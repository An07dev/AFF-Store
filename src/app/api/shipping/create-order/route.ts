import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { createGHNOrder } from '@/lib/shipping/ghn';
import { createGHTKOrder } from '@/lib/shipping/ghtk';
import { createViettelPostOrder } from '@/lib/shipping/viettelpost';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { orderId, provider, orderData } = await request.json();

    let result: { trackingCode: string; fee: number };

    if (provider === 'ghtk') {
      result = await createGHTKOrder(orderData);
    } else if (provider === 'viettelpost') {
      result = await createViettelPostOrder(orderData);
    } else {
      result = await createGHNOrder(orderData);
    }

    if (orderId) {
      const carrierName =
        provider === 'ghtk'
          ? 'Giao Hàng Tiết Kiệm (GHTK)'
          : provider === 'viettelpost'
          ? 'Viettel Post'
          : 'Giao Hàng Nhanh (GHN)';

      const initialLog = {
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Bàn giao vận chuyển',
        location: 'Kho tổng ShopTik',
        description: `Đã tạo vận đơn thành công với ${carrierName}. Mã vận đơn: ${result.trackingCode}`,
        carrier: provider,
        createdAt: new Date(),
      };

      await Order.findByIdAndUpdate(orderId, {
        status: 'shipping',
        shippingProvider: provider,
        shippingCarrier: carrierName,
        trackingCode: result.trackingCode,
        shippingStatus: 'picking',
        $push: { shippingLogs: initialLog },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã tạo vận đơn giao hàng thành công!',
      data: {
        provider,
        trackingCode: result.trackingCode,
        fee: result.fee,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tạo vận đơn' },
      { status: 500 }
    );
  }
}