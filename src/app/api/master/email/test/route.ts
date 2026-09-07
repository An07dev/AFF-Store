import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/lib/mongodb';
import { SystemConfig } from '@/models/SystemConfig';
import { generateLicenseEmailHtml } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      toEmail,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      smtpFrom,
    } = body;

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập địa chỉ email người nhận hợp lệ!' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const dbConfig = await SystemConfig.findOne({ key: 'master_payment_config' }).lean();

    const host = smtpHost || dbConfig?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(smtpPort || dbConfig?.smtpPort || process.env.SMTP_PORT || 465);
    const secure = smtpSecure !== undefined ? Boolean(smtpSecure) : (dbConfig?.smtpSecure ?? (port === 465));
    const user = smtpUser || dbConfig?.smtpUser || process.env.SMTP_USER || '';
    const pass = smtpPass || dbConfig?.smtpPass || process.env.SMTP_PASS || '';
    const from = smtpFrom || dbConfig?.smtpFrom || process.env.SMTP_FROM || `"ShopBig Master" <${user || 'noreply@shopbig.vn'}>`;

    if (!user || !pass) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Chưa điền thông tin tài khoản Email gửi (SMTP User) hoặc Mật khẩu ứng dụng (SMTP Pass). Vui lòng nhập trước khi gửi test!',
        },
        { status: 400 }
      );
    }

    const testHtml = generateLicenseEmailHtml({
      buyerName: 'Khách Hàng Thử Nghiệm (Test Admin)',
      orderCode: 'ST799K_TEST_DEMO',
      licenseKey: 'AFF-TEST-DEMO-9999',
      plan: '799k',
      amount: 799000,
      downloadUrl: dbConfig?.sourceCodeDownloadUrl || 'https://drive.google.com/drive/folders/shopbig-source-code-full-package',
      hotline: dbConfig?.hotlineSupport || '0988.888.888',
      docsUrl: dbConfig?.docsUrl || 'https://shopbig.vn/docs/setup-guide',
    });

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
    });

    // Verify SMTP connection
    await transporter.verify();

    // Send Test Mail
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: `[ShopBig TEST] Thử Nghiệm Kết Nối SMTP & Bàn Giao Mã Nguồn Thành Công`,
      html: testHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi email thử nghiệm thành công tới ${toEmail}! Hãy kiểm tra hộp thư đến (Inbox / Spam).`,
      messageId: info.messageId,
      envelope: info.envelope,
    });
  } catch (error: any) {
    console.error('Lỗi khi gửi email test:', error);

    let friendlyError = error.message || 'Lỗi không xác định khi kết nối SMTP';
    if (error.code === 'EAUTH') {
      friendlyError = 'Xác thực tài khoản thất bại (Sai mật khẩu hoặc sai tài khoản). Với Gmail, bạn cần dùng "Mật khẩu ứng dụng (App Password 16 ký tự)" thay vì mật khẩu đăng nhập thông thường.';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      friendlyError = 'Kết nối tới máy chủ SMTP bị quá thời gian (Timeout). Vui lòng kiểm tra lại Host và Port (465 cho SSL hoặc 587 cho TLS).';
    }

    return NextResponse.json(
      {
        success: false,
        message: friendlyError,
        rawError: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
