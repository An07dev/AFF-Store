import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { generateSlug } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const sort = searchParams.get('sort') || 'newest';

    const filter: any = {};

    if (status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      // Check if category is slug or id
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          filter.category = catDoc._id;
        }
      }
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { soldCount: -1 };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh sách sản phẩm' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp tên, giá và danh mục' },
        { status: 400 }
      );
    }

    const slug = body.slug || generateSlug(body.name);
    const newProduct = await Product.create({
      ...body,
      slug,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thêm sản phẩm thành công',
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi thêm sản phẩm' },
      { status: 500 }
    );
  }
}