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
      await Order.findByIdAndUpdate(orderId, {
        status: 'shipping',
        shippingProvider: provider,
        trackingCode: result.trackingCode,
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