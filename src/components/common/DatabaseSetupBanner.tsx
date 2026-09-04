'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiDatabase,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiX,
  FiRefreshCw,
  FiZap,
  FiShield,
  FiCheck,
  FiCopy,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
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
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Minimal Inline Setup & Progress State
  const [seeding, setSeeding] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [setupDone, setSetupDone] = useState(false);
  const [showUriInput, setShowUriInput] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [testingUri, setTestingUri] = useState(false);
  const [copied, setCopied] = useState(false);

  // Do not show banner when already on /setup page
  const isSetupPage = pathname === '/setup';

  const checkDb = async () => {
    try {
      const res = await apiFetch('/api/system/db-status');
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data);
      }
    } catch (err) {
      setStatus({
        isVercel: false,
        hasUriConfigured: false,
        isConnected: false,
        isSeeded: false,
        errorMessage: 'Không thể kết nối máy chủ CSDL',
        stats: { users: 0, products: 0, categories: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSetupPage) return;
    checkDb();
  }, [pathname, isSetupPage]);

  // Handle 1-Click Minimal Initialize directly on Home Page
  const handleInlineInitialize = async () => {
    setSeeding(true);
    setSetupDone(false);
    setProgressPercent(15);
    setProgressText('[1/3] Đang kết nối CSDL...');

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await delay(400);
      setProgressPercent(45);
      setProgressText('[2/3] Đang tạo Admin: admin@shopbig.vn...');

      // Call setup API in background
      const apiPromise = apiFetch('/api/setup/initialize', { method: 'POST' });

      await delay(500);
      setProgressPercent(80);
      setProgressText('[3/3] Đang nạp danh mục, banner & sản phẩm mẫu...');

      const res = await apiPromise;
      const data = await res.json();

      await delay(400);
      if (data.success) {
        setProgressPercent(100);
        setProgressText('🎉 Khởi tạo hoàn tất 100%!');
        setSetupDone(true);
        toast.success('🎉 Khởi tạo CSDL thành công!');

        // Refresh database status and reload page data smoothly after 1.5s
        setTimeout(() => {
          checkDb();
          router.refresh();
        }, 1500);
      } else {
        throw new Error(data.message || 'Lỗi khởi tạo CSDL');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi khởi tạo CSDL');
      setProgressText(`❌ Lỗi: ${err.message || 'Thất bại'}`);
      setTimeout(() => {
        setSeeding(false);
      }, 3000);
    } finally {
      if (!setupDone) {
        setTimeout(() => setSeeding(false), 2500);
      }
    }
  };

  // Handle Test / Connect Custom URI directly
  const handleTestAndSaveUri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) {
      toast.error('Vui lòng dán link MONGODB_URI');
      return;
    }

    setTestingUri(true);
    try {
      const res = await apiFetch('/api/setup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: customUri }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Kết nối MongoDB thành công! Đang khởi tạo dữ liệu...');
        setShowUriInput(false);
        handleInlineInitialize();
      } else {
        toast.error(data.message || 'Kết nối thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi kiểm tra kết nối');
    } finally {
      setTestingUri(false);
    }
  };

  const copyAdminPass = () => {
    navigator.clipboard.writeText('admin123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Đã copy mật khẩu: admin123');
  };

  if (isSetupPage || loading || !status || dismissed) {
    return null;
  }

  // If connected and seeded, no banner needed
  if (status.isConnected && status.isSeeded && !setupDone) {
    return null;
  }

  const isNotConnected = !status.isConnected;

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.bannerBar}>
        {/* State 1: Active Loading Progress (Minimal) */}
        {seeding || setupDone ? (
          <div className={styles.progressRow}>
            <div className={styles.progressLeft}>
              {setupDone ? (
                <div className={styles.iconDone}>
                  <FiCheck size={14} />
                </div>
              ) : (
                <div className={styles.miniSpinner}></div>
              )}
              <div className={styles.progressTextWrap}>
                <span className={styles.progressTitle}>{progressText}</span>
                {setupDone && (
                  <span className={styles.credSnippet}>
                    Admin: <strong>admin@shopbig.vn</strong> | Pass:{' '}
                    <button type="button" className={styles.copyPassBtn} onClick={copyAdminPass}>
                      <strong>admin123</strong> {copied ? <FiCheck size={11} color="#10b981" /> : <FiCopy size={11} />}
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className={styles.progressRight}>
              <div className={styles.percentText}>{progressPercent}%</div>
              <div className={styles.miniBarTrack}>
                <div
                  className={`${styles.miniBarFill} ${setupDone ? styles.miniBarSuccess : ''}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {setupDone && (
                <Link href="/admin/login" className={styles.btnAdminQuick}>
                  <FiShield size={13} /> Admin
                </Link>
              )}
            </div>
          </div>
        ) : showUriInput ? (
          /* State 2: Minimal URI Input Row */
          <form className={styles.uriInputForm} onSubmit={handleTestAndSaveUri}>
            <span className={styles.uriLabel}>Nhập MONGODB_URI:</span>
            <input
              type="text"
              className={styles.uriInput}
              placeholder="mongodb+srv://user:pass@cluster0.mongodb.net/webbanhang"
              value={customUri}
              onChange={(e) => setCustomUri(e.target.value)}
              autoFocus
            />
            <button type="submit" className={styles.btnUriSubmit} disabled={testingUri}>
              {testingUri ? 'Đang thử...' : '⚡ Kết nối & Tạo'}
            </button>
            <button
              type="button"
              className={styles.btnUriCancel}
              onClick={() => setShowUriInput(false)}
            >
              Hủy
            </button>
          </form>
        ) : (
          /* State 3: Normal Minimalist Banner Prompt */
          <div className={styles.normalRow}>
            <div className={styles.leftInfo}>
              <span className={styles.statusDot}></span>
              <span className={styles.badgeLabel}>
                {isNotConnected ? 'CSDL Chưa Kết Nối' : 'CSDL Trống'}
              </span>
              <span className={styles.mainText}>
                {isNotConnected
                  ? (status.isVercel
                      ? 'Chưa cấu hình MONGODB_URI trên Cloud.'
                      : 'Hệ thống chưa kết nối được cơ sở dữ liệu.')
                  : 'Cơ sở dữ liệu đã kết nối nhưng chưa có tài khoản Admin & sản phẩm mẫu.'}
              </span>
            </div>

            <div className={styles.rightActions}>
              {status.isConnected ? (
                /* 1-Click Initialize right here */
                <button
                  type="button"
                  className={styles.btnActionPrimary}
                  onClick={handleInlineInitialize}
                  disabled={seeding}
                >
                  <FiZap size={14} />
                  <span>Khởi tạo CSDL ngay</span>
                </button>
              ) : (
                /* Prompt to configure URI or open full setup */
                <>
                  <button
                    type="button"
                    className={styles.btnActionPrimary}
                    onClick={() => setShowUriInput(true)}
                  >
                    <FiDatabase size={14} />
                    <span>Nhập MONGODB_URI</span>
                  </button>
                  <Link href="/setup" className={styles.btnActionSecondary}>
                    <span>Hướng dẫn</span>
                    <FiArrowRight size={12} />
                  </Link>
                </>
              )}

              <button
                type="button"
                className={styles.btnClose}
                onClick={() => setDismissed(true)}
                title="Đóng thông báo"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

