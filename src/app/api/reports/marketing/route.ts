import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TrackingEvent from '@/models/TrackingEvent';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7days';

    const now = new Date();
    let startDate = new Date();

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === '30days') {
      startDate.setDate(now.getDate() - 30);
    } else {
      // all time
      startDate = new Date(2020, 0, 1);
    }

    // 1. Query Strict Real Counts from TrackingEvent
    const [pageViews, viewContent, addToCart, initiateCheckout, purchases] =
      await Promise.all([
        TrackingEvent.countDocuments({ eventName: 'PageView', createdAt: { $gte: startDate } }),
        TrackingEvent.countDocuments({ eventName: 'ViewContent', createdAt: { $gte: startDate } }),
        TrackingEvent.countDocuments({ eventName: 'AddToCart', createdAt: { $gte: startDate } }),
        TrackingEvent.countDocuments({ eventName: 'InitiateCheckout', createdAt: { $gte: startDate } }),
        TrackingEvent.countDocuments({ eventName: 'Purchase', createdAt: { $gte: startDate } }),
      ]);

    // 2. Sum Real Revenue from Purchases in TrackingEvent
    const purchaseEvents = await TrackingEvent.find({
      eventName: 'Purchase',
      createdAt: { $gte: startDate },
    }).select('value');
    const totalRevenue = purchaseEvents.reduce((sum, e) => sum + (e.value || 0), 0);

    const averageOrderValue = purchases > 0 ? Math.round(totalRevenue / purchases) : 0;
    const overallCvr = pageViews > 0 ? Number(((purchases / pageViews) * 100).toFixed(2)) : 0;
    const cartRate = viewContent > 0 ? Number(((addToCart / viewContent) * 100).toFixed(1)) : 0;
    const checkoutRate = addToCart > 0 ? Number(((initiateCheckout / addToCart) * 100).toFixed(1)) : 0;
    const purchaseFromCheckoutRate = initiateCheckout > 0 ? Number(((purchases / initiateCheckout) * 100).toFixed(1)) : 0;
    const cartAbandonmentRate =
      addToCart > 0 ? Number((((Math.max(0, addToCart - purchases)) / addToCart) * 100).toFixed(1)) : 0;

    // 3. Real Traffic Source Attribution Grouping
    const channelStats = await TrackingEvent.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$source',
          visits: {
            $sum: { $cond: [{ $eq: ['$eventName', 'PageView'] }, 1, 0] },
          },
          addToCart: {
            $sum: { $cond: [{ $eq: ['$eventName', 'AddToCart'] }, 1, 0] },
          },
          purchases: {
            $sum: { $cond: [{ $eq: ['$eventName', 'Purchase'] }, 1, 0] },
          },
          revenue: {
            $sum: { $cond: [{ $eq: ['$eventName', 'Purchase'] }, '$value', 0] },
          },
        },
      },
    ]);

    const channelMap: Record<string, any> = {};
    channelStats.forEach((c) => {
      if (c._id) {
        channelMap[c._id] = c;
      }
    });

    const definedChannels = [
      { key: 'facebook', name: 'Facebook Ads & Instagram', icon: 'facebook' },
      { key: 'tiktok', name: 'TikTok Ads & Video Bio', icon: 'tiktok' },
      { key: 'google', name: 'Google Search & Shopping', icon: 'google' },
      { key: 'direct', name: 'Trực tiếp & Giới thiệu (Direct / Zalo)', icon: 'direct' },
    ];

    const channels = definedChannels.map((d) => {
      const recorded = channelMap[d.key];
      const chVisits = recorded?.visits || 0;
      const chAddToCart = recorded?.addToCart || 0;
      const chPurchases = recorded?.purchases || 0;
      const chRevenue = recorded?.revenue || 0;
      const cvr = chVisits > 0 ? Number(((chPurchases / chVisits) * 100).toFixed(1)) : 0;

      return {
        channel: d.name,
        icon: d.icon,
        visits: chVisits,
        addToCart: chAddToCart,
        purchases: chPurchases,
        revenue: chRevenue,
        cvr,
      };
    });

    // 4. Funnel Steps
    const funnelSteps = [
      {
        step: '1. Lượt Xem Trang (PageView)',
        count: pageViews,
        dropOffPercent: 0,
        percentOfTotal: 100,
      },
      {
        step: '2. Xem Chi Tiết Sản Phẩm (ViewContent)',
        count: viewContent,
        dropOffPercent: pageViews > 0 ? Number((((pageViews - viewContent) / pageViews) * 100).toFixed(1)) : 0,
        percentOfTotal: pageViews > 0 ? Number(((viewContent / pageViews) * 100).toFixed(1)) : 0,
      },
      {
        step: '3. Thêm Vào Giỏ Hàng (AddToCart)',
        count: addToCart,
        dropOffPercent: viewContent > 0 ? Number((((viewContent - addToCart) / viewContent) * 100).toFixed(1)) : 0,
        percentOfTotal: pageViews > 0 ? Number(((addToCart / pageViews) * 100).toFixed(1)) : 0,
      },
      {
        step: '4. Bắt Đầu Đặt Hàng (InitiateCheckout)',
        count: initiateCheckout,
        dropOffPercent: addToCart > 0 ? Number((((addToCart - initiateCheckout) / addToCart) * 100).toFixed(1)) : 0,
        percentOfTotal: pageViews > 0 ? Number(((initiateCheckout / pageViews) * 100).toFixed(1)) : 0,
      },
      {
        step: '5. Mua Hàng Thành Công (Purchase)',
        count: purchases,
        dropOffPercent: initiateCheckout > 0 ? Number((((initiateCheckout - purchases) / initiateCheckout) * 100).toFixed(1)) : 0,
        percentOfTotal: pageViews > 0 ? Number(((purchases / pageViews) * 100).toFixed(1)) : 0,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        period,
        isRealData: true,
        kpis: {
          totalRevenue,
          purchases,
          pageViews,
          averageOrderValue,
          overallCvr,
          cartRate,
          checkoutRate,
          purchaseFromCheckoutRate,
          cartAbandonmentRate,
        },
        funnelSteps,
        channels,
      },
    });
  } catch (error: any) {
    console.error('Error getting real marketing report:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải báo cáo Marketing' },
      { status: 500 }
    );
  }
}
