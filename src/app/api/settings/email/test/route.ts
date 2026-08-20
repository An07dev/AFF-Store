import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { sendTestEmail, defaultEmailSettings, IEmailSettings } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetEmail = body.targetEmail?.trim() || body.user?.trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập địa chỉ email nhận thư thử nghiệm hợp lệ' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await Setting.findOne({ key: 'email_settings' });
    const currentVal: IEmailSettings = existing?.value || defaultEmailSettings;

    let finalPass = body.pass;
    if (finalPass === '••••••••' || !finalPass) {
      finalPass = currentVal.pass || defaultEmailSettings.pass;
    }

    const testConfig: IEmailSettings = {
      enabled: true,
      host: body.host?.trim() || currentVal.host || 'smtp.gmail.com',
      port: Number(body.port) || currentVal.port || 465,
      secure: Number(body.port) === 465 || currentVal.secure,
      user: body.user?.trim() || currentVal.user || '',
      pass: finalPass?.trim() || '',
      senderName: body.senderName?.trim() || currentVal.senderName || 'ShopTik Store',
      senderEmail: body.senderEmail?.trim() || body.user?.trim() || currentVal.user || '',
      adminNotificationEmail: targetEmail,
      sendToCustomer: true,
      sendToAdmin: true,
    };

    if (!testConfig.user || !testConfig.pass) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền Email gửi và Mật khẩu ứng dụng SMTP trước khi gửi thử' },
        { status: 400 }
      );
    }

    await sendTestEmail(targetEmail, testConfig);

    return NextResponse.json({
      success: true,
      message: `Đã gửi email thử nghiệm thành công tới ${targetEmail}! Vui lòng kiểm tra Hộp thư đến (hoặc thư mục Spam).`,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    let errorDetail = error.message || 'Lỗi kết nối SMTP';
    if (errorDetail.includes('Invalid login') || errorDetail.includes('Username and Password not accepted')) {
      errorDetail = 'Tài khoản hoặc Mật khẩu ứng dụng Gmail không chính xác. Hãy tạo Mật khẩu ứng dụng (App Password) 16 ký tự của Google.';
    }

    return NextResponse.json(
      {
        success: false,
        message: `Gửi email thử nghiệm thất bại: ${errorDetail}`,
      },
      { status: 500 }
    );
  }
}
