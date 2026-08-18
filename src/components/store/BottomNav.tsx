'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FiHome, FiGrid, FiLayers, FiTruck } from 'react-icons/fi';
import styles from './BottomNav.module.css';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  // Hide BottomNav on dedicated checkout / payment / success flows
  const isHiddenRoute =
    pathname === '/checkout' ||
    pathname === '/payment' ||
    pathname === '/order-success';

  if (isHiddenRoute) {
    return null;
  }

  const isHome = pathname === '/' && (!currentTab || currentTab === 'home');
  const isProducts = pathname === '/' && currentTab === 'products';
  const isCategories = pathname === '/' && currentTab === 'categories';
  const isTracking = pathname === '/tracking';

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${isHome ? styles.active : ''}`}>
        <FiHome className={styles.icon} />
        <span>Trang chủ</span>
      </Link>

      <Link
        href="/?tab=products"
        className={`${styles.navItem} ${isProducts ? styles.active : ''}`}
      >
        <FiGrid className={styles.icon} />
        <span>Sản phẩm</span>
      </Link>

      <Link
        href="/?tab=categories"
        className={`${styles.navItem} ${isCategories ? styles.active : ''}`}
      >
        <FiLayers className={styles.icon} />
        <span>Danh mục</span>
      </Link>

      <Link href="/tracking" className={`${styles.navItem} ${isTracking ? styles.active : ''}`}>
        <FiTruck className={styles.icon} />
        <span>Theo dõi đơn</span>
      </Link>
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}