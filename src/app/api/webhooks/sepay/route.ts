import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { extractOrderCode } from '@/lib/payment/sepay';

export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'SePay VietQR Webhook Listener',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { content, description, transferAmount, amount, transferType, orderCode: directCode, code } = body;

    // Optional transferType filter (skip only if explicitly 'out')
    if (transferType === 'out') {
      return NextResponse.json({ success: true, message: 'Bỏ qua giao dịch chuyển tiền đi (out)' });
    }

    const orderCode =
      directCode?.toUpperCase() ||
      code?.toUpperCase() ||
      extractOrderCode(content) ||
      extractOrderCode(description);

    if (!orderCode) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy mã đơn hàng ST... trong nội dung thanh toán' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy đơn hàng ${orderCode}` },
        { status: 404 }
      );
    }

    const receivedAmount = Number(transferAmount || amount || 0);

    // Update order payment status
    order.paymentStatus = 'paid';
    if (order.status === 'pending') {
      order.status = 'confirmed';
    }
    await order.save();

    return NextResponse.json({
      success: true,
      message: `Đã xác nhận thanh toán thành công cho đơn hàng #${orderCode}`,
      data: {
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
        receivedAmount: receivedAmount || order.totalAmount,
        paymentStatus: order.paymentStatus,
        status: order.status,
      },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xử lý webhook SePay' },
      { status: 500 }
    );
  }
}