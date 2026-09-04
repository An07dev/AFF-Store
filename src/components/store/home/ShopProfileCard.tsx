'use client';

import React, { memo } from 'react';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import styles from '@/app/(store)/page.module.css';

interface ShopProfileCardProps {
  shopDisplayName: string;
  logoUrl?: string;
  avatarInitials: string;
  socialLinks?: {
    tiktokUrl?: string;
    facebookUrl?: string;
  };
}

const SHOP_INFO = {
  rating: 4.9,
  totalSold: '15.8K',
  followers: '10.2K',
};

const ShopProfileCardComponent: React.FC<ShopProfileCardProps> = ({
  shopDisplayName,
  logoUrl,
  avatarInitials,
  socialLinks,
}) => {
  return (
    <div className={styles.shopCard}>
      <div className={styles.shopLeft}>
        <div className={`${styles.shopAvatar} ${logoUrl ? styles.shopAvatarWithImage : ''}`}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={shopDisplayName}
              className={styles.shopAvatarImg}
              loading="lazy"
            />
          ) : (
            avatarInitials
          )}
        </div>
        <div className={styles.shopInfo}>
          <div className={styles.shopNameRow}>
            <span className={styles.mallBadge}>Mall</span>
            <span className={styles.shopName}>{shopDisplayName}</span>
          </div>
          <div className={styles.shopMeta}>
            <span>⭐ {SHOP_INFO.rating}</span>
            <span>•</span>
            <span>{SHOP_INFO.totalSold} đã bán</span>
            <span>•</span>
            <span>{SHOP_INFO.followers} theo dõi</span>
          </div>
        </div>
      </div>

      <div className={styles.shopRight}>
        {socialLinks?.tiktokUrl && (
          <a
            href={socialLinks.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialBtn}
          >
            <FaTiktok size={11} /> TikTok
          </a>
        )}
        {socialLinks?.facebookUrl && (
          <a
            href={socialLinks.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialBtn}
          >
            <FaFacebook size={11} /> FB
          </a>
        )}
      </div>
    </div>
  );
};

export const ShopProfileCard = memo(ShopProfileCardComponent);
export default ShopProfileCard;
