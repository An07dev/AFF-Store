import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Voucher from '@/models/Voucher';

export const dynamic = 'force-dynamic';

// GET /api/admin/vouchers/[id] - Lấy chi tiết 1 Voucher
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await context.params;
    const voucher = await Voucher.findById(resolvedParams.id).populate(
      'applicableProducts',
      'name slug price images'
    );

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy Voucher' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: voucher,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lấy thông tin voucher' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/vouchers/[id] - Sửa thông tin Voucher
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await context.params;
    const body = await request.json();

    const voucher = await Voucher.findById(resolvedParams.id);
    if (!voucher) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy Voucher cần sửa' },
        { status: 404 }
      );
    }

    if (body.code && body.code.trim().toUpperCase() !== voucher.code) {
      const cleanCode = body.code.trim().toUpperCase();
      const existing = await Voucher.findOne({ code: cleanCode, _id: { $ne: resolvedParams.id } });
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Mã Voucher "${cleanCode}" đã tồn tại trên hệ thống!` },
          { status: 400 }
        );
      }
      voucher.code = cleanCode;
    }

    if (body.name !== undefined) voucher.name = body.name.trim();
    if (body.description !== undefined) voucher.description = body.description.trim();
    if (body.discountType !== undefined) voucher.discountType = body.discountType;
    if (body.discountValue !== undefined) voucher.discountValue = Number(body.discountValue);
    if (body.maxDiscountAmount !== undefined) voucher.maxDiscountAmount = Number(body.maxDiscountAmount);
    if (body.minOrderValue !== undefined) voucher.minOrderValue = Number(body.minOrderValue);
    if (body.totalUsageLimit !== undefined) voucher.totalUsageLimit = Number(body.totalUsageLimit);
    if (body.limitPerCustomer !== undefined) voucher.limitPerCustomer = Number(body.limitPerCustomer);
    if (body.startDate !== undefined) voucher.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) voucher.endDate = new Date(body.endDate);
    if (body.isActive !== undefined) voucher.isActive = Boolean(body.isActive);
    if (body.isPublic !== undefined) voucher.isPublic = Boolean(body.isPublic);
    if (body.applicableType !== undefined) voucher.applicableType = body.applicableType;
    if (body.applicableCategories !== undefined) voucher.applicableCategories = body.applicableCategories;
    if (body.applicableProducts !== undefined) voucher.applicableProducts = body.applicableProducts;

    await voucher.save();

    return NextResponse.json({
      success: true,
      message: 'Cập nhật Voucher thành công!',
      data: voucher,
    });
  } catch (error: any) {
    console.error('Error updating voucher:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật voucher' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/vouchers/[id] - Xóa Voucher
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await context.params;
    const voucher = await Voucher.findByIdAndDelete(resolvedParams.id);

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy Voucher cần xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa Voucher thành công!',
    });
  } catch (error: any) {
    console.error('Error deleting voucher:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xóa voucher' },
      { status: 500 }
    );
  }
}
