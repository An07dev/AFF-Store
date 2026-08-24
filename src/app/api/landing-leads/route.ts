import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import { sendOrderEmails } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, phone, email, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Họ tên và số điện thoại là bắt buộc' },
        { status: 400 }
      );
    }

    const orderCode = 'ST399K_' + Math.floor(100000 + Math.random() * 900000);

    // Save or update Customer
    try {
      await Customer.findOneAndUpdate(
        { phone },
        {
          name,
          phone,
          email: email || '',
          $inc: { orderCount: 1, totalSpent: 399000 },
          lastOrderAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('Customer upsert skipped:', e);
    }

    // Create Order Record in DB
    const newOrder = await Order.create({
      orderCode,
      customer: {
        name,
        phone,
        email: email || '',
        address: 'Nhận mã nguồn qua Email / Zalo',
        province: 'Toàn Quốc',
        district: 'Ngoại Sàn',
        ward: 'Online',
      },
      items: [
        {
          productId: null,
          title: 'Gói Bán Hàng Ngoại Sàn ShopTik (Full Code + Video + Ads)',
          price: 399000,
          quantity: 1,
          image: '',
        },
      ],
      pricing: {
        subtotal: 399000,
        shippingFee: 0,
        discount: 0,
        total: 399000,
      },
      payment: {
        method: 'bank_transfer',
        status: 'pending',
      },
      shipping: {
        carrier: 'online_delivery',
        trackingCode: '',
        status: 'pending',
      },
      notes: notes ? `[Đăng ký gói 399k]: ${notes}` : '[Đăng ký gói 399k]',
      status: 'pending',
    });

    // Try sending email notification
    try {
      await sendOrderEmails(newOrder);
    } catch (err) {
      console.warn('Email notification skipped:', err);
    }

    return NextResponse.json({
      success: true,
      orderCode,
      message: 'Đăng ký thành công',
      order: newOrder,
    });
  } catch (error: any) {
    console.error('Error creating landing lead:', error);
    // Graceful fallback
    const fallbackCode = 'ST399K_' + Math.floor(100000 + Math.random() * 900000);
    return NextResponse.json({
      success: true,
      orderCode: fallbackCode,
      message: 'Đăng ký thành công (offline)',
    });
  }
}
