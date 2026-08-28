import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'active' | 'locked' | 'all'
    const provider = searchParams.get('provider'); // 'google' | 'facebook' | 'local'

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'locked') {
      filter.isLocked = true;
    } else if (status === 'active') {
      filter.isLocked = { $ne: true };
    }

    if (provider && provider !== 'all') {
      filter.provider = provider;
    }

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Calculate dynamic items bought and orders for each customer
    const enhancedCustomers = await Promise.all(
      customers.map(async (c: any) => {
        // Query orders matching phone or email
        const orderMatch: any[] = [];
        if (c.phone) orderMatch.push({ 'customer.phone': c.phone });
        if (c.email) orderMatch.push({ 'customer.email': c.email });

        let itemsBoughtCount = 0;
        let calculatedTotalSpent = c.totalSpent || 0;
        let calculatedOrderCount = c.orderCount || 0;

        if (orderMatch.length > 0) {
          const orders = await Order.find({ $or: orderMatch }).lean();
          calculatedOrderCount = orders.length;
          calculatedTotalSpent = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
          itemsBoughtCount = orders.reduce((sum: number, o: any) => {
            const orderItemsQty = (o.items || []).reduce((q: number, item: any) => q + (item.quantity || 1), 0);
            return sum + orderItemsQty;
          }, 0);
        }

        return {
          ...c,
          orderCount: calculatedOrderCount,
          totalSpent: calculatedTotalSpent,
          totalItemsBought: itemsBoughtCount,
        };
      })
    );

    // Global Stats
    const totalCustomersCount = await Customer.countDocuments({});
    const lockedCustomersCount = await Customer.countDocuments({ isLocked: true });

    return NextResponse.json({
      success: true,
      data: enhancedCustomers,
      stats: {
        totalCustomers: totalCustomersCount,
        lockedCustomers: lockedCustomersCount,
      },
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

    const newCustomer = await Customer.create({
      ...body,
      isLocked: body.isLocked || false,
      provider: body.provider || 'local',
    });

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