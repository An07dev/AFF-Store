import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import { generateOrderCode } from '@/lib/utils';
import { sendOrderEmails } from '@/lib/email';

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

    const filter: any = {};

    if (phone) {
      filter['customer.phone'] = phone;
    }
    if (email) {
      filter['customer.email'] = email;
    }
    if (userId) {
      filter['userId'] = userId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

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
    const discountAmount = body.discountAmount || 0;
    const totalAmount = body.totalAmount || Math.max(0, subtotal + shippingFee - discountAmount);

    const newOrder = await Order.create({
      orderCode,
      customer: body.customer,
      items: body.items,
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      paymentMethod: body.paymentMethod || 'cod',
      paymentStatus: body.paymentStatus || 'unpaid',
      status: body.status || 'pending',
      shippingProvider: body.shippingProvider || 'ghn',
      shippingCarrier: body.shippingCarrier || 'Giao Hàng Nhanh (GHN)',
      notes: body.notes,
    });

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

    // Update product soldCount & stock
    for (const item of body.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { soldCount: item.quantity, stock: -item.quantity },
        });
      }
    }

    // Gửi email thông báo đơn hàng ngầm (không bắt khách hàng phải chờ)
    sendOrderEmails(newOrder.toObject ? newOrder.toObject() : newOrder).catch((e) => {
      console.error('Email dispatch error:', e);
    });

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