import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Product from '@/models/Product';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';

    const now = new Date();
    let startDate = new Date();

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'yesterday') {
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    const validPaymentFilter = {
      $or: [
        { paymentMethod: { $nin: ['bank_transfer', 'online'] } },
        { paymentStatus: { $in: ['paid', 'refunded'] } },
      ],
    };

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      ...validPaymentFilter,
    });
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const newCustomers = await Customer.countDocuments({ createdAt: { $gte: startDate } });

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      shipping: orders.filter((o) => o.status === 'shipping').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };

    // Revenue by date
    const dateMap = new Map<string, { revenue: number; orders: number }>();
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const curr = dateMap.get(dateKey) || { revenue: 0, orders: 0 };
      if (o.status !== 'cancelled') {
        curr.revenue += o.totalAmount || 0;
      }
      curr.orders += 1;
      dateMap.set(dateKey, curr);
    });

    const revenueByDate = Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    // Top products
    const topProducts = await Product.find({ status: 'active' })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name soldCount price salePrice images');

    const recentOrders = await Order.find(validPaymentFilter).sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        newCustomers,
        averageOrderValue,
        revenueByDate,
        ordersByStatus,
        topProducts,
        recentOrders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải dữ liệu báo cáo' },
      { status: 500 }
    );
  }
}