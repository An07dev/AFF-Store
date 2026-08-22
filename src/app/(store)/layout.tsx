'use client';

import React from 'react';
import CartDrawer from '@/components/store/CartDrawer';
import AuthModal from '@/components/store/AuthModal';
import BottomNav from '@/components/store/BottomNav';
import ChatFloatingWidget from '@/components/store/ChatFloatingWidget';
import MarketingPixelTracker from '@/components/store/MarketingPixelTracker';
import FomoLiveNotification from '@/components/store/FomoLiveNotification';
import styles from './layout.module.css';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.outerViewport}>
      <MarketingPixelTracker />
      <div className={styles.phoneContainer}>
        <div className={styles.phoneScreen}>
          {children}
        </div>
        <ChatFloatingWidget />
        <BottomNav />
      </div>

      <FomoLiveNotification />
      <CartDrawer />
      <AuthModal />
    </div>
  );
}