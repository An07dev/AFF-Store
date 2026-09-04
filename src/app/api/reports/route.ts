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
    let endDate: Date | null = null;
    const dateMap = new Map<string, { revenue: number; orders: number }>();
    const isHourly = period === 'today' || period === 'yesterday';

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      for (let h = 0; h < 24; h++) {
        const hourKey = `${h.toString().padStart(2, '0')}:00`;
        dateMap.set(hourKey, { revenue: 0, orders: 0 });
      }
    } else if (period === 'yesterday') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      for (let h = 0; h < 24; h++) {
        const hourKey = `${h.toString().padStart(2, '0')}:00`;
        dateMap.set(hourKey, { revenue: 0, orders: 0 });
      }
    } else if (period === '7days') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        dateMap.set(dateKey, { revenue: 0, orders: 0 });
      }
    } else if (period === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const totalDays = now.getDate();
      for (let day = 1; day <= totalDays; day++) {
        const d = new Date(now.getFullYear(), now.getMonth(), day);
        const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        dateMap.set(dateKey, { revenue: 0, orders: 0 });
      }
    } else {
      // 30days default
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        dateMap.set(dateKey, { revenue: 0, orders: 0 });
      }
    }

    const validPaymentFilter = {
      $or: [
        { paymentMethod: { $nin: ['bank_transfer', 'online'] } },
        { paymentStatus: { $in: ['paid', 'refunded'] } },
      ],
    };

    const dateQuery: any = { createdAt: { $gte: startDate } };
    if (endDate) {
      dateQuery.createdAt.$lte = endDate;
    }

    const orders = await Order.find({
      ...dateQuery,
      ...validPaymentFilter,
    });
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const customerQuery = endDate
      ? { createdAt: { $gte: startDate, $lte: endDate } }
      : { createdAt: { $gte: startDate } };
    const newCustomers = await Customer.countDocuments(customerQuery);

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      shipping: orders.filter((o) => o.status === 'shipping').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };

    // Revenue by date / hour
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      let key = '';
      if (isHourly) {
        key = `${d.getHours().toString().padStart(2, '0')}:00`;
      } else {
        key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      if (dateMap.has(key)) {
        const curr = dateMap.get(key)!;
        if (o.status !== 'cancelled') {
          curr.revenue += o.totalAmount || 0;
        }
        curr.orders += 1;
      }
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