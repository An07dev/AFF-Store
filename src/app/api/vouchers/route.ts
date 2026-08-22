import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Voucher from '@/models/Voucher';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

// GET /api/vouchers - Lấy danh sách Voucher công khai cho Khách hàng thu thập
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.trim() || '';
    const now = new Date();

    const vouchers = await Voucher.find({
      isActive: true,
      isPublic: true,
      endDate: { $gte: now },
      $or: [
        { totalUsageLimit: 0 },
        { $expr: { $lt: ['$usedCount', '$totalUsageLimit'] } },
      ],
    })
      .sort({ minOrderValue: 1, createdAt: -1 })
      .select('code name description discountType discountValue maxDiscountAmount minOrderValue totalUsageLimit usedCount limitPerCustomer startDate endDate applicableType');

    let usedVoucherCodes: string[] = [];
    if (phone) {
      const orders = await Order.find({
        'customer.phone': phone,
        voucherCode: { $exists: true, $ne: '' },
        status: { $ne: 'cancelled' },
      }).select('voucherCode');

      const phoneUsageMap: Record<string, number> = {};
      orders.forEach((o) => {
        if (o.voucherCode) {
          phoneUsageMap[o.voucherCode] = (phoneUsageMap[o.voucherCode] || 0) + 1;
        }
      });

      usedVoucherCodes = Object.keys(phoneUsageMap).filter((code) => {
        const v = vouchers.find((vch) => vch.code === code);
        return v && phoneUsageMap[code] >= (v.limitPerCustomer || 1);
      });
    }

    const formattedVouchers = vouchers.map((v) => {
      const vObj = v.toObject ? v.toObject() : v;
      return {
        ...vObj,
        isUsedByCustomer: usedVoucherCodes.includes(v.code),
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedVouchers,
    });
  } catch (error: any) {
    console.error('Error fetching public vouchers:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh sách mã giảm giá' },
      { status: 500 }
    );
  }
}
