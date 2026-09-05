import { NextResponse } from 'next/server';
import { validateAndConsumeLicense } from '@/lib/license-manager';
import { buildMongoUriForDb } from '@/lib/tenant-config';
import { switchDatabaseConnection } from '@/lib/mongodb';
import { autoSeedIfNeeded } from '@/lib/auto-seed';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {}

    const shopName = body.shopName?.trim() || 'Shop Của Tôi';
    const rawLicenseKey = body.licenseKey?.trim() || '';
    const adminEmail = body.adminEmail?.trim() || 'admin@shopbig.vn';
    const adminPassword = body.adminPassword?.trim() || 'admin123';

    if (!rawLicenseKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng cung cấp Mã Kích Hoạt Bản Quyền (License Key) được cấp khi mua web!',
        },
        { status: 400 }
      );
    }

    console.log(`🔒 [License Check] Đang xác thực key "${rawLicenseKey}" cho shop: "${shopName}"...`);

    // 1. Atomically Validate and Consume the 1-Time License Key on Master Cluster
    const verifyResult = await validateAndConsumeLicense(rawLicenseKey, shopName);

    if (!verifyResult.success || !verifyResult.dbName) {
      return NextResponse.json(
        {
          success: false,
          message: verifyResult.message || 'Mã bản quyền không hợp lệ hoặc đã được sử dụng!',
        },
        { status: 400 }
      );
    }

    const dbName = verifyResult.dbName;
    const mongoUri = buildMongoUriForDb(dbName);

    console.log(`🚀 [Auto-Provision] Đang khởi tạo CSDL riêng: ${dbName} cho cửa hàng: "${shopName}"`);

    // 2. Switch active Mongoose connection to this new tenant DB
    await switchDatabaseConnection(mongoUri);

    // 3. Seed schema (Admin account + Theme only, 0 mock products/categories)
    await autoSeedIfNeeded({
      shopName,
      adminEmail,
      adminPassword,
    });

    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const categories = await Category.countDocuments();

    console.log(`✅ [Auto-Provision] Đã kích hoạt bản quyền & cấp CSDL "${dbName}" thành công!`);

    return NextResponse.json({
      success: true,
      message: `🎉 Kích hoạt bản quyền và cấp CSDL riêng "${dbName}" thành công!`,
      data: {
        shopName,
        dbName,
        licenseKey: rawLicenseKey.toUpperCase(),
        buyerName: verifyResult.license?.buyerName,
        adminEmail,
        adminPassword,
        stats: { users, products, categories },
      },
    });
  } catch (error: any) {
    console.error('Auto provision error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Lỗi tự động cấp cơ sở dữ liệu cho khách hàng',
      },
      { status: 500 }
    );
  }
}
