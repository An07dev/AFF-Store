import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SystemConfig } from '@/models/SystemConfig';

export const revalidate = 60; // Cache 60 seconds

export async function GET() {
  try {
    await connectToDatabase();
    const config = await SystemConfig.findOne({ key: 'master_payment_config' }).lean();

    const bankInfo = {
      bankCode: config?.bankCode || 'MB',
      bankName: config?.bankName || 'MBBank (Ngân Hàng Quân Đội)',
      accountNumber: config?.accountNumber || '0973475484',
      accountName: config?.accountName || 'SHOPBIG STORE',
      qrTemplate: config?.qrTemplate || 'compact2',
      hotlineSupport: config?.hotlineSupport || '0988.888.888',
    };

    return NextResponse.json({
      success: true,
      data: bankInfo,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: {
        bankCode: 'MB',
        bankName: 'MBBank (Ngân Hàng Quân Đội)',
        accountNumber: '0973475484',
        accountName: 'SHOPBIG STORE',
        qrTemplate: 'compact2',
        hotlineSupport: '0988.888.888',
      },
    });
  }
}
