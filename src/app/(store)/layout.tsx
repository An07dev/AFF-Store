'use client';

import React from 'react';
import CartDrawer from '@/components/store/CartDrawer';
import AuthModal from '@/components/store/AuthModal';
import BottomNav from '@/components/store/BottomNav';
import styles from './layout.module.css';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.outerViewport}>
      <div className={styles.phoneContainer}>
        <div className={styles.phoneScreen}>
          {children}
        </div>
        <BottomNav />
      </div>

      <CartDrawer />
      <AuthModal />
    </div>
  );
}