'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiTruck,
  FiMessageSquare,
  FiShoppingBag,
  FiUsers,
  FiUserCheck,
  FiStar,
  FiMessageCircle,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
} from 'react-icons/fi';
import styles from '@/app/(store)/page.module.css';

interface ShopProfileCardProps {
  shopDisplayName: string;
  logoUrl?: string;
  avatarInitials: string;
  productCount?: number;
  socialLinks?: {
    tiktokUrl?: string;
    facebookUrl?: string;
  };
}

const ShopProfileCardComponent: React.FC<ShopProfileCardProps> = ({
  shopDisplayName = 'Shop Của Tôi',
  logoUrl,
  avatarInitials = 'ST',
  productCount = 4,
}) => {
  const router = useRouter();

  return (
    <div className={styles.shopeeShopCardWrapper}>
      {/* LEFT BOX: DARK SHOP HERO CARD */}
      <div className={styles.shopeeShopIdentityCard}>
        <div className={styles.shopeeShopCoverOverlay} />
        
        <div className={styles.shopeeShopIdentityContent}>
          {/* Avatar & Status */}
          <div className={styles.shopeeAvatarWrap}>
            {logoUrl ? (
              <img src={logoUrl} alt={shopDisplayName} className={styles.shopeeAvatarImg} />
            ) : (
              <div className={styles.shopeeAvatarPlaceholder}>{avatarInitials}</div>
            )}
            <span className={styles.shopeeOfficialBadge}>Chính Hãng</span>
          </div>

          <div className={styles.shopeeShopIdentityInfo}>
            <h1 className={styles.shopeeShopTitle}>{shopDisplayName}</h1>
            <p className={styles.shopeeShopStatus}>
              <span className={styles.onlineDot} /> Online 18 phút trước
            </p>
          </div>

          {/* 2 Action Buttons: Theo Dõi Đơn & Chat */}
          <div className={styles.shopeeShopActions}>
            <button
              type="button"
              className={styles.btnShopeeFollow}
              onClick={() => router.push('/tracking')}
            >
              <FiTruck size={14} />
              <span>Theo Dõi Đơn</span>
            </button>

            <button
              type="button"
              className={styles.btnShopeeChat}
              onClick={() => router.push('/chat')}
            >
              <FiMessageSquare size={13} />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT BOX: 8 METRICS GRID (2 COLUMNS X 4 ROWS) */}
      <div className={styles.shopeeMetricsGrid}>
        {/* Column 1 */}
        <div className={styles.metricItem}>
          <span className={styles.metricIcon}><FiShoppingBag size={14} /></span>
          <span className={styles.metricLabel}>Sản phẩm:</span>
          <span className={styles.metricValueHighlight}>{productCount}</span>
        </div>

        <div className={styles.metricItem}>
          <span className={styles.metricIcon}><FiUsers size={14} /></span>
          <span className={styles.metricLabel}>Người theo dõi:</span>
          <span className={styles.metricValueHighlight}>7.3k</span>
        </div>

        <div className={styles.metricItem}>
          <span className={styles.metricIcon}><FiUserCheck size={14} /></span>
          <span className={styles.metricLabel}>Đang theo dõi:</span>
          <span className={styles.metricValueHighlight}>8</span>
        </div>

        <div className={styles.metricItem}>
          <span className={styles.metricIcon}><FiStar size={14} color="#f59e0b" /></span>
          <span className={styles.metricLabel}>Đánh giá:</span>
          <span className={styles.metricValueHighlight}>4.9 (15.4k Đánh giá)</span>
        </div>

        <div className={styles.metricItem}>
          <span className={styles.metricIcon}><FiMessageCircle size={14} /></span>
          <span className={styles.metricLabel}>Tỉ lệ phản hồi Chat:</span>
          <span className={styles.metricValueHighlight}>98% (Trong vài giờ)</span>
        </div>

        <div className={styles.metricItem}>
          <span className={styles.metricIcon}><FiCalendar size={14} /></span>
          <span className={styles.metricLabel}>Tham gia:</span>
          <span className={styles.metricValueHighlight}>5 năm trước</span>
        </div>

        <div className={styles.metricItem}>
          <span className={styles.metricIcon}><FiMapPin size={14} /></span>
          <span className={styles.metricLabel}>Địa chỉ:</span>
          <span className={styles.metricValueHighlight}>Hà Nội, Việt Nam</span>
        </div>

        <div className={styles.metricItem}>
          <span className={styles.metricIcon}><FiBriefcase size={14} /></span>
          <span className={styles.metricLabel}>Tên doanh nghiệp:</span>
          <span className={styles.metricValueHighlight}>{shopDisplayName} Store</span>
        </div>
      </div>
    </div>
  );
};

export const ShopProfileCard = memo(ShopProfileCardComponent);
export default ShopProfileCard;
