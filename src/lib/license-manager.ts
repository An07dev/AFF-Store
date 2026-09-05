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
  status: 'available' | 'activated' | 'revoked';
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
  const res = await collection.updateOne(
    { licenseKey: key.trim().toUpperCase() },
    { $set: { status: 'revoked', updatedAt: new Date() } }
  );
  return res.modifiedCount > 0;
}

/**
 * Validate and atomically consume a 1-time License Key
 */
export async function validateAndConsumeLicense(
  rawKey: string,
  shopName: string,
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

    if (existing.status === 'activated') {
      const dateStr = existing.activatedAt
        ? new Date(existing.activatedAt).toLocaleString('vi-VN')
        : 'trước đó';
      return {
        success: false,
        message: `Mã bản quyền này ĐÃ ĐƯỢC KÍCH HOẠT cho cửa hàng "${existing.shopName || 'khác'}" vào lúc ${dateStr}. Mỗi key chỉ dùng được 1 lần và không thể tái sử dụng!`,
      };
    }

    // 2. Generate isolated Tenant DB for this shop
    const generatedDb = generateDbName(shopName);
    const tenantUri = buildMongoUriForDb(generatedDb);

    // 3. Atomically consume the license key (Atomic CAS update)
    const result = await collection.findOneAndUpdate(
      { licenseKey: key, status: 'available' },
      {
        $set: {
          status: 'activated',
          shopName: shopName.trim(),
          assignedDb: generatedDb,
          machineFingerprint: machineFingerprint || 'web-client',
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
