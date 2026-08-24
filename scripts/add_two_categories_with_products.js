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

async function addCategoriesAndProducts() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

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

  // 1. Add or Update the 2 Categories
  const newCategoriesData = [
    {
      name: 'Bánh Trung Thu',
      slug: 'banh-trung-thu',
      description: 'Hộp bánh Trung Thu thượng hạng, bánh nướng, bánh dẻo cao cấp quà tặng sum vầy',
      image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80',
      order: 11,
      isActive: true,
    },
    {
      name: 'Áo Đá Bóng',
      slug: 'ao-da-bong',
      description: 'Áo bóng đá CLB & Đội tuyển quốc gia chất vải mè thái thoáng khí, co giãn cực tốt',
      image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&auto=format&fit=crop&q=80',
      order: 12,
      isActive: true,
    },
  ];

  const catDocs = {};
  for (const catData of newCategoriesData) {
    let cat = await Category.findOneAndUpdate(
      { slug: catData.slug },
      { $set: catData },
      { upsert: true, new: true }
    );
    catDocs[catData.slug] = cat;
    console.log(`✓ Đã tạo/cập nhật danh mục: [${cat.slug}] ${cat.name}`);
  }

  // 2. Add sample products for both categories
  const newProducts = [
    // --- BÁNH TRUNG THU 1 ---
    {
      name: 'Hộp Quà Bánh Trung Thu Hoàng Kim Thượng Hạng 4 Bánh Kèm Trà Ô Long Hộp Gỗ Khắc Sơn Mài',
      slug: 'hop-qua-banh-trung-thu-hoang-kim-4-banh-kem-tra',
      category: catDocs['banh-trung-thu']._id,
      price: 680000,
      salePrice: 489000,
      soldCount: 860,
      rating: 5.0,
      reviewCount: 240,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Bộ Vị Bánh', values: ['Set Hoàng Kim Truyền Thống (Thập Cẩm Bát Bửu, Hạt Sen, Đậu Xanh, Môn)', 'Set Hiện Đại Thượng Hạng (Lava Trứng Muối, Tiramisu, Matcha, Yến Sào)'] },
      ],
      variants: [
        {
          sku: 'BTT-HOANGKIM-TT',
          name: 'Set Hoàng Kim Truyền Thống',
          color: 'Set Hoàng Kim Truyền Thống (Thập Cẩm Bát Bửu, Hạt Sen, Đậu Xanh, Môn)',
          size: 'Hộp 4 Bánh 150g + Trà',
          price: 680000,
          salePrice: 489000,
          stock: 60,
          image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&auto=format&fit=crop&q=80',
        },
        {
          sku: 'BTT-HOANGKIM-HD',
          name: 'Set Hiện Đại Thượng Hạng',
          color: 'Set Hiện Đại Thượng Hạng (Lava Trứng Muối, Tiramisu, Matcha, Yến Sào)',
          size: 'Hộp 4 Bánh 150g + Trà',
          price: 750000,
          salePrice: 539000,
          stock: 50,
          image: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80',
        },
      ],
      description: `✨ GIỚI THIỆU SẢN PHẨM:
Hộp Bánh Trung Thu Hoàng Kim Thượng Hạng là tuyệt tác ẩm thực và nghệ thuật quà tặng Trung Thu. Vỏ hộp gỗ khắc sơn mài hoa sen tinh xảo kết hợp hương vị bánh nướng truyền thống và hiện đại, mang trọn lời chúc Đoàn Viên và Thịnh Vượng đến gia đình, người thân và đối tác.

🌟 HƯƠNG VỊ ĐỈNH CAO NGUYÊN BẢN:
• Vỏ bánh nướng mỏng mềm, màu vàng ươm óng ả, hoa văn sắc nét từng đường vân.
• Nhân Thập Cẩm Bát Bửu Gà Quay: Hòa quyện từ 8 nguyên liệu quý như lạp xưởng tôm, jambon, hạt sen, hạt dưa, lá chanh thơm lừng.
• Nhân Lava Trứng Muối Tan Chảy: Lớp trứng muối béo ngậy tan chảy mượt mà ngay khi cắt bánh.
• Giảm ngọt 30%: Sử dụng đường ăn kiêng Isomalt tự nhiên, thơm dịu, thanh nhẹ tốt cho sức khỏe.
• Kèm 1 Hũ Trà Ô Long Thượng Hạng 50g nhập khẩu từ cao nguyên Mộc Châu.

📋 QUY CÁCH ĐÓNG GÓI & THÔNG TIN SẢN PHẨM:
• Trọng lượng bánh: 150g/bánh (Hộp 4 bánh tổng 600g)
• Hạn sử dụng: 60 ngày kể từ ngày sản xuất (Hàng sản xuất mới mỗi ngày)
• Bộ sản phẩm gồm: 4 Bánh Trung Thu + 1 Hũ Trà Ô Long + Hộp gỗ sơn mài cao cấp + Túi giấy sang trọng.

🛡️ CAM KẾT CHẤT LƯỢNG:
• Đầy đủ chứng nhận vệ sinh an toàn thực phẩm ISO 22000.
• Hoàn tiền 100% nếu bánh bị móp méo, vỡ nát trong quá trình vận chuyển.`,
    },

    // --- BÁNH TRUNG THU 2 ---
    {
      name: 'Bánh Trung Thu Trứng Muối Tan Chảy Lava Custard Hong Kong Hộp 6 Bánh Béo Ngậy Đậm Đà',
      slug: 'banh-trung-thu-trung-muoi-tan-chay-lava-custard-6-banh',
      category: catDocs['banh-trung-thu']._id,
      price: 420000,
      salePrice: 289000,
      soldCount: 1520,
      rating: 4.9,
      reviewCount: 390,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Quy Cách', values: ['Hộp 6 Bánh (Hộp Quà Tết Trung Thu)'] },
      ],
      variants: [
        {
          sku: 'BTT-LAVA-6',
          name: 'Hộp 6 Bánh Lava',
          color: 'Lava Trứng Muối Kim Sa',
          size: 'Hộp 6 Bánh (50g/bánh)',
          price: 420000,
          salePrice: 289000,
          stock: 90,
          image: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80',
        },
      ],
      description: `✨ GIỚI THIỆU SẢN PHẨM:
Bánh Trung Thu Lava Custard Trứng Muối Tan Chảy là món bánh gây sốt mỗi mùa trăng rằm. Vỏ bánh ngàn lớp bơ Pháp giòn nhẹ, ôm trọn dòng nhân kim sa trứng muối tuôn trào béo ngậy ngọt ngào khó cưỡng.

🌟 ĐIỂM NHẤN ĐẶC BIỆT:
• Nhân Lava Kim Sa trứng muối béo bùi, mịn màng tự nhiên không pha bột phẩm màu.
• Có thể làm nóng bằng lò vi sóng hoặc nồi chiên không dầu trong 10 giây để nhân tan chảy cực đã miệng.
• Hộp quà màu đỏ may mắn sang trọng, thích hợp biếu tặng bạn bè, đồng nghiệp.`,
    },

    // --- ÁO ĐÁ BÓNG 1 ---
    {
      name: 'Áo Đá Bóng CLB Real Madrid / Man City / MU Mùa Giải Mới 2025/2026 Vải Mè Thái Cao Cấp',
      slug: 'ao-da-bong-clb-real-madrid-man-city-mu-2025-2026',
      category: catDocs['ao-da-bong']._id,
      price: 260000,
      salePrice: 169000,
      soldCount: 2450,
      rating: 4.9,
      reviewCount: 680,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Câu Lạc Bộ', values: ['Real Madrid (Trắng Hoàng Gia)', 'Manchester United (Đỏ Truyền Thống)', 'Man City (Xanh Da Trời)'] },
        { name: 'Size Áo', values: ['Size S (45-55kg)', 'Size M (56-65kg)', 'Size L (66-75kg)', 'Size XL (76-88kg)'] },
      ],
      variants: [
        { sku: 'BONG-REAL-M', name: 'Real Madrid - Size M', color: 'Real Madrid (Trắng Hoàng Gia)', size: 'Size M (56-65kg)', price: 260000, salePrice: 169000, stock: 50, image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80' },
        { sku: 'BONG-REAL-L', name: 'Real Madrid - Size L', color: 'Real Madrid (Trắng Hoàng Gia)', size: 'Size L (66-75kg)', price: 260000, salePrice: 169000, stock: 45, image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80' },
        { sku: 'BONG-MU-M', name: 'Manchester United - Size M', color: 'Manchester United (Đỏ Truyền Thống)', size: 'Size M (56-65kg)', price: 260000, salePrice: 169000, stock: 40, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80' },
        { sku: 'BONG-MU-L', name: 'Manchester United - Size L', color: 'Manchester United (Đỏ Truyền Thống)', size: 'Size L (66-75kg)', price: 260000, salePrice: 169000, stock: 35, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80' },
        { sku: 'BONG-MC-M', name: 'Man City - Size M', color: 'Man City (Xanh Da Trời)', size: 'Size M (56-65kg)', price: 260000, salePrice: 169000, stock: 30, image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `✨ GIỚI THIỆU SẢN PHẨM:
Áo Bóng Đá CLB Mùa Giải Mới 2025/2026 chuẩn thi đấu với thiết kế thể thao chuyên nghiệp. Vải dệt mè hạt gạo kim cương cao cấp giúp thoát nhiệt siêu nhanh, mang lại cảm giác nhẹ tênh và tự tin bứt tốc trên sân cỏ.

🌟 ĐẶC ĐIỂM KỸ THUẬT VƯỢT TRỘI:
• Chất vải Thun Mè Thái Lan 100% Polyester: Co giãn 4 chiều, mềm mịn, chống nhăn và kháng bám bẩn.
• Công nghệ Dệt Thoát Ẩm Dri-FIT: Hút sạch mồ hôi và bay hơi tức thì, không gây bết dính vào cơ thể.
• Logo CLB & Nhà tài trợ: Thêu sắc nét, công nghệ in nhiệt chìm không bong tróc kể cả khi giặt máy nhiều lần.
• Cổ áo & Tay áo may bo co giãn thoải mái, không gây cọ xát khó chịu khi vận động mạnh.

📋 BẢNG CHỌN SIZE CHUẨN FORM VIỆT NAM:
• Size S: Chiều cao 1m50 - 1m60 | Cân nặng 45 - 55kg
• Size M: Chiều cao 1m60 - 1m68 | Cân nặng 56 - 65kg
• Size L: Chiều cao 1m68 - 1m75 | Cân nặng 66 - 75kg
• Size XL: Chiều cao 1m75 - 1m85 | Cân nặng 76 - 88kg

🛡️ CHÍNH SÁCH ĐỔI TRẢ & BẢO HÀNH:
• Hỗ trợ đổi size miễn phí trong 7 ngày nếu mặc không vừa vặn.
• Nhận in tên + số áo theo yêu cầu (in decal xịn sắc nét không bong tróc).`,
    },

    // --- ÁO ĐÁ BÓNG 2 ---
    {
      name: 'Bộ Quần Áo Bóng Đá Đội Tuyển Quốc Gia Việt Nam / Argentina Sân Nhà Sân Khách Co Giãn 4 Chiều',
      slug: 'bo-quan-ao-bong-da-doi-tuyen-quoc-gia-viet-nam-argentina',
      category: catDocs['ao-da-bong']._id,
      price: 280000,
      salePrice: 189000,
      soldCount: 1890,
      rating: 5.0,
      reviewCount: 470,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80',
      ],
      options: [
        { name: 'Đội Tuyển', values: ['Đội Tuyển Việt Nam (Đỏ)', 'Đội Tuyển Argentina (Sọc Trắng Xanh)'] },
        { name: 'Size', values: ['Size M (55-65kg)', 'Size L (66-75kg)', 'Size XL (76-85kg)'] },
      ],
      variants: [
        { sku: 'BONG-VN-M', name: 'Đội Tuyển Việt Nam - M', color: 'Đội Tuyển Việt Nam (Đỏ)', size: 'Size M (55-65kg)', price: 280000, salePrice: 189000, stock: 50, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80' },
        { sku: 'BONG-VN-L', name: 'Đội Tuyển Việt Nam - L', color: 'Đội Tuyển Việt Nam (Đỏ)', size: 'Size L (66-75kg)', price: 280000, salePrice: 189000, stock: 40, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80' },
        { sku: 'BONG-ARG-L', name: 'Đội Tuyển Argentina - L', color: 'Đội Tuyển Argentina (Sọc Trắng Xanh)', size: 'Size L (66-75kg)', price: 280000, salePrice: 189000, stock: 45, image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80' },
      ],
      description: `✨ BỘ QUẦN ÁO ĐÁ BÓNG ĐỘI TUYỂN QUỐC GIA CAO CẤP:
• Gồm cả Áo + Quần đồng bộ chất lượng cao.
• Vải mè kim cương nhập khẩu thoáng mát, kháng khuẩn khử mùi mồ hôi.
• Cờ quốc gia thêu viền sắc sảo, ngôi sao vàng thêu nổi đẳng cấp.`,
    },
  ];

  for (const prodData of newProducts) {
    let calculatedStock = 0;
    let min = Infinity;
    let max = -Infinity;

    if (prodData.variants && prodData.variants.length > 0) {
      for (const v of prodData.variants) {
        calculatedStock += Number(v.stock) || 0;
        const effective = v.salePrice && v.salePrice > 0 ? Number(v.salePrice) : Number(v.price);
        if (effective < min) min = effective;
        if (effective > max) max = effective;
      }
    }

    const payload = {
      ...prodData,
      stock: calculatedStock > 0 ? calculatedStock : 100,
      minPrice: min === Infinity ? (prodData.salePrice || prodData.price) : min,
      maxPrice: max === -Infinity ? prodData.price : max,
      status: 'active',
    };

    const updated = await Product.findOneAndUpdate(
      { slug: prodData.slug },
      { $set: payload },
      { upsert: true, new: true }
    );
    console.log(`✓ Đã tạo sản phẩm: [${updated.slug}] ${updated.name} (${updated.variants.length} biến thể)`);
  }

  console.log('\n🎉 Hoàn thành tạo 2 danh mục mới và các sản phẩm tương ứng!');
  process.exit(0);
}

addCategoriesAndProducts().catch((err) => {
  console.error('Error adding categories and products:', err);
  process.exit(1);
});
