'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiDatabase,
  FiCheckCircle,
  FiAlertTriangle,
  FiServer,
  FiCloud,
  FiKey,
  FiExternalLink,
  FiArrowRight,
  FiRefreshCw,
  FiLock,
  FiShield,
  FiShoppingBag,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

interface DbStatus {
  isVercel: boolean;
  hasUriConfigured: boolean;
  isConnected: boolean;
  isSeeded: boolean;
  environment: string;
  errorMessage: string | null;
  stats: {
    users: number;
    products: number;
    categories: number;
  };
}

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Test connection state
  const [customUri, setCustomUri] = useState('');
  const [testingUri, setTestingUri] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Seed state
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await apiFetch('/api/system/db-status');
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data);
      }
    } catch (err: any) {
      toast.error('Không thể kiểm tra trạng thái CSDL');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) {
      toast.error('Vui lòng nhập chuỗi kết nối MongoDB (MONGODB_URI)');
      return;
    }

    setTestingUri(true);
    setTestResult(null);
    try {
      const res = await apiFetch('/api/setup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: customUri }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        toast.success(data.message || 'Kết nối thành công!');
      } else {
        toast.error(data.message || 'Kết nối thất bại');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Lỗi kiểm tra kết nối',
      });
      toast.error('Lỗi kiểm tra kết nối');
    } finally {
      setTestingUri(false);
    }
  };

  const handleInitializeDb = async () => {
    setSeeding(true);
    try {
      const res = await apiFetch('/api/setup/initialize', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSeedResult(data.data);
        toast.success(data.message || 'Khởi tạo dữ liệu thành công!');
        fetchStatus();
      } else {
        toast.error(data.message || 'Lỗi khởi tạo CSDL');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi hệ thống khi khởi tạo');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandIconBox}>
              <img src="/images/logo.png" alt="ShopBig Logo" className={styles.brandImg} />
            </div>
            <div>
              <h1 className={styles.brandTitle}>ShopBig Setup Wizard</h1>
              <span className={styles.brandSubtitle}>Trình Thiết Lập Cơ Sở Dữ Liệu & Khởi Tạo Hệ Thống</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={fetchStatus}
              disabled={loadingStatus}
            >
              <FiRefreshCw className={loadingStatus ? styles.spin : ''} />
              <span>Làm mới trạng thái</span>
            </button>
            <Link href="/" className={styles.headerLink}>
              Trang Bán Hàng
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Card 1: System Live Status */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <FiServer />
            </div>
            <div>
              <h2 className={styles.cardTitle}>1. Trạng Thái Hệ Thống & Kết Nối CSDL</h2>
              <p className={styles.cardDesc}>Kiểm tra thời gian thực môi trường chạy và tình trạng kết nối</p>
            </div>
          </div>

          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Môi trường triển khai:</span>
              <span className={styles.badgeInfo}>
                {status?.isVercel ? '☁️ Vercel Serverless' : '💻 Local / Máy chủ riêng'}
              </span>
            </div>

            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Trạng thái kết nối DB:</span>
              {status?.isConnected ? (
                <span className={styles.badgeSuccess}>
                  <FiCheckCircle /> Đã kết nối thành công
                </span>
              ) : (
                <span className={styles.badgeDanger}>
                  <FiAlertTriangle /> Chưa có kết nối CSDL
                </span>
              )}
            </div>

            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Dữ liệu hệ thống:</span>
              {status?.isSeeded ? (
                <span className={styles.badgeSuccess}>
                  <FiCheckCircle /> Đầy đủ ({status.stats.products} sản phẩm, {status.stats.categories} danh mục)
                </span>
              ) : (
                <span className={styles.badgeWarning}>
                  <FiAlertTriangle /> CSDL trống (Chưa khởi tạo)
                </span>
              )}
            </div>
          </div>

          {status?.errorMessage && (
            <div className={styles.errorBox}>
              <strong>Chi tiết lỗi:</strong> {status.errorMessage}
            </div>
          )}
        </section>

        {/* Card 2: MongoDB Atlas Setup Guide & Connection Form */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <FiCloud />
            </div>
            <div>
              <h2 className={styles.cardTitle}>2. Cấu Hình Chuỗi Kết Nối (MONGODB_URI)</h2>
              <p className={styles.cardDesc}>
                {status?.isVercel
                  ? 'Khi chạy trên Vercel/Cloud, bạn cần thêm biến MONGODB_URI vào Vercel Environment Variables'
                  : 'Sử dụng MongoDB Atlas đám mây miễn phí hoặc CSDL cục bộ nhúng'}
              </p>
            </div>
          </div>

          {/* Guide Steps */}
          <div className={styles.guideSteps}>
            <h3 className={styles.guideTitle}>📖 3 Bước lấy MONGODB_URI miễn phí 100% từ MongoDB Atlas (2 phút):</h3>
            <div className={styles.stepsList}>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>1</span>
                <div>
                  <strong>Đăng ký tài khoản miễn phí:</strong>
                  <p>
                    Truy cập{' '}
                    <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank" rel="noreferrer">
                      mongodb.com/cloud/atlas <FiExternalLink size={12} />
                    </a>{' '}
                    và chọn gói <strong>M0 Free (Miễn phí vĩnh viễn)</strong>.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <span className={styles.stepNum}>2</span>
                <div>
                  <strong>Mở quyền truy cập IP (Network Access):</strong>
                  <p>
                    Vào <strong>Security &gt; Network Access</strong> &gt; Nhấn <strong>Add IP Address</strong> &gt; Chọn{' '}
                    <strong>Allow Access from Anywhere (0.0.0.0/0)</strong> để Vercel/Website kết nối được.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <span className={styles.stepNum}>3</span>
                <div>
                  <strong>Lấy chuỗi kết nối & Thêm vào Vercel:</strong>
                  <p>
                    Nhấn <strong>Connect &gt; Drivers</strong> &gt; Copy chuỗi kết nối (thay thế <code>&lt;password&gt;</code> bằng mật khẩu DB của bạn).
                  </p>
                  <p style={{ marginTop: 4 }}>
                    👉 Trên Vercel: Vào <strong>Project Settings &gt; Environment Variables</strong> &gt; Thêm Key: <code>MONGODB_URI</code> với Value vừa copy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test connection tool */}
          <form className={styles.testForm} onSubmit={handleTestConnection}>
            <label className={styles.inputLabel}>Kiểm tra chuỗi kết nối MongoDB của bạn:</label>
            <div className={styles.inputRow}>
              <input
                type="text"
                className={styles.inputUri}
                placeholder="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/webbanhang?retryWrites=true&w=majority"
                value={customUri}
                onChange={(e) => setCustomUri(e.target.value)}
              />
              <button type="submit" className={styles.btnTest} disabled={testingUri}>
                {testingUri ? 'Đang kiểm tra...' : '⚡ Kiểm Tra Kết Nối'}
              </button>
            </div>

            {testResult && (
              <div className={testResult.success ? styles.resultSuccess : styles.resultError}>
                {testResult.message}
              </div>
            )}
          </form>
        </section>

        {/* Card 3: 1-Click Auto Seed Initial Data */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <FiKey />
            </div>
            <div>
              <h2 className={styles.cardTitle}>3. Khởi Tạo Dữ Liệu & Tạo Tài Khoản Admin</h2>
              <p className={styles.cardDesc}>Tạo sẵn tài khoản quản trị viên, danh mục, sản phẩm mẫu và thiết lập theme chuẩn</p>
            </div>
          </div>

          <div className={styles.seedArea}>
            <p className={styles.seedNotice}>
              Khi nhấn nút dưới đây, hệ thống sẽ tự động tạo tài khoản Admin <strong>admin@shopbig.vn</strong> (mật khẩu <strong>admin123</strong>) cùng toàn bộ dữ liệu mẫu ban đầu để bạn bắt đầu kinh doanh ngay lập tức.
            </p>

            <button
              type="button"
              className={styles.btnSeed}
              onClick={handleInitializeDb}
              disabled={seeding || !status?.isConnected}
            >
              {seeding ? (
                '⏳ Đang khởi tạo dữ liệu...'
              ) : (
                <>
                  <FiShoppingBag size={18} />
                  <span>🚀 Khởi Tạo Dữ Liệu Mẫu & Tài Khoản Admin</span>
                </>
              )}
            </button>

            {!status?.isConnected && (
              <span className={styles.warnText}>⚠️ Bạn cần kết nối CSDL ở Bước 2 trước khi khởi tạo dữ liệu.</span>
            )}

            {/* Seed Results */}
            {seedResult && (
              <div className={styles.seedSuccessBox}>
                <h4 className={styles.seedSuccessTitle}>
                  <FiCheckCircle color="#10b981" /> Khởi tạo cơ sở dữ liệu thành công!
                </h4>
                <div className={styles.adminCredentials}>
                  <div className={styles.credRow}>
                    <span>Tài khoản Admin:</span>
                    <strong>{seedResult.adminEmail}</strong>
                  </div>
                  <div className={styles.credRow}>
                    <span>Mật khẩu:</span>
                    <strong>{seedResult.adminPassword}</strong>
                  </div>
                  <div className={styles.credRow}>
                    <span>Dữ liệu đã tạo:</span>
                    <span>{seedResult.stats?.products} sản phẩm, {seedResult.stats?.categories} danh mục</span>
                  </div>
                </div>

                <div className={styles.navButtons}>
                  <Link href="/admin/login" className={styles.btnNavAdmin}>
                    <FiShield /> Đăng Nhập Quản Trị (Admin)
                  </Link>
                  <Link href="/" className={styles.btnNavStore}>
                    <FiShoppingBag /> Xem Cửa Hàng (Storefront)
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
