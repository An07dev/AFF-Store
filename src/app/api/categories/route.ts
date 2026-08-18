import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).sort({ order: 1, createdAt: -1 });

    // Aggregate product counts for each category
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    counts.forEach((c) => {
      if (c._id) countMap.set(c._id.toString(), c.count);
    });

    const categoriesWithCount = categories.map((cat) => {
      const catObj = cat.toObject();
      catObj.productCount = countMap.get(cat._id.toString()) || 0;
      return catObj;
    });

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh mục' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'Tên danh mục là bắt buộc' },
        { status: 400 }
      );
    }

    const slug = body.slug || generateSlug(body.name);
    const newCategory = await Category.create({
      ...body,
      slug,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thêm danh mục thành công',
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi thêm danh mục' },
      { status: 500 }
    );
  }
}