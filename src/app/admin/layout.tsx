'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiPackage,
  FiFolder,
  FiShoppingCart,
  FiUsers,
  FiBarChart2,
  FiTruck,
  FiTarget,
  FiCreditCard,
  FiSettings,
  FiMenu,
  FiBell,
  FiUser,
  FiMessageSquare,
} from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/admin' },
    { name: 'Tin nhắn CSKH', icon: FiMessageSquare, path: '/admin/chat' },
    { name: 'Sản phẩm', icon: FiPackage, path: '/admin/products' },
    { name: 'Danh mục', icon: FiFolder, path: '/admin/categories' },
    { name: 'Đơn hàng', icon: FiShoppingCart, path: '/admin/orders' },
    { name: 'Khách hàng', icon: FiUsers, path: '/admin/customers' },
    { name: 'Báo cáo', icon: FiBarChart2, path: '/admin/reports' },
    { name: 'Vận chuyển', icon: FiTruck, path: '/admin/shipping' },
    { name: 'Marketing', icon: FiTarget, path: '/admin/marketing' },
    { name: 'Thanh toán', icon: FiCreditCard, path: '/admin/payment' },
    { name: 'Cài đặt giao diện', icon: FiSettings, path: '/admin/settings' },
  ];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className={`admin-theme ${styles.adminLayout}`}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          {theme.pageTitles?.logoUrl ? (
            <img src={theme.pageTitles.logoUrl} alt="Logo" style={{ maxHeight: 32, objectFit: 'contain' }} />
          ) : (
            <h2>{theme.pageTitles?.logoText || 'ShopTik'} Admin</h2>
          )}
        </div>
        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? pathname === '/admin'
                : pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} href={item.path} className={`${styles.menuItem} ${isActive ? styles.active : ''}`}>
                <item.icon className={styles.icon} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu />
          </button>
          <div className={styles.headerRight}>
            <button className={styles.iconButton}>
              <FiBell />
            </button>
            <div className={styles.userInfo}>
              <FiUser className={styles.userIcon} />
              <span>Admin</span>
            </div>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}
