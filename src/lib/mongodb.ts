import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { getTenantConfig, buildMongoUriForDb, MASTER_CLUSTER_BASE } from './tenant-config';

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
 * Get or spawn a self-contained persistent embedded MongoDB instance (Local Development Only)
 */
async function getEmbeddedMongoUri(): Promise<string> {
  if (cached.embeddedInstance) {
    return cached.embeddedInstance.getUri();
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    throw new Error('Embedded MongoDB cannot run in Serverless environment. Please use Cloud MongoDB Atlas.');
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  let dbDir = path.join(process.cwd(), 'data', 'db');

  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch (e) {
    dbDir = path.join('/tmp', 'db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
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
            serverSelectionTimeoutMS: 8000,
          });
          cached.activeUri = targetUri;
          console.log('✅ [DB Connect] Đã kết nối thành công tới Database!');
          return conn;
        } catch (err: any) {
          console.warn('⚠️ [DB Fallback] Không thể kết nối tới CSDL cấu hình:', err.message);
        }
      }

      // 2. If running on Vercel / Cloud or Master Cluster is available: use Cloud Atlas cluster
      const isServerless = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME);
      if (isServerless || (MASTER_CLUSTER_BASE && MASTER_CLUSTER_BASE.includes('mongodb+srv://'))) {
        const fallbackDb = tenant?.dbName || 'webstore';
        const cloudUri = buildMongoUriForDb(fallbackDb);
        console.log('☁️ [Cloud Atlas Connect] Đang kết nối CSDL Cloud:', cloudUri.replace(/:([^:@]+)@/, ':****@'));
        const conn = await mongoose.connect(cloudUri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 8000,
        });
        cached.activeUri = cloudUri;
        return conn;
      }

      // 3. Default Local Development Only: Run Embedded MongoDB
      try {
        const embeddedUri = await getEmbeddedMongoUri();
        const conn = await mongoose.connect(embeddedUri, {
          bufferCommands: false,
        });
        cached.activeUri = embeddedUri;
        return conn;
      } catch (embErr: any) {
        console.warn('⚠️ [Embedded DB Error]:', embErr.message);
        const cloudUri = buildMongoUriForDb('webstore');
        const conn = await mongoose.connect(cloudUri, {
          bufferCommands: false,
        });
        cached.activeUri = cloudUri;
        return conn;
      }
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
