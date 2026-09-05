import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getTenantConfig, saveTenantConfig, buildMongoUriForDb, MASTER_CLUSTER_BASE } from '@/lib/tenant-config';
import { checkLicenseStatus, findLicenseByHostOrKey, LicenseCheckResult } from '@/lib/license-manager';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceFresh = searchParams.get('fresh') === '1';
  const keyParam = searchParams.get('key') || searchParams.get('licenseKey') || '';
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';

  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  let tenant = getTenantConfig();

  // Auto-resolve tenant from Cloud Master DB if local config is absent (Vercel Serverless cold start)
  if (!tenant?.dbName) {
    try {
      const activeLicense = await findLicenseByHostOrKey(host, keyParam);
      if (activeLicense && activeLicense.assignedDb) {
        const dbName = activeLicense.assignedDb;
        saveTenantConfig({
          shopName: activeLicense.shopName || 'Shop Của Tôi',
          dbName: dbName,
          mongoUri: buildMongoUriForDb(dbName),
          createdAt: activeLicense.createdAt ? new Date(activeLicense.createdAt).toISOString() : new Date().toISOString(),
          licenseKey: activeLicense.licenseKey,
        });
        tenant = getTenantConfig();
        console.log(`☁️ [Cloud Rehydrate] Đã tự động khôi phục cấu hình CSDL "${dbName}" cho host "${host}"`);
      }
    } catch (resolveErr) {
      console.warn('Auto-resolve tenant from cloud master DB skipped:', resolveErr);
    }
  }

  const hasUriConfigured = Boolean(
    tenant?.mongoUri || (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '')
  );

  let isConnected = false;
  let isSeeded = false;
  let isLocked = false;
  let isRevoked = false;
  let licenseStatus: string = 'unknown';
  let licenseCheck: LicenseCheckResult | null = null;
  let errorMessage: string | null = null;
  let stats = {
    users: 0,
    products: 0,
    categories: 0,
  };

  // 1. Live License Check against Master Cluster
  if (tenant?.licenseKey) {
    try {
      licenseCheck = await checkLicenseStatus(tenant.licenseKey, forceFresh);
      licenseStatus = licenseCheck.status;

      if (licenseCheck.status === 'revoked') {
        isLocked = true;
        isRevoked = true;
        errorMessage = 'Bản quyền sử dụng website đã bị khóa hoặc thu hồi bởi nhà phát hành.';
      } else if (licenseCheck.status === 'not_found') {
        isLocked = true;
        isRevoked = true;
        errorMessage = 'Mã bản quyền không tồn tại hoặc đã bị xóa khỏi hệ thống máy chủ.';
      }
    } catch (licErr: any) {
      console.warn('Live license verification check error:', licErr.message);
    }
  }

  // 2. Database Connection Check (Only if not locked/revoked)
  if (!isLocked) {
    try {
      const conn = await connectToDatabase();
      if (conn && mongoose.connection.readyState === 1) {
        isConnected = true;
        try {
          stats.users = await User.countDocuments();
          stats.products = await Product.countDocuments();
          stats.categories = await Category.countDocuments();
          isSeeded = stats.users > 0;
        } catch (err: any) {
          console.warn('Error reading stats:', err.message);
        }
      }
    } catch (error: any) {
      isConnected = false;
      errorMessage = error.message || 'Không thể kết nối tới cơ sở dữ liệu';
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      isVercel,
      hasUriConfigured,
      hasMasterCluster: Boolean(MASTER_CLUSTER_BASE && MASTER_CLUSTER_BASE.includes('mongodb')),
      tenant,
      isConnected,
      isSeeded,
      isLocked,
      isRevoked,
      licenseStatus,
      licenseCheck,
      stats,
      errorMessage,
      environment: isVercel ? 'vercel' : (process.env.NODE_ENV || 'development'),
    },
  });
}

