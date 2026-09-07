import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { sendLicenseEmail } from '@/lib/email';
import { License } from '@/models/License';
import { Lead } from '@/models/Lead';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toEmail, licenseKey, buyerName, buyerPhone, orderCode, plan, amount } = body;

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email người nhận không hợp lệ!' },
        { status: 400 }
      );
    }

    if (!licenseKey) {
      return NextResponse.json(
        { success: false, message: 'Mã bản quyền (licenseKey) là bắt buộc!' },
        { status: 400 }
      );
    }

    const emailRes = await sendLicenseEmail({
      toEmail,
      buyerName: buyerName || 'Khách Hàng',
      buyerPhone: buyerPhone || '',
      orderCode: orderCode || 'MANUAL_DISPATCH',
      licenseKey,
      plan: plan || '399k',
      amount: Number(amount) || (plan === '799k' ? 799000 : 399000),
    });

    if (emailRes.success) {
      return NextResponse.json({
        success: true,
        message: emailRes.simulated
          ? `[Chế độ mô phỏng] Đã ghi log gửi email bản quyền ${licenseKey} tới ${toEmail} (Chưa điền SMTP Pass)`
          : `Đã gửi email bàn giao mã nguồn & bản quyền ${licenseKey} tới ${toEmail} thành công!`,
        simulated: emailRes.simulated,
        messageId: emailRes.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, message: emailRes.error || 'Lỗi khi gửi email' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi gửi mail', error: error.message },
      { status: 500 }
    );
  }
}
