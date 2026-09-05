import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { getTenantConfig } from './tenant-config';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  embeddedInstance: any | null;
  activeUri: string | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  embeddedInstance: null,
  activeUri: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Reset / Switch active MongoDB connection to a new target URI
 */
export async function switchDatabaseConnection(newUri: string): Promise<typeof mongoose> {
  if (cached.conn) {
    try {
      await mongoose.disconnect();
    } catch (e) {}
  }
  cached.conn = null;
  cached.promise = null;
  cached.activeUri = newUri;

  console.log('🔄 [DB Switch] Đang kết nối tới CSDL khách hàng mới:', newUri.replace(/:([^:@]+)@/, ':****@'));
  const conn = await mongoose.connect(newUri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
  });
  cached.conn = conn;
  return conn;
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
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      // 1. Check if client has a dedicated tenant database configured
      const tenant = getTenantConfig();
      let targetUri = tenant?.mongoUri || process.env.MONGODB_URI?.trim();

      // If user provided a custom/tenant URI
      if (targetUri && targetUri !== 'auto' && targetUri !== 'local' && targetUri !== 'embedded') {
        try {
          console.log('🌐 [DB Connect] Đang kết nối CSDL:', targetUri.replace(/:([^:@]+)@/, ':****@'));
          const conn = await mongoose.connect(targetUri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 6000,
          });
          cached.activeUri = targetUri;
          console.log('✅ [DB Connect] Đã kết nối thành công tới Database!');
          return conn;
        } catch (err: any) {
          console.warn('⚠️ [DB Fallback] Không thể kết nối tới CSDL cấu hình:', err.message);
          console.log('🔄 [DB Fallback] Tự động chuyển sang Cơ Sở Dữ Liệu Nhúng Cục Bộ (Embedded DB)...');
        }
      }

      // Default / Zero-Config: Run Embedded MongoDB
      const embeddedUri = await getEmbeddedMongoUri();
      const conn = await mongoose.connect(embeddedUri, {
        bufferCommands: false,
      });
      cached.activeUri = embeddedUri;
      return conn;
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
