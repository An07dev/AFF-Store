import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Voucher from '@/models/Voucher';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

// POST /api/vouchers/validate - Kiểm tra hợp lệ và tính số tiền giảm giá
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { code, orderSubtotal = 0, phone = '' } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập mã Voucher' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const voucher = await Voucher.findOne({ code: cleanCode });

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: `Mã giảm giá "${cleanCode}" không tồn tại hoặc đã bị xóa!` },
        { status: 400 }
      );
    }

    if (!voucher.isActive) {
      return NextResponse.json(
        { success: false, message: `Mã giảm giá "${cleanCode}" hiện đang tạm khóa!` },
        { status: 400 }
      );
    }

    const now = new Date();
    if (voucher.startDate && now < new Date(voucher.startDate)) {
      return NextResponse.json(
        { success: false, message: `Mã giảm giá "${cleanCode}" chưa đến thời gian áp dụng!` },
        { status: 400 }
      );
    }

    if (voucher.endDate && now > new Date(voucher.endDate)) {
      return NextResponse.json(
        { success: false, message: `Mã giảm giá "${cleanCode}" đã hết hạn sử dụng!` },
        { status: 400 }
      );
    }

    if (voucher.totalUsageLimit > 0 && voucher.usedCount >= voucher.totalUsageLimit) {
      return NextResponse.json(
        { success: false, message: `Mã giảm giá "${cleanCode}" đã hết lượt sử dụng!` },
        { status: 400 }
      );
    }

    const subtotal = Number(orderSubtotal) || 0;
    if (voucher.minOrderValue > 0 && subtotal < voucher.minOrderValue) {
      const missing = voucher.minOrderValue - subtotal;
      const formattedMissing = new Intl.NumberFormat('vi-VN').format(missing);
      const formattedMin = new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue);
      return NextResponse.json(
        {
          success: false,
          message: `Đơn hàng tối thiểu ${formattedMin}đ mới áp dụng được mã này (Bạn cần mua thêm ${formattedMissing}đ).`,
        },
        { status: 400 }
      );
    }

    // Check customer phone usage if phone is provided
    const cleanPhone = phone ? phone.trim() : '';
    if (cleanPhone && voucher.limitPerCustomer > 0) {
      const usedByCustomer = await Order.countDocuments({
        'customer.phone': cleanPhone,
        voucherCode: cleanCode,
        status: { $ne: 'cancelled' },
        $or: [
          { paymentMethod: { $nin: ['bank_transfer', 'online'] } },
          { paymentStatus: 'paid' },
        ],
      });

      if (usedByCustomer >= voucher.limitPerCustomer) {
        return NextResponse.json(
          {
            success: false,
            message: `Mã giảm giá "${cleanCode}" chỉ áp dụng ${voucher.limitPerCustomer} lần cho mỗi số điện thoại!`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (voucher.discountType === 'fixed') {
      discountAmount = Math.min(voucher.discountValue, subtotal);
    } else if (voucher.discountType === 'percent') {
      const calculated = Math.round((subtotal * voucher.discountValue) / 100);
      if (voucher.maxDiscountAmount > 0) {
        discountAmount = Math.min(calculated, voucher.maxDiscountAmount, subtotal);
      } else {
        discountAmount = Math.min(calculated, subtotal);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        discountAmount,
        minOrderValue: voucher.minOrderValue,
      },
      message: `Áp dụng mã giảm giá thành công! Giảm ${new Intl.NumberFormat('vi-VN').format(discountAmount)}đ`,
    });
  } catch (error: any) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi kiểm tra mã giảm giá' },
      { status: 500 }
    );
  }
}
