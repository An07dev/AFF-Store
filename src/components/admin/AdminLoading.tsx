'use client';

import React from 'react';
import styles from './AdminLoading.module.css';

export default function AdminLoading({ text = 'Đang tải dữ liệu...' }: { text?: string }) {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.spinner}></div>
      <span className={styles.label}>{text}</span>
    </div>
  );
}