import User from '@/models/User';
import Setting from '@/models/Setting';
import { hashPassword } from '@/lib/auth';
import { defaultThemeConfig } from '@/app/api/settings/theme/route';

let isSeeding = false;

export interface SeedOptions {
  shopName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

/**
 * Initialize only the essential Admin Account & Shop Theme.
 * Absolutely NO sample products, mock categories or fake reviews are created.
 */
export async function autoSeedIfNeeded(options?: SeedOptions) {
  if (isSeeding) return;
  
  try {
    isSeeding = true;
    
    // 1. Create essential Admin account
    const adminEmail = options?.adminEmail?.trim() || 'admin@shopbig.vn';
    const adminPassword = options?.adminPassword || 'admin123';
    const shopName = options?.shopName?.trim() || 'ShopBig';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await hashPassword(adminPassword);
      admin = await User.create({
        name: `Admin ${shopName}`,
        email: adminEmail,
        phone: '0988888888',
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`[AutoSeed] ✅ Đã tạo tài khoản Admin: ${adminEmail} / ${adminPassword}`);
    }

    // 2. Initialize default Theme Settings with Shop Name
    const themeSetting = await Setting.findOne({ key: 'theme_settings' });
    if (!themeSetting) {
      const customTheme = JSON.parse(JSON.stringify(defaultThemeConfig));
      if (shopName) {
        customTheme.pageTitles.logoText = shopName;
      }
      await Setting.create({
        key: 'theme_settings',
        value: customTheme,
      });
      console.log(`[AutoSeed] ✅ Đã khởi tạo cấu hình Theme & Logo cho ${shopName}`);
    }
  } catch (error) {
    console.error('[AutoSeed] Error initializing admin:', error);
  } finally {
    isSeeding = false;
  }
}


