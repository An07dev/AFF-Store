import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import Voucher from '@/models/Voucher';
import { generateOrderCode } from '@/lib/utils';
import { sendOrderEmails } from '@/lib/email';
import { deductOrderInventory } from '@/lib/inventory-helper';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    // Điều kiện lọc cốt lõi: Ẩn các đơn chuyển khoản VietQR chưa thanh toán (chưa quét mã QR).
    // Chỉ hiển thị đơn COD hoặc đơn chuyển khoản đã quét mã thanh toán thành công (paid / refunded).
    const andConditions: any[] = [
      {
        $or: [
          { paymentMethod: { $nin: ['bank_transfer', 'online'] } },
          { paymentStatus: { $in: ['paid', 'refunded'] } },
        ],
      },
    ];

    if (phone) {
      andConditions.push({ 'customer.phone': phone });
    }
    if (email) {
      andConditions.push({ 'customer.email': email });
    }
    if (userId) {
      andConditions.push({ userId });
    }

    if (status && status !== 'all') {
      andConditions.push({ status });
    }

    if (search) {
      andConditions.push({
        $or: [
          { orderCode: { $regex: search, $options: 'i' } },
          { 'customer.name': { $regex: search, $options: 'i' } },
          { 'customer.phone': { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      andConditions.push({ createdAt: dateFilter });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh sách đơn hàng' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.customer || !body.customer.name || !body.customer.phone || !body.customer.address) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp đầy đủ thông tin khách hàng' },
        { status: 400 }
      );
    }

    if (!body.items || !body.items.length) {
      return NextResponse.json(
        { success: false, message: 'Đơn hàng không có sản phẩm' },
        { status: 400 }
      );
    }

    const orderCode = generateOrderCode();
    const subtotal = body.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shippingFee = body.shippingFee || 0;
    let discountAmount = 0;
    let validVoucherCode: string | undefined = undefined;

    // Strict Voucher Validation
    if (body.voucherCode) {
      const cleanCode = body.voucherCode.trim().toUpperCase();
      const voucher = await Voucher.findOne({ code: cleanCode });
      const now = new Date();

      if (!voucher || !voucher.isActive) {
        return NextResponse.json(
          { success: false, message: `Mã giảm giá "${cleanCode}" không hợp lệ hoặc đã bị khóa!` },
          { status: 400 }
        );
      }

      if (voucher.startDate && now < new Date(voucher.startDate)) {
        return NextResponse.json(
          { success: false, message: `Mã giảm giá "${cleanCode}" chưa đến ngày áp dụng!` },
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
          { success: false, message: `Mã giảm giá "${cleanCode}" đã hết lượt sử dụng toàn shop!` },
          { status: 400 }
        );
      }

      if (voucher.minOrderValue > 0 && subtotal < voucher.minOrderValue) {
        return NextResponse.json(
          { success: false, message: `Đơn hàng chưa đạt giá trị tối thiểu để dùng mã "${cleanCode}"!` },
          { status: 400 }
        );
      }

      const phone = body.customer?.phone?.trim() || '';
      if (phone && voucher.limitPerCustomer > 0) {
        const phoneUsedCount = await Order.countDocuments({
          'customer.phone': phone,
          voucherCode: cleanCode,
          status: { $ne: 'cancelled' },
          $or: [
            { paymentMethod: { $nin: ['bank_transfer', 'online'] } },
            { paymentStatus: 'paid' },
          ],
        });

        if (phoneUsedCount >= voucher.limitPerCustomer) {
          return NextResponse.json(
            {
              success: false,
              message: `Mã giảm giá "${cleanCode}" đã được sử dụng với số điện thoại ${phone}!`,
            },
            { status: 400 }
          );
        }
      }

      // Calculate server-side discount
      if (voucher.discountType === 'fixed') {
        discountAmount = Math.min(voucher.discountValue, subtotal);
      } else if (voucher.discountType === 'percent') {
        const calc = Math.round((subtotal * voucher.discountValue) / 100);
        discountAmount =
          voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0
            ? Math.min(calc, voucher.maxDiscountAmount, subtotal)
            : Math.min(calc, subtotal);
      }

      validVoucherCode = cleanCode;
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
    const paymentMethod = body.paymentMethod || 'cod';
    const isCOD = paymentMethod === 'cod';
    const isAlreadyPaid = body.paymentStatus === 'paid';

    const newOrder = await Order.create({
      orderCode,
      customer: body.customer,
      items: body.items,
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: body.paymentStatus || (isAlreadyPaid ? 'paid' : 'unpaid'),
      status: body.status || 'pending',
      shippingProvider: body.shippingProvider || 'ghn',
      shippingCarrier: body.shippingCarrier || 'Giao Hàng Nhanh (GHN)',
      voucherCode: validVoucherCode,
      voucherDiscount: discountAmount,
      notes: body.notes,
      inventoryDeducted: false,
    });

    // Chỉ thực hiện trừ tồn kho, cập nhật doanh số khách hàng, tăng lượt voucher và gửi email
    // ngay lập tức nếu là đơn COD hoặc đơn đã thanh toán.
    // Đối với đơn Chuyển khoản VietQR chưa quét mã (unpaid), các tác vụ này sẽ được kích hoạt
    // tự động trong webhook SePay khi khách quét QR thanh toán thành công!
    if (isCOD || isAlreadyPaid) {
      // If voucher was used, increment its usage count
      if (validVoucherCode) {
        await Voucher.findOneAndUpdate(
          { code: validVoucherCode },
          { $inc: { usedCount: 1 } }
        ).catch((err) => console.error('Error updating voucher usedCount:', err));
      }

      // Update customer stats
      const phone = body.customer.phone.trim();
      let customerDoc = await Customer.findOne({ phone });
      if (!customerDoc) {
        customerDoc = await Customer.create({
          name: body.customer.name,
          phone,
          email: body.customer.email,
          address: body.customer.address,
          province: body.customer.province,
          district: body.customer.district,
          ward: body.customer.ward,
          orderCount: 1,
          totalSpent: totalAmount,
          lastOrderAt: new Date(),
        });
      } else {
        customerDoc.orderCount += 1;
        customerDoc.totalSpent += totalAmount;
        customerDoc.lastOrderAt = new Date();
        await customerDoc.save();
      }

      // Tự động trừ tồn kho theo từng biến thể sản phẩm
      await deductOrderInventory(newOrder);

      // Gửi email thông báo đơn hàng ngầm (không bắt khách hàng phải chờ)
      sendOrderEmails(newOrder.toObject ? newOrder.toObject() : newOrder).catch((e) => {
        console.error('Email dispatch error:', e);
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo đơn hàng thành công!',
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tạo đơn hàng' },
      { status: 500 }
    );
  }
}