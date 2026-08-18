import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const code = searchParams.get('code');

    let order;
    if (orderId && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId);
    } else if (code) {
      order = await Order.findOne({ orderCode: code.toUpperCase() });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        orderCode: order.orderCode,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        isPaid: order.paymentStatus === 'paid',
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi kiểm tra thanh toán' },
      { status: 500 }
    );
  }
}