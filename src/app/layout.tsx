import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import DatabaseSetupBanner from '@/components/common/DatabaseSetupBanner';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'theme_settings' });
    const siteTitle = setting?.value?.pageTitles?.siteTitle?.trim() || setting?.value?.pageTitles?.logoText?.trim() || '';
    const metaDescription = setting?.value?.pageTitles?.metaDescription?.trim() || '';
    const faviconUrl = setting?.value?.pageTitles?.faviconUrl?.trim() || setting?.value?.pageTitles?.logoUrl?.trim() || '';

    return {
      title: siteTitle || undefined,
      description: metaDescription || undefined,
      ...(faviconUrl
        ? {
            icons: {
              icon: faviconUrl,
              shortcut: faviconUrl,
              apple: faviconUrl,
            },
          }
        : {}),
    };
  } catch {
    return {};
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