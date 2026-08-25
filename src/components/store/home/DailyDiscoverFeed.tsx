'use client';

import React, { useState, useEffect, memo } from 'react';
import { FiChevronDown } from 'react-icons/fi';
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
  // Progressive rendering: initial 12 products for ultra-fast initial DOM layout
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [activeFilter, products]);

  const displayedList = loading ? [1, 2, 3, 4, 5, 6] : products.slice(0, visibleCount);
  const hasMore = !loading && products.length > visibleCount;

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
        {displayedList.map((item: any, i: number) => (
          <StoreProductCard
            key={item._id || i}
            product={loading ? ({} as any) : item}
            loading={loading}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>

      {/* Progressive Load More Trigger */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: 'var(--text-main, #0f172a)',
              padding: '9px 22px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
            }}
            onClick={() => setVisibleCount((prev) => prev + 12)}
          >
            <span>Xem thêm gợi ý ({products.length - visibleCount}+)</span>
            <FiChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export const DailyDiscoverFeed = memo(DailyDiscoverFeedComponent);
export default DailyDiscoverFeed;
