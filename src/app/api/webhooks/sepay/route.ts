import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { extractOrderCode } from '@/lib/payment/sepay';
import { deductOrderInventory } from '@/lib/inventory-helper';
import { createGHNOrder } from '@/lib/shipping/ghn';
import { createGHTKOrder } from '@/lib/shipping/ghtk';
import { createViettelPostOrder } from '@/lib/shipping/viettelpost';

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
    // Optional API Key verification if configured in .env.local
    const apiKey = process.env.SEPAY_API_KEY;
    if (apiKey) {
      const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
      const providedKey = authHeader.replace(/^Apikey\s+/i, '').replace(/^Bearer\s+/i, '').trim();
      if (providedKey !== apiKey.trim()) {
        return NextResponse.json(
          { success: false, message: 'Sai mã xác thực API Key từ SePay' },
          { status: 401 }
        );
      }
    }

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
    order.paidAt = new Date();
    if (body.referenceCode || body.transactionId || body.id) {
      order.transactionId = String(body.referenceCode || body.transactionId || body.id);
    }

    // Tự động trừ tồn kho theo từng biến thể sản phẩm khi chuyển khoản thành công
    if (!order.inventoryDeducted && Array.isArray(order.items) && order.items.length > 0) {
      await deductOrderInventory(order);
    }

    const newLog = {
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Đã thanh toán',
      location: 'Cổng thanh toán VietQR (SePay)',
      description: `Khách hàng đã thanh toán thành công ${receivedAmount ? receivedAmount.toLocaleString('vi-VN') + '₫' : ''} qua mã VietQR. Đơn hàng đã được xác nhận và trừ tồn kho tự động.`,
      createdAt: new Date(),
    };

    if (!order.shippingLogs) order.shippingLogs = [];
    order.shippingLogs.push(newLog);

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