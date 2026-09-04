'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiDatabase, FiAlertTriangle, FiArrowRight, FiCheckCircle, FiX } from 'react-icons/fi';
import { apiFetch } from '@/lib/api';
import styles from './DatabaseSetupBanner.module.css';

interface DbStatus {
  isVercel: boolean;
  hasUriConfigured: boolean;
  isConnected: boolean;
  isSeeded: boolean;
  errorMessage: string | null;
  stats: {
    users: number;
    products: number;
    categories: number;
  };
}

export default function DatabaseSetupBanner() {
  const pathname = usePathname();
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Do not show banner when already on /setup page
  const isSetupPage = pathname === '/setup';

  useEffect(() => {
    if (isSetupPage) return;

    let isMounted = true;
    async function checkDb() {
      try {
        const res = await apiFetch('/api/system/db-status');
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          setStatus(data.data);
        }
      } catch (err) {
        // If API fails, DB is definitely not connected
        if (isMounted) {
          setStatus({
            isVercel: false,
            hasUriConfigured: false,
            isConnected: false,
            isSeeded: false,
            errorMessage: 'Không thể kết nối máy chủ CSDL',
            stats: { users: 0, products: 0, categories: 0 },
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkDb();
    return () => {
      isMounted = false;
    };
  }, [pathname, isSetupPage]);

  if (isSetupPage || loading || !status || dismissed) {
    return null;
  }

  // If connected and seeded, no banner needed
  if (status.isConnected && status.isSeeded) {
    return null;
  }

  const isNotConnected = !status.isConnected;
  const isNotSeeded = status.isConnected && !status.isSeeded;

  return (
    <div className={`${styles.banner} ${isNotConnected ? styles.bannerDanger : styles.bannerWarning}`}>
      <div className={styles.container}>
        <div className={styles.left}>
          <span className={styles.pulseIcon}>
            {isNotConnected ? <FiAlertTriangle size={18} /> : <FiDatabase size={18} />}
          </span>
          <div className={styles.textContent}>
            <strong className={styles.title}>
              {isNotConnected
                ? 'Chưa thiết lập Cơ sở dữ liệu (Database)'
                : 'CSDL đã kết nối nhưng chưa có dữ liệu mẫu'}
            </strong>
            <span className={styles.desc}>
              {isNotConnected
                ? (status.isVercel
                    ? 'Bạn đang chạy trên Vercel/Cloud nhưng chưa cấu hình MONGODB_URI. Cần thiết lập để web hoạt động!'
                    : 'Hệ thống chưa kết nối được cơ sở dữ liệu. Nhấn thiết lập ngay để hoàn tất cài đặt.')
                : 'Khởi tạo tài khoản Admin và sản phẩm mẫu để bắt đầu bán hàng.'}
            </span>
          </div>
        </div>

        <div className={styles.right}>
          <Link href="/setup" className={styles.setupBtn}>
            <span>Thiết lập CSDL ngay</span>
            <FiArrowRight size={15} />
          </Link>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setDismissed(true)}
            title="Tạm ẩn thông báo"
            aria-label="Tạm ẩn"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
