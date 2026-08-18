import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Seed Admin User
    const adminEmail = 'admin@shoptik.vn';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await hashPassword('admin123');
      admin = await User.create({
        name: 'Admin ShopTik',
        email: adminEmail,
        phone: '0988888888',
        password: hashedPassword,
        role: 'admin',
      });
    }

    // 2. Seed Categories
    const categoriesData = [
      { name: 'Thời Trang Nam', slug: 'thoi-trang-nam', order: 1 },
      { name: 'Thời Trang Nữ', slug: 'thoi-trang-nu', order: 2 },
      { name: 'Phụ Kiện & Giày Dép', slug: 'phu-kien-giay-dep', order: 3 },
      { name: 'Đồ Điện Tử & Phụ Kiện', slug: 'do-dien-tu-phu-kien', order: 4 },
    ];

    const categoryMap: any = {};
    for (const cat of categoriesData) {
      let c = await Category.findOne({ slug: cat.slug });
      if (!c) {
        c = await Category.create(cat);
      }
      categoryMap[cat.slug] = c._id;
    }

    // 3. Seed Products
    const productsData = [
      {
        name: 'Áo Polo Nam Phối Bo Cổ Cao Cấp',
        slug: 'ao-polo-nam-phoi-bo-co-cao-cap',
        price: 250000,
        salePrice: 189000,
        category: categoryMap['thoi-trang-nam'],
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80'],
        stock: 120,
        soldCount: 85,
        isFeatured: true,
        description: 'Chất liệu vải cá sấu cotton 4 chiều mềm mịn, co giãn thấm hút mồ hôi cực tốt.',
        variants: [
          { color: 'Đen', size: 'L', stock: 40, price: 189000 },
          { color: 'Trắng', size: 'XL', stock: 40, price: 189000 },
          { color: 'Xanh Navy', size: 'L', stock: 40, price: 189000 },
        ],
      },
      {
        name: 'Quần Jean Slimfit Nam Co Giãn Thoải Mái',
        slug: 'quan-jean-slimfit-nam-co-gian-thoai-mai',
        price: 450000,
        salePrice: 349000,
        category: categoryMap['thoi-trang-nam'],
        images: ['https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80'],
        stock: 80,
        soldCount: 42,
        isFeatured: true,
        description: 'Form dáng tôn dáng chuẩn Hàn Quốc, co giãn nhẹ nhàng hoạt động cả ngày không gò bó.',
        variants: [
          { color: 'Xanh Đậm', size: '30', stock: 30, price: 349000 },
          { color: 'Xanh Nhạt', size: '32', stock: 50, price: 349000 },
        ],
      },
      {
        name: 'Đầm Nữ Dáng Xòe Dự Tiệc Thanh Lịch',
        slug: 'dam-nu-dang-xoe-du-tiec-thanh-lich',
        price: 520000,
        salePrice: 399000,
        category: categoryMap['thoi-trang-nu'],
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80'],
        stock: 50,
        soldCount: 65,
        isFeatured: true,
        description: 'Thiết kế sang trọng, chất voan tơ 2 lớp bồng bềnh, đường may tinh tế.',
        variants: [
          { color: 'Trắng Kem', size: 'S', stock: 20, price: 399000 },
          { color: 'Đỏ Đô', size: 'M', stock: 30, price: 399000 },
        ],
      },
      {
        name: 'Tai Nghe Bluetooth Không Dây True Wireless Pro',
        slug: 'tai-nghe-bluetooth-khong-day-true-wireless-pro',
        price: 650000,
        salePrice: 429000,
        category: categoryMap['do-dien-tu-phu-kien'],
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'],
        stock: 90,
        soldCount: 120,
        isFeatured: true,
        description: 'Âm bass mạnh mẽ, chống ồn chủ động ANC, pin trâu lên đến 28 giờ kèm hộp sạc.',
        variants: [
          { color: 'Đen Nhám', stock: 45, price: 429000 },
          { color: 'Trắng Tinh Khôi', stock: 45, price: 429000 },
        ],
      },
    ];

    for (const prod of productsData) {
      const p = await Product.findOne({ slug: prod.slug });
      if (!p) {
        await Product.create(prod);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Khởi tạo dữ liệu mẫu thành công! Tài khoản admin: admin@shoptik.vn / admin123',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi seed dữ liệu' },
      { status: 500 }
    );
  }
}