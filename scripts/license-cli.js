#!/usr/bin/env node

/**
 * CLI Tool for Seller / Administrator to Manage License Keys
 * Usage:
 *   node scripts/license-cli.js gen "Buyer Name / Note"
 *   node scripts/license-cli.js list
 *   node scripts/license-cli.js revoke "AFF-XXXX-XXXX-XXXX"
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Simple native .env loader
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const MASTER_URI =
  process.env.MONGODB_MASTER_URI ||
  process.env.MONGODB_URI ||
  'mongodb+srv://bigmansale2_db_user:LQBnps6DkzVpKe84@cluster0.o9kuvob.mongodb.net/webstore?retryWrites=true&w=majority&appName=Cluster0';

const COLLECTION_NAME = '_system_licenses';

function formatNewKey() {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `AFF-${seg()}-${seg()}-${seg()}`;
}

async function getDbCollection() {
  let targetUri = MASTER_URI;
  if (targetUri.includes('.mongodb.net/')) {
    targetUri = targetUri.replace(/\.mongodb\.net\/([^?]+)/, '.mongodb.net/webstore');
  }
  const conn = await mongoose.createConnection(targetUri, {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
  }).asPromise();

  return { conn, collection: conn.collection(COLLECTION_NAME) };
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === '--help' || command === '-h') {
    console.log(`
======================================================
🔑 HỆ THỐNG QUẢN LÝ BẢN QUYỀN (AFF-STORE LICENSE CLI)
======================================================
Cách sử dụng:
  npm run license:gen "<Tên Khách Hàng / Ghi Chú>"
      -> Tạo mã kích hoạt 1-lần cho khách hàng mới

  npm run license:list
      -> Xem danh sách tất cả các License Key và trạng thái

  npm run license:revoke "<MÃ_KEY>"
      -> Thu hồi / Khóa một mã bản quyền vi phạm
======================================================
`);
    process.exit(0);
  }

  try {
    const { conn, collection } = await getDbCollection();

    if (command === 'gen' || command === 'generate') {
      const buyerName = args.join(' ').trim() || 'Khách Hàng Mới';
      const key = formatNewKey();

      const record = {
        licenseKey: key,
        buyerName: buyerName,
        status: 'available',
        shopName: null,
        assignedDb: null,
        activatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await collection.insertOne(record);

      console.log(`\n======================================================`);
      console.log(`🎉 TẠO MÃ BẢN QUYỀN THÀNH CÔNG!`);
      console.log(`======================================================`);
      console.log(`👤 Khách hàng : ${buyerName}`);
      console.log(`🔑 License Key: \x1b[32m\x1b[1m${key}\x1b[0m`);
      console.log(`📌 Trạng thái : \x1b[33mCHƯA KÍCH HOẠT (Chỉ dùng được 1 lần)\x1b[0m`);
      console.log(`📅 Ngày tạo   : ${new Date().toLocaleString('vi-VN')}`);
      console.log(`======================================================\n`);
    } else if (command === 'list') {
      const list = await collection.find({}).sort({ createdAt: -1 }).toArray();

      console.log(`\n========================================================================================`);
      console.log(`📋 DANH SÁCH TẤT CẢ LICENSE KEYS (${list.length} Mã)`);
      console.log(`========================================================================================`);

      if (list.length === 0) {
        console.log('Chưa có mã bản quyền nào được tạo. Hãy chạy: npm run license:gen "Tên Khách"');
      } else {
        list.forEach((item, index) => {
          let statusBadge = '\x1b[33m[CHƯA DÙNG]\x1b[0m';
          if (item.status === 'activated') {
            statusBadge = '\x1b[32m[ĐÃ KÍCH HOẠT]\x1b[0m';
          } else if (item.status === 'revoked') {
            statusBadge = '\x1b[31m[BỊ KHÓA]\x1b[0m';
          }

          console.log(
            `${index + 1}. \x1b[1m${item.licenseKey}\x1b[0m | ${statusBadge} | Khách: \x1b[36m${item.buyerName}\x1b[0m`
          );
          if (item.status === 'activated') {
            console.log(
              `   └─ Shop: "${item.shopName || 'N/A'}" | DB: ${item.assignedDb || 'N/A'} | Lúc: ${item.activatedAt ? new Date(item.activatedAt).toLocaleString('vi-VN') : 'N/A'}`
            );
          }
        });
      }
      console.log(`========================================================================================\n`);
    } else if (command === 'revoke') {
      const keyToRevoke = args[0]?.trim().toUpperCase();
      if (!keyToRevoke) {
        console.error('❌ Vui lòng cung cấp mã Key cần khóa. Ví dụ: npm run license:revoke "AFF-XXXX-XXXX-XXXX"');
        process.exit(1);
      }

      const res = await collection.updateOne(
        { licenseKey: keyToRevoke },
        { $set: { status: 'revoked', updatedAt: new Date() } }
      );

      if (res.matchedCount === 0) {
        console.log(`❌ Không tìm thấy mã Key: ${keyToRevoke}`);
      } else {
        console.log(`🚫 Đã thu hồi / khóa mã bản quyền: \x1b[31m\x1b[1m${keyToRevoke}\x1b[0m thành công!`);
      }
    } else if (command === 'reactivate' || command === 'unrevoke') {
      const keyToReactivate = args[0]?.trim().toUpperCase();
      if (!keyToReactivate) {
        console.error('❌ Vui lòng cung cấp mã Key cần mở khóa. Ví dụ: node scripts/license-cli.js reactivate "AFF-XXXX-XXXX-XXXX"');
        process.exit(1);
      }

      const existing = await collection.findOne({ licenseKey: keyToReactivate });
      if (!existing) {
        console.log(`❌ Không tìm thấy mã Key: ${keyToReactivate}`);
      } else {
        const nextStatus = (existing.assignedDb || existing.shopName) ? 'activated' : 'available';
        await collection.updateOne(
          { licenseKey: keyToReactivate },
          { $set: { status: nextStatus, updatedAt: new Date() } }
        );
        console.log(`🎉 Đã MỞ KHÓA bản quyền: \x1b[32m\x1b[1m${keyToReactivate}\x1b[0m (Trạng thái mới: ${nextStatus}) thành công!`);
      }
    } else {
      console.log(`Lệnh không hợp lệ: "${command}". Hãy dùng 'gen', 'list', 'revoke', hoặc 'reactivate'.`);
    }

    await conn.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi kết nối CSDL Master:', err.message);
    process.exit(1);
  }
}

main();
