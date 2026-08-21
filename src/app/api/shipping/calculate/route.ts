import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { calculateGHNFee } from '@/lib/shipping/ghn';
import { calculateGHTKFee } from '@/lib/shipping/ghtk';
import { calculateViettelPostFee } from '@/lib/shipping/viettelpost';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { province, district, weight, orderValue } = await request.json();

    // 1. Fetch shipping config from database
    const configSetting = await Setting.findOne({ key: 'shipping_config' });
    const config = configSetting?.value || {};

    const isGhnEnabled = config.carriers?.ghn?.enabled ?? config.ghnEnabled ?? true;
    const isGhtkEnabled = config.carriers?.ghtk?.enabled ?? config.ghtkEnabled ?? true;
    const isVtpEnabled = config.carriers?.viettelpost?.enabled ?? config.vtpEnabled ?? true;
    const freeShippingThreshold = Number(config.rates?.freeShippingThreshold ?? config.freeShippingThreshold ?? 500000);
    const isFreeShipping = typeof orderValue === 'number' && orderValue > 0 && orderValue >= freeShippingThreshold;

    // 2. Only calculate fees for enabled carriers
    const [ghn, ghtk, viettelpost] = await Promise.all([
      isGhnEnabled ? calculateGHNFee(province || 'Hà Nội', district || '', weight || 500) : Promise.resolve(null),
      isGhtkEnabled ? calculateGHTKFee(province || 'Hà Nội', district || '', weight || 500) : Promise.resolve(null),
      isVtpEnabled ? calculateViettelPostFee(province || 'Hà Nội', district || '', weight || 500) : Promise.resolve(null),
    ]);

    // 3. Build active carriers list for customer checkout selection
    const carriers = [];

    if (isGhnEnabled && ghn) {
      carriers.push({
        id: 'ghn',
        carrier: 'ghn',
        name: 'Giao Hàng Nhanh (GHN Express)',
        shortName: 'GHN Express',
        fee: isFreeShipping ? 0 : ghn.fee,
        originalFee: ghn.fee,
        isFree: isFreeShipping,
        estimatedDays: ghn.estimatedTime || '1-2 ngày',
        tag: 'Hỏa Tốc',
        description: 'Hỏa tốc nội thành, kết nối giao nhanh 24-48h',
      });
    }

    if (isGhtkEnabled && ghtk) {
      carriers.push({
        id: 'ghtk',
        carrier: 'ghtk',
        name: 'Giao Hàng Tiết Kiệm (GHTK)',
        shortName: 'GHTK',
        fee: isFreeShipping ? 0 : ghtk.fee,
        originalFee: ghtk.fee,
        isFree: isFreeShipping,
        estimatedDays: ghtk.estimatedTime || '1-3 ngày',
        tag: 'Tiết Kiệm',
        description: 'Độ phủ sóng 63 tỉnh thành, tối ưu chi phí bưu cục',
      });
    }

    if (isVtpEnabled && viettelpost) {
      carriers.push({
        id: 'viettelpost',
        carrier: 'viettelpost',
        name: 'Viettel Post Bảo Đảm',
        shortName: 'Viettel Post',
        fee: isFreeShipping ? 0 : viettelpost.fee,
        originalFee: viettelpost.fee,
        isFree: isFreeShipping,
        estimatedDays: viettelpost.estimatedTime || '2-3 ngày',
        tag: 'Bảo Đảm',
        description: 'Mạng lưới bưu chính quân đội, an toàn tin cậy',
      });
    }

    // Fallback: If no 3rd-party carrier is enabled, offer Standard In-house delivery
    if (carriers.length === 0) {
      const isInner = (province || '').toLowerCase().includes('hà nội') || (province || '').toLowerCase().includes('hồ chí minh');
      const innerFee = Number(config.rates?.defaultInnerFee ?? config.defaultInnerFee ?? 22000);
      const outerFee = Number(config.rates?.defaultOuterFee ?? config.defaultOuterFee ?? 32000);
      const standardFee = isInner ? innerFee : outerFee;

      carriers.push({
        id: 'internal',
        carrier: 'internal',
        name: 'Giao hàng tiêu chuẩn ShopTik',
        shortName: 'Tiêu Chuẩn',
        fee: isFreeShipping ? 0 : standardFee,
        originalFee: standardFee,
        isFree: isFreeShipping,
        estimatedDays: isInner ? '1-2 ngày' : '2-4 ngày',
        tag: 'Nội Bộ',
        description: 'Shop tự điều phối giao hàng tận nơi',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        carriers,
        isFreeShipping,
        freeShippingThreshold,
        ghn,
        ghtk,
        viettelpost,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tính phí vận chuyển' },
      { status: 500 }
    );
  }
}