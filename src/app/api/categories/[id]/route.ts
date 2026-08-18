import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import { generateSlug } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh mục' },
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

    if (body.name && !body.slug) {
      body.slug = generateSlug(body.name);
    }

    const updated = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật danh mục' },
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

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa danh mục thành công',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xóa danh mục' },
      { status: 500 }
    );
  }
}