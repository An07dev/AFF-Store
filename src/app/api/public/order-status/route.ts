import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import { WebhookLog } from '@/models/WebhookLog';
import { License } from '@/models/License';
import { SystemConfig } from '@/models/SystemConfig';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GET: Kiểm tra trạng thái thanh toán của đơn hàng theo orderCode hoặc SĐT
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawOrderCode = searchParams.get('orderCode')?.trim() || '';
    const rawPhone = searchParams.get('phone')?.trim().replace(/[\s.-]/g, '') || '';

    if (!rawOrderCode && !rawPhone) {
      return NextResponse.json(
        { success: false, message: 'Thiếu mã đơn hàng hoặc số điện thoại' },
        { status: 400 }
      );
    }

    const orderCode = rawOrderCode.toUpperCase();

    await connectToDatabase();

    // 1. Tìm Lead theo orderCode
    let lead = null;
    if (orderCode) {
      lead = await Lead.findOne({ orderCode }).lean();
    }

    if (!lead && rawPhone) {
      lead = await Lead.findOne({ phone: rawPhone }).sort({ createdAt: -1 }).lean();
    }

    // 2. Tìm WebhookLog khớp với orderCode để lấy license key & emailStatus
    let webhookLog = null;
    if (orderCode) {
      webhookLog = await WebhookLog.findOne({
        matchedOrderCode: orderCode,
        status: 'success',
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!webhookLog && rawPhone) {
      webhookLog = await WebhookLog.findOne({
        buyerPhone: rawPhone,
        status: 'success',
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // 3. Tìm License key trực tiếp nếu có
    let license = null;
    if (webhookLog?.generatedLicenseKey) {
      license = await License.findOne({ licenseKey: webhookLog.generatedLicenseKey }).lean();
    }
    if (!license && orderCode) {
      license = await License.findOne({
        notes: { $regex: orderCode, $options: 'i' },
      })
        .sort({ createdAt: -1 })
        .lean();
    }
    if (!license && rawPhone) {
      license = await License.findOne({
        buyerPhone: rawPhone,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // 4. Lấy cấu hình link tải source code
    const systemConfig = await SystemConfig.findOne({ key: 'master_payment_config' }).lean();
    const sourceCodeDownloadUrl =
      systemConfig?.sourceCodeDownloadUrl ||
      'https://drive.google.com/drive/folders/shopbig-source-code-full-package';

    // 5. Xác định trạng thái đã thanh toán hay chưa
    const isPaid =
      lead?.paymentStatus === 'paid' ||
      webhookLog?.status === 'success' ||
      !!license;

    if (isPaid) {
      return NextResponse.json({
        success: true,
        isPaid: true,
        orderCode: lead?.orderCode || webhookLog?.matchedOrderCode || orderCode,
        buyerName: lead?.name || webhookLog?.buyerName || license?.buyerName || 'Khách Hàng',
        buyerEmail: lead?.email || webhookLog?.buyerEmail || '',
        buyerPhone: lead?.phone || webhookLog?.buyerPhone || rawPhone,
        plan: lead?.plan || license?.plan || '399k',
        amount: lead?.amount || webhookLog?.transferAmount || (lead?.plan === '799k' ? 799000 : 399000),
        licenseKey: webhookLog?.generatedLicenseKey || license?.licenseKey || '',
        emailStatus: webhookLog?.emailStatus || (lead?.email ? 'sent' : 'skipped_no_email'),
        sourceCodeDownloadUrl,
        paidAt: webhookLog?.createdAt || license?.createdAt || new Date().toISOString(),
      });
    }

    // Fallback: Kiểm tra file local leads.json nếu có
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const leadsFile = path.join(dataDir, 'leads.json');
      if (fs.existsSync(leadsFile)) {
        const fileContent = fs.readFileSync(leadsFile, 'utf-8');
        const localLeads = JSON.parse(fileContent || '[]');
        const localLead = localLeads.find(
          (l: any) => l.orderCode === orderCode || (rawPhone && l.phone === rawPhone)
        );
        if (localLead && localLead.paymentStatus === 'paid') {
          return NextResponse.json({
            success: true,
            isPaid: true,
            orderCode: localLead.orderCode,
            buyerName: localLead.name,
            buyerEmail: localLead.email || '',
            buyerPhone: localLead.phone,
            plan: localLead.plan || '399k',
            amount: localLead.amount || (localLead.plan === '799k' ? 799000 : 399000),
            licenseKey: '',
            emailStatus: 'sent',
            sourceCodeDownloadUrl,
            paidAt: localLead.updatedAt || new Date().toISOString(),
          });
        }
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      isPaid: false,
      orderCode: lead?.orderCode || orderCode,
      paymentStatus: 'pending',
      message: 'Chờ giao dịch VietQR từ SePay',
    });
  } catch (error: any) {
    console.error('Error checking order status:', error);
    return NextResponse.json(
      {
        success: false,
        isPaid: false,
        message: 'Lỗi kiểm tra trạng thái đơn hàng',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
