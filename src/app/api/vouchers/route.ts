import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Voucher from '@/models/Voucher';

export const dynamic = 'force-dynamic';

// GET /api/vouchers - Lấy danh sách Voucher công khai cho Khách hàng thu thập
export async function GET() {
  try {
    await connectToDatabase();
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
      .select('code name description discountType discountValue maxDiscountAmount minOrderValue totalUsageLimit usedCount startDate endDate applicableType');

    return NextResponse.json({
      success: true,
      data: vouchers,
    });
  } catch (error: any) {
    console.error('Error fetching public vouchers:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh sách mã giảm giá' },
      { status: 500 }
    );
  }
}
