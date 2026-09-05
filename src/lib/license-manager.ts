import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { MASTER_CLUSTER_BASE, generateDbName, buildMongoUriForDb, saveTenantConfig, getTenantConfig } from './tenant-config';

const MASTER_DB_NAME = 'webstore';
const COLLECTION_NAME = '_system_licenses';

export interface LicenseRecord {
  _id?: any;
  licenseKey: string;
  buyerName: string;
  note?: string;
  status: 'available' | 'activated' | 'active' | 'revoked' | string;
  shopName?: string;
  assignedDb?: string;
  machineFingerprint?: string;
  activatedAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

let masterConn: mongoose.Connection | null = null;

/**
 * Get or initialize connection to the Master Database for license checks
 */
export async function getMasterConnection(): Promise<mongoose.Connection> {
  if (masterConn && masterConn.readyState === 1) {
    return masterConn;
  }

  const masterUri = buildMongoUriForDb(MASTER_DB_NAME);
  console.log('🔒 [Master License] Đang kết nối tới Master Cluster để kiểm tra bản quyền...');

  const conn = await mongoose.createConnection(masterUri, {
    serverSelectionTimeoutMS: 8000,
    bufferCommands: false,
  }).asPromise();

  masterConn = conn;
  return conn;
}

/**
 * Helper to generate a secure, readable License Key
 * Format: AFF-XXXX-YYYY-ZZZZ (16 chars alphanumeric)
 */
export function formatNewKey(): string {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `AFF-${segment()}-${segment()}-${segment()}`;
}

/**
 * Generate a new license key and save to Master DB
 */
export async function createLicenseKey(buyerName: string, note?: string): Promise<LicenseRecord> {
  const conn = await getMasterConnection();
  const collection = conn.collection<LicenseRecord>(COLLECTION_NAME);

  const licenseKey = formatNewKey();
  const record: LicenseRecord = {
    licenseKey,
    buyerName: buyerName.trim(),
    note: note || '',
    status: 'available',
    createdAt: new Date(),
  };

  await collection.insertOne(record);
  console.log(`✅ [License Manager] Đã tạo Key mới: ${licenseKey} cho khách hàng: ${buyerName}`);
  return record;
}

/**
 * List all license keys from Master DB
 */
export async function getAllLicenses(): Promise<LicenseRecord[]> {
  const conn = await getMasterConnection();
  const collection = conn.collection<LicenseRecord>(COLLECTION_NAME);
  return await collection.find({}).sort({ createdAt: -1 }).toArray();
}

/**
 * Revoke an existing license key
 */
export async function revokeLicense(key: string): Promise<boolean> {
  const conn = await getMasterConnection();
  const collection = conn.collection<LicenseRecord>(COLLECTION_NAME);
  const normalizedKey = key.trim().toUpperCase();
  const res = await collection.updateOne(
    { licenseKey: normalizedKey },
    { $set: { status: 'revoked', updatedAt: new Date() } }
  );
  delete licenseCache[normalizedKey];
  return res.modifiedCount > 0;
}

/**
 * Reactivate a previously revoked license key
 */
export async function reactivateLicense(key: string): Promise<boolean> {
  const conn = await getMasterConnection();
  const collection = conn.collection<LicenseRecord>(COLLECTION_NAME);
  const normalizedKey = key.trim().toUpperCase();
  const res = await collection.updateOne(
    { licenseKey: normalizedKey },
    { $set: { status: 'activated', updatedAt: new Date() } }
  );
  delete licenseCache[normalizedKey];
  return res.modifiedCount > 0;
}

export interface LicenseCheckResult {
  valid: boolean;
  status: 'available' | 'activated' | 'active' | 'revoked' | 'not_found' | 'offline_ok' | string;
  licenseKey?: string;
  buyerName?: string;
  shopName?: string;
  assignedDb?: string;
  message?: string;
}

// In-memory cache to prevent overwhelming master cluster on every request
const licenseCache: Record<string, { result: LicenseCheckResult; expiresAt: number }> = {};

/**
 * Realtime Runtime License Status Verification
 */
export async function checkLicenseStatus(rawKey?: string, forceFresh = false): Promise<LicenseCheckResult> {
  const key = rawKey?.trim().toUpperCase();
  if (!key) {
    return {
      valid: false,
      status: 'not_found',
      message: 'Không tìm thấy mã bản quyền trong cấu hình.',
    };
  }

  // Cache hit check (unless forced fresh)
  if (!forceFresh) {
    const cached = licenseCache[key];
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }
  }

  try {
    const conn = await getMasterConnection();
    const collection = conn.collection<LicenseRecord>(COLLECTION_NAME);

    const record = await collection.findOne({ licenseKey: key });

    if (!record) {
      const res: LicenseCheckResult = {
        valid: false,
        status: 'not_found',
        licenseKey: key,
        message: 'Mã bản quyền không tồn tại trên hệ thống máy chủ.',
      };
      licenseCache[key] = { result: res, expiresAt: Date.now() + 15000 };
      return res;
    }

    if (record.status === 'revoked') {
      const res: LicenseCheckResult = {
        valid: false,
        status: 'revoked',
        licenseKey: key,
        buyerName: record.buyerName,
        shopName: record.shopName,
        assignedDb: record.assignedDb,
        message: 'Bản quyền này đã bị thu hồi hoặc tạm khóa bởi nhà phát hành.',
      };
      licenseCache[key] = { result: res, expiresAt: Date.now() + 5000 };
      return res;
    }

    const isActive = record.status === 'activated' || record.status === 'active';
    const res: LicenseCheckResult = {
      valid: isActive,
      status: record.status,
      licenseKey: key,
      buyerName: record.buyerName,
      shopName: record.shopName,
      assignedDb: record.assignedDb,
      message: isActive ? 'Bản quyền hợp lệ và đang hoạt động.' : 'Mã chưa được kích hoạt.',
    };
    licenseCache[key] = { result: res, expiresAt: Date.now() + 20000 };
    return res;
  } catch (error: any) {
    console.warn('⚠️ [License Check] Không thể kết nối Master DB:', error.message);
    return {
      valid: true,
      status: 'offline_ok',
      licenseKey: key,
      message: 'Tạm thời không kết nối được máy chủ bản quyền.',
    };
  }
}

/**
 * Find active license for a host / domain or license key from Cloud Master DB
 */
export async function findLicenseByHostOrKey(host?: string, key?: string): Promise<LicenseRecord | null> {
  try {
    const conn = await getMasterConnection();
    const collection = conn.collection<LicenseRecord>(COLLECTION_NAME);

    if (key) {
      const rec = await collection.findOne({
        licenseKey: key.trim().toUpperCase(),
        status: { $in: ['activated', 'active'] },
      });
      if (rec) return rec;
    }

    if (host && host !== 'localhost' && !host.startsWith('localhost:')) {
      const cleanHost = host.split(':')[0].toLowerCase();
      const rec = await collection.findOne({
        $or: [
          { domain: cleanHost },
          { host: cleanHost },
          { machineFingerprint: cleanHost },
        ],
        status: { $in: ['activated', 'active'] },
      });
      if (rec) return rec;
    }
  } catch (e) {
    console.warn('Error querying master license for host:', e);
  }
  return null;
}

/**
 * Validate and atomically consume a 1-time License Key
 */
export async function validateAndConsumeLicense(
  rawKey: string,
  shopName: string,
  host?: string,
  machineFingerprint?: string
): Promise<{ success: boolean; message: string; dbName?: string; license?: LicenseRecord }> {
  const key = rawKey.trim().toUpperCase();
  if (!key || !key.startsWith('AFF-')) {
    return {
      success: false,
      message: 'Định dạng Mã Bản Quyền không hợp lệ! (Phải có dạng AFF-XXXX-XXXX-XXXX)',
    };
  }

  try {
    const conn = await getMasterConnection();
    const collection = conn.collection<LicenseRecord>(COLLECTION_NAME);

    // 1. Find the license record
    const existing = await collection.findOne({ licenseKey: key });

    if (!existing) {
      return {
        success: false,
        message: 'Mã bản quyền không tồn tại trong hệ thống! Vui lòng liên hệ người bán để nhận mã hợp lệ.',
      };
    }

    if (existing.status === 'revoked') {
      return {
        success: false,
        message: 'Mã bản quyền này đã bị thu hồi hoặc vô hiệu hóa do vi phạm chính sách sử dụng!',
      };
    }

    // If key is ALREADY activated, allow seamless re-syncing/restoring for the active shop!
    if (existing.status === 'activated' || existing.status === 'active') {
      const dbName = existing.assignedDb || generateDbName(shopName);
      const tenantUri = buildMongoUriForDb(dbName);
      const activeShopName = existing.shopName || shopName;

      const cleanHost = host ? host.split(':')[0].toLowerCase() : '';
      if (cleanHost) {
        await collection.updateOne(
          { licenseKey: key },
          { $set: { host: cleanHost, domain: cleanHost, updatedAt: new Date() } }
        );
      }

      saveTenantConfig({
        shopName: activeShopName,
        dbName,
        mongoUri: tenantUri,
        createdAt: existing.createdAt ? new Date(existing.createdAt).toISOString() : new Date().toISOString(),
        licenseKey: key,
      });

      return {
        success: true,
        message: 'Khôi phục kết nối bản quyền thành công!',
        dbName,
        license: existing,
      };
    }

    // 2. Generate isolated Tenant DB for this shop
    const generatedDb = generateDbName(shopName);
    const tenantUri = buildMongoUriForDb(generatedDb);
    const cleanHost = host ? host.split(':')[0].toLowerCase() : (machineFingerprint || 'web-client');

    // 3. Atomically consume the license key (Atomic CAS update)
    const result = await collection.findOneAndUpdate(
      { licenseKey: key, status: 'available' },
      {
        $set: {
          status: 'activated',
          shopName: shopName.trim(),
          assignedDb: generatedDb,
          host: cleanHost,
          domain: cleanHost,
          machineFingerprint: machineFingerprint || cleanHost,
          activatedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return {
        success: false,
        message: 'Mã bản quyền vừa bị kích hoạt ở một nơi khác trong cùng thời điểm!',
      };
    }

    // 4. Save local tenant configuration file
    saveTenantConfig({
      shopName: shopName.trim(),
      dbName: generatedDb,
      mongoUri: tenantUri,
      createdAt: new Date().toISOString(),
      licenseKey: key,
    });

    return {
      success: true,
      message: 'Xác thực bản quyền thành công!',
      dbName: generatedDb,
      license: result as unknown as LicenseRecord,
    };
  } catch (error: any) {
    console.error('❌ [License Verify Error]:', error);
    return {
      success: false,
      message: `Lỗi kết nối máy chủ xác thực bản quyền: ${error.message || 'Không xác định'}`,
    };
  }
}
