import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'ShopTik - Cửa Hàng Thời Trang & Công Nghệ',
  description: 'Trải nghiệm mua sắm trực tuyến cao cấp, giao hàng nhanh chóng toàn quốc.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <ThemeProvider>
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