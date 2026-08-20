import { NextResponse } from 'next/server';
import { getUnifiedOrderTracking } from '@/lib/shipping/unifiedTracker';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || searchParams.get('orderCode') || searchParams.get('trackingCode') || '';
    const carrier = searchParams.get('carrier') || '';

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp mã đơn hàng hoặc mã vận đơn (code)' },
        { status: 400 }
      );
    }

    const trackingResult = await getUnifiedOrderTracking({
      orderCode: code,
      trackingCode: code,
      carrier,
    });

    return NextResponse.json({
      success: true,
      data: trackingResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tra cứu hành trình vận đơn' },
      { status: 500 }
    );
  }
}
