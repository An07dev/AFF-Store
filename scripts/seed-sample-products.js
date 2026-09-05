const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Get Active Tenant URI
function getActiveUri() {
  const configFile = path.join(process.cwd(), 'data', 'tenant_config.json');
  if (fs.existsSync(configFile)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (cfg.mongoUri) {
        console.log(`📡 Đang nạp sản phẩm mẫu vào CSDL khách hàng: [${cfg.dbName}] (${cfg.shopName})`);
        return cfg.mongoUri;
      }
    } catch (e) {}
  }
  return (
    process.env.MONGODB_URI ||
    'mongodb+srv://bigmansale2_db_user:LQBnps6DkzVpKe84@cluster0.o9kuvob.mongodb.net/webstore?retryWrites=true&w=majority&appName=Cluster0'
  );
}

async function seedSampleProducts() {
  const uri = getActiveUri();
  const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 10000 }).asPromise();

  console.log('🔗 Kết nối MongoDB thành công!');

  const Category = conn.collection('categories');
  const Product = conn.collection('products');

  // 1. Seed Categories
  const categoriesData = [
    {
      name: 'Áo Polo Nam',
      slug: 'ao-polo-nam',
      description: 'Dòng áo polo cao cấp công sở & dạo phố',
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Áo Sơ Mi Nam',
      slug: 'ao-so-mi-nam',
      description: 'Áo sơ mi Oxford, sơ mi lụa chống nhăn',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Quần Tây & Kaki',
      slug: 'quan-tay-kaki',
      description: 'Quần âu Slimfit, quần kaki co giãn 4 chiều',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      order: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Áo Khoác Nam',
      slug: 'ao-khoac-nam',
      description: 'Áo khoác gió 2 lớp, áo bomber phong cách',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      order: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const catMap = {};
  for (const cat of categoriesData) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      catMap[cat.slug] = existing._id;
    } else {
      const res = await Category.insertOne(cat);
      catMap[cat.slug] = res.insertedId;
      console.log(`➕ Đã thêm danh mục: ${cat.name}`);
    }
  }

  // 2. Seed Detailed Products with Rich Variants
  const productsData = [
    // Product 1: Áo Polo Nam Premium Cotton Pima
    {
      name: 'Áo Polo Nam Premium Cotton Pima Chống Nhăn',
      slug: 'ao-polo-nam-premium-cotton-pima',
      price: 350000,
      salePrice: 289000,
      minPrice: 289000,
      maxPrice: 350000,
      category: catMap['ao-polo-nam'],
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
      ],
      stock: 360,
      soldCount: 142,
      rating: 4.9,
      reviewCount: 38,
      description:
        '<p><strong>Áo Polo Nam Premium Cotton Pima</strong> sử dụng chất liệu 100% sợi bông Cotton Pima thượng hạng, mang lại cảm giác mềm mại, thoáng mát và co giãn vượt trội suốt ngày dài.</p><ul><li>Chất liệu: 95% Cotton Pima + 5% Spandex chống xù lông</li><li>Kiểu dáng: Slim-fit tôn dáng, cổ bẻ phối sọc thanh lịch</li><li>Độ bền: Không bai nhão, giữ phom hoàn hảo sau nhiều lần giặt</li></ul>',
      isFeatured: true,
      status: 'active',
      options: [
        { name: 'Màu sắc', values: ['Đen Huyền Bí', 'Trắng Tinh Khôi', 'Xanh Navy'] },
        { name: 'Kích cỡ', values: ['M (50-60kg)', 'L (60-70kg)', 'XL (70-80kg)', '2XL (80-90kg)'] },
      ],
      variants: [
        // Đen
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-BLK-M',
          title: 'Đen Huyền Bí / M (50-60kg)',
          color: 'Đen Huyền Bí',
          size: 'M (50-60kg)',
          attributes: { 'Màu sắc': 'Đen Huyền Bí', 'Kích cỡ': 'M (50-60kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-BLK-L',
          title: 'Đen Huyền Bí / L (60-70kg)',
          color: 'Đen Huyền Bí',
          size: 'L (60-70kg)',
          attributes: { 'Màu sắc': 'Đen Huyền Bí', 'Kích cỡ': 'L (60-70kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-BLK-XL',
          title: 'Đen Huyền Bí / XL (70-80kg)',
          color: 'Đen Huyền Bí',
          size: 'XL (70-80kg)',
          attributes: { 'Màu sắc': 'Đen Huyền Bí', 'Kích cỡ': 'XL (70-80kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-BLK-2XL',
          title: 'Đen Huyền Bí / 2XL (80-90kg)',
          color: 'Đen Huyền Bí',
          size: '2XL (80-90kg)',
          attributes: { 'Màu sắc': 'Đen Huyền Bí', 'Kích cỡ': '2XL (80-90kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        },
        // Trắng
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-WHT-M',
          title: 'Trắng Tinh Khôi / M (50-60kg)',
          color: 'Trắng Tinh Khôi',
          size: 'M (50-60kg)',
          attributes: { 'Màu sắc': 'Trắng Tinh Khôi', 'Kích cỡ': 'M (50-60kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-WHT-L',
          title: 'Trắng Tinh Khôi / L (60-70kg)',
          color: 'Trắng Tinh Khôi',
          size: 'L (60-70kg)',
          attributes: { 'Màu sắc': 'Trắng Tinh Khôi', 'Kích cỡ': 'L (60-70kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-WHT-XL',
          title: 'Trắng Tinh Khôi / XL (70-80kg)',
          color: 'Trắng Tinh Khôi',
          size: 'XL (70-80kg)',
          attributes: { 'Màu sắc': 'Trắng Tinh Khôi', 'Kích cỡ': 'XL (70-80kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-WHT-2XL',
          title: 'Trắng Tinh Khôi / 2XL (80-90kg)',
          color: 'Trắng Tinh Khôi',
          size: '2XL (80-90kg)',
          attributes: { 'Màu sắc': 'Trắng Tinh Khôi', 'Kích cỡ': '2XL (80-90kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        },
        // Xanh Navy
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-NVY-M',
          title: 'Xanh Navy / M (50-60kg)',
          color: 'Xanh Navy',
          size: 'M (50-60kg)',
          attributes: { 'Màu sắc': 'Xanh Navy', 'Kích cỡ': 'M (50-60kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-NVY-L',
          title: 'Xanh Navy / L (60-70kg)',
          color: 'Xanh Navy',
          size: 'L (60-70kg)',
          attributes: { 'Màu sắc': 'Xanh Navy', 'Kích cỡ': 'L (60-70kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-NVY-XL',
          title: 'Xanh Navy / XL (70-80kg)',
          color: 'Xanh Navy',
          size: 'XL (70-80kg)',
          attributes: { 'Màu sắc': 'Xanh Navy', 'Kích cỡ': 'XL (70-80kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'POLO-PIMA-NVY-2XL',
          title: 'Xanh Navy / 2XL (80-90kg)',
          color: 'Xanh Navy',
          size: '2XL (80-90kg)',
          attributes: { 'Màu sắc': 'Xanh Navy', 'Kích cỡ': '2XL (80-90kg)' },
          price: 350000,
          salePrice: 289000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Product 2: Áo Sơ Mi Oxford Dài Tay Slimfit Công Sở
    {
      name: 'Áo Sơ Mi Oxford Dài Tay Slimfit Công Sở',
      slug: 'ao-so-mi-oxford-dai-tay-slimfit',
      price: 450000,
      salePrice: 389000,
      minPrice: 389000,
      maxPrice: 450000,
      category: catMap['ao-so-mi-nam'],
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      ],
      stock: 240,
      soldCount: 98,
      rating: 4.8,
      reviewCount: 29,
      description:
        '<p><strong>Áo Sơ Mi Nam Dài Tay Oxford</strong> sở hữu chất liệu dệt sợi đôi bền bỉ, dày dặn nhưng vô cùng thoáng khí, chuẩn phom lịch lãm cho quý ông công sở.</p>',
      isFeatured: true,
      status: 'active',
      options: [
        { name: 'Màu sắc', values: ['Trắng Classic', 'Xanh Pastel'] },
        { name: 'Kích cỡ', values: ['38 (S)', '39 (M)', '40 (L)', '41 (XL)'] },
      ],
      variants: [
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SOMI-OXF-WHT-38',
          title: 'Trắng Classic / 38 (S)',
          color: 'Trắng Classic',
          size: '38 (S)',
          attributes: { 'Màu sắc': 'Trắng Classic', 'Kích cỡ': '38 (S)' },
          price: 450000,
          salePrice: 389000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SOMI-OXF-WHT-39',
          title: 'Trắng Classic / 39 (M)',
          color: 'Trắng Classic',
          size: '39 (M)',
          attributes: { 'Màu sắc': 'Trắng Classic', 'Kích cỡ': '39 (M)' },
          price: 450000,
          salePrice: 389000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SOMI-OXF-WHT-40',
          title: 'Trắng Classic / 40 (L)',
          color: 'Trắng Classic',
          size: '40 (L)',
          attributes: { 'Màu sắc': 'Trắng Classic', 'Kích cỡ': '40 (L)' },
          price: 450000,
          salePrice: 389000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SOMI-OXF-WHT-41',
          title: 'Trắng Classic / 41 (XL)',
          color: 'Trắng Classic',
          size: '41 (XL)',
          attributes: { 'Màu sắc': 'Trắng Classic', 'Kích cỡ': '41 (XL)' },
          price: 450000,
          salePrice: 389000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SOMI-OXF-BLU-38',
          title: 'Xanh Pastel / 38 (S)',
          color: 'Xanh Pastel',
          size: '38 (S)',
          attributes: { 'Màu sắc': 'Xanh Pastel', 'Kích cỡ': '38 (S)' },
          price: 450000,
          salePrice: 389000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SOMI-OXF-BLU-39',
          title: 'Xanh Pastel / 39 (M)',
          color: 'Xanh Pastel',
          size: '39 (M)',
          attributes: { 'Màu sắc': 'Xanh Pastel', 'Kích cỡ': '39 (M)' },
          price: 450000,
          salePrice: 389000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SOMI-OXF-BLU-40',
          title: 'Xanh Pastel / 40 (L)',
          color: 'Xanh Pastel',
          size: '40 (L)',
          attributes: { 'Màu sắc': 'Xanh Pastel', 'Kích cỡ': '40 (L)' },
          price: 450000,
          salePrice: 389000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'SOMI-OXF-BLU-41',
          title: 'Xanh Pastel / 41 (XL)',
          color: 'Xanh Pastel',
          size: '41 (XL)',
          attributes: { 'Màu sắc': 'Xanh Pastel', 'Kích cỡ': '41 (XL)' },
          price: 450000,
          salePrice: 389000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Product 3: Quần Tây Nam Co Giãn 4 Chiều Form Slimfit
    {
      name: 'Quần Tây Nam Co Giãn 4 Chiều Form Slimfit',
      slug: 'quan-tay-nam-co-gian-4-chieu-slimfit',
      price: 490000,
      salePrice: 420000,
      minPrice: 420000,
      maxPrice: 490000,
      category: catMap['quan-tay-kaki'],
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
      ],
      stock: 250,
      soldCount: 210,
      rating: 5.0,
      reviewCount: 45,
      description:
        '<p><strong>Quần Tây Nam Slimfit Co Giãn</strong> chống nhăn tuyệt đối, cạp chun thông minh co giãn 2-3cm mang lại cảm giác thoải mái khi ngồi làm việc cả ngày.</p>',
      isFeatured: true,
      status: 'active',
      options: [
        { name: 'Màu sắc', values: ['Đen Tuyển', 'Xám Đậm Charcoal'] },
        { name: 'Kích cỡ', values: ['Size 29', 'Size 30', 'Size 31', 'Size 32', 'Size 34'] },
      ],
      variants: [
        // Đen
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-BLK-29',
          title: 'Đen Tuyển / Size 29',
          color: 'Đen Tuyển',
          size: 'Size 29',
          attributes: { 'Màu sắc': 'Đen Tuyển', 'Kích cỡ': 'Size 29' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-BLK-30',
          title: 'Đen Tuyển / Size 30',
          color: 'Đen Tuyển',
          size: 'Size 30',
          attributes: { 'Màu sắc': 'Đen Tuyển', 'Kích cỡ': 'Size 30' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-BLK-31',
          title: 'Đen Tuyển / Size 31',
          color: 'Đen Tuyển',
          size: 'Size 31',
          attributes: { 'Màu sắc': 'Đen Tuyển', 'Kích cỡ': 'Size 31' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-BLK-32',
          title: 'Đen Tuyển / Size 32',
          color: 'Đen Tuyển',
          size: 'Size 32',
          attributes: { 'Màu sắc': 'Đen Tuyển', 'Kích cỡ': 'Size 32' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-BLK-34',
          title: 'Đen Tuyển / Size 34',
          color: 'Đen Tuyển',
          size: 'Size 34',
          attributes: { 'Màu sắc': 'Đen Tuyển', 'Kích cỡ': 'Size 34' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        },
        // Xám
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-GRY-29',
          title: 'Xám Đậm Charcoal / Size 29',
          color: 'Xám Đậm Charcoal',
          size: 'Size 29',
          attributes: { 'Màu sắc': 'Xám Đậm Charcoal', 'Kích cỡ': 'Size 29' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-GRY-30',
          title: 'Xám Đậm Charcoal / Size 30',
          color: 'Xám Đậm Charcoal',
          size: 'Size 30',
          attributes: { 'Màu sắc': 'Xám Đậm Charcoal', 'Kích cỡ': 'Size 30' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-GRY-31',
          title: 'Xám Đậm Charcoal / Size 31',
          color: 'Xám Đậm Charcoal',
          size: 'Size 31',
          attributes: { 'Màu sắc': 'Xám Đậm Charcoal', 'Kích cỡ': 'Size 31' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-GRY-32',
          title: 'Xám Đậm Charcoal / Size 32',
          color: 'Xám Đậm Charcoal',
          size: 'Size 32',
          attributes: { 'Màu sắc': 'Xám Đậm Charcoal', 'Kích cỡ': 'Size 32' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'QT-SLIM-GRY-34',
          title: 'Xám Đậm Charcoal / Size 34',
          color: 'Xám Đậm Charcoal',
          size: 'Size 34',
          attributes: { 'Màu sắc': 'Xám Đậm Charcoal', 'Kích cỡ': 'Size 34' },
          price: 490000,
          salePrice: 420000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Product 4: Áo Khoác Gió Nam 2 Lớp Chống Thấm Nước
    {
      name: 'Áo Khoác Gió Nam 2 Lớp Chống Thấm Nước Kháng Khuẩn',
      slug: 'ao-khoac-gio-nam-2-lop-chong-nuoc',
      price: 550000,
      salePrice: 469000,
      minPrice: 469000,
      maxPrice: 550000,
      category: catMap['ao-khoac-nam'],
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
      ],
      stock: 180,
      soldCount: 180,
      rating: 4.9,
      reviewCount: 52,
      description:
        '<p><strong>Áo Khoác Gió Nam 2 Lớp</strong> công nghệ Nano chống thấm nước, cản gió giữ ấm và lót lưới thoáng khí chống dính mồ hôi.</p>',
      isFeatured: true,
      status: 'active',
      options: [
        { name: 'Màu sắc', values: ['Xanh Rêu Quân Đội', 'Đen Jet Black'] },
        { name: 'Kích cỡ', values: ['L (60-70kg)', 'XL (70-80kg)', '2XL (80-90kg)'] },
      ],
      variants: [
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'AK-GIO-REU-L',
          title: 'Xanh Rêu Quân Đội / L (60-70kg)',
          color: 'Xanh Rêu Quân Đội',
          size: 'L (60-70kg)',
          attributes: { 'Màu sắc': 'Xanh Rêu Quân Đội', 'Kích cỡ': 'L (60-70kg)' },
          price: 550000,
          salePrice: 469000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'AK-GIO-REU-XL',
          title: 'Xanh Rêu Quân Đội / XL (70-80kg)',
          color: 'Xanh Rêu Quân Đội',
          size: 'XL (70-80kg)',
          attributes: { 'Màu sắc': 'Xanh Rêu Quân Đội', 'Kích cỡ': 'XL (70-80kg)' },
          price: 550000,
          salePrice: 469000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'AK-GIO-REU-2XL',
          title: 'Xanh Rêu Quân Đội / 2XL (80-90kg)',
          color: 'Xanh Rêu Quân Đội',
          size: '2XL (80-90kg)',
          attributes: { 'Màu sắc': 'Xanh Rêu Quân Đội', 'Kích cỡ': '2XL (80-90kg)' },
          price: 550000,
          salePrice: 469000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'AK-GIO-BLK-L',
          title: 'Đen Jet Black / L (60-70kg)',
          color: 'Đen Jet Black',
          size: 'L (60-70kg)',
          attributes: { 'Màu sắc': 'Đen Jet Black', 'Kích cỡ': 'L (60-70kg)' },
          price: 550000,
          salePrice: 469000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'AK-GIO-BLK-XL',
          title: 'Đen Jet Black / XL (70-80kg)',
          color: 'Đen Jet Black',
          size: 'XL (70-80kg)',
          attributes: { 'Màu sắc': 'Đen Jet Black', 'Kích cỡ': 'XL (70-80kg)' },
          price: 550000,
          salePrice: 469000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          sku: 'AK-GIO-BLK-2XL',
          title: 'Đen Jet Black / 2XL (80-90kg)',
          color: 'Đen Jet Black',
          size: '2XL (80-90kg)',
          attributes: { 'Màu sắc': 'Đen Jet Black', 'Kích cỡ': '2XL (80-90kg)' },
          price: 550000,
          salePrice: 469000,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const prod of productsData) {
    const existing = await Product.findOne({ slug: prod.slug });
    if (existing) {
      await Product.updateOne({ slug: prod.slug }, { $set: prod });
      console.log(`🔄 Đã cập nhật sản phẩm: ${prod.name} (${prod.variants.length} biến thể)`);
    } else {
      await Product.insertOne(prod);
      console.log(`➕ Đã thêm sản phẩm mới: ${prod.name} (${prod.variants.length} biến thể)`);
    }
  }

  const totalProds = await Product.countDocuments();
  const totalCats = await Category.countDocuments();

  console.log(`\n🎉 HOÀN TẤT! CSDL hiện có ${totalCats} Danh mục và ${totalProds} Sản phẩm với đầy đủ biến thể!`);
  await conn.close();
}

seedSampleProducts().catch(console.error);
