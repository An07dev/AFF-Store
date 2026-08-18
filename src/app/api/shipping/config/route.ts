import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

const DEFAULT_SHIPPING_CONFIG = {
  carriers: {
    ghn: {
      enabled: true,
      token: 'ghn_prod_token_demo_873912',
      shopId: '184920',
      environment: 'production',
    },
    ghtk: {
      enabled: true,
      token: 'ghtk_api_token_demo_982341',
      partnerId: 'PARTNER_SHOPTIK_01',
      environment: 'production',
    },
    viettelpost: {
      enabled: true,
      token: 'vtp_secret_token_demo_109283',
      username: 'shoptik_vtp',
      environment: 'production',
    },
  },
  rates: {
    defaultInnerFee: 22000,
    defaultOuterFee: 32000,
    freeShippingThreshold: 500000,
    autoPushOrder: false,
  },
  // Backward compatibility flat fields
  ghnEnabled: true,
  ghtkEnabled: true,
  vtpEnabled: true,
  defaultInnerFee: 22000,
  defaultOuterFee: 32000,
  freeShippingThreshold: 500000,
};

// GET: Lấy toàn bộ cấu hình 3 hãng vận chuyển & biểu phí
export async function GET() {
  try {
    await connectToDatabase();
    let config = await Setting.findOne({ key: 'shipping_config' });

    if (!config) {
      config = await Setting.create({
        key: 'shipping_config',
        value: DEFAULT_SHIPPING_CONFIG,
      });
    }

    // Merge defaults with saved values
    const mergedData = {
      ...DEFAULT_SHIPPING_CONFIG,
      ...config.value,
      carriers: {
        ...DEFAULT_SHIPPING_CONFIG.carriers,
        ...(config.value?.carriers || {}),
      },
      rates: {
        ...DEFAULT_SHIPPING_CONFIG.rates,
        ...(config.value?.rates || {}),
      },
    };

    return NextResponse.json({
      success: true,
      data: mergedData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải cấu hình vận chuyển' },
      { status: 500 }
    );
  }
}

// POST: Lưu cập nhật cấu hình 3 hãng vận chuyển & Token API
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Đồng bộ cả dạng nested và flat field
    const payload = {
      ...body,
      ghnEnabled: body.carriers?.ghn?.enabled ?? body.ghnEnabled ?? true,
      ghtkEnabled: body.carriers?.ghtk?.enabled ?? body.ghtkEnabled ?? true,
      vtpEnabled: body.carriers?.viettelpost?.enabled ?? body.vtpEnabled ?? true,
      defaultInnerFee: body.rates?.defaultInnerFee ?? body.defaultInnerFee ?? 22000,
      defaultOuterFee: body.rates?.defaultOuterFee ?? body.defaultOuterFee ?? 32000,
      freeShippingThreshold: body.rates?.freeShippingThreshold ?? body.freeShippingThreshold ?? 500000,
    };

    const updated = await Setting.findOneAndUpdate(
      { key: 'shipping_config' },
      { value: payload },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Đã lưu cấu hình các hãng vận chuyển thành công!',
      data: updated.value,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lưu cấu hình vận chuyển' },
      { status: 500 }
    );
  }
}