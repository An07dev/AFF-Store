'use client';

import React, { useState } from 'react';
import { FiX, FiShoppingBag, FiLock, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithSocial, pendingAction } = useCustomerAuth();
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSocialClick = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    await loginWithSocial(provider);
    setSocialLoading(null);
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
          {isStrictProductLock ? 'Đăng Nhập Để Tiếp Tục' : 'Đăng Nhập 1-Chạm'}
        </h2>
        <p className={styles.subtitle}>
          Đăng nhập an toàn qua tài khoản <strong>Google</strong> hoặc <strong>Facebook</strong> để bắt đầu mua sắm, nhận tư vấn và theo dõi đơn hàng.
        </p>

        {/* Social Login Buttons (Google & Facebook) */}
        <div className={styles.socialGroup}>
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.googleBtn}`}
            onClick={() => handleSocialClick('google')}
            disabled={socialLoading !== null}
          >
            <FcGoogle size={22} />
            <span>{socialLoading === 'google' ? 'Đang kết nối Google...' : 'Tiếp tục với Google'}</span>
          </button>

          <button
            type="button"
            className={`${styles.socialBtn} ${styles.facebookBtn}`}
            onClick={() => handleSocialClick('facebook')}
            disabled={socialLoading !== null}
          >
            <FaFacebook size={22} color="#ffffff" />
            <span>{socialLoading === 'facebook' ? 'Đang kết nối Facebook...' : 'Tiếp tục với Facebook'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11.5, color: '#94a3b8', marginTop: 16 }}>
          <FiShield size={13} color="#10b981" />
          <span>Bảo mật 100% qua Google & Facebook OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
}