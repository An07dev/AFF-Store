'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { apiFetch } from '@/lib/api';
import { getStoredToken, isTokenExpired } from '@/lib/auth-client';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [identifier, setIdentifier] = useState('admin@shoptik.vn');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in with a valid token
  useEffect(() => {
    const token = getStoredToken();
    if (token && !isTokenExpired(token)) {
      router.replace('/admin');
    }
  }, [router]);

  const handleFillDefault = () => {
    setIdentifier('admin@shoptik.vn');
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

      <div className={styles.loginCard}>
        {/* Brand Logo & Title */}
        <div className={styles.logoArea}>
          {theme.pageTitles?.logoUrl ? (
            <img
              src={theme.pageTitles.logoUrl}
              alt="Logo"
              className={styles.logoImg}
            />
          ) : (
            <div className={styles.logoText}>
              {theme.pageTitles?.logoText || 'ShopTik'}
              <span className={styles.logoBadge}>Admin</span>
            </div>
          )}
        </div>

        <div className={styles.titleBox}>
          <h2>Hệ Thống Quản Trị</h2>
          <p>Đăng nhập để quản lý đơn hàng, kho và thiết lập cửa hàng</p>
        </div>

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
                placeholder="admin@shoptik.vn hoặc SĐT"
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
            disabled={loading}
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
            <div>Email: admin@shoptik.vn</div>
            <div>Mật khẩu: admin123</div>
          </div>
        </div>

        <div className={styles.footerNote}>
          © 2026 {theme.pageTitles?.logoText || 'ShopTik'} E-Commerce Portal. All rights reserved.
        </div>
      </div>
    </div>
  );
}
