'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiShield,
  FiCheckCircle,
  FiRefreshCw,
  FiDatabase,
  FiAlertTriangle,
  FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { apiFetch } from '@/lib/api';
import { getStoredToken, isTokenExpired } from '@/lib/auth-client';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [identifier, setIdentifier] = useState('admin@shopbig.vn');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto DB Setup States
  const [autoSettingUp, setAutoSettingUp] = useState(false);
  const [setupPercent, setSetupPercent] = useState(0);
  const [setupText, setSetupText] = useState('');
  const [setupDone, setSetupDone] = useState(false);
  const [dbUnconnected, setDbUnconnected] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [testingUri, setTestingUri] = useState(false);

  // 1. Check DB Status on load & Auto-Setup if uninitialized
  useEffect(() => {
    let isMounted = true;

    async function checkAndAutoSetupDb() {
      try {
        const res = await apiFetch('/api/system/db-status');
        const data = await res.json();

        if (!isMounted) return;

        if (data.success && data.data) {
          const { isConnected, isSeeded } = data.data;

          if (!isConnected) {
            setDbUnconnected(true);
          } else if (!isSeeded) {
            // DATABASE IS CONNECTED BUT NOT INITIALIZED -> AUTO SETUP NOW!
            runAutoSetup();
          }
        }
      } catch (e) {
        console.warn('DB check error:', e);
      }
    }

    checkAndAutoSetupDb();

    return () => {
      isMounted = false;
    };
  }, []);

  // Run the automatic setup routine with progress bar
  const runAutoSetup = async (customShopName?: string) => {
    const sName = customShopName || 'ShopBig';
    setAutoSettingUp(true);
    setSetupPercent(15);
    setSetupText(`[1/3] Đang cấp phát CSDL MongoDB riêng cho "${sName}"...`);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await delay(500);
      setSetupPercent(45);
      setSetupText('[2/3] Đang tạo tài khoản Quản trị viên: admin@shopbig.vn...');

      const apiPromise = apiFetch('/api/setup/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName: sName }),
      });

      await delay(600);
      setSetupPercent(80);
      setSetupText('[3/3] Đang nạp danh mục, sản phẩm mẫu & cấu hình theme...');

      const res = await apiPromise;
      const data = await res.json();

      await delay(400);
      if (data.success) {
        setSetupPercent(100);
        setSetupText(`🎉 CSDL riêng (${data.data?.dbName || ''}) đã sẵn sàng 100%!`);
        setSetupDone(true);
        setIdentifier('admin@shopbig.vn');
        setPassword('admin123');
        toast.success(`🎉 Đã tự động tạo CSDL riêng cho "${sName}" & tài khoản Admin!`);

        setTimeout(() => {
          setAutoSettingUp(false);
        }, 1800);
      } else {
        throw new Error(data.message || 'Lỗi khởi tạo CSDL');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tự động khởi tạo CSDL');
      setSetupText(`❌ Lỗi: ${err.message || 'Thất bại'}`);
      setTimeout(() => {
        setAutoSettingUp(false);
      }, 3500);
    }
  };

  // Handle Custom URI connect if DB was unconnected
  const handleConnectCustomUri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) {
      toast.error('Vui lòng nhập chuỗi kết nối MONGODB_URI');
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
        toast.success('Kết nối MongoDB thành công! Đang tự động nạp dữ liệu...');
        setDbUnconnected(false);
        runAutoSetup();
      } else {
        toast.error(data.message || 'Kết nối thất bại');
      }
    } catch (e: any) {
      toast.error('Lỗi kiểm tra kết nối');
    } finally {
      setTestingUri(false);
    }
  };

  // Auto-redirect if already logged in with a valid token
  useEffect(() => {
    const token = getStoredToken();
    if (token && !isTokenExpired(token)) {
      router.replace('/admin');
    }
  }, [router]);

  const handleFillDefault = () => {
    setIdentifier('admin@shopbig.vn');
    setPassword('admin123');
    toast.success('Đã điền tài khoản Admin mẫu!');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Vui lòng nhập đầy đủ Email/SĐT và Mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        const { token, user } = data.data;

        // Verify role
        if (user.role !== 'admin' && user.role !== 'staff') {
          toast.error('Tài khoản này không có quyền truy cập trang Quản Trị');
          setLoading(false);
          return;
        }

        // Save Admin session
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));

        toast.success(`Xin chào, ${user.name}! Đăng nhập thành công.`);

        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        toast.error(data.message || 'Tài khoản hoặc mật khẩu không chính xác');
      }
    } catch (err: any) {
      toast.error('Lỗi kết nối máy chủ khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Dynamic Glow background effects */}
      <div className={styles.glowCircle1}></div>
      <div className={styles.glowCircle2}></div>

      {/* AUTO SETUP PROGRESS MODAL OVERLAY */}
      {autoSettingUp && (
        <div className={styles.autoSetupOverlay}>
          <div className={styles.autoSetupCard}>
            <div className={styles.autoSetupHeader}>
              <div className={styles.autoSetupIcon}>
                {setupDone ? <FiCheckCircle size={24} color="#10b981" /> : <FiZap size={24} color="#3b82f6" />}
              </div>
              <div>
                <h3 className={styles.autoSetupTitle}>
                  {setupDone ? '🎉 Khởi Tạo Thành Công!' : '🚀 Đang Tự Động Thiết Lập CSDL...'}
                </h3>
                <p className={styles.autoSetupSub}>
                  {setupDone
                    ? 'Tài khoản Admin và dữ liệu ban đầu đã sẵn sàng.'
                    : 'Hệ thống phát hiện CSDL mới, đang tự động nạp dữ liệu chuẩn.'}
                </p>
              </div>
            </div>

            <div className={styles.progressTrack}>
              <div
                className={`${styles.progressFill} ${setupDone ? styles.progressSuccess : ''}`}
                style={{ width: `${setupPercent}%` }}
              ></div>
            </div>

            <div className={styles.progressStatusRow}>
              <span className={styles.statusText}>{setupText}</span>
              <span className={styles.percentBadge}>{setupPercent}%</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.loginCard}>
        {/* Brand Logo & Title */}
        <div className={styles.logoArea}>
          {theme.pageTitles?.logoUrl && (
            <img
              src={theme.pageTitles.logoUrl}
              alt="Logo"
              className={styles.logoImg}
            />
          )}
          <div className={styles.logoText}>
            {theme.pageTitles?.logoText || 'ShopBig'}
            <span className={styles.logoBadge}>Admin</span>
          </div>
        </div>

        <div className={styles.titleBox}>
          <h2>Hệ Thống Quản Trị</h2>
          <p>Đăng nhập để quản lý đơn hàng, kho và thiết lập cửa hàng</p>
        </div>

        {/* If DB is unconnected (e.g. on fresh Vercel), show quick URI input */}
        {dbUnconnected && (
          <form className={styles.dbUnconnectedBox} onSubmit={handleConnectCustomUri}>
            <div className={styles.unconnectedHeader}>
              <FiAlertTriangle color="#f59e0b" />
              <span>Chưa kết nối CSDL MongoDB:</span>
            </div>
            <input
              type="text"
              className={styles.unconnectedInput}
              placeholder="mongodb+srv://user:pass@cluster0.mongodb.net/dbname"
              value={customUri}
              onChange={(e) => setCustomUri(e.target.value)}
            />
            <button type="submit" className={styles.btnConnectDb} disabled={testingUri}>
              {testingUri ? 'Đang kết nối...' : '⚡ Kết nối & Tự động tạo CSDL'}
            </button>
          </form>
        )}

        {/* Login Form */}
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Email hoặc Số điện thoại quản trị</label>
            <div className={styles.inputWrap}>
              <FiMail className={styles.inputIcon} />
              <input
                type="text"
                required
                className={styles.input}
                placeholder="admin@shopbig.vn hoặc SĐT"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu</label>
            <div className={styles.inputWrap}>
              <FiLock className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || autoSettingUp}
          >
            {loading ? (
              'Đang xác thực...'
            ) : (
              <>
                <FiLogIn /> Đăng Nhập Quản Trị
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Account helper */}
        <div className={styles.quickAccountBox}>
          <div className={styles.quickAccountHeader}>
            <span>
              <FiShield style={{ marginRight: 4 }} /> Tài khoản mặc định:
            </span>
            <button
              type="button"
              className={styles.fillBtn}
              onClick={handleFillDefault}
            >
              Tự điền
            </button>
          </div>
          <div className={styles.quickAccountInfo}>
            <div>Email: admin@shopbig.vn</div>
            <div>Mật khẩu: admin123</div>
          </div>
        </div>

        <div className={styles.footerNote}>
          © 2026 {theme.pageTitles?.logoText || 'ShopBig'} E-Commerce Portal. All rights reserved.
        </div>
      </div>
    </div>
  );
}

