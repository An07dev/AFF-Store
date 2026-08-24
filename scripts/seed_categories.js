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

const categories = [
  {
    name: 'Thời Trang Nam',
    slug: 'thoi-trang-nam',
    description: 'Áo polo, áo thun, sơ mi, quần jean & trang phục nam hiện đại',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',
    order: 1,
    isActive: true,
  },
  {
    name: 'Thời Trang Nữ',
    slug: 'thoi-trang-nu',
    description: 'Váy đầm hot trend, áo kiểu, croptop & set đồ nữ thanh lịch',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    order: 2,
    isActive: true,
  },
  {
    name: 'Phụ Kiện Điện Thoại & Công Nghệ',
    slug: 'phu-kien-dien-thoai-cong-nghe',
    description: 'Củ sạc nhanh GaN, cáp sạc, ốp lưng, giá đỡ điện thoại & sạc dự phòng',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    order: 3,
    isActive: true,
  },
  {
    name: 'Tai Nghe & Loa Bluetooth',
    slug: 'tai-nghe-loa-bluetooth',
    description: 'Tai nghe True Wireless chống ồn ANC, loa bluetooth bass trầm đỉnh cao',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    order: 4,
    isActive: true,
  },
  {
    name: 'Đồng Hồ & Smartwatch',
    slug: 'dong-ho-smartwatch',
    description: 'Smartwatch thể thao theo dõi nhịp tim, đồng hồ đeo tay thời trang cao cấp',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    order: 5,
    isActive: true,
  },
  {
    name: 'Đồ Gia Dụng Thông Minh',
    slug: 'gia-dung-thong-minh',
    description: 'Máy tạo ẩm phun sương, đèn ngủ thông minh, máy hút bụi mini & tiện ích gia đình',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80',
    order: 6,
    isActive: true,
  },
  {
    name: 'Mỹ Phẩm & Chăm Sóc Sắc Đẹp',
    slug: 'my-pham-lam-dep',
    description: 'Son môi, kem chống nắng, serum dưỡng da & dụng cụ chăm sóc da mặt',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
    order: 7,
    isActive: true,
  },
  {
    name: 'Túi Xách, Balo & Ví Da',
    slug: 'tui-xach-balo-vi-da',
    description: 'Balo đi học đi làm chống nước, túi đeo chéo unisex, ví da nam nữ sang trọng',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    order: 8,
    isActive: true,
  },
  {
    name: 'Trang Sức & Phụ Kiện Thời Trang',
    slug: 'trang-suc-phu-kien',
    description: 'Kính râm chống tia UV, dây chuyền titan không rỉ, nhẫn & vòng tay cá tính',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    order: 9,
    isActive: true,
  },
  {
    name: 'Giày Dép & Sneaker',
    slug: 'giay-dep-sneaker',
    description: 'Sneaker năng động, giày thể thao chạy bộ, sandal & dép quai ngang hot trend',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    order: 10,
    isActive: true,
  },
];

async function seedCategories() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true }));

  console.log('Inserting new categories...');
  const result = await Category.insertMany(categories);
  console.log(`\n✓ Đã tạo thành công ${result.length} danh mục mới:`);
  result.forEach((c, idx) => {
    console.log(`  ${idx + 1}. [${c.slug}] ${c.name}`);
  });

  process.exit(0);
}

seedCategories().catch((err) => {
  console.error('Error creating categories:', err);
  process.exit(1);
});
