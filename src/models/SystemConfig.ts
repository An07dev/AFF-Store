import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemConfig extends Document {
  key: string;
  // Bank & VietQR
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrTemplate: string;
  sepayApiKey: string;
  sepayWebhookSecret: string;
  
  // Email SMTP Settings
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  adminNotifyEmail?: string;
  
  // Email Content & Template Customization
  emailSubjectTemplate?: string;
  emailBannerTitle?: string;
  emailIntroText?: string;
  
  // Delivery & Support
  sourceCodeDownloadUrl: string;
  hotlineSupport: string;
  docsUrl: string;
  
  updatedAt: Date;
  createdAt: Date;
}

const SystemConfigSchema: Schema = new Schema<ISystemConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'master_payment_config',
      index: true,
    },
    // Bank
    bankCode: { type: String, default: 'MB' },
    bankName: { type: String, default: 'MBBank (Ngân Hàng Quân Đội)' },
    accountNumber: { type: String, default: '0973475484' },
    accountName: { type: String, default: 'SHOPBIG STORE' },
    qrTemplate: { type: String, default: 'compact2' },
    sepayApiKey: { type: String, default: 'shopbig_sepay_secret_2026' },
    sepayWebhookSecret: { type: String, default: '' },
    
    // SMTP
    smtpHost: { type: String, default: 'smtp.gmail.com' },
    smtpPort: { type: Number, default: 465 },
    smtpSecure: { type: Boolean, default: true },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    smtpFrom: { type: String, default: '"ShopBig Master" <noreply@shopbig.vn>' },
    adminNotifyEmail: { type: String, default: '' },
    
    // Email Template
    emailSubjectTemplate: {
      type: String,
      default: '[ShopBig] Bàn Giao Mã Bản Quyền & Mã Nguồn Đơn Hàng #{orderCode}',
    },
    emailBannerTitle: {
      type: String,
      default: 'XÁC NHẬN BÀN GIAO MÃ NGUỒN SHOPBIG',
    },
    emailIntroText: {
      type: String,
      default: 'Hệ thống ShopBig đã ghi nhận giao dịch thanh toán thành công của bạn qua VietQR SePay. Dưới đây là thông tin bàn giao mã kích hoạt bản quyền và gói source code hoàn chỉnh:',
    },
    
    // Delivery
    sourceCodeDownloadUrl: {
      type: String,
      default: 'https://drive.google.com/drive/folders/shopbig-source-code-full-package',
    },
    hotlineSupport: { type: String, default: '0988.888.888' },
    docsUrl: { type: String, default: 'https://shopbig.vn/docs/setup-guide' },
  },
  {
    timestamps: true,
    collection: '_system_configs',
  }
);

export const SystemConfig: Model<ISystemConfig> =
  mongoose.models.SystemConfig || mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);

export default SystemConfig;
