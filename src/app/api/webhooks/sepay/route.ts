import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { extractOrderCode } from '@/lib/payment/sepay';
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

    // TỰ ĐỘNG ĐẨY ĐƠN SANG HÃNG VẬN CHUYỂN BÊN THỨ 3 (GHN / GHTK / VTP)
    if (!order.trackingCode || order.trackingCode.startsWith('TEMP-')) {
      const rawProvider = (order.shippingProvider || order.shippingCarrier || 'ghn').toLowerCase();
      let provider = 'ghn';
      if (rawProvider.includes('ghtk') || rawProvider.includes('tiết kiệm') || rawProvider.includes('tiet kiem')) {
        provider = 'ghtk';
      } else if (rawProvider.includes('viettel') || rawProvider.includes('vtp')) {
        provider = 'viettelpost';
      } else {
        provider = 'ghn';
      }

      try {
        const orderData = {
          orderCode: order.orderCode,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalAmount,
          to_name: order.customer?.name,
          to_phone: order.customer?.phone,
          to_address: order.customer?.address,
          province: order.customer?.province,
          district: order.customer?.district,
          ward: order.customer?.ward,
          customer: order.customer,
          items: order.items,
          cod_amount: 0, // Đã thanh toán chuyển khoản thì COD = 0
          weight: 500,
        };

        let result: { trackingCode: string; fee: number };
        if (provider === 'ghtk') {
          result = await createGHTKOrder(orderData);
        } else if (provider === 'viettelpost') {
          result = await createViettelPostOrder(orderData);
        } else {
          result = await createGHNOrder(orderData);
        }

        if (result && result.trackingCode) {
          order.trackingCode = result.trackingCode;
          order.shippingProvider = provider;
          order.shippingCarrier =
            provider === 'ghtk'
              ? 'Giao Hàng Tiết Kiệm (GHTK)'
              : provider === 'viettelpost'
              ? 'Viettel Post'
              : 'Giao Hàng Nhanh (GHN)';
          order.shippingStatus = 'ready_to_pick';

          const newLog = {
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            status: 'Đã xác nhận đơn',
            location: 'Kho tổng ShopTik Store',
            description: `Khách hàng đã chuyển khoản thành công. Hệ thống tự động duyệt đơn và đẩy sang ${order.shippingCarrier} (Mã vận đơn: ${result.trackingCode}) để Shipper đến lấy hàng.`,
            carrier: order.shippingCarrier,
            createdAt: new Date(),
          };

          if (!order.shippingLogs) order.shippingLogs = [];
          order.shippingLogs.push(newLog);
        }
      } catch (shippingErr: any) {
        console.error('Tự động đẩy đơn sang hãng vận chuyển gặp sự cố:', shippingErr.message);
      }
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
        trackingCode: order.trackingCode,
        shippingCarrier: order.shippingCarrier,
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