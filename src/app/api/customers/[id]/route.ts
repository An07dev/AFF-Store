import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Order from '@/models/Order';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy thông tin khách hàng' },
        { status: 404 }
      );
    }

    const orders = await Order.find({
      'customer.phone': customer.phone,
      $or: [
        { paymentMethod: { $nin: ['bank_transfer', 'online'] } },
        { paymentStatus: { $in: ['paid', 'refunded'] } },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        ...customer.toObject(),
        orders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải thông tin khách hàng' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const updated = await Customer.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật khách hàng thành công',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật khách hàng' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa khách hàng thành công',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xóa khách hàng' },
      { status: 500 }
    );
  }
}