'use client';

import React, { useState } from 'react';
import { FiX, FiShoppingBag, FiLock, FiZap } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register, loginWithSocial, pendingAction } = useCustomerAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await login(loginData.identifier, loginData.password);
    setSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await register(registerData);
    setSubmitting(false);
  };

  const handleSocialClick = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    await loginWithSocial(provider);
    setSocialLoading(null);
  };

  const handleQuickDemoFill = () => {
    setTab('login');
    setLoginData({
      identifier: 'khachhang@gmail.com',
      password: 'password123',
    });
  };

  let promptMessage = 'Đăng nhập để xem chi tiết sản phẩm, theo dõi đơn & nhận ưu đãi';
  if (pendingAction?.type === 'VIEW_PRODUCT') {
    promptMessage = pendingAction.product?.name
      ? `🔐 Vui lòng đăng nhập qua Google hoặc Facebook để xem chi tiết sản phẩm "${pendingAction.product.name}"!`
      : '🔐 Vui lòng đăng nhập để xem thông tin chi tiết sản phẩm & bảng giá!';
  } else if (pendingAction?.type === 'ADD_TO_CART') {
    promptMessage = `Vui lòng đăng nhập để thêm "${pendingAction.product?.name || 'sản phẩm'}" vào giỏ hàng!`;
  } else if (pendingAction?.type === 'BUY_NOW') {
    promptMessage = `Vui lòng đăng nhập để mua ngay "${pendingAction.product?.name || 'sản phẩm'}"!`;
  } else if (pendingAction?.customMessage) {
    promptMessage = pendingAction.customMessage;
  }

  const isStrictProductLock = pendingAction?.type === 'VIEW_PRODUCT';

  return (
    <div className={styles.overlay} onClick={closeAuthModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeAuthModal} aria-label="Đóng">
          <FiX size={16} />
        </button>

        {/* Prompt Banner */}
        <div className={`${styles.promptBanner} ${isStrictProductLock ? styles.promptBannerLock : ''}`}>
          {isStrictProductLock ? (
            <FiLock size={16} className={styles.promptIcon} />
          ) : (
            <FiShoppingBag size={16} className={styles.promptIcon} />
          )}
          <span>{promptMessage}</span>
        </div>

        <h2 className={styles.title}>
          {isStrictProductLock
            ? 'Đăng Nhập Để Tiếp Tục'
            : tab === 'login'
            ? 'Đăng Nhập Khách Hàng'
            : 'Tạo Tài Khoản Mới'}
        </h2>
        <p className={styles.subtitle}>
          {isStrictProductLock
            ? 'Đăng nhập 1-chạm qua Google hoặc Facebook để xem trọn vẹn thông tin & ưu đãi.'
            : tab === 'login'
            ? 'Đăng nhập để tiếp tục mua sắm và nhận ưu đãi độc quyền.'
            : 'Đăng ký nhanh chỉ trong 30 giây để mua hàng.'}
        </p>

        {/* Social Login Buttons (Google & Facebook) */}
        <div className={styles.socialGroup}>
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.googleBtn}`}
            onClick={() => handleSocialClick('google')}
            disabled={socialLoading !== null}
          >
            <FcGoogle size={20} />
            <span>{socialLoading === 'google' ? 'Đang kết nối...' : 'Tiếp tục với Google'}</span>
          </button>

          <button
            type="button"
            className={`${styles.socialBtn} ${styles.facebookBtn}`}
            onClick={() => handleSocialClick('facebook')}
            disabled={socialLoading !== null}
          >
            <FaFacebook size={20} color="#1877f2" />
            <span>{socialLoading === 'facebook' ? 'Đang kết nối...' : 'Tiếp tục với Facebook'}</span>
          </button>
        </div>

        <div className={styles.divider}>
          <span>hoặc bằng tài khoản</span>
        </div>

        {/* Tabs for Credentials */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.activeTab : ''}`}
            onClick={() => setTab('login')}
          >
            Đăng nhập
          </button>
          <button
            className={`${styles.tab} ${tab === 'register' ? styles.activeTab : ''}`}
            onClick={() => setTab('register')}
          >
            Đăng ký
          </button>
        </div>

        {tab === 'login' ? (
          <form className={styles.form} onSubmit={handleLoginSubmit}>
            <div className={styles.inputGroup}>
              <label>Email hoặc Số điện thoại</label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="example@gmail.com hoặc 0988..."
                value={loginData.identifier}
                onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Mật khẩu</label>
              <input
                type="password"
                required
                className={styles.input}
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? 'Đang xử lý...' : 'Đăng Nhập Ngay'}
            </button>

            <button
              type="button"
              className={styles.quickFillBtn}
              onClick={handleQuickDemoFill}
            >
              <FiZap style={{ display: 'inline', marginRight: 4 }} />
              Điền tài khoản mẫu (khachhang@gmail.com)
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleRegisterSubmit}>
            <div className={styles.inputGroup}>
              <label>Họ và tên</label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="Nguyễn Văn A"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                required
                className={styles.input}
                placeholder="example@gmail.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Số điện thoại</label>
              <input
                type="tel"
                required
                className={styles.input}
                placeholder="0988123456"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Mật khẩu</label>
              <input
                type="password"
                required
                className={styles.input}
                placeholder="Ít nhất 6 ký tự"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? 'Đang tạo...' : 'Đăng Ký & Tiếp Tục'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}