import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { License } from '@/models/License';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const query = searchParams.get('q');

    await connectToDatabase();

    // 1. Thống kê tổng quan (Metrics)
    const [
      totalCount,
      availableCount,
      activeCount,
      revokedCount,
      count399k,
      count799k,
    ] = await Promise.all([
      License.countDocuments({}),
      License.countDocuments({ status: 'available' }),
      License.countDocuments({ status: 'active' }),
      License.countDocuments({ status: 'revoked' }),
      License.countDocuments({ plan: '399k' }),
      License.countDocuments({ plan: '799k' }),
    ]);

    const revenue399k = count399k * 399000;
    const revenue799k = count799k * 799000;
    const totalRevenue = revenue399k + revenue799k;

    // 2. Bộ lọc dữ liệu bảng
    const filter: Record<string, any> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (plan && plan !== 'all') {
      filter.plan = plan;
    }
    if (query) {
      filter.$or = [
        { licenseKey: { $regex: query, $options: 'i' } },
        { buyerName: { $regex: query, $options: 'i' } },
        { buyerPhone: { $regex: query, $options: 'i' } },
        { shopName: { $regex: query, $options: 'i' } },
        { assignedDb: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [licenses, filteredTotal] = await Promise.all([
      License.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      License.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      metrics: {
        total: totalCount,
        available: availableCount,
        active: activeCount,
        revoked: revokedCount,
        count399k,
        count799k,
        revenue399k,
        revenue799k,
        totalRevenue,
      },
      data: licenses,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching master licenses:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách bản quyền', error: error.message },
      { status: 500 }
    );
  }
}
