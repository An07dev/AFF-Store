const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let uri = 'mongodb+srv://levananbg03_db_user:ZVKH2iQyepPYqbFq@cluster0.d9p5c9d.mongodb.net/webstore?retryWrites=true&w=majority';

try {
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match && match[1]) {
      uri = match[1].trim().replace(/^["']|["']$/g, '');
    }
  }
} catch (e) {}

async function run() {
  console.log('========================================================');
  console.log('1. KIỂM TRA KẾT NỐI CƠ SỞ DỮ LIỆU (MONGODB ATLAS)');
  console.log('========================================================');
  console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@'));

  try {
    const conn = await mongoose.connect(uri);
    console.log('✅ KẾT NỐI THÀNH CÔNG ĐẾN MONGODB ATLAS!');
    console.log('• Database Name :', conn.connection.name);
    console.log('• Host          :', conn.connection.host);
    console.log('• Port          :', conn.connection.port);

    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nDanh sách các Collection trong CSDL:');
    for (const col of collections) {
      const count = await conn.connection.db.collection(col.name).countDocuments();
      console.log(` - ${col.name.padEnd(20)}: ${count} documents`);
    }

    console.log('\n========================================================');
    console.log('2. TẠO LẠI TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN)');
    console.log('========================================================');

    const UserSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phone: { type: String },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
        avatar: { type: String },
        isLocked: { type: Boolean, default: false },
        lockReason: { type: String },
        lastLoginAt: { type: Date },
      },
      { timestamps: true }
    );

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // List of admin accounts to ensure created
    const adminAccounts = [
      {
        name: 'Quản Trị Viên (Admin)',
        email: 'admin@shoptik.vn',
        phone: '0988888888',
        passwordRaw: 'admin123',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      },
      {
        name: 'Lê Văn An (Super Admin)',
        email: 'levananbg03@gmail.com',
        phone: '0988123456',
        passwordRaw: 'admin123',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      },
    ];

    for (const acc of adminAccounts) {
      const hashedPassword = await bcrypt.hash(acc.passwordRaw, 10);
      
      const updated = await User.findOneAndUpdate(
        { email: acc.email.toLowerCase().trim() },
        {
          $set: {
            name: acc.name,
            email: acc.email.toLowerCase().trim(),
            phone: acc.phone,
            password: hashedPassword,
            role: acc.role,
            avatar: acc.avatar,
            isLocked: false,
            lockReason: '',
          },
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Đã tạo / làm mới tài khoản Admin:`);
      console.log(`   • Tên         : ${updated.name}`);
      console.log(`   • Email       : ${updated.email}`);
      console.log(`   • Mật khẩu    : ${acc.passwordRaw}`);
      console.log(`   • Quyền (Role): ${updated.role}`);
      console.log(`   • Trạng thái  : ${updated.isLocked ? 'Đã khóa' : 'Hoạt động (Active)'}\n`);
    }

    console.log('========================================================');
    console.log('3. XÁC THỰC ĐĂNG NHẬP THỬ BẰNG MẬT KHẨU MỚI');
    console.log('========================================================');

    const adminCheck = await User.findOne({ email: 'admin@shoptik.vn' });
    const isMatch = await bcrypt.compare('admin123', adminCheck.password);
    console.log('Kiểm tra khớp mật khẩu bcrypt (admin@shoptik.vn / admin123):', isMatch ? '✅ HỢP LỆ!' : '❌ SAI MẬT KHẨU!');

    await mongoose.disconnect();
    console.log('Đã ngắt kết nối an toàn.');
  } catch (err) {
    console.error('❌ LỖI KẾT NỐI CSDL:', err);
  }
}

run();
