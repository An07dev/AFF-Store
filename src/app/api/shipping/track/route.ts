import { NextResponse } from 'next/server';
import { trackGHNOrder } from '@/lib/shipping/ghn';
import { trackGHTKOrder } from '@/lib/shipping/ghtk';
import { trackViettelPostOrder } from '@/lib/shipping/viettelpost';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const carrier = searchParams.get('carrier') || '';
    const trackingCode = searchParams.get('code') || '';

    if (!trackingCode) {
      return NextResponse.json(
        { success: false, message: 'Thiếu mã vận đơn (trackingCode)' },
        { status: 400 }
      );
    }

    let carrierResult: any = null;
    const lower = carrier.toLowerCase();

    if (lower.includes('ghn') || trackingCode.startsWith('GHN')) {
      carrierResult = await trackGHNOrder(trackingCode);
    } else if (lower.includes('ghtk') || trackingCode.startsWith('GHTK')) {
      carrierResult = await trackGHTKOrder(trackingCode);
    } else if (lower.includes('viettel') || trackingCode.startsWith('VTP')) {
      carrierResult = await trackViettelPostOrder(trackingCode);
    }

    if (carrierResult && carrierResult.success) {
      return NextResponse.json({
        success: true,
        data: carrierResult,
      });
    }

    // Default structured logs if real API is not connected or in sandbox
    return NextResponse.json({
      success: true,
      data: {
        trackingCode,
        carrier: carrier || 'Giao Hàng Tiết Kiệm (GHTK)',
        status: 'shipping',
        isLive: false,
        message: 'Đang hiển thị hành trình ước tính (Chưa cấu hình API Token thực của hãng)',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tra cứu vận đơn' },
      { status: 500 }
    );
  }
}
