'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './BannerNotice.module.css';

interface BannerNoticeProps {
  customText?: string;
  forceShow?: boolean;
}

export default function BannerNotice({ customText, forceShow }: BannerNoticeProps) {
  const { theme } = useTheme();

  const isVisible = forceShow || (theme?.pageTitles?.showBannerNotice !== false);
  if (!isVisible) return null;

  const message =
    customText ||
    theme?.pageTitles?.bannerNotice ||
    '🔥 Ưu đãi hot khi giảm giá sâu cho các đơn hàng 🔥';

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.marqueeTrack}>
        <span className={styles.marqueeItem}>{message}</span>
        <span className={styles.marqueeItem}>{message}</span>
        <span className={styles.marqueeItem}>{message}</span>
        <span className={styles.marqueeItem}>{message}</span>
      </div>
    </div>
  );
}
