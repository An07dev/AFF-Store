import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { License } from '@/models/License';
import { Customer } from '@/models/Customer';

function generateLicenseKey(): string {
  const part = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, 'A');
  return `AFF-${part()}-${part()}-${part()}`;
}

export function formatZaloMessage(
  buyerName: string,
  licenseKey: string,
  plan: string = '399k',
  hotline: string = '0988.888.888'
): string {
  const planLabel = plan === '799k' ? 'Gói Setup A-Z 799K' : 'Gói Tự Cài Đặt 399K';
  return `Cảm ơn ${buyerName} đã mua mã nguồn ShopBig (${planLabel})!
🔑 Mã bản quyền của bạn: ${licenseKey}
🌐 Hướng dẫn kích hoạt: Mở website -> Nhập tên shop và mã key để hệ thống tự động kích hoạt CSDL riêng trong 3 giây.
📞 Hotline kỹ thuật hỗ trợ: ${hotline}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      buyerName,
      buyerPhone = '',
      plan = '399k',
      price,
      notes = '',
      count = 1,
      hotline = '0988.888.888',
    } = body;

    if (!buyerName) {
      return NextResponse.json(
        { success: false, message: 'Tên người mua / khách hàng là bắt buộc' },
        { status: 400 }
      );
    }

    const cleanBuyerName = String(buyerName).trim();
    const cleanBuyerPhone = String(buyerPhone).trim().replace(/[\s.-]/g, '');
    const cleanPlan = plan === '799k' ? '799k' : '399k';
    const keyPrice = price ? Number(price) : cleanPlan === '799k' ? 799000 : 399000;
    const numKeys = Math.min(20, Math.max(1, Number(count) || 1));

    await connectToDatabase();

    const createdKeys = [];

    for (let i = 0; i < numKeys; i++) {
      let uniqueKey = '';
      let isUnique = false;
      let attempts = 0;

      // Ensure key uniqueness
      while (!isUnique && attempts < 10) {
        uniqueKey = generateLicenseKey();
        const existing = await License.findOne({ licenseKey: uniqueKey });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      const licenseDoc = await License.create({
        licenseKey: uniqueKey,
        buyerName: numKeys > 1 ? `${cleanBuyerName} (#${i + 1})` : cleanBuyerName,
        buyerPhone: cleanBuyerPhone,
        plan: cleanPlan,
        price: keyPrice,
        notes: String(notes).trim(),
        status: 'available',
        shopName: null,
        assignedDb: null,
        activatedAt: null,
        createdBy: 'master_admin',
      });

      createdKeys.push({
        ...licenseDoc.toObject(),
        zaloMessage: formatZaloMessage(cleanBuyerName, uniqueKey, cleanPlan, hotline),
      });
    }

    // Tự động đồng bộ vào CRM nếu có số điện thoại
    if (cleanBuyerPhone) {
      try {
        await Customer.findOneAndUpdate(
          { phone: cleanBuyerPhone },
          {
            $set: {
              name: cleanBuyerName,
              lastOrderAt: new Date(),
            },
            $inc: { totalOrders: numKeys, totalSpent: keyPrice * numKeys },
            $addToSet: { tags: `license-${cleanPlan}` },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (crmErr) {
        console.warn('Customer CRM sync skipped:', crmErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã tạo thành công ${numKeys} mã bản quyền`,
      count: numKeys,
      data: createdKeys,
    });
  } catch (error: any) {
    console.error('Error creating license keys:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo mã bản quyền', error: error.message },
      { status: 500 }
    );
  }
}
