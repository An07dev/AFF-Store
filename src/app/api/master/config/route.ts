import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SystemConfig } from '@/models/SystemConfig';

const DEFAULT_CONFIG = {
  key: 'master_payment_config',
  bankCode: 'MB',
  bankName: 'MBBank (Ngân Hàng Quân Đội)',
  accountNumber: '0973475484',
  accountName: 'SHOPBIG STORE',
  qrTemplate: 'compact2',
  sepayApiKey: 'shopbig_sepay_secret_2026',
  sepayWebhookSecret: '',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '"ShopBig Master" <noreply@shopbig.vn>',
  adminNotifyEmail: '',
  emailSubjectTemplate: '[ShopBig] Bàn Giao Mã Bản Quyền & Mã Nguồn Đơn Hàng #{orderCode}',
  emailBannerTitle: 'XÁC NHẬN BÀN GIAO MÃ NGUỒN SHOPBIG',
  emailIntroText:
    'Hệ thống ShopBig đã ghi nhận giao dịch thanh toán thành công của bạn qua VietQR SePay. Dưới đây là thông tin bàn giao mã kích hoạt bản quyền và gói source code hoàn chỉnh:',
  sourceCodeDownloadUrl: 'https://drive.google.com/drive/folders/shopbig-source-code-full-package',
  hotlineSupport: '0988.888.888',
  docsUrl: 'https://shopbig.vn/docs/setup-guide',
};

// GET: Lấy toàn bộ cấu hình thanh toán & ngân hàng & email
export async function GET() {
  try {
    await connectToDatabase();
    let config = await SystemConfig.findOne({ key: 'master_payment_config' }).lean();

    if (!config) {
      config = await SystemConfig.create(DEFAULT_CONFIG);
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error('Error fetching master config:', error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_CONFIG,
      fallback: true,
    });
  }
}

// POST: Cập nhật cấu hình ngân hàng & thanh toán & email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bankCode,
      bankName,
      accountNumber,
      accountName,
      qrTemplate,
      sepayApiKey,
      sepayWebhookSecret,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      smtpFrom,
      adminNotifyEmail,
      emailSubjectTemplate,
      emailBannerTitle,
      emailIntroText,
      sourceCodeDownloadUrl,
      hotlineSupport,
      docsUrl,
    } = body;

    await connectToDatabase();

    const updateData: Record<string, any> = {};
    if (bankCode !== undefined) updateData.bankCode = String(bankCode).trim().toUpperCase();
    if (bankName !== undefined) updateData.bankName = String(bankName).trim();
    if (accountNumber !== undefined) updateData.accountNumber = String(accountNumber).trim();
    if (accountName !== undefined) updateData.accountName = String(accountName).trim().toUpperCase();
    if (qrTemplate !== undefined) updateData.qrTemplate = String(qrTemplate).trim();
    if (sepayApiKey !== undefined) updateData.sepayApiKey = String(sepayApiKey).trim();
    if (sepayWebhookSecret !== undefined) updateData.sepayWebhookSecret = String(sepayWebhookSecret).trim();
    
    // SMTP & Email
    if (smtpHost !== undefined) updateData.smtpHost = String(smtpHost).trim();
    if (smtpPort !== undefined) updateData.smtpPort = Number(smtpPort) || 465;
    if (smtpSecure !== undefined) updateData.smtpSecure = Boolean(smtpSecure);
    if (smtpUser !== undefined) updateData.smtpUser = String(smtpUser).trim();
    if (smtpPass !== undefined) updateData.smtpPass = String(smtpPass).trim();
    if (smtpFrom !== undefined) updateData.smtpFrom = String(smtpFrom).trim();
    if (adminNotifyEmail !== undefined) updateData.adminNotifyEmail = String(adminNotifyEmail).trim();
    if (emailSubjectTemplate !== undefined) updateData.emailSubjectTemplate = String(emailSubjectTemplate).trim();
    if (emailBannerTitle !== undefined) updateData.emailBannerTitle = String(emailBannerTitle).trim();
    if (emailIntroText !== undefined) updateData.emailIntroText = String(emailIntroText).trim();

    if (sourceCodeDownloadUrl !== undefined) updateData.sourceCodeDownloadUrl = String(sourceCodeDownloadUrl).trim();
    if (hotlineSupport !== undefined) updateData.hotlineSupport = String(hotlineSupport).trim();
    if (docsUrl !== undefined) updateData.docsUrl = String(docsUrl).trim();

    const updatedConfig = await SystemConfig.findOneAndUpdate(
      { key: 'master_payment_config' },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Lưu cấu hình ngân hàng & Email SMTP thành công!',
      data: updatedConfig,
    });
  } catch (error: any) {
    console.error('Error saving master config:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lưu cấu hình', error: error.message },
      { status: 500 }
    );
  }
}
