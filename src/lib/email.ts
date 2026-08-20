import nodemailer from 'nodemailer';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { formatPrice } from '@/lib/utils';

export interface IEmailSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  senderName: string;
  senderEmail: string;
  adminNotificationEmail: string;
  sendToCustomer: boolean;
  sendToAdmin: boolean;
}

export const defaultEmailSettings: IEmailSettings = {
  enabled: true,
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  senderName: process.env.SMTP_SENDER_NAME || 'ShopTik Store',
  senderEmail: process.env.SMTP_USER || '',
  adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || '',
  sendToCustomer: true,
  sendToAdmin: true,
};

// 1. Get Effective Email Settings from DB or ENV
export async function getEmailSettings(): Promise<IEmailSettings> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'email_settings' });
    if (setting && setting.value) {
      return {
        ...defaultEmailSettings,
        ...setting.value,
      };
    }
  } catch (err) {
    console.error('Error loading email settings from DB:', err);
  }
  return defaultEmailSettings;
}

// 2. Create Nodemailer Transporter
export async function createTransporter(customConfig?: IEmailSettings) {
  const config = customConfig || (await getEmailSettings());

  if (!config.user || !config.pass) {
    return null;
  }

  const isSecure = config.port === 465 || config.secure;

  return nodemailer.createTransport({
    host: config.host || 'smtp.gmail.com',
    port: Number(config.port) || 465,
    secure: isSecure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// 3. HTML Template for Customer Order Confirmation
export function generateCustomerOrderEmailHtml(order: any, shopName = 'ShopTik Store', siteUrl = 'http://localhost:3000') {
  const orderCode = order.orderCode || order._id;
  const customerName = order.customer?.name || 'Quý khách';
  const customerPhone = order.customer?.phone || '';
  const customerAddress = order.customer?.address || '';
  const paymentMethodLabel =
    order.paymentMethod === 'bank_transfer'
      ? 'Chuyển khoản Ngân hàng (VietQR)'
      : 'Thanh toán khi nhận hàng (COD)';
  const paymentStatusBadge =
    order.paymentStatus === 'paid'
      ? '<span style="background:#10b981;color:#fff;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;">ĐÃ THANH TOÁN</span>'
      : '<span style="background:#f59e0b;color:#fff;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;">CHỜ THANH TOÁN</span>';

  const itemsHtml = (order.items || [])
    .map((item: any) => {
      const priceFormatted = formatPrice(item.price);
      const totalItemFormatted = formatPrice(item.price * item.quantity);
      const variantText = item.variant?.name || item.variant?.title || '';
      const imageSrc = item.image || `${siteUrl}/file.svg`;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 8px; width: 60px; vertical-align: top;">
            <img src="${imageSrc}" alt="${item.name}" style="width: 54px; height: 54px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" />
          </td>
          <td style="padding: 12px 8px; vertical-align: top;">
            <div style="font-weight: 700; color: #1e293b; font-size: 13px; line-height: 1.4;">${item.name}</div>
            ${variantText ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px;">Phân loại: <strong>${variantText}</strong></div>` : ''}
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">SL: x${item.quantity} (${priceFormatted})</div>
          </td>
          <td style="padding: 12px 8px; vertical-align: top; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">
            ${totalItemFormatted}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng #${orderCode}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #334155; line-height: 1.6;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${shopName}</h1>
      <div style="margin-top: 8px; font-size: 14px; opacity: 0.95;">🎉 ĐẶT HÀNG THÀNH CÔNG!</div>
      <div style="margin-top: 14px; display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">
        Mã đơn: #${orderCode}
      </div>
    </div>

    <!-- Body Content -->
    <div style="padding: 24px;">
      <p style="font-size: 14px; margin-top: 0; color: #1e293b;">
        Chào <strong>${customerName}</strong>,
      </p>
      <p style="font-size: 13px; color: #475569; margin-bottom: 20px;">
        Cảm ơn bạn đã tin tưởng mua sắm tại <strong>${shopName}</strong>! Đơn hàng của bạn đã được tiếp nhận và đang được chuẩn bị đóng gói cẩn thận.
      </p>

      <!-- Customer & Shipping Info Box -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
          📍 Thông Tin Nhận Hàng
        </div>
        <div style="font-size: 13px; margin-bottom: 4px;"><strong>Người nhận:</strong> ${customerName}</div>
        <div style="font-size: 13px; margin-bottom: 4px;"><strong>Số điện thoại:</strong> ${customerPhone}</div>
        <div style="font-size: 13px; margin-bottom: 4px;"><strong>Địa chỉ:</strong> ${customerAddress}</div>
        <div style="font-size: 13px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: space-between;">
          <span><strong>Hình thức:</strong> ${paymentMethodLabel}</span>
          ${paymentStatusBadge}
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          📦 Chi Tiết Sản Phẩm
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Order Summary Total Box -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #475569;">
          <span>Tiền hàng:</span>
          <span style="font-weight: 600; color: #1e293b;">${formatPrice(order.subtotal || 0)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #475569;">
          <span>Phí giao hàng:</span>
          <span style="font-weight: 600; color: #1e293b;">${order.shippingFee > 0 ? formatPrice(order.shippingFee) : 'Miễn phí'}</span>
        </div>
        ${order.discountAmount ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #10b981;">
          <span>Giảm giá:</span>
          <span style="font-weight: 600;">-${formatPrice(order.discountAmount)}</span>
        </div>` : ''}
        <div style="border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; font-weight: 800; color: #0f172a;">TỔNG THANH TOÁN:</span>
          <span style="font-size: 18px; font-weight: 900; color: #2563eb;">${formatPrice(order.totalAmount || 0)}</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0 10px 0;">
        <a href="${siteUrl}/order-success?code=${orderCode}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          🔍 Tra Cứu Tiến Trình Đơn Hàng
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0 0 6px 0; color: #f8fafc; font-weight: 700;">${shopName} - Mua sắm uy tín & chất lượng</p>
      <p style="margin: 0;">Mọi thắc mắc xin vui lòng liên hệ trực tiếp qua Chat trên Website để được hỗ trợ nhanh nhất.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// 4. HTML Template for Admin Order Alert
export function generateAdminOrderAlertEmailHtml(order: any, shopName = 'ShopTik Store', siteUrl = 'http://localhost:3000') {
  const orderCode = order.orderCode || order._id;
  const customerName = order.customer?.name || 'Khách hàng';
  const customerPhone = order.customer?.phone || '';
  const customerAddress = order.customer?.address || '';
  const totalAmountFormatted = formatPrice(order.totalAmount || 0);

  const itemsListText = (order.items || [])
    .map(
      (item: any) =>
        `• <strong>${item.name}</strong> ${item.variant?.name ? `(${item.variant.name})` : ''} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    )
    .join('<br>');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>[Đơn Hàng Mới] #${orderCode}</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: #ef4444; color: #ffffff; padding: 8px 14px; border-radius: 6px; font-weight: 800; font-size: 14px; display: inline-block; margin-bottom: 16px;">
      🔥 CÓ ĐƠN HÀNG MỚI CẦN XỬ LÝ
    </div>
    <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a;">Đơn hàng #${orderCode} vừa được tạo!</h2>

    <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;">
      <p style="margin: 0 0 6px 0;"><strong>Khách hàng:</strong> ${customerName}</p>
      <p style="margin: 0 0 6px 0;"><strong>Số điện thoại:</strong> <a href="tel:${customerPhone}" style="color: #2563eb; font-weight: 700;">${customerPhone}</a></p>
      <p style="margin: 0 0 6px 0;"><strong>Địa chỉ nhận hàng:</strong> ${customerAddress}</p>
      <p style="margin: 0 0 6px 0;"><strong>Phương thức:</strong> ${order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản VietQR' : 'Ship COD'}</p>
      <p style="margin: 0;"><strong>Tổng tiền thu:</strong> <span style="font-size: 16px; font-weight: 800; color: #dc2626;">${totalAmountFormatted}</span></p>
    </div>

    <div style="margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
      <div style="font-weight: 700; margin-bottom: 6px;">Danh sách sản phẩm:</div>
      ${itemsListText}
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${siteUrl}/admin/orders" target="_blank" style="background: #0f172a; color: #ffffff; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px;">
        Xem Quản Trị Đơn Hàng
      </a>
    </div>
  </div>
</body>
</html>
  `;
}

// 5. Main Dispatcher: Send Order Emails Asynchronously (Non-blocking)
export async function sendOrderEmails(order: any) {
  try {
    const config = await getEmailSettings();
    if (!config.enabled) {
      console.log('ℹ️ Email notifications are disabled in settings.');
      return;
    }

    const transporter = await createTransporter(config);
    if (!transporter) {
      console.warn('⚠️ Cannot create email transporter (SMTP credentials missing).');
      return;
    }

    const shopName = config.senderName || 'ShopTik Store';
    const sender = `"${shopName}" <${config.user}>`;

    // 1. Send confirmation email to Customer (if valid email provided)
    const customerEmail = order.customer?.email;
    const isRealCustomerEmail =
      customerEmail &&
      customerEmail.includes('@') &&
      !customerEmail.endsWith('@shoptik.vn') &&
      !customerEmail.endsWith('@placeholder.vn');

    if (config.sendToCustomer && isRealCustomerEmail) {
      try {
        const customerHtml = generateCustomerOrderEmailHtml(order, shopName);
        await transporter.sendMail({
          from: sender,
          to: customerEmail,
          subject: `[${shopName}] Xác nhận đơn hàng #${order.orderCode} - Đặt hàng thành công!`,
          html: customerHtml,
        });
        console.log(`✉️ Order confirmation email sent to customer: ${customerEmail}`);
      } catch (err: any) {
        console.error('❌ Failed to send customer email:', err.message);
      }
    }

    // 2. Send alert email to Admin
    const adminEmail = config.adminNotificationEmail || config.user;
    if (config.sendToAdmin && adminEmail && adminEmail.includes('@')) {
      try {
        const adminHtml = generateAdminOrderAlertEmailHtml(order, shopName);
        await transporter.sendMail({
          from: sender,
          to: adminEmail,
          subject: `🔥 [Đơn Hàng Mới] #${order.orderCode} - Khách ${order.customer?.name || 'Khách'} vừa đặt ${formatPrice(order.totalAmount || 0)}`,
          html: adminHtml,
        });
        console.log(`✉️ Admin new order alert email sent to: ${adminEmail}`);
      } catch (err: any) {
        console.error('❌ Failed to send admin alert email:', err.message);
      }
    }
  } catch (globalErr: any) {
    console.error('❌ Global error in sendOrderEmails:', globalErr.message);
  }
}

// 6. Test Email Dispatcher
export async function sendTestEmail(targetEmail: string, customConfig?: IEmailSettings) {
  const config = customConfig || (await getEmailSettings());
  const transporter = await createTransporter(config);

  if (!transporter) {
    throw new Error('Chưa cấu hình tài khoản email hoặc mật khẩu ứng dụng SMTP');
  }

  const shopName = config.senderName || 'ShopTik Store';
  const sender = `"${shopName}" <${config.user}>`;

  const info = await transporter.sendMail({
    from: sender,
    to: targetEmail,
    subject: `✅ [${shopName}] Kiểm tra kết nối Email SMTP thành công!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; color: #1e293b;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
          <h2 style="color: #10b981; margin: 0 0 10px 0;">🎉 Kết Nối SMTP Thành Công!</h2>
          <p style="font-size: 14px; color: #475569;">Hệ thống gửi email thông báo đơn hàng của <strong>${shopName}</strong> đã hoạt động chính xác.</p>
          <div style="margin-top: 16px; font-size: 12px; color: #94a3b8;">Thời gian gửi: ${new Date().toLocaleString('vi-VN')}</div>
        </div>
      </div>
    `,
  });

  return info;
}
