'use client';

import React, { memo } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import styles from '@/app/(store)/page.module.css';

const TrustCommitmentBarComponent: React.FC = () => {
  return (
    <div className={styles.trustBar}>
      <div className={styles.trustItem}>
        <FiCheckCircle className={styles.trustIcon} />
        <span>100% Chính Hãng</span>
      </div>
      <div className={styles.trustItem}>
        <FiCheckCircle className={styles.trustIcon} />
        <span>7 Ngày Đổi Trả</span>
      </div>
      <div className={styles.trustItem}>
        <FiCheckCircle className={styles.trustIcon} />
        <span>Freeship Tận Nơi</span>
      </div>
    </div>
  );
};

export const TrustCommitmentBar = memo(TrustCommitmentBarComponent);
export default TrustCommitmentBar;
