import fs from 'fs';
import path from 'path';

export const MASTER_CLUSTER_BASE =
  process.env.MONGODB_MASTER_URI ||
  process.env.MONGODB_URI ||
  'mongodb+srv://bigmansale2_db_user:LQBnps6DkzVpKe84@cluster0.o9kuvob.mongodb.net/{DB_NAME}?retryWrites=true&w=majority&appName=Cluster0';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'tenant_config.json');

export interface TenantConfig {
  shopName: string;
  dbName: string;
  mongoUri: string;
  createdAt: string;
  licenseKey?: string;
}

export function getTenantConfig(): TenantConfig | null {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export function saveTenantConfig(config: TenantConfig): void {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not save tenant config file:', e);
  }
}

export function generateDbName(shopName: string): string {
  const clean = (shopName || 'cuahang')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const baseName = clean ? `shop_${clean}` : 'shop';
  return `${baseName}_${randomSuffix}`.substring(0, 38);
}

export function buildMongoUriForDb(dbName: string): string {
  if (MASTER_CLUSTER_BASE.includes('{DB_NAME}')) {
    return MASTER_CLUSTER_BASE.replace('{DB_NAME}', dbName);
  }

  if (MASTER_CLUSTER_BASE.includes('.mongodb.net/')) {
    return MASTER_CLUSTER_BASE.replace(/\.mongodb\.net\/([^?]+)/, `.mongodb.net/${dbName}`);
  }

  return `${MASTER_CLUSTER_BASE}/${dbName}`;
}

