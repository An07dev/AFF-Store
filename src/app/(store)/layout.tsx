'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import CartDrawer from '@/components/store/CartDrawer';
import AuthModal from '@/components/store/AuthModal';
import BottomNav from '@/components/store/BottomNav';
import ChatFloatingWidget from '@/components/store/ChatFloatingWidget';
import MarketingPixelTracker from '@/components/store/MarketingPixelTracker';
import FomoLiveNotification from '@/components/store/FomoLiveNotification';
import styles from './layout.module.css';

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