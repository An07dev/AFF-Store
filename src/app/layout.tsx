import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import DatabaseSetupBanner from '@/components/common/DatabaseSetupBanner';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'theme_settings' }).lean();
    const themeConfig = (setting as any)?.value || {};
    const pageTitles = themeConfig?.pageTitles || {};

    const title = pageTitles.siteTitle || 'Trải nghiệm mua sắm thời trang trực tuyến thời thượng,Miễn phí giao hàng nhanh chóng toàn quốc.';
    const description = pageTitles.metaDescription || 'Trải nghiệm mua sắm trực tuyến cao cấp, giao hàng nhanh chóng toàn quốc.';
    const rawFavicon = pageTitles.faviconUrl?.trim();
    const rawLogo = pageTitles.logoUrl?.trim();
    const faviconUrl = rawFavicon || rawLogo || '/favicon.ico';

    return {
      title,
      description,
      icons: {
        icon: [
          { url: faviconUrl },
        ],
        shortcut: [faviconUrl],
        apple: [faviconUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Trải nghiệm mua sắm thời trang trực tuyến thời thượng,Miễn phí giao hàng nhanh chóng toàn quốc.',
      description: 'Trải nghiệm mua sắm trực tuyến cao cấp, giao hàng nhanh chóng toàn quốc.',
      icons: {
        icon: [{ url: '/favicon.ico' }],
        shortcut: ['/favicon.ico'],
        apple: ['/favicon.ico'],
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={jakarta.variable}>
      <body className={jakarta.className}>
        <ThemeProvider>
          <DatabaseSetupBanner />
          <CustomerAuthProvider>
            <CartProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#13161f',
                    color: '#f8fafc',
                    border: '1px solid #232838',
                    borderRadius: '8px',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#13161f',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#13161f',
                    },
                  },
                }}
              />
            </CartProvider>
          </CustomerAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}