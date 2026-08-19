import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'payment_config' });

    const defaultPaymentConfig = {
      bankName: process.env.NEXT_PUBLIC_VIETQR_BANK || 'MBBank',
      accountNumber: process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '0528438642',
      accountName: process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'LE VAN AN',
      sepayToken: process.env.SEPAY_API_KEY || '',
    };

    if (!setting || !setting.value) {
      return NextResponse.json({
        success: true,
        data: defaultPaymentConfig,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...defaultPaymentConfig,
        ...setting.value,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải cấu hình thanh toán' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { bankName, accountNumber, accountName, sepayToken } = body;

    const updatedConfig = {
      bankName: bankName || 'MBBank',
      accountNumber: String(accountNumber || '').trim(),
      accountName: String(accountName || '').trim().toUpperCase(),
      sepayToken: sepayToken || '',
    };

    const setting = await Setting.findOneAndUpdate(
      { key: 'payment_config' },
      { $set: { value: updatedConfig } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Đã lưu cấu hình tài khoản nhận tiền SePay & VietQR vào Database thành công!',
      data: setting.value,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lưu cấu hình thanh toán' },
      { status: 500 }
    );
  }
}
