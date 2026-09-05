'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { FiLayers, FiChevronRight } from 'react-icons/fi';
import styles from '@/app/(store)/page.module.css';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  productCount?: number;
  sampleImage?: string;
  image?: string;
}

interface HomeCategoryShowcaseProps {
  categories: CategoryItem[];
  categoryImageMap: Record<string, string>;
  onCategorySelect: (slugOrId: string) => void;
  onSeeAll: () => void;
}

const iconGradients = [
  'linear-gradient(135deg, #ff5722 0%, #ee4d2d 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #10b981 0%, #047857 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
  'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
  'linear-gradient(135deg, #64748b 0%, #334155 100%)',
];

const HomeCategoryShowcaseComponent: React.FC<HomeCategoryShowcaseProps> = ({
  categories,
  categoryImageMap,
  onCategorySelect,
  onSeeAll,
}) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className={styles.homeCategorySection}>
      <div className={styles.homeCategoryHeader}>
        <div className={styles.homeCategoryTitleGroup}>
          <FiLayers className={styles.homeCategoryIcon} />
          <h3 className={styles.homeCategoryTitle}>DANH MỤC SẢN PHẨM</h3>
        </div>
        <button
          type="button"
          className={styles.homeCategorySeeAll}
          onClick={onSeeAll}
        >
          <span>Xem tất cả</span>
          <FiChevronRight size={13} />
        </button>
      </div>

      <div className={styles.homeCategoryGrid}>
        {categories.map((cat, idx) => {
          const gradient = iconGradients[idx % iconGradients.length];
          const catSlug = (cat.slug || '').toLowerCase().trim();
          const catId = (cat._id || '').toString().trim();
          const catName = (cat.name || '').toLowerCase().trim();
          const displayImage =
            categoryImageMap[catId] ||
            categoryImageMap[catSlug] ||
            categoryImageMap[catName] ||
            cat.sampleImage ||
            cat.image;

          return (
            <div
              key={cat._id || idx}
              className={styles.homeCategoryCard}
              onClick={() => onCategorySelect(cat.slug || cat._id)}
            >
              <div
                className={styles.homeCategoryImgWrap}
                style={!displayImage ? { background: gradient } : undefined}
              >
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={cat.name}
                    fill
                    sizes="60px"
                    className={styles.homeCategoryImg}
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.homeCategoryFallbackIcon}>
                    <FiLayers />
                  </span>
                )}
              </div>
              <span className={styles.homeCategoryName}>{cat.name}</span>
              {cat.productCount !== undefined && cat.productCount > 0 && (
                <span className={styles.homeCategoryCount}>{cat.productCount} sản phẩm</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HomeCategoryShowcase = memo(HomeCategoryShowcaseComponent);
export default HomeCategoryShowcase;
