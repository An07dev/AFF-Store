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

    // 2. Only calculate fees for enabled carriers
    const [ghn, ghtk, viettelpost] = await Promise.all([
      isGhnEnabled ? calculateGHNFee(province, district, weight) : Promise.resolve(null),
      isGhtkEnabled ? calculateGHTKFee(province, district, weight) : Promise.resolve(null),
      isVtpEnabled ? calculateViettelPostFee(province, district, weight) : Promise.resolve(null),
    ]);

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