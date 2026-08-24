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

async function cleanDatabase() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected successfully to MongoDB!\n');

  const db = mongoose.connection.db;

  // 1. Check BEFORE counts
  console.log('=== TRẠNG THÁI TRƯỚC KHI XÓA ===');
  const collectionsToClean = [
    'orders',
    'customers',
    'products',
    'categories',
    'chatmessages',
    'conversations',
    'reviews',
    'trackingevents',
    'carts',
  ];

  for (const colName of collectionsToClean) {
    try {
      const count = await db.collection(colName).countDocuments();
      console.log(`- [${colName}]: ${count} bản ghi`);
    } catch (e) {
      console.log(`- [${colName}]: 0 bản ghi (hoặc chưa tạo)`);
    }
  }

  // 2. Perform DELETIONS on requested collections
  console.log('\n=== TIẾN HÀNH XÓA DỮ LIỆU ===');

  // Đơn hàng
  const resOrders = await db.collection('orders').deleteMany({});
  console.log(`✓ Đã xóa ${resOrders.deletedCount} đơn hàng (Quản Lý Đơn Hàng & Báo Cáo Doanh Số)`);

  // Khách hàng CRM
  const resCustomers = await db.collection('customers').deleteMany({});
  console.log(`✓ Đã xóa ${resCustomers.deletedCount} khách hàng (Quản Lý Khách Hàng CRM)`);

  // Sản phẩm
  const resProducts = await db.collection('products').deleteMany({});
  console.log(`✓ Đã xóa ${resProducts.deletedCount} sản phẩm (Quản Lý Sản Phẩm)`);

  // Đánh giá sản phẩm
  const resReviews = await db.collection('reviews').deleteMany({});
  console.log(`✓ Đã xóa ${resReviews.deletedCount} đánh giá sản phẩm`);

  // Danh mục
  const resCategories = await db.collection('categories').deleteMany({});
  console.log(`✓ Đã xóa ${resCategories.deletedCount} danh mục (Quản Lý Danh Mục)`);

  // Tin nhắn & Hội thoại CSKH
  const resMsgs = await db.collection('chatmessages').deleteMany({});
  console.log(`✓ Đã xóa ${resMsgs.deletedCount} tin nhắn CSKH (Tin Nhắn CSKH)`);

  const resConvs = await db.collection('conversations').deleteMany({});
  console.log(`✓ Đã xóa ${resConvs.deletedCount} hội thoại CSKH (Tin Nhắn CSKH)`);

  // Tracking Events & Marketing Pixel logs
  const resTracking = await db.collection('trackingevents').deleteMany({});
  console.log(`✓ Đã xóa ${resTracking.deletedCount} lượt tracking (Báo Cáo & Phân Tích Doanh Số & Tổng Quan)`);

  // Giỏ hàng
  try {
    const resCarts = await db.collection('carts').deleteMany({});
    console.log(`✓ Đã xóa ${resCarts.deletedCount} giỏ hàng`);
  } catch (e) {}

  // 3. Reset FlashSale items & stats (vì sản phẩm đã xóa)
  await db.collection('flashsales').updateMany(
    {},
    {
      $set: {
        items: [],
        'slots.$[].items': [],
        'stats.totalOrders': 0,
        'stats.totalRevenue': 0,
      },
    }
  );
  console.log('✓ Đã làm mới cấu hình Flash Sale (xóa sản phẩm cũ trong slots, giữ lại khung giờ cấu hình)');

  // 4. Reset Voucher usage counters
  await db.collection('vouchers').updateMany(
    {},
    {
      $set: {
        usedCount: 0,
      },
    }
  );
  console.log('✓ Đã reset số lượt sử dụng voucher về 0');

  // 5. Check PRESERVED data
  console.log('\n=== CÁC CẤU HÌNH ĐƯỢC GIỮ NGUYÊN HOÀN TOÀN ===');
  const settings = await db.collection('settings').find({}).toArray();
  for (const s of settings) {
    console.log(`- [Setting] ${s.key}: ĐÃ GIỮ NGUYÊN`);
  }

  const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
  for (const u of users) {
    console.log(`- [User] ${u.email} (${u.name} - ${u.role}): ĐÃ GIỮ NGUYÊN`);
  }

  // 6. Check AFTER counts
  console.log('\n=== TRẠNG THÁI SAU KHI DỌN DẸP ===');
  const allCollections = await db.listCollections().toArray();
  for (const c of allCollections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`- [${c.name}]: ${count} bản ghi`);
  }

  console.log('\n Hoàn tất dọn dẹp cơ sở dữ liệu!');
  process.exit(0);
}

cleanDatabase().catch((err) => {
  console.error('Lỗi dọn dẹp DB:', err);
  process.exit(1);
});
