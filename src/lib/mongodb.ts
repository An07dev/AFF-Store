import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { autoSeedIfNeeded } from './auto-seed';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  embeddedInstance: any | null;
  hasAutoSeeded: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  embeddedInstance: null,
  hasAutoSeeded: false,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Get or spawn a self-contained persistent embedded MongoDB instance
 */
async function getEmbeddedMongoUri(): Promise<string> {
  if (cached.embeddedInstance) {
    return cached.embeddedInstance.getUri();
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const dbDir = path.join(process.cwd(), 'data', 'db');
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log('🚀 [Embedded DB] Đang khởi động cơ sở dữ liệu nhúng tại:', dbDir);
  
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbPath: dbDir,
      storageEngine: 'wiredTiger',
    },
  });

  cached.embeddedInstance = mongod;
  const uri = mongod.getUri();
  console.log('✅ [Embedded DB] CSDL nhúng đã sẵn sàng (Persistent Storage):', uri);
  return uri;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    if (!cached.hasAutoSeeded) {
      cached.hasAutoSeeded = true;
      autoSeedIfNeeded().catch(() => {});
    }
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      let targetUri = process.env.MONGODB_URI?.trim();

      // If user provided a custom URI (e.g. Atlas or local service)
      if (targetUri && targetUri !== 'auto' && targetUri !== 'local' && targetUri !== 'embedded') {
        try {
          console.log('🌐 [DB Connect] Đang kết nối tới MONGODB_URI cấu hình...');
          const conn = await mongoose.connect(targetUri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
          });
          console.log('✅ [DB Connect] Đã kết nối thành công tới Database từ thiện/cấu hình!');
          return conn;
        } catch (err: any) {
          console.warn('⚠️ [DB Fallback] Không thể kết nối tới MONGODB_URI cấu hình:', err.message);
          console.log('🔄 [DB Fallback] Tự động chuyển sang Cơ Sở Dữ Liệu Nhúng Cục Bộ (Embedded DB)...');
        }
      }

      // Default / Zero-Config: Run Embedded MongoDB
      const embeddedUri = await getEmbeddedMongoUri();
      const conn = await mongoose.connect(embeddedUri, {
        bufferCommands: false,
      });
      return conn;
    })();
  }

  try {
    cached.conn = await cached.promise;
    if (!cached.hasAutoSeeded) {
      cached.hasAutoSeeded = true;
      autoSeedIfNeeded().catch(() => {});
    }
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;