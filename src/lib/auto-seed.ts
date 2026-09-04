import User from '@/models/User';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Setting from '@/models/Setting';
import { hashPassword } from '@/lib/auth';
import { defaultThemeConfig } from '@/app/api/settings/theme/route';

let isSeeding = false;

export async function autoSeedIfNeeded() {
  if (isSeeding) return;
  
  try {
    isSeeding = true;
    
    // 1. Check if Admin exists
    const adminEmail = 'admin@shopbig.vn';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await hashPassword('admin123');
      admin = await User.create({
        name: 'Admin ShopBig',
        email: adminEmail,
        phone: '0988888888',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('[AutoSeed] ✅ Đã tạo tài khoản Admin mặc định: admin@shopbig.vn / admin123');
    }

    // 2. Check if Categories exist
    const categoryCount = await Category.countDocuments();
    let categoryMap: Record<string, any> = {};
    
    if (categoryCount === 0) {
      const categoriesData = [
        { name: 'Thời Trang Nam', slug: 'thoi-trang-nam', order: 1 },
        { name: 'Thời Trang Nữ', slug: 'thoi-trang-nu', order: 2 },
        { name: 'Phụ Kiện & Giày Dép', slug: 'phu-kien-giay-dep', order: 3 },
        { name: 'Đồ Điện Tử & Phụ Kiện', slug: 'do-dien-tu-phu-kien', order: 4 },
      ];

      for (const cat of categoriesData) {
        const c = await Category.create(cat);
        categoryMap[cat.slug] = c._id;
      }
      console.log('[AutoSeed] ✅ Đã khởi tạo 4 danh mục sản phẩm mẫu');
    } else {
      const allCats = await Category.find();
      allCats.forEach((c) => {
        categoryMap[c.slug] = c._id;
      });
    }

    // 3. Check if Products exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
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
        const p = await Product.create(prod);
        
        // Sample reviews
        await Review.create({
          product: p._id,
          author: 'Trần Minh Hoàng',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          rating: 5,
          variantTitle: 'Chuẩn',
          comment: 'Sản phẩm tuyệt vời đúng như mô tả. Shop giao hàng siêu nhanh chỉ 2 ngày là nhận được.',
          likes: 8,
          verified: true,
          status: 'approved',
        });
        await Product.findByIdAndUpdate(p._id, { rating: 5, reviewCount: 1 });
      }
      console.log('[AutoSeed] ✅ Đã khởi tạo danh sách sản phẩm và đánh giá mẫu');
    }

    // 4. Check Theme Settings
    const themeSetting = await Setting.findOne({ key: 'theme_settings' });
    if (!themeSetting) {
      await Setting.create({
        key: 'theme_settings',
        value: defaultThemeConfig,
      });
      console.log('[AutoSeed] ✅ Đã khởi tạo cấu hình Theme & Logo ShopBig');
    }
  } catch (error) {
    console.error('[AutoSeed] Error running auto-seed:', error);
  } finally {
    isSeeding = false;
  }
}
