import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Voucher from '@/models/Voucher';

export const dynamic = 'force-dynamic';

// GET /api/admin/vouchers - Lấy danh sách Voucher cho trang Admin
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all | active | inactive | expired

    const filter: any = {};

    if (search.trim()) {
      filter.$or = [
        { code: { $regex: search.trim(), $options: 'i' } },
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const now = new Date();
    if (status === 'active') {
      filter.isActive = true;
      filter.endDate = { $gte: now };
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'expired') {
      filter.endDate = { $lt: now };
    }

    const vouchers = await Voucher.find(filter)
      .sort({ createdAt: -1 })
      .populate('applicableProducts', 'name slug price images');

    // Calculate overall stats
    const totalVouchers = await Voucher.countDocuments();
    const activeVouchers = await Voucher.countDocuments({
      isActive: true,
      endDate: { $gte: now },
    });
    const totalUsedCount = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);

    return NextResponse.json({
      success: true,
      data: vouchers,
      stats: {
        total: totalVouchers,
        active: activeVouchers,
        totalUsed: totalUsedCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin vouchers:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh sách voucher' },
      { status: 500 }
    );
  }
}

// POST /api/admin/vouchers - Tạo Voucher mới
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.code || !body.name || body.discountValue === undefined) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ Mã, Tên và Giá trị giảm' },
        { status: 400 }
      );
    }

    const cleanCode = body.code.trim().toUpperCase();

    // Check duplicate code
    const existing = await Voucher.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Mã Voucher "${cleanCode}" đã tồn tại trên hệ thống!` },
        { status: 400 }
      );
    }

    if (!body.endDate) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng chọn ngày kết thúc hiệu lực của Voucher' },
        { status: 400 }
      );
    }

    const newVoucher = await Voucher.create({
      code: cleanCode,
      name: body.name.trim(),
      description: body.description?.trim() || '',
      discountType: body.discountType || 'fixed',
      discountValue: Number(body.discountValue) || 0,
      maxDiscountAmount: Number(body.maxDiscountAmount) || 0,
      minOrderValue: Number(body.minOrderValue) || 0,
      totalUsageLimit: Number(body.totalUsageLimit) || 0,
      usedCount: 0,
      limitPerCustomer: Number(body.limitPerCustomer) || 1,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: new Date(body.endDate),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : true,
      applicableType: body.applicableType || 'all',
      applicableCategories: body.applicableCategories || [],
      applicableProducts: body.applicableProducts || [],
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo mã Voucher thành công!',
      data: newVoucher,
    });
  } catch (error: any) {
    console.error('Error creating voucher:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tạo voucher mới' },
      { status: 500 }
    );
  }
}
