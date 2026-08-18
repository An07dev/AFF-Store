import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh sách khách hàng' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Tên và số điện thoại là bắt buộc' },
        { status: 400 }
      );
    }

    const newCustomer = await Customer.create(body);
    return NextResponse.json(
      {
        success: true,
        message: 'Thêm khách hàng thành công',
        data: newCustomer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi thêm khách hàng' },
      { status: 500 }
    );
  }
}