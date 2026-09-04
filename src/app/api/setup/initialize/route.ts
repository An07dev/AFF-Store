import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { autoSeedIfNeeded } from '@/lib/auto-seed';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function POST() {
  try {
    await connectToDatabase();
    await autoSeedIfNeeded();

    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const categories = await Category.countDocuments();

    return NextResponse.json({
      success: true,
      message: '🎉 Khởi tạo CSDL thành công! Đã tạo tài khoản Admin và dữ liệu mẫu.',
      data: {
        adminEmail: 'admin@shopbig.vn',
        adminPassword: 'admin123',
        stats: { users, products, categories },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi khởi tạo cơ sở dữ liệu' },
      { status: 500 }
    );
  }
}
