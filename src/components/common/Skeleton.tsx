'use client';

import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  type?: 'text' | 'rect' | 'circle' | 'product-card' | 'table-row';
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  count?: number;
  style?: React.CSSProperties;
}

export default function Skeleton({
  type = 'rect',
  width,
  height,
  borderRadius,
  className = '',
  count = 1,
  style,
}: SkeletonProps) {
  if (type === 'product-card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${styles.productCard} ${className}`} style={style}>
            <div className={styles.productCardImg} />
            <div className={styles.productCardBody}>
              <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '40%', height: 12 }} />
              <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '90%', height: 16 }} />
              <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '50%', height: 18 }} />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'table-row') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${styles.tableRow} ${className}`} style={style}>
            <div className={`${styles.skeleton} ${styles.circle}`} style={{ width: 36, height: 36 }} />
            <div className={`${styles.skeleton} ${styles.text}`} style={{ flex: 2, height: 16 }} />
            <div className={`${styles.skeleton} ${styles.text}`} style={{ flex: 1, height: 16 }} />
            <div className={`${styles.skeleton} ${styles.text}`} style={{ flex: 1, height: 16 }} />
          </div>
        ))}
      </>
    );
  }

  const baseStyle: React.CSSProperties = {
    width: width || (type === 'circle' ? 48 : '100%'),
    height: height || (type === 'text' ? 16 : type === 'circle' ? 48 : 120),
    borderRadius: borderRadius || (type === 'circle' ? '50%' : undefined),
    ...style,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`${styles.skeleton} ${styles[type]} ${className}`}
          style={baseStyle}
        />
      ))}
    </>
  );
}
