'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/store/BottomNav';
import MarketingPixelTracker from '@/components/store/MarketingPixelTracker';
import styles from './layout.module.css';

// Dynamic Import for heavy overlay widgets to shrink initial Store JS bundle
const ChatFloatingWidget = dynamic(
  () => import('@/components/store/ChatFloatingWidget'),
  { ssr: false }
);

const CartDrawer = dynamic(
  () => import('@/components/store/CartDrawer'),
  { ssr: false }
);

const AuthModal = dynamic(
  () => import('@/components/store/AuthModal'),
  { ssr: false }
);

const FomoLiveNotification = dynamic(
  () => import('@/components/store/FomoLiveNotification'),
  { ssr: false }
);

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname === '/chat' || pathname?.startsWith('/chat/');
  const isProductPage = pathname?.startsWith('/product');
  const isCartPage = pathname === '/cart' || pathname?.startsWith('/cart');

  return (
    <div className={styles.outerViewport}>
      <MarketingPixelTracker />
      <div className={styles.phoneContainer}>
        <div className={styles.phoneScreen}>
          {children}
        </div>
        {!isChatPage && !isProductPage && !isCartPage && <ChatFloatingWidget />}
        {!isChatPage && !isProductPage && !isCartPage && <BottomNav />}
      </div>

      <FomoLiveNotification />
      <CartDrawer />
      <AuthModal />
    </div>
  );
}