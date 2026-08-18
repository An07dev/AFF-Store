import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { generateSlug } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải chi tiết sản phẩm' },
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

    const updated = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm để cập nhật' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật sản phẩm' },
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

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xóa sản phẩm' },
      { status: 500 }
    );
  }
}