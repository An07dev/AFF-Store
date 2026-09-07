import { NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import { License } from '@/models/License';
import { Customer } from '@/models/Customer';
import { WebhookLog } from '@/models/WebhookLog';
import { sendLicenseEmail } from '@/lib/email';

function generateLicenseKey(): string {
  const part = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, 'A');
  return `AFF-${part()}-${part()}-${part()}`;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // SePay standard fields
    const {
      id,
      gateway = 'VietQR',
      transactionDate,
      accountNumber = '',
      code,
      content = '',
      description = '',
      transferType = 'in',
      transferAmount = 0,
      referenceCode = '',
    } = payload;

    const rawContent = String(content || description || code || '').trim();
    const amount = Number(transferAmount) || 0;

    // Check transfer type: must be incoming transfer
    if (transferType !== 'in' && amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Bỏ qua giao dịch không phải tiền vào',
      });
    }

    await connectToMasterDatabase();

    // 1. Trích xuất mã đơn hàng thông minh từ nội dung chuyển khoản
    // Format hỗ trợ: ST399K_123456, ST399K123456, ST399K 123456, ST799K_123456, GOI399K 123456, ORD123456, số 6 chữ số
    let matchedLead = null;
    let extractedOrderCode = '';

    // Bước 1.1: Match prefix dạng ST399K, ST799K, ST10K, GOI399K, GOI799K, ORD kèm số
    const prefixMatch = rawContent.match(/(ST(?:399|799|10)K|GOI(?:399|799|10)K|ORD)[_\s-]?(\d{4,8})/i);
    if (prefixMatch) {
      const prefix = prefixMatch[1].toUpperCase();
      const numberPart = prefixMatch[2];
      const codeWithUnderscore = `${prefix}_${numberPart}`;
      const codeWithoutUnderscore = `${prefix}${numberPart}`;

      matchedLead = await Lead.findOne({
        $or: [
          { orderCode: codeWithUnderscore },
          { orderCode: codeWithoutUnderscore },
          { orderCode: new RegExp(numberPart + '$') },
        ],
      });

      extractedOrderCode = matchedLead?.orderCode || codeWithUnderscore;
    }

    // Bước 1.2: Nếu chưa tìm thấy, trích xuất tất cả các chuỗi 5-6 chữ số trong nội dung chuyển khoản để khớp đuôi orderCode
    if (!matchedLead) {
      const digitsMatches = rawContent.match(/\d{5,6}/g) || [];
      for (const digits of digitsMatches) {
        matchedLead = await Lead.findOne({
          orderCode: new RegExp(digits + '$'),
        });
        if (matchedLead) {
          extractedOrderCode = matchedLead.orderCode;
          break;
        }
      }
    }

    // Bước 1.3: Trích xuất số điện thoại (03x, 05x, 07x, 08x, 09x hoặc 84x)
    const phoneMatch = rawContent.match(/(0[3|5|7|8|9]\d{8})/) || rawContent.match(/(84[3|5|7|8|9]\d{8})/);
    const extractedPhone = phoneMatch ? phoneMatch[1].replace(/^84/, '0') : '';

    if (!matchedLead && extractedPhone) {
      matchedLead = await Lead.findOne({ phone: extractedPhone }).sort({ createdAt: -1 });
      if (matchedLead) extractedOrderCode = matchedLead.orderCode;
    }

    // Xác định thông tin người mua và gói bản quyền
    let buyerName = matchedLead?.name || 'Khách Hàng VietQR';
    let buyerPhone = matchedLead?.phone || extractedPhone;
    let buyerEmail = matchedLead?.email || '';
    let plan = matchedLead?.plan || (extractedOrderCode.includes('799') || amount >= 750000 ? '799k' : '399k');
    const orderCode = matchedLead?.orderCode || extractedOrderCode || `SEPAY_${id || Date.now()}`;

    // Nếu chưa có email từ Lead, kiểm tra trong Customer CRM theo SĐT
    if (!buyerEmail && buyerPhone) {
      try {
        const existingCustomer = await Customer.findOne({ phone: buyerPhone }).lean();
        if (existingCustomer) {
          buyerName = existingCustomer.name || buyerName;
          buyerEmail = existingCustomer.email || buyerEmail;
        }
      } catch {
        // ignore
      }
    }

    if (matchedLead) {
      // Cập nhật trạng thái Lead sang 'paid'
      matchedLead.paymentStatus = 'paid';
      matchedLead.paymentMethod = 'vietqr';
      await matchedLead.save();
    }

    // 2. Tự động sinh Mã Bản Quyền mới
    let uniqueKey = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      uniqueKey = generateLicenseKey();
      const existing = await License.findOne({ licenseKey: uniqueKey });
      if (!existing) isUnique = true;
      attempts++;
    }

    const defaultAmount = plan === '799k' ? 799000 : 399000;

    const createdLicense = await License.create({
      licenseKey: uniqueKey,
      buyerName,
      buyerPhone,
      plan,
      price: amount || defaultAmount,
      notes: `Kích hoạt tự động qua SePay Webhook - Giao dịch #${id || referenceCode || ''} | Mã đơn: ${orderCode} | Nội dung: ${rawContent}`,
      status: 'available',
      shopName: null,
      assignedDb: null,
      activatedAt: null,
      createdBy: 'sepay_webhook_bot',
    });

    // 3. Tự động cập nhật hồ sơ Khách Hàng (CRM)
    if (buyerPhone) {
      try {
        await Customer.findOneAndUpdate(
          { phone: buyerPhone },
          {
            $set: {
              name: buyerName,
              ...(buyerEmail ? { email: buyerEmail } : {}),
              lastOrderAt: new Date(),
            },
            $inc: { totalOrders: 1, totalSpent: amount || defaultAmount },
            $addToSet: { tags: ['sepay-buyer', `license-${plan}`] },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (crmErr) {
        console.warn('CRM update error:', crmErr);
      }
    }

    // 4. Gửi Email bàn giao mã nguồn & mã kích hoạt (nếu có email)
    let emailStatus: 'sent' | 'skipped_no_email' | 'failed' | 'simulated' = 'skipped_no_email';
    let emailErrorMsg = '';

    if (buyerEmail) {
      const emailRes = await sendLicenseEmail({
        toEmail: buyerEmail,
        buyerName,
        buyerPhone,
        orderCode,
        licenseKey: uniqueKey,
        plan,
        amount: amount || defaultAmount,
      });

      if (emailRes.success) {
        emailStatus = emailRes.simulated ? 'simulated' : 'sent';
      } else {
        emailStatus = 'failed';
        emailErrorMsg = emailRes.error || 'Lỗi gửi mail';
      }
    }

    // 5. Lưu vết vào Webhook Logs để Admin dễ dàng giám sát
    const logDoc = await WebhookLog.create({
      gateway,
      transactionId: id || referenceCode || Date.now(),
      transferAmount: amount,
      transferContent: rawContent,
      referenceCode,
      matchedOrderCode: orderCode,
      buyerName,
      buyerPhone,
      buyerEmail,
      generatedLicenseKey: uniqueKey,
      emailStatus,
      emailError: emailErrorMsg,
      rawPayload: payload,
      status: 'success',
      message: `Đã cấp bản quyền ${uniqueKey} thành công cho ${buyerName}`,
    });

    return NextResponse.json({
      success: true,
      message: `Xử lý Webhook thành công. Đã tạo bản quyền ${uniqueKey}`,
      orderCode,
      licenseKey: uniqueKey,
      buyerName,
      buyerEmail: buyerEmail || 'Chưa cung cấp email',
      emailStatus,
      logId: logDoc._id,
    });
  } catch (error: any) {
    console.error('Lỗi khi xử lý SePay Webhook:', error);

    try {
      await connectToMasterDatabase();
      await WebhookLog.create({
        gateway: 'sepay',
        transactionId: Date.now(),
        transferAmount: 0,
        transferContent: 'Lỗi parse webhook payload',
        rawPayload: {},
        status: 'failed',
        message: error.message || 'Lỗi không xác định',
      });
    } catch {
      // ignore
    }

    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi xử lý Webhook', error: error.message },
      { status: 500 }
    );
  }
}

// GET: Lấy danh sách lịch sử Webhook Logs cho Master Admin
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));

    await connectToMasterDatabase();

    const logs = await WebhookLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    const total = await WebhookLog.countDocuments({});

    return NextResponse.json({
      success: true,
      total,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải lịch sử Webhook Logs', error: error.message },
      { status: 500 }
    );
  }
}
