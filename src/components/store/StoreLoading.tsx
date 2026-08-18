'use client';

import React from 'react';
import styles from './StoreLoading.module.css';

export default function StoreLoading({ text = 'Đang tải dữ liệu...' }: { text?: string }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <span className={styles.text}>{text}</span>
    </div>
  );
}