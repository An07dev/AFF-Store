import { NextResponse } from 'next/server';
import { calculateGHNFee } from '@/lib/shipping/ghn';
import { calculateGHTKFee } from '@/lib/shipping/ghtk';
import { calculateViettelPostFee } from '@/lib/shipping/viettelpost';

export async function POST(request: Request) {
  try {
    const { province, district, weight, orderValue } = await request.json();

    const ghn = await calculateGHNFee(province, district, weight);
    const ghtk = await calculateGHTKFee(province, district, weight);
    const viettelpost = await calculateViettelPostFee(province, district, weight);

    return NextResponse.json({
      success: true,
      data: {
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