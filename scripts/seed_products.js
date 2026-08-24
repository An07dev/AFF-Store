const mongoose = require('mongoose');
const fs = require('fs');

let mongoUri = 'mongodb://localhost:27017/webbanhang';
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    mongoUri = match[1].trim();
  }
}

async function seedProducts() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
    name: String,
    slug: String,
  }, { timestamps: true }));

  const categories = await Category.find({});
  const catMap = {};
  categories.forEach(c => {
    catMap[c.slug] = c._id;
  });

  console.log('Found categories in DB:', Object.keys(catMap));

  const rawProducts = [
    // ==========================================
    // 1. THỜI TRANG NAM
    // ==========================================
    {
      name: 'Áo Polo Nam Phối Cổ Dệt Bo Cao Cấp Vải Cotton Co Giãn 4 Chiều',
      slug: 'ao-polo-nam-phoi-co-det-bo-cao-cap',
      categorySlug: 'thoi-trang-nam',
      price: 350000,
      salePrice: 229000,
      soldCount: 1420,
      rating: 4.9,
      reviewCount: 382,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Đen Phối Trắng', 'Trắng Phối Đen', 'Xanh Navy'] },
        { name: 'Kích Cỡ', values: ['M (50-60kg)', 'L (60-70kg)', 'XL (70-80kg)'] },
      ],
      variants: [
        { sku: 'POLO-DEN-M', name: 'Đen Phối Trắng - M', color: 'Đen Phối Trắng', size: 'M (50-60kg)', price: 350000, salePrice: 229000, stock: 50, image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80' },
        { sku: 'POLO-DEN-L', name: 'Đen Phối Trắng - L', color: 'Đen Phối Trắng', size: 'L (60-70kg)', price: 350000, salePrice: 229000, stock: 45, image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80' },
        { sku: 'POLO-DEN-XL', name: 'Đen Phối Trắng - XL', color: 'Đen Phối Trắng', size: 'XL (70-80kg)', price: 350000, salePrice: 229000, stock: 30, image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80' },
        { sku: 'POLO-TRANG-M', name: 'Trắng Phối Đen - M', color: 'Trắng Phối Đen', size: 'M (50-60kg)', price: 350000, salePrice: 229000, stock: 40, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80' },
        { sku: 'POLO-TRANG-L', name: 'Trắng Phối Đen - L', color: 'Trắng Phối Đen', size: 'L (60-70kg)', price: 350000, salePrice: 229000, stock: 35, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80' },
        { sku: 'POLO-NAVY-L', name: 'Xanh Navy - L', color: 'Xanh Navy', size: 'L (60-70kg)', price: 350000, salePrice: 229000, stock: 50, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🌟 ĐẶC ĐIỂM NỔI BẬT
- **Chất liệu:** 95% Cotton tự nhiên kết hợp 5% Spandex giúp co giãn 4 chiều tối đa, thấm hút mồ hôi vượt trội.
- **Thiết kế:** Cổ bẻ dệt bo tinh tế, form Regular-fit trẻ trung tôn dáng, dễ dàng phối quần tây, quần jean hay kaki.
- **Độ bền:** Công nghệ dệt sợi kháng xù lông, giữ form áo chuẩn sau nhiều lần giặt.

### 📋 THÔNG SỐ SẢN PHẨM
- **Thương hiệu:** ShopTik Men
- **Xuất xứ:** Việt Nam xuất khẩu
- **Bảng size tham khảo:**
  - Size M: 50 - 60kg | Cao 1m60 - 1m68
  - Size L: 60 - 70kg | Cao 1m68 - 1m75
  - Size XL: 70 - 82kg | Cao 1m73 - 1m82

### 🛡️ CHÍNH SÁCH BẢO HÀNH & ĐỔI TRẢ
- Đổi trả miễn phí trong vòng 7 ngày nếu lỗi từ nhà sản xuất hoặc không vừa size.
- Kiểm tra hàng trước khi thanh toán (COD).`,
    },
    {
      name: 'Quần Jean Nam Ống Suông Form Rộng Phong Cách Streetwear Unisex',
      slug: 'quan-jean-nam-ong-suong-form-rong',
      categorySlug: 'thoi-trang-nam',
      price: 450000,
      salePrice: 299000,
      soldCount: 890,
      rating: 4.8,
      reviewCount: 215,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Xanh Nhạt Vintage', 'Xanh Đậm Classic', 'Đen Khói'] },
        { name: 'Size', values: ['Size 29', 'Size 30', 'Size 31', 'Size 32'] },
      ],
      variants: [
        { sku: 'JEAN-XANH-29', name: 'Xanh Nhạt - 29', color: 'Xanh Nhạt Vintage', size: 'Size 29', price: 450000, salePrice: 299000, stock: 30, image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80' },
        { sku: 'JEAN-XANH-30', name: 'Xanh Nhạt - 30', color: 'Xanh Nhạt Vintage', size: 'Size 30', price: 450000, salePrice: 299000, stock: 35, image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80' },
        { sku: 'JEAN-DEN-30', name: 'Đen Khói - 30', color: 'Đen Khói', size: 'Size 30', price: 450000, salePrice: 299000, stock: 40, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80' },
        { sku: 'JEAN-DEN-31', name: 'Đen Khói - 31', color: 'Đen Khói', size: 'Size 31', price: 450000, salePrice: 299000, stock: 25, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🌟 ĐẶC ĐIỂM NỔI BẬT
- **Vải Denim 12oz cao cấp:** Mềm mịn, đứng dáng, đã qua xử lý wash màu vintage thời thượng.
- **Form Straight Loose (Ống Suông):** Che khuyết điểm chân cực tốt, tạo cảm giác kéo dài chân và cực kỳ thoải mái khi vận động.
- **Phối đồ:** Hoàn hảo khi mix cùng Sneaker, áo thun oversized hoặc áo sơ mi khoác ngoài.`,
    },

    // ==========================================
    // 2. THỜI TRANG NỮ
    // ==========================================
    {
      name: 'Váy Đầm Maxi Nữ Dáng Chữ A Cổ Vuông Tay Bồng Phong Cách Nàng Thơ',
      slug: 'vay-dam-maxi-nu-dang-chu-a-co-vuong-tay-bong',
      categorySlug: 'thoi-trang-nu',
      price: 490000,
      salePrice: 319000,
      soldCount: 950,
      rating: 5.0,
      reviewCount: 310,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Trắng Tinh Khôi', 'Vàng Kem Nhẹ', 'Xanh Pastel'] },
        { name: 'Size', values: ['Size S (42-48kg)', 'Size M (49-55kg)', 'Size L (56-62kg)'] },
      ],
      variants: [
        { sku: 'VAY-TRANG-S', name: 'Trắng - S', color: 'Trắng Tinh Khôi', size: 'Size S (42-48kg)', price: 490000, salePrice: 319000, stock: 30, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80' },
        { sku: 'VAY-TRANG-M', name: 'Trắng - M', color: 'Trắng Tinh Khôi', size: 'Size M (49-55kg)', price: 490000, salePrice: 319000, stock: 40, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80' },
        { sku: 'VAY-KEM-S', name: 'Vàng Kem - S', color: 'Vàng Kem Nhẹ', size: 'Size S (42-48kg)', price: 490000, salePrice: 319000, stock: 25, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80' },
        { sku: 'VAY-KEM-M', name: 'Vàng Kem - M', color: 'Vàng Kem Nhẹ', size: 'Size M (49-55kg)', price: 490000, salePrice: 319000, stock: 35, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🌟 ĐIỂM NHẤN THIẾT KẾ
- **Chất liệu:** Tơ gân hạt nhập khẩu 2 lớp mềm mại, có lót trong kín đáo, không nhăn nhúm.
- **Kiểu dáng:** Cổ vuông khoe xương quai xanh quyến rũ, tay bồng tiểu thư che bắp tay, eo thắt chun co giãn tôn dáng cực đỉnh.
- **Thích hợp:** Đi chơi, du lịch biển, chụp ảnh kỷ yếu, dự tiệc nhẹ hoặc hẹn hò lãng mạn.`,
    },
    {
      name: 'Set Đồ Nữ Áo Blazer Croptop Kèm Chân Váy Xếp Ly Hàn Quốc',
      slug: 'set-do-nu-ao-blazer-croptop-chan-vay-xep-ly',
      categorySlug: 'thoi-trang-nu',
      price: 550000,
      salePrice: 389000,
      soldCount: 620,
      rating: 4.9,
      reviewCount: 178,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Đen Quý Phái', 'Nâu Be Hàn Quốc', 'Xám Khói'] },
        { name: 'Size', values: ['S', 'M', 'L'] },
      ],
      variants: [
        { sku: 'SET-BE-S', name: 'Nâu Be - S', color: 'Nâu Be Hàn Quốc', size: 'S', price: 550000, salePrice: 389000, stock: 20, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80' },
        { sku: 'SET-BE-M', name: 'Nâu Be - M', color: 'Nâu Be Hàn Quốc', size: 'M', price: 550000, salePrice: 389000, stock: 25, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80' },
        { sku: 'SET-DEN-S', name: 'Đen - S', color: 'Đen Quý Phái', size: 'S', price: 550000, salePrice: 389000, stock: 30, image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🌟 PHONG CÁCH HÀN QUỐC THỜI THƯỢNG
- Áo blazer croptop hiện đại khoe eo thon kết hợp chân váy xếp ly có quần bảo hộ bên trong an toàn.
- Chất vải tuyết mưa dày dặn, đứng form chuẩn sang xịn mịn.`,
    },

    // ==========================================
    // 3. PHỤ KIỆN ĐIỆN THOẠI & CÔNG NGHỆ
    // ==========================================
    {
      name: 'Củ Sạc Nhanh GaN 65W 3 Cổng Type-C & USB-A Tương Thích iPhone, iPad, MacBook',
      slug: 'cu-sac-nhanh-gan-65w-3-cong-type-c-usb-a',
      categorySlug: 'phu-kien-dien-thoai-cong-nghe',
      price: 490000,
      salePrice: 299000,
      soldCount: 2350,
      rating: 5.0,
      reviewCount: 640,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1609592424368-dc81c853bc69?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Phân Loại', values: ['Chỉ Củ Sạc', 'Kèm Cáp C to C 100W', 'Kèm Cáp C to Lightning'] },
        { name: 'Màu Sắc', values: ['Đen Nhám (Matte Black)', 'Trắng Ngọc Trai'] },
      ],
      variants: [
        { sku: 'GAN65W-DEN-NO', name: 'Chỉ Củ Sạc - Đen Nhám', color: 'Đen Nhám (Matte Black)', size: 'Chỉ Củ Sạc', price: 490000, salePrice: 299000, stock: 100, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80' },
        { sku: 'GAN65W-DEN-CC', name: 'Kèm Cáp C to C - Đen', color: 'Đen Nhám (Matte Black)', size: 'Kèm Cáp C to C 100W', price: 560000, salePrice: 349000, stock: 80, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80' },
        { sku: 'GAN65W-TRANG-CL', name: 'Kèm Cáp C to Lightning - Trắng', color: 'Trắng Ngọc Trai', size: 'Kèm Cáp C to Lightning', price: 580000, salePrice: 359000, stock: 70, image: 'https://images.unsplash.com/photo-1609592424368-dc81c853bc69?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### ⚡ CÔNG NGHỆ SẠC NHANH ĐỈNH CAO
- **Công nghệ GaN III:** Kích thước thu nhỏ 45% nhưng công suất đạt đến 65W, tỏa nhiệt cực thấp và chống cháy nổ an toàn tuyệt đối.
- **3 Cổng sạc tiện lợi:** 2 cổng Type-C PD 65W + 1 cổng USB-A Quick Charge 3.0, sạc đồng thời 3 thiết bị cùng lúc.
- **Bảo vệ toàn diện:** Chip thông minh tự ngắt khi đầy pin, bảo vệ quá dòng, quá áp và ngắn mạch.
- **Bảo hành:** 12 tháng lỗi 1 đổi 1 chính hãng.`,
    },
    {
      name: 'Pin Sạc Dự Phòng Magsafe Không Dây 10.000mAh Siêu Mỏng Có Chân Đỡ Tiện Lợi',
      slug: 'pin-sac-du-phong-magsafe-khong-day-10000mah',
      categorySlug: 'phu-kien-dien-thoai-cong-nghe',
      price: 520000,
      salePrice: 349000,
      soldCount: 1100,
      rating: 4.8,
      reviewCount: 290,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1622445262464-84b1b0722e0a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Tím Pastel', 'Trắng Băng Tuyết', 'Đen Titan'] },
        { name: 'Dung Lượng', values: ['10.000mAh Chuẩn'] },
      ],
      variants: [
        { sku: 'MAG-TIM', name: 'Tím Pastel - 10000mAh', color: 'Tím Pastel', size: '10.000mAh Chuẩn', price: 520000, salePrice: 349000, stock: 50, image: 'https://images.unsplash.com/photo-1622445262464-84b1b0722e0a?w=800&auto=format&fit=crop&q=80' },
        { sku: 'MAG-TRANG', name: 'Trắng Băng Tuyết - 10000mAh', color: 'Trắng Băng Tuyết', size: '10.000mAh Chuẩn', price: 520000, salePrice: 349000, stock: 60, image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🔋 HÍT TỪ TÍNH MAGSAFE SIÊU CHẮC
- Lực hút nam châm N52 siêu mạnh, không lo rơi rớt khi di chuyển.
- Sạc không dây nhanh 15W + Cổng ra Type-C PD 20W sạc nhanh có dây.
- Tích hợp chân đế kim loại gập mở thông minh để vừa sạc vừa xem phim, lướt TikTok.`,
    },

    // ==========================================
    // 4. TAI NGHE & LOA BLUETOOTH
    // ==========================================
    {
      name: 'Tai Nghe Bluetooth True Wireless Chống Ồn Chủ Động ANC Âm Bass Cực Căng',
      slug: 'tai-nghe-bluetooth-tws-chong-on-anc',
      categorySlug: 'tai-nghe-loa-bluetooth',
      price: 650000,
      salePrice: 420000,
      soldCount: 1850,
      rating: 4.9,
      reviewCount: 460,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Đen Không Gian', 'Trắng Sữa', 'Xanh Midnight'] },
      ],
      variants: [
        { sku: 'ANC-DEN', name: 'Đen Không Gian', color: 'Đen Không Gian', size: 'Tiêu chuẩn', price: 650000, salePrice: 420000, stock: 65, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80' },
        { sku: 'ANC-TRANG', name: 'Trắng Sữa', color: 'Trắng Sữa', size: 'Tiêu chuẩn', price: 650000, salePrice: 420000, stock: 75, image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🎵 TRẢI NGHIỆM ÂM THANH SỐNG ĐỘNG
- **Chống ồn chủ động ANC -35dB:** Lọc sạch tiếng ồn môi trường xung quanh, tận hưởng không gian âm nhạc riêng biệt.
- **Màng loa Dynamic 13mm:** Âm bass sâu chắc nịch, âm treble trong trẻo rõ ràng từng chi tiết.
- **Pin trâu:** 7 giờ nghe liên tục, kèm dock sạc nâng tổng thời lượng lên tới 35 giờ.
- **Độ trễ siêu thấp 40ms:** Thích hợp cả chơi game FPS và xem phim không lo lệch tiếng.`,
    },
    {
      name: 'Loa Bluetooth Mini Cầm Tay Chống Nước IPX7 Đèn LED RGB Theo Nhạc',
      slug: 'loa-bluetooth-mini-cam-tay-chong-nuoc-ipx7-led-rgb',
      categorySlug: 'tai-nghe-loa-bluetooth',
      price: 480000,
      salePrice: 289000,
      soldCount: 920,
      rating: 4.8,
      reviewCount: 195,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Đen Huyền Bí', 'Đỏ Rực Rỡ', 'Xanh Rêu Quân Đội'] },
      ],
      variants: [
        { sku: 'LOA-DEN', name: 'Đen Huyền Bí', color: 'Đen Huyền Bí', size: 'Bản Chuẩn', price: 480000, salePrice: 289000, stock: 45, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80' },
        { sku: 'LOA-DO', name: 'Đỏ Rực Rỡ', color: 'Đỏ Rực Rỡ', size: 'Bản Chuẩn', price: 480000, salePrice: 289000, stock: 35, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🔊 ÂM THANH 360 ĐỘ TRẦM ẤM
- Công suất 10W cực lớn so với kích thước nhỏ gọn trong lòng bàn tay.
- Chuẩn chống nước IPX7 thoải mái mang đi dã ngoại, tắm hồ bơi hay đi dưới trời mưa.
- Dải đèn LED RGB nhấp nháy chuyển động theo từng điệu nhạc cực chill.`,
    },

    // ==========================================
    // 5. ĐỒNG HỒ & SMARTWATCH
    // ==========================================
    {
      name: 'Đồng Hồ Thông Minh Smartwatch Màn Hình AMOLED Tràn Viền Đo Nhịp Tim SpO2 Nghe Gọi Bluetooth',
      slug: 'dong-ho-thong-minh-smartwatch-amoled-nghe-goi',
      categorySlug: 'dong-ho-smartwatch',
      price: 890000,
      salePrice: 599000,
      soldCount: 1350,
      rating: 4.9,
      reviewCount: 380,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Khung & Dây', values: ['Đen Titan (Dây Silicon)', 'Bạc Sang Trọng (Dây Da)', 'Vàng Hồng (Dây Kim Loại)'] },
      ],
      variants: [
        { sku: 'WATCH-DEN', name: 'Đen Titan (Dây Silicon)', color: 'Đen Titan (Dây Silicon)', size: 'Màn 1.95 inch', price: 890000, salePrice: 599000, stock: 50, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
        { sku: 'WATCH-BAC', name: 'Bạc Sang Trọng (Dây Da)', color: 'Bạc Sang Trọng (Dây Da)', size: 'Màn 1.95 inch', price: 950000, salePrice: 649000, stock: 40, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### ⌚ THIẾT KẾ ĐẲNG CẤP & CÔNG NGHỆ VƯỢT TRỘI
- **Màn hình AMOLED 1.95 inch:** Độ phân giải HD siêu nét, hiển thị rõ nét ngay dưới ánh nắng gắt.
- **Nghe gọi trực tiếp:** Mic lọc ồn và loa thoại to rõ, đồng bộ danh bạ và nhận thông báo Zalo, Facebook, SMS tức thì.
- **Theo dõi sức khỏe 24/7:** Đo nhịp tim, nồng độ oxy trong máu SpO2, theo dõi giấc ngủ và hơn 100 chế độ thể thao.
- **Thời lượng pin:** Lên đến 7-10 ngày cho 1 lần sạc đầy.`,
    },

    // ==========================================
    // 6. ĐỒ GIA DỤNG THÔNG MINH
    // ==========================================
    {
      name: 'Máy Phun Sương Tạo Ẩm Không Khí Khuếch Tán Tinh Dầu Đèn Ngủ LED 7 Màu',
      slug: 'may-phun-suong-tao-am-khuech-tan-tinh-dau-led',
      categorySlug: 'gia-dung-thong-minh',
      price: 320000,
      salePrice: 189000,
      soldCount: 1680,
      rating: 4.8,
      reviewCount: 340,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Trắng Vân Gỗ', 'Đen Huyền Bí'] },
        { name: 'Dung Tích', values: ['500ml Bản Cao Cấp'] },
      ],
      variants: [
        { sku: 'HUM-TRANG', name: 'Trắng Vân Gỗ - 500ml', color: 'Trắng Vân Gỗ', size: '500ml Bản Cao Cấp', price: 320000, salePrice: 189000, stock: 80, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80' },
        { sku: 'HUM-DEN', name: 'Đen Huyền Bí - 500ml', color: 'Đen Huyền Bí', size: '500ml Bản Cao Cấp', price: 320000, salePrice: 189000, stock: 60, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🌿 KHÔNG GIAN SỐNG TRONG LÀNH & THƯ GIÃN
- Công nghệ sóng siêu âm nano khuếch tán sương cực mịn, cấp ẩm cho da trong phòng điều hòa không bị khô ráp.
- Dung tích bình chứa 500ml hoạt động liên tục 12 tiếng không cần châm nước.
- Tích hợp khay nhỏ tinh dầu và đèn ngủ đổi màu lung linh cho giấc ngủ ngon sâu hơn.`,
    },
    {
      name: 'Máy Hút Bụi Cầm Tay Không Dây Mini Lực Hút Cực Mạnh 9000Pa Đa Năng Cho Ô Tô Và Bàn Học',
      slug: 'may-hut-bui-cam-tay-khong-day-mini-9000pa',
      categorySlug: 'gia-dung-thong-minh',
      price: 390000,
      salePrice: 249000,
      soldCount: 820,
      rating: 4.7,
      reviewCount: 165,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Đen Carbon', 'Trắng Bạc'] },
      ],
      variants: [
        { sku: 'VAC-DEN', name: 'Đen Carbon', color: 'Đen Carbon', size: 'Kèm 4 đầu hút', price: 390000, salePrice: 249000, stock: 55, image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🌪️ LỰC HÚT SIÊU MẠNH 9000PA
- Động cơ lõi đồng tốc độ cao dễ dàng hút sạch tóc vụn, tàn thuốc, bụi bẩn khe ghế ô tô, bàn phím máy tính.
- Kèm 4 đầu hút chuyên dụng và lõi lọc HEPA có thể giặt rửa tái sử dụng nhiều lần.`,
    },

    // ==========================================
    // 7. MỸ PHẨM & CHĂM SÓC SẮC ĐẸP
    // ==========================================
    {
      name: 'Son Kem Lì Mịn Môi Kháng Nước Lâu Trôi 12H Tone Màu Đỏ Gạch Hot Trend',
      slug: 'son-kem-li-min-moi-khang-nuoc-do-gach',
      categorySlug: 'my-pham-lam-dep',
      price: 280000,
      salePrice: 179000,
      soldCount: 2800,
      rating: 5.0,
      reviewCount: 890,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Mã Màu', values: ['#01 Đỏ Gạch Ánh Cam', '#02 Đỏ Đất Trầm', '#03 Hồng Khô MLBB'] },
      ],
      variants: [
        { sku: 'LIP-01', name: '#01 Đỏ Gạch Ánh Cam', color: '#01 Đỏ Gạch Ánh Cam', size: 'Fullsize 4.5g', price: 280000, salePrice: 179000, stock: 120, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80' },
        { sku: 'LIP-02', name: '#02 Đỏ Đất Trầm', color: '#02 Đỏ Đất Trầm', size: 'Fullsize 4.5g', price: 280000, salePrice: 179000, stock: 100, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80' },
        { sku: 'LIP-03', name: '#03 Hồng Khô MLBB', color: '#03 Hồng Khô MLBB', size: 'Fullsize 4.5g', price: 280000, salePrice: 179000, stock: 90, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 💄 CHẤT SON VELVET MỀM MỊN NHƯ NHUNG
- Lên màu chuẩn xác ngay từ lần quẹt đầu tiên, che phủ rãnh môi hoàn hảo.
- Không gây khô môi nhờ chứa tinh dầu Jojoba và Vitamin E nuôi dưỡng ẩm mượt.
- Kháng nước, chống lem dính khi uống nước hay đeo khẩu trang suốt 12 tiếng.`,
    },

    // ==========================================
    // 8. TÚI XÁCH, BALO & VÍ DA
    // ==========================================
    {
      name: 'Balo Nam Nữ Thời Trang Chống Thấm Nước Đựng Vừa Laptop 15.6 Inch Nhiều Ngăn Tiện Lợi',
      slug: 'balo-nam-nu-thoi-trang-chong-nuoc-laptop-15-inch',
      categorySlug: 'tui-xach-balo-vi-da',
      price: 460000,
      salePrice: 299000,
      soldCount: 1450,
      rating: 4.9,
      reviewCount: 370,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Đen Classic', 'Xám Tro Hiện Đại', 'Xanh Navy'] },
      ],
      variants: [
        { sku: 'BALO-DEN', name: 'Đen Classic', color: 'Đen Classic', size: 'Vừa Laptop 15.6 inch', price: 460000, salePrice: 299000, stock: 70, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
        { sku: 'BALO-XAM', name: 'Xám Tro', color: 'Xám Tro Hiện Đại', size: 'Vừa Laptop 15.6 inch', price: 460000, salePrice: 299000, stock: 50, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🎒 THIẾT KẾ ĐA NĂNG ĐI HỌC, ĐI LÀM, DU LỊCH
- Vải Oxford 900D cao cấp phủ màng chống thấm nước bảo vệ đồ đạc an toàn dưới mưa.
- Ngăn chống sốc riêng cho Laptop đến 15.6 inch, đệm lưng thoáng khí chống gù vai.
- Cổng sạc USB thông minh bên ngoài balo cực kỳ tiện lợi.`,
    },

    // ==========================================
    // 9. TRANG SỨC & PHỤ KIỆN THỜI TRANG
    // ==========================================
    {
      name: 'Kính Râm Thời Trang Unisex Gọng Vuông Chống Tia UV400 Phong Cách Hàn Quốc',
      slug: 'kinh-ram-thoi-trang-unisex-gong-vuong-uv400',
      categorySlug: 'trang-suc-phu-kien',
      price: 260000,
      salePrice: 149000,
      soldCount: 2100,
      rating: 4.9,
      reviewCount: 520,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Mắt Kính', values: ['Đen Huyền', 'Trà Gradient', 'Tráng Gương Bạc'] },
      ],
      variants: [
        { sku: 'GLASS-DEN', name: 'Đen Huyền', color: 'Đen Huyền', size: 'Free Size', price: 260000, salePrice: 149000, stock: 150, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80' },
        { sku: 'GLASS-TRA', name: 'Trà Gradient', color: 'Trà Gradient', size: 'Free Size', price: 260000, salePrice: 149000, stock: 110, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 🕶️ BẢO VỆ MẮT TỐI ĐA & TẠO GU THỜI THƯỢNG
- Tròng kính Polarized phân cực chống chói lóa, ngăn chặn 100% tia UV400 độc hại.
- Gọng nhựa Acetate siêu nhẹ, bền bỉ, ôm sát khuôn mặt không gây đau vành tai.`,
    },

    // ==========================================
    // 10. GIÀY DÉP & SNEAKER
    // ==========================================
    {
      name: 'Giày Sneaker Thể Thao Nam Nữ Cổ Thấp Đế Cao Su Đúc Êm Chân Phong Cách Năng Động',
      slug: 'giay-sneaker-the-thao-nam-nu-de-cao-su-duc-em-chan',
      categorySlug: 'giay-dep-sneaker',
      price: 590000,
      salePrice: 389000,
      soldCount: 1670,
      rating: 4.9,
      reviewCount: 410,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Màu Sắc', values: ['Đỏ Đô Phối Trắng', 'Trắng Kem Classic', 'Đen All-Black'] },
        { name: 'Size', values: ['38', '39', '40', '41', '42', '43'] },
      ],
      variants: [
        { sku: 'SNK-DO-39', name: 'Đỏ Đô - Size 39', color: 'Đỏ Đô Phối Trắng', size: '39', price: 590000, salePrice: 389000, stock: 25, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
        { sku: 'SNK-DO-40', name: 'Đỏ Đô - Size 40', color: 'Đỏ Đô Phối Trắng', size: '40', price: 590000, salePrice: 389000, stock: 35, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
        { sku: 'SNK-DO-41', name: 'Đỏ Đô - Size 41', color: 'Đỏ Đô Phối Trắng', size: '41', price: 590000, salePrice: 389000, stock: 30, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
        { sku: 'SNK-TRANG-39', name: 'Trắng Kem - Size 39', color: 'Trắng Kem Classic', size: '39', price: 590000, salePrice: 389000, stock: 40, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80' },
        { sku: 'SNK-TRANG-40', name: 'Trắng Kem - Size 40', color: 'Trắng Kem Classic', size: '40', price: 590000, salePrice: 389000, stock: 45, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80' },
        { sku: 'SNK-TRANG-41', name: 'Trắng Kem - Size 41', color: 'Trắng Kem Classic', size: '41', price: 590000, salePrice: 389000, stock: 35, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `### 👟 NĂNG ĐỘNG, ÊM ÁI TRÊN TỪNG BƯỚC CHÂN
- **Đế cao su nguyên khối:** Đàn hồi cao, chống trơn trượt tối đa ngay cả trên mặt sàn trơn ướt.
- **Thân giày da Microfiber:** Dễ dàng lau chùi, thoáng khí không gây hôi chân khi mang cả ngày.
- **Phong cách:** Thiết kế unisex trẻ trung, phối cùng quần short, quần jean hay chân váy đều cực kỳ thu hút.`,
    },
  ];

  const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: 0, min: 0 },
    minPrice: { type: Number, default: 0, index: true },
    maxPrice: { type: Number, default: 0, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['active', 'hidden'], default: 'active', index: true },
    options: [{ name: String, values: [String] }],
    variants: [{
      sku: String,
      name: String,
      color: String,
      size: String,
      price: Number,
      salePrice: Number,
      stock: Number,
      image: String,
    }],
  }, { timestamps: true });

  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  console.log('Clearing existing products before inserting...');
  await Product.deleteMany({});

  const productsToInsert = rawProducts.map(p => {
    const catId = catMap[p.categorySlug];
    if (!catId) {
      console.warn(`Category slug not found: ${p.categorySlug}`);
    }

    let calculatedStock = 0;
    let min = Infinity;
    let max = -Infinity;

    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        calculatedStock += Number(v.stock) || 0;
        const effective = v.salePrice && v.salePrice > 0 ? Number(v.salePrice) : Number(v.price);
        if (effective < min) min = effective;
        if (effective > max) max = effective;
      }
    }

    return {
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.salePrice || 0,
      minPrice: min === Infinity ? (p.salePrice || p.price) : min,
      maxPrice: max === -Infinity ? p.price : max,
      category: catId,
      images: p.images,
      stock: calculatedStock > 0 ? calculatedStock : 100,
      soldCount: p.soldCount || 0,
      rating: p.rating || 5,
      reviewCount: p.reviewCount || 0,
      description: p.description,
      isFeatured: p.isFeatured || false,
      status: 'active',
      options: p.options || [],
      variants: p.variants || [],
    };
  });

  console.log(`Inserting ${productsToInsert.length} products...`);
  const inserted = await Product.insertMany(productsToInsert);
  console.log(`\n✓ Đã thêm thành công ${inserted.length} sản phẩm đầy đủ biến thể và hình ảnh:`);
  inserted.forEach((prod, i) => {
    console.log(`  ${i + 1}. [${prod.slug}] ${prod.name} (${prod.variants.length} biến thể, ${prod.images.length} ảnh)`);
  });

  process.exit(0);
}

seedProducts().catch((err) => {
  console.error('Error seeding products:', err);
  process.exit(1);
});
