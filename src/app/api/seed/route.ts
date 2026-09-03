import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Seed Admin User
    const adminEmail = 'admin@shopbig.vn';
    let admin = await User.findOne({ email: adminEmail });
    const hashedPassword = await hashPassword('admin123');
    if (!admin) {
      admin = await User.create({
        name: 'Admin ShopBig',
        email: adminEmail,
        phone: '0988888888',
        password: hashedPassword,
        role: 'admin',
      });
    } else {
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
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
        options: [
          { name: 'Màu sắc', values: ['Đen Titan', 'Trắng Basic', 'Xanh Navy'] },
          { name: 'Kích cỡ', values: ['M (55-65kg)', 'L (65-75kg)', 'XL (75-85kg)'] },
        ],
        variants: [
          { sku: 'POLO-BLK-M', title: 'Đen Titan / M (55-65kg)', name: 'Đen Titan / M (55-65kg)', color: 'Đen Titan', size: 'M', attributes: { 'Màu sắc': 'Đen Titan', 'Kích cỡ': 'M (55-65kg)' }, stock: 30, price: 250000, salePrice: 189000 },
          { sku: 'POLO-BLK-L', title: 'Đen Titan / L (65-75kg)', name: 'Đen Titan / L (65-75kg)', color: 'Đen Titan', size: 'L', attributes: { 'Màu sắc': 'Đen Titan', 'Kích cỡ': 'L (65-75kg)' }, stock: 30, price: 250000, salePrice: 189000 },
          { sku: 'POLO-WHT-M', title: 'Trắng Basic / M (55-65kg)', name: 'Trắng Basic / M (55-65kg)', color: 'Trắng Basic', size: 'M', attributes: { 'Màu sắc': 'Trắng Basic', 'Kích cỡ': 'M (55-65kg)' }, stock: 30, price: 250000, salePrice: 189000 },
          { sku: 'POLO-NVY-L', title: 'Xanh Navy / L (65-75kg)', name: 'Xanh Navy / L (65-75kg)', color: 'Xanh Navy', size: 'L', attributes: { 'Màu sắc': 'Xanh Navy', 'Kích cỡ': 'L (65-75kg)' }, stock: 30, price: 250000, salePrice: 189000 },
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
        options: [{ name: 'Kích cỡ', values: ['29 (50-57kg)', '30 (58-64kg)', '31 (65-70kg)', '32 (71-77kg)'] }],
        variants: [
          { sku: 'JEAN-29', title: 'Size 29 (50-57kg)', name: 'Size 29 (50-57kg)', size: '29', attributes: { 'Kích cỡ': '29 (50-57kg)' }, stock: 20, price: 450000, salePrice: 349000 },
          { sku: 'JEAN-30', title: 'Size 30 (58-64kg)', name: 'Size 30 (58-64kg)', size: '30', attributes: { 'Kích cỡ': '30 (58-64kg)' }, stock: 30, price: 450000, salePrice: 349000 },
          { sku: 'JEAN-31', title: 'Size 31 (65-70kg)', name: 'Size 31 (65-70kg)', size: '31', attributes: { 'Kích cỡ': '31 (65-70kg)' }, stock: 20, price: 450000, salePrice: 349000 },
          { sku: 'JEAN-32', title: 'Size 32 (71-77kg)', name: 'Size 32 (71-77kg)', size: '32', attributes: { 'Kích cỡ': '32 (71-77kg)' }, stock: 20, price: 450000, salePrice: 349000 },
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
        options: [
          { name: 'Màu sắc', values: ['Trắng Kem', 'Đỏ Đô', 'Đen Quyến Rũ'] },
          { name: 'Kích cỡ', values: ['S (40-48kg)', 'M (48-55kg)', 'L (55-62kg)'] },
        ],
        variants: [
          { sku: 'DAM-WHT-S', title: 'Trắng Kem / S (40-48kg)', name: 'Trắng Kem / S (40-48kg)', color: 'Trắng Kem', size: 'S', attributes: { 'Màu sắc': 'Trắng Kem', 'Kích cỡ': 'S (40-48kg)' }, stock: 15, price: 520000, salePrice: 399000 },
          { sku: 'DAM-RED-M', title: 'Đỏ Đô / M (48-55kg)', name: 'Đỏ Đô / M (48-55kg)', color: 'Đỏ Đô', size: 'M', attributes: { 'Màu sắc': 'Đỏ Đô', 'Kích cỡ': 'M (48-55kg)' }, stock: 20, price: 520000, salePrice: 399000 },
          { sku: 'DAM-BLK-L', title: 'Đen Quyến Rũ / L (55-62kg)', name: 'Đen Quyến Rũ / L (55-62kg)', color: 'Đen Quyến Rũ', size: 'L', attributes: { 'Màu sắc': 'Đen Quyến Rũ', 'Kích cỡ': 'L (55-62kg)' }, stock: 15, price: 520000, salePrice: 399000 },
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
        options: [{ name: 'Màu sắc', values: ['Đen Nhám (Matte Black)', 'Trắng Tinh Khôi (Pure White)'] }],
        variants: [
          { sku: 'TWSPRO-BLK', title: 'Đen Nhám (Matte Black)', name: 'Đen Nhám (Matte Black)', color: 'Đen Nhám (Matte Black)', attributes: { 'Màu sắc': 'Đen Nhám (Matte Black)' }, stock: 45, price: 650000, salePrice: 429000 },
          { sku: 'TWSPRO-WHT', title: 'Trắng Tinh Khôi (Pure White)', name: 'Trắng Tinh Khôi (Pure White)', color: 'Trắng Tinh Khôi (Pure White)', attributes: { 'Màu sắc': 'Trắng Tinh Khôi (Pure White)' }, stock: 45, price: 650000, salePrice: 429000 },
        ],
      },
    ];

    for (const prod of productsData) {
      let p = await Product.findOne({ slug: prod.slug });
      if (!p) {
        p = await Product.create(prod);
      }

      // Seed reviews for this product if none exist
      const existingReviews = await Review.countDocuments({ product: p._id });
      if (existingReviews === 0) {
        const sampleReviews = [
          {
            product: p._id,
            author: 'Trần Minh Hoàng',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            rating: 5,
            variantTitle: 'Đen / L',
            comment: 'Sản phẩm tuyệt vời đúng như mô tả. Vải dày dặn, mặc rất mát và vừa vặn. Shop giao hàng siêu nhanh chỉ 2 ngày là nhận được hàng.',
            images: [
              'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400',
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
            ],
            likes: 12,
            verified: true,
            reply: {
              content: 'ShopBig chân thành cảm ơn bạn Hoàng đã tin tưởng và ủng hộ shop. Chúc bạn luôn có những trải nghiệm tuyệt vời!',
              createdAt: new Date(),
            },
            status: 'approved',
          },
          {
            product: p._id,
            author: 'Nguyễn Thị Thu Hà',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            rating: 5,
            variantTitle: 'Trắng / M',
            comment: 'Đẹp lắm mọi người ơi, đường may cẩn thận không có chỉ thừa. Sẽ ủng hộ shop thêm nhiều lần nữa!',
            images: [],
            likes: 6,
            verified: true,
            status: 'approved',
          },
          {
            product: p._id,
            author: 'Lê Văn Hùng',
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
            rating: 4,
            variantTitle: 'Xanh Navy / XL',
            comment: 'Hàng ok, đóng gói bọc kỹ 2 lớp hộp chắc chắn. Form áo hơi ôm một xíu nhưng mặc lên dáng rất thể thao và khỏe khoắn.',
            images: [],
            likes: 3,
            verified: true,
            status: 'approved',
          },
        ];
        await Review.insertMany(sampleReviews);
        await Product.findByIdAndUpdate(p._id, { rating: 4.8, reviewCount: 3 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Khởi tạo dữ liệu mẫu thành công! Tài khoản admin: admin@shopbig.vn / admin123',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi seed dữ liệu' },
      { status: 500 }
    );
  }
}