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

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm để cập nhật' },
        { status: 404 }
      );
    }

    if (body.name && !body.slug && body.name !== product.name) {
      body.slug = generateSlug(body.name);
    }

    if (body.variants && Array.isArray(body.variants)) {
      body.variants = body.variants.map((v: any, idx: number) => {
        const parsedSalePrice =
          v.salePrice !== undefined && v.salePrice !== null && v.salePrice !== ''
            ? Number(v.salePrice)
            : 0;

        const colorVal = v.color || v.attributes?.['Màu sắc'] || v.attributes?.['Màu'];
        const sizeVal = v.size || v.attributes?.['Kích cỡ'] || v.attributes?.['Size'] || v.attributes?.['Kích thước'];
        const title =
          v.title ||
          v.name ||
          (v.attributes ? Object.values(v.attributes).filter(Boolean).join(' / ') : '') ||
          [colorVal, sizeVal].filter(Boolean).join(' / ') ||
          `Biến thể ${idx + 1}`;

        return {
          ...v,
          sku: v.sku?.trim() || `${(product.slug || 'SP').toUpperCase()}-${idx + 1}`,
          title,
          name: title,
          color: colorVal,
          size: sizeVal,
          attributes: v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {}),
          price: Number(v.price) || Number(body.price) || product.price || 0,
          salePrice: parsedSalePrice,
          stock: Math.max(0, Number(v.stock) || 0),
          image: v.image || '',
        };
      });
    }

    Object.assign(product, body);
    const updated = await product.save();

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