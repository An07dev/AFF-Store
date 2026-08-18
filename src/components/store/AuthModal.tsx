'use client';

import React, { useState } from 'react';
import { FiX, FiShoppingBag, FiUserCheck, FiZap } from 'react-icons/fi';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register, pendingAction } = useCustomerAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const handleQuickDemoFill = () => {
    setTab('login');
    setLoginData({
      identifier: 'khachhang@gmail.com',
      password: 'password123',
    });
  };

  let promptMessage = 'Đăng nhập để theo dõi đơn hàng & nhận ưu đãi';
  if (pendingAction?.type === 'ADD_TO_CART') {
    promptMessage = `Vui lòng đăng nhập để thêm "${pendingAction.product?.name || 'sản phẩm'}" vào giỏ hàng!`;
  } else if (pendingAction?.type === 'BUY_NOW') {
    promptMessage = `Vui lòng đăng nhập để mua ngay "${pendingAction.product?.name || 'sản phẩm'}"!`;
  }

  return (
    <div className={styles.overlay} onClick={closeAuthModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeAuthModal} aria-label="Đóng">
          <FiX size={16} />
        </button>

        {pendingAction && (
          <div className={styles.promptBanner}>
            <FiShoppingBag size={15} style={{ flexShrink: 0 }} />
            <span>{promptMessage}</span>
          </div>
        )}

        <h2 className={styles.title}>{tab === 'login' ? 'Đăng Nhập Khách Hàng' : 'Tạo Tài Khoản Mới'}</h2>
        <p className={styles.subtitle}>
          {tab === 'login'
            ? 'Đăng nhập để tiếp tục mua sắm và nhận ưu đãi độc quyền.'
            : 'Đăng ký nhanh chỉ trong 30 giây để mua hàng.'}
        </p>

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