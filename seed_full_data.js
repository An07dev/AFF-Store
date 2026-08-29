const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb+srv://bigmansale2_db_user:LQBnps6DkzVpKe84@cluster0.o9kuvob.mongodb.net/webstore?retryWrites=true&w=majority&appName=Cluster0';

async function seedData() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected successfully!');

  // Define Schemas
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    role: { type: String, default: 'customer' },
  }, { timestamps: true }));

  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    description: String,
    image: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true }));

  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    price: Number,
    salePrice: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [String],
    stock: Number,
    soldCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    description: String,
    variants: [{ color: String, size: String, stock: Number, price: Number }],
  }, { timestamps: true }));

  const Customer = mongoose.models.Customer || mongoose.model('Customer', new mongoose.Schema({
    name: String,
    phone: { type: String, unique: true },
    email: String,
    address: String,
    province: String,
    district: String,
    ward: String,
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: Date,
  }, { timestamps: true }));

  const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
    orderCode: { type: String, unique: true },
    customer: {
      name: String,
      phone: String,
      email: String,
      address: String,
      province: String,
      district: String,
      ward: String,
    },
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      variant: { color: String, size: String },
    }],
    subtotal: Number,
    shippingFee: Number,
    discountAmount: Number,
    totalAmount: Number,
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: { type: String, default: 'unpaid' },
    status: { type: String, default: 'pending' },
    notes: String,
  }, { timestamps: true }));

  const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({
    key: { type: String, unique: true },
    value: mongoose.Schema.Types.Mixed,
  }, { timestamps: true }));

  console.log('Clearing old collections (except preserving theme)...');
  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Customer.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // 1. Seed Users
  const adminHashed = await bcrypt.hash('admin123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@shoptik.vn' },
    {
      name: 'Admin ShopTik',
      email: 'admin@shoptik.vn',
      phone: '0988888888',
      password: adminHashed,
      role: 'admin',
    },
    { upsert: true }
  );

  const staffHashed = await bcrypt.hash('staff123', 10);
  await User.findOneAndUpdate(
    { email: 'staff@shoptik.vn' },
    {
      name: 'Nhân Viên Quản Trị',
      email: 'staff@shoptik.vn',
      phone: '0977777777',
      password: staffHashed,
      role: 'staff',
    },
    { upsert: true }
  );

  console.log('✓ Seeded Admin & Staff users');

  // 2. Seed Categories
  const catDocs = await Category.insertMany([
    {
      name: 'Thời Trang Nam',
      slug: 'thoi-trang-nam',
      description: 'Áo sơ mi, áo polo, quần tây và quần jean nam thời thượng',
      order: 1,
      isActive: true,
    },
    {
      name: 'Thời Trang Nữ',
      slug: 'thoi-trang-nu',
      description: 'Váy đầm dự tiệc, áo kiểu, chân váy phong cách thanh lịch Hàn Quốc',
      order: 2,
      isActive: true,
    },
    {
      name: 'Áo Khoác & Bomber',
      slug: 'ao-khoac-bomber',
      description: 'Áo khoác gió 2 lớp chống nước, áo khoác dạ, hoodie unisex',
      order: 3,
      isActive: true,
    },
    {
      name: 'Giày Sneaker & Thể Thao',
      slug: 'giay-sneaker',
      description: 'Giày sneaker phong cách đường phố, giày chạy bộ êm ái',
      order: 4,
      isActive: true,
    },
    {
      name: 'Túi Xách & Balo',
      slug: 'tui-xach-balo',
      description: 'Balo laptop chống nước, túi đeo chéo da PU cao cấp',
      order: 5,
      isActive: true,
    },
    {
      name: 'Phụ Kiện Thời Trang',
      slug: 'phu-kien-thoi-trang',
      description: 'Thắt lưng da bò, đồng hồ phong cách, mắt kính chống tia UV',
      order: 6,
      isActive: true,
    },
  ]);

  const catMap = {};
  catDocs.forEach((c) => {
    catMap[c.slug] = c._id;
  });
  console.log('✓ Seeded 6 Categories');

  // 3. Seed Products
  const prodDocs = await Product.insertMany([
    {
      name: 'Áo Polo Nam Phối Bo Cổ Cao Cấp',
      slug: 'ao-polo-nam-phoi-bo-co-cao-cap',
      price: 280000,
      salePrice: 199000,
      category: catMap['thoi-trang-nam'],
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 150,
      soldCount: 92,
      isFeatured: true,
      status: 'active',
      description: 'Chất liệu vải cá sấu cotton 4 chiều mềm mịn, co giãn thấm hút mồ hôi cực tốt. Phom regular fit ôm vừa vặn, lịch lãm phù hợp đi làm và đi chơi.',
      variants: [
        { color: 'Đen Sang Trọng', size: 'M', stock: 40, price: 199000 },
        { color: 'Đen Sang Trọng', size: 'L', stock: 50, price: 199000 },
        { color: 'Trắng Tinh Khôi', size: 'L', stock: 35, price: 199000 },
        { color: 'Xanh Navy', size: 'XL', stock: 25, price: 199000 },
      ],
    },
    {
      name: 'Quần Jean Nam Slimfit Co Giãn Rách Gối Nhẹ',
      slug: 'quan-jean-nam-slimfit-co-gian',
      price: 490000,
      salePrice: 359000,
      category: catMap['thoi-trang-nam'],
      images: [
        'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 85,
      soldCount: 54,
      isFeatured: true,
      status: 'active',
      description: 'Form dáng tôn dáng chuẩn Hàn Quốc, co giãn nhẹ nhàng hoạt động cả ngày không gò bó. Màu wash xanh retro cực dễ phối đồ.',
      variants: [
        { color: 'Xanh Đậm', size: '29', stock: 25, price: 359000 },
        { color: 'Xanh Đậm', size: '30', stock: 30, price: 359000 },
        { color: 'Xanh Nhạt', size: '31', stock: 30, price: 359000 },
      ],
    },
    {
      name: 'Áo Sơ Mi Nam Oxford Tay Dài Chống Nhăn',
      slug: 'ao-so-mi-nam-oxford-tay-dai',
      price: 380000,
      salePrice: 289000,
      category: catMap['thoi-trang-nam'],
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 60,
      soldCount: 38,
      isFeatured: false,
      status: 'active',
      description: 'Vải dệt Oxford dệt chéo dày dặn đứng phom, công nghệ xử lý bề mặt chống nhăn không cần là ủi nhiều lần.',
      variants: [
        { color: 'Trắng', size: 'M', stock: 20, price: 289000 },
        { color: 'Xanh Pastel', size: 'L', stock: 20, price: 289000 },
        { color: 'Hồng Nhạt', size: 'XL', stock: 20, price: 289000 },
      ],
    },
    {
      name: 'Đầm Nữ Dáng Xòe Dự Tiệc Thanh Lịch Sang Trọng',
      slug: 'dam-nu-dang-xoe-du-tiec-thanh-lich',
      price: 550000,
      salePrice: 420000,
      category: catMap['thoi-trang-nu'],
      images: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 70,
      soldCount: 68,
      isFeatured: true,
      status: 'active',
      description: 'Thiết kế sang trọng, chất voan tơ 2 lớp bồng bềnh nữ tính, may đo tỉ mỉ từng đường chỉ, tôn vinh vóc dáng phái đẹp.',
      variants: [
        { color: 'Trắng Kem', size: 'S', stock: 25, price: 420000 },
        { color: 'Trắng Kem', size: 'M', stock: 25, price: 420000 },
        { color: 'Đỏ Ruby', size: 'L', stock: 20, price: 420000 },
      ],
    },
    {
      name: 'Set Bộ Áo Blazer Nữ Kèm Chân Váy Xếp Ly',
      slug: 'set-bo-ao-blazer-nu-kem-chan-vay',
      price: 680000,
      salePrice: 520000,
      category: catMap['thoi-trang-nu'],
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 45,
      soldCount: 29,
      isFeatured: true,
      status: 'active',
      description: 'Bộ trang phục công sở phong cách quý cô hiện đại. Chất tuyết mưa dày dặn, đứng dáng, không bai xù.',
      variants: [
        { color: 'Be Sữa', size: 'S', stock: 15, price: 520000 },
        { color: 'Be Sữa', size: 'M', stock: 15, price: 520000 },
        { color: 'Đen', size: 'L', stock: 15, price: 520000 },
      ],
    },
    {
      name: 'Áo Khoác Gió Bomber 2 Lớp Chống Thấm Nước',
      slug: 'ao-khoac-gio-bomber-2-lop-chong-nuoc',
      price: 450000,
      salePrice: 329000,
      category: catMap['ao-khoac-bomber'],
      images: [
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 110,
      soldCount: 115,
      isFeatured: true,
      status: 'active',
      description: 'Chất liệu trượt nước Nano cao cấp, cản gió giữ nhiệt tối ưu. Thiết kế cổ bo dệt thể thao năng động.',
      variants: [
        { color: 'Đen Huyền Bí', size: 'L', stock: 40, price: 329000 },
        { color: 'Xanh Rêu', size: 'XL', stock: 40, price: 329000 },
        { color: 'Xám Xi Măng', size: '2XL', stock: 30, price: 329000 },
      ],
    },
    {
      name: 'Áo Hoodie Nỉ Bông Dày Dặn Unisex Streetwear',
      slug: 'ao-hoodie-ni-bong-day-dan-unisex',
      price: 390000,
      salePrice: 289000,
      category: catMap['ao-khoac-bomber'],
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 90,
      soldCount: 78,
      isFeatured: true,
      status: 'active',
      description: 'Chất nỉ lót bông mịn ấm áp, form rộng oversize phong cách đường phố trẻ trung, in hình phản quang bắt mắt.',
      variants: [
        { color: 'Đen', size: 'L', stock: 30, price: 289000 },
        { color: 'Xám Tiêu', size: 'XL', stock: 30, price: 289000 },
        { color: 'Nâu Cacao', size: 'L', stock: 30, price: 289000 },
      ],
    },
    {
      name: 'Giày Sneaker Nam Thể Thao Đế Air Đệm Khí Êm Chân',
      slug: 'giay-sneaker-nam-the-thao-de-air',
      price: 650000,
      salePrice: 489000,
      category: catMap['giay-sneaker'],
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 75,
      soldCount: 96,
      isFeatured: true,
      status: 'active',
      description: 'Đế đệm khí êm ái giảm chấn thương khi vận động, thân vải dệt Flyknit thoáng khí siêu bền bỉ.',
      variants: [
        { color: 'Đỏ Đen', size: '40', stock: 15, price: 489000 },
        { color: 'Đỏ Đen', size: '41', stock: 20, price: 489000 },
        { color: 'Đỏ Đen', size: '42', stock: 20, price: 489000 },
        { color: 'Trắng Bạc', size: '41', stock: 20, price: 489000 },
      ],
    },
    {
      name: 'Giày Thể Thao Nữ Cổ Thấp Phối Màu Pastel Xinh Xắn',
      slug: 'giay-the-thao-nu-co-thap-pastel',
      price: 520000,
      salePrice: 389000,
      category: catMap['giay-sneaker'],
      images: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 65,
      soldCount: 47,
      isFeatured: false,
      status: 'active',
      description: 'Thiết kế nhẹ nhàng xinh xắn, tôn dáng chiều cao thêm 4cm tự nhiên, phối màu pastel nữ tính.',
      variants: [
        { color: 'Hồng Phấn', size: '36', stock: 20, price: 389000 },
        { color: 'Hồng Phấn', size: '37', stock: 25, price: 389000 },
        { color: 'Xanh Bạc Hà', size: '38', stock: 20, price: 389000 },
      ],
    },
    {
      name: 'Balo Laptop Chống Nước Đa Năng Có Cổng Sạc USB',
      slug: 'balo-laptop-chong-nuoc-da-nang',
      price: 420000,
      salePrice: 319000,
      category: catMap['tui-xach-balo'],
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 80,
      soldCount: 63,
      isFeatured: true,
      status: 'active',
      description: 'Đựng vừa laptop 15.6 inch, vải Oxford chống xước và kháng nước, tích hợp cổng cắm sạc điện thoại tiện lợi.',
      variants: [
        { color: 'Đen Nhám', stock: 40, price: 319000 },
        { color: 'Xám Ghi', stock: 40, price: 319000 },
      ],
    },
    {
      name: 'Túi Đeo Chéo Nữ Da PU Cao Cấp Khóa Vàng',
      slug: 'tui-deo-cheo-nu-da-pu-cao-cap',
      price: 360000,
      salePrice: 269000,
      category: catMap['tui-xach-balo'],
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 95,
      soldCount: 82,
      isFeatured: true,
      status: 'active',
      description: 'Chất da PU mềm mịn không bong tróc, phụ kiện khóa mạ vàng sáng bóng chống gỉ sét, phom hộp cứng cáp.',
      variants: [
        { color: 'Nâu Bò', stock: 45, price: 269000 },
        { color: 'Đen Tuyển', stock: 50, price: 269000 },
      ],
    },
    {
      name: 'Đồng Hồ Nam Dây Da Quartz Chống Nước 3ATM',
      slug: 'dong-ho-nam-day-da-quartz-chong-nuoc',
      price: 690000,
      salePrice: 499000,
      category: catMap['phu-kien-thoi-trang'],
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      ],
      stock: 50,
      soldCount: 41,
      isFeatured: true,
      status: 'active',
      description: 'Mặt kính khoáng Mineral chống xước, bộ máy Quartz Nhật Bản chạy chuẩn xác, dây da thật 2 lớp cao cấp.',
      variants: [
        { color: 'Mặt Đen Dây Đen', stock: 25, price: 499000 },
        { color: 'Mặt Trắng Dây Nâu', stock: 25, price: 499000 },
      ],
    },
  ]);

  console.log('✓ Seeded 12 Products');

  // 4. Seed Customers
  const customerDocs = await Customer.insertMany([
    {
      name: 'Nguyễn Văn An',
      phone: '0987123456',
      email: 'nguyenvanan@gmail.com',
      address: 'Số 15 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội',
      province: 'Hà Nội',
      district: 'Quận Cầu Giấy',
      ward: 'Phường Trung Hòa',
      orderCount: 3,
      totalSpent: 1450000,
      lastOrderAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      name: 'Trần Thị Mai',
      phone: '0912345678',
      email: 'tranmaibn@gmail.com',
      address: '482 Nguyễn Thị Minh Khai, Phường 2, Quận 3, TP. Hồ Chí Minh',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 3',
      ward: 'Phường 2',
      orderCount: 2,
      totalSpent: 940000,
      lastOrderAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      name: 'Lê Hoàng Long',
      phone: '0905112233',
      email: 'hoanglongdanang@gmail.com',
      address: '102 Bạch Đằng, Hải Châu, Đà Nẵng',
      province: 'Đà Nẵng',
      district: 'Quận Hải Châu',
      ward: 'Phường Hải Châu 1',
      orderCount: 4,
      totalSpent: 2150000,
      lastOrderAt: new Date(Date.now() - 1 * 86400000),
    },
    {
      name: 'Phạm Hương Giang',
      phone: '0938889900',
      email: 'huonggiang88@gmail.com',
      address: '25 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
      province: 'Hà Nội',
      district: 'Quận Hoàn Kiếm',
      ward: 'Phường Hàng Bài',
      orderCount: 1,
      totalSpent: 520000,
      lastOrderAt: new Date(Date.now() - 7 * 86400000),
    },
    {
      name: 'Vũ Đức Minh',
      phone: '0978665544',
      email: 'ducminh.vu@gmail.com',
      address: '120 Võ Văn Kiệt, Ninh Kiều, Cần Thơ',
      province: 'Cần Thơ',
      district: 'Quận Ninh Kiều',
      ward: 'Phường An Hòa',
      orderCount: 2,
      totalSpent: 808000,
      lastOrderAt: new Date(Date.now() - 3 * 86400000),
    },
  ]);

  console.log('✓ Seeded 5 Customers');

  // 5. Seed Orders
  await Order.insertMany([
    {
      orderCode: 'ST2601',
      customer: {
        name: 'Nguyễn Văn An',
        phone: '0987123456',
        email: 'nguyenvanan@gmail.com',
        address: 'Số 15 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội',
        province: 'Hà Nội',
        district: 'Quận Cầu Giấy',
        ward: 'Phường Trung Hòa',
      },
      items: [
        {
          productId: prodDocs[0]._id,
          name: prodDocs[0].name,
          price: 199000,
          quantity: 2,
          image: prodDocs[0].images[0],
          variant: { color: 'Đen Sang Trọng', size: 'L' },
        },
        {
          productId: prodDocs[1]._id,
          name: prodDocs[1].name,
          price: 359000,
          quantity: 1,
          image: prodDocs[1].images[0],
          variant: { color: 'Xanh Đậm', size: '30' },
        },
      ],
      subtotal: 757000,
      shippingFee: 25000,
      discountAmount: 50000,
      totalAmount: 732000,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      status: 'shipping',
      notes: 'Giao giờ hành chính, gọi trước 15 phút',
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
    {
      orderCode: 'ST2602',
      customer: {
        name: 'Trần Thị Mai',
        phone: '0912345678',
        email: 'tranmaibn@gmail.com',
        address: '482 Nguyễn Thị Minh Khai, Phường 2, Quận 3, TP. Hồ Chí Minh',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 3',
        ward: 'Phường 2',
      },
      items: [
        {
          productId: prodDocs[3]._id,
          name: prodDocs[3].name,
          price: 420000,
          quantity: 1,
          image: prodDocs[3].images[0],
          variant: { color: 'Trắng Kem', size: 'M' },
        },
        {
          productId: prodDocs[10]._id,
          name: prodDocs[10].name,
          price: 269000,
          quantity: 1,
          image: prodDocs[10].images[0],
          variant: { color: 'Nâu Bò', size: '' },
        },
      ],
      subtotal: 689000,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: 689000,
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      status: 'pending',
      notes: 'Cho kiểm tra hàng trước khi nhận',
      createdAt: new Date(Date.now() - 2 * 3600000),
    },
    {
      orderCode: 'ST2603',
      customer: {
        name: 'Lê Hoàng Long',
        phone: '0905112233',
        email: 'hoanglongdanang@gmail.com',
        address: '102 Bạch Đằng, Hải Châu, Đà Nẵng',
        province: 'Đà Nẵng',
        district: 'Quận Hải Châu',
        ward: 'Phường Hải Châu 1',
      },
      items: [
        {
          productId: prodDocs[7]._id,
          name: prodDocs[7].name,
          price: 489000,
          quantity: 1,
          image: prodDocs[7].images[0],
          variant: { color: 'Đỏ Đen', size: '41' },
        },
      ],
      subtotal: 489000,
      shippingFee: 30000,
      discountAmount: 0,
      totalAmount: 519000,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      status: 'confirmed',
      notes: '',
      createdAt: new Date(Date.now() - 10 * 3600000),
    },
    {
      orderCode: 'ST2604',
      customer: {
        name: 'Phạm Hương Giang',
        phone: '0938889900',
        email: 'huonggiang88@gmail.com',
        address: '25 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
        province: 'Hà Nội',
        district: 'Quận Hoàn Kiếm',
        ward: 'Phường Hàng Bài',
      },
      items: [
        {
          productId: prodDocs[4]._id,
          name: prodDocs[4].name,
          price: 520000,
          quantity: 1,
          image: prodDocs[4].images[0],
          variant: { color: 'Be Sữa', size: 'M' },
        },
      ],
      subtotal: 520000,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: 520000,
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      status: 'delivered',
      notes: 'Khách VIP',
      createdAt: new Date(Date.now() - 4 * 86400000),
    },
    {
      orderCode: 'ST2605',
      customer: {
        name: 'Vũ Đức Minh',
        phone: '0978665544',
        email: 'ducminh.vu@gmail.com',
        address: '120 Võ Văn Kiệt, Ninh Kiều, Cần Thơ',
        province: 'Cần Thơ',
        district: 'Quận Ninh Kiều',
        ward: 'Phường An Hòa',
      },
      items: [
        {
          productId: prodDocs[5]._id,
          name: prodDocs[5].name,
          price: 329000,
          quantity: 1,
          image: prodDocs[5].images[0],
          variant: { color: 'Đen Huyền Bí', size: 'L' },
        },
        {
          productId: prodDocs[9]._id,
          name: prodDocs[9].name,
          price: 319000,
          quantity: 1,
          image: prodDocs[9].images[0],
          variant: { color: 'Đen Nhám', size: '' },
        },
      ],
      subtotal: 648000,
      shippingFee: 35000,
      discountAmount: 0,
      totalAmount: 683000,
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      status: 'cancelled',
      notes: 'Khách đổi ý muốn chuyển sang màu khác',
      createdAt: new Date(Date.now() - 6 * 86400000),
    },
    {
      orderCode: 'ST2606',
      customer: {
        name: 'Nguyễn Văn An',
        phone: '0987123456',
        email: 'nguyenvanan@gmail.com',
        address: 'Số 15 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội',
        province: 'Hà Nội',
        district: 'Quận Cầu Giấy',
        ward: 'Phường Trung Hòa',
      },
      items: [
        {
          productId: prodDocs[11]._id,
          name: prodDocs[11].name,
          price: 499000,
          quantity: 1,
          image: prodDocs[11].images[0],
          variant: { color: 'Mặt Đen Dây Đen', size: '' },
        },
      ],
      subtotal: 499000,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: 499000,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      status: 'delivered',
      notes: 'Đã nhận hàng hài lòng',
      createdAt: new Date(Date.now() - 8 * 86400000),
    },
  ]);

  console.log('✓ Seeded 6 Orders');

  // 6. Seed Marketing Vouchers
  await Setting.findOneAndUpdate(
    { key: 'marketing_vouchers' },
    {
      key: 'marketing_vouchers',
      value: [
        { code: 'TIKTOK50K', discount: 50000, minOrder: 300000, maxUses: 100, usedCount: 14, active: true },
        { code: 'FREESHIP', discount: 25000, minOrder: 250000, maxUses: 500, usedCount: 68, active: true },
        { code: 'WELCOME10K', discount: 10000, minOrder: 100000, maxUses: 1000, usedCount: 120, active: true },
        { code: 'SUPERVIP', discount: 100000, minOrder: 800000, maxUses: 50, usedCount: 5, active: true },
      ],
    },
    { upsert: true }
  );

  console.log('✓ Seeded Marketing Vouchers');
  console.log('\n==========================================');
  console.log('SEED DATA COMPLETED SUCCESSFULLY!');
  console.log('==========================================');
  process.exit(0);
}

seedData().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
