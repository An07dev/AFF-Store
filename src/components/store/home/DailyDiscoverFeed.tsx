'use client';

import React, { memo } from 'react';
import StoreProductCard, { ProductItem } from './StoreProductCard';
import styles from '@/app/(store)/page.module.css';

const FILTER_PILLS = ['Tất cả', 'Flash Sale 🔥', 'Bán chạy', 'Hàng mới', 'Giá ↕'];

interface DailyDiscoverFeedProps {
  products: ProductItem[];
  loading: boolean;
  activeFilter: number;
  priceSortAsc: boolean;
  onFilterClick: (index: number) => void;
  onQuickAdd: (e: React.MouseEvent, product: ProductItem) => void;
}

const DailyDiscoverFeedComponent: React.FC<DailyDiscoverFeedProps> = ({
  products,
  loading,
  activeFilter,
  priceSortAsc,
  onFilterClick,
  onQuickAdd,
}) => {
  return (
    <div className={styles.dailyDiscoverSection}>
      <div className={styles.stickyDiscoverHeader}>
        <div className={styles.discoverTitleRow}>
          <h2 className={styles.discoverTitle}>✨ GỢI Ý HÔM NAY ✨</h2>
        </div>

        <div className={styles.filterPills}>
          {FILTER_PILLS.map((pill, i) => (
            <button
              key={i}
              className={`${styles.filterPill} ${activeFilter === i ? styles.filterActive : ''}`}
              onClick={() => onFilterClick(i)}
            >
              {pill} {i === 4 ? (priceSortAsc ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Shopee Product Grid */}
      <div className={styles.productGrid}>
        {(loading ? [1, 2, 3, 4, 5, 6] : products).map((item: any, i: number) => (
          <StoreProductCard
            key={item._id || i}
            product={loading ? ({} as any) : item}
            loading={loading}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </div>
  );
};

export const DailyDiscoverFeed = memo(DailyDiscoverFeedComponent);
export default DailyDiscoverFeed;
