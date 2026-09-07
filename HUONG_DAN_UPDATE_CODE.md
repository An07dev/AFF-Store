# TÀI LIỆU HƯỚNG DẪN CẬP NHẬT CODE (CLONE 100% VÀO LUỒNG CHÍNH)

Tài liệu này tổng hợp toàn bộ các file tạo mới, file chỉnh sửa và file cần xóa để bạn cập nhật đồng bộ 100% vào luồng code chính của dự án.

---

## MỤC LỤC
1. [PHẦN 1: TÍNH NĂNG MỚI - TOP 3 SẢN PHẨM BÁN CHẠY](#phần-1-tính-năng-mới---top-3-sản-phẩm-bán-chạy)
   - 1.1. [Tạo mới] `src/components/store/home/TopBestSellersSection.tsx`
   - 1.2. [Tạo mới] `src/components/store/home/TopBestSellersSection.module.css`
   - 1.3. [Cập nhật] `src/app/(store)/page.tsx`
2. [PHẦN 2: SỬA LỖI ĐỒNG BỘ TIÊU ĐỀ META & FAVICON](#phần-2-sửa-lỗi-đồng-bộ-tiêu-đề-meta--favicon)
   - 2.1. [Cập nhật] `src/app/layout.tsx`
   - 2.2. [Cập nhật] `src/app/api/settings/theme/route.ts`
   - 2.3. [Cập nhật] `src/contexts/ThemeContext.tsx`
   - 2.4. [Cập nhật] `src/app/admin/settings/page.tsx`
   - 2.5. [Xóa file thừa] `src/app/favicon.ico` & `src/app/icon.png`

---

## PHẦN 1: TÍNH NĂNG MỚI - TOP 3 SẢN PHẨM BÁN CHẠY

### 1.1. [TẠO MỚI] `src/components/store/home/TopBestSellersSection.tsx`

Tạo file tại đường dẫn: `src/components/store/home/TopBestSellersSection.tsx` với toàn bộ nội dung sau:

```tsx
'use client';

import React, { memo, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronRight, FiShoppingCart, FiStar } from 'react-icons/fi';
import { ProductItem, formatPrice, calcDiscount, formatSold, StarRating } from './StoreProductCard';
import styles from './TopBestSellersSection.module.css';

interface TopBestSellersSectionProps {
  products: ProductItem[];
  onQuickAdd: (e: React.MouseEvent, product: ProductItem) => void;
  onSeeAll: () => void;
}

const MEDAL_CONFIGS = [
  {
    rank: 1,
    title: 'TOP 1',
    badgeClass: styles.medal1,
    cardClass: styles.rank1Card,
    crownText: '🥇 #1 BÁN CHẠY',
  },
  {
    rank: 2,
    title: 'TOP 2',
    badgeClass: styles.medal2,
    cardClass: styles.rank2Card,
    crownText: '🥈 #2 NỔI BẬT',
  },
  {
    rank: 3,
    title: 'TOP 3',
    badgeClass: styles.medal3,
    cardClass: styles.rank3Card,
    crownText: '🥉 #3 YÊU THÍCH',
  },
];

const TopBestSellersSectionComponent: React.FC<TopBestSellersSectionProps> = ({
  products,
  onQuickAdd,
  onSeeAll,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  // Lấy top 3 sản phẩm bán chạy nhất
  const top3 = products.slice(0, 3);

  // Tính toán chỉ số chấm tròn khi vuốt trên mobile
  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    if (clientWidth <= 0) return;
    const index = Math.round(scrollLeft / (clientWidth * 0.74));
    setActiveSlideIndex(Math.min(top3.length - 1, Math.max(0, index)));
  };

  return (
    <section className={styles.sectionContainer}>
      {/* 1. Header Row */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.crownIconBadge}>👑</span>
          <h2 className={styles.sectionTitle}>
            <span className={styles.highlightText}>TOP 3 BÁN CHẠY</span> NHẤT
          </h2>
        </div>

        <button
          type="button"
          className={styles.seeAllBtn}
          onClick={onSeeAll}
        >
          <span>Xem tất cả</span>
          <FiChevronRight size={13} />
        </button>
      </div>

      {/* 2. Track & Grid Wrapper */}
      <div className={styles.trackWrapper}>
        <div
          ref={trackRef}
          className={styles.topGrid}
          onScroll={handleScroll}
        >
          {top3.map((product, index) => {
            const medal = MEDAL_CONFIGS[index] || MEDAL_CONFIGS[2];
            const effectivePrice = product.flashPrice || product.salePrice || product.price;
            const effectiveOriginalPrice =
              product.price > effectivePrice
                ? product.price
                : product.salePrice && product.salePrice > effectivePrice
                  ? product.salePrice
                  : 0;

            const discount = calcDiscount(effectiveOriginalPrice, effectivePrice);
            const soldCount = product.soldCount ?? product.sold ?? 0;
            const rating = product.rating || 5;
            const imageSrc =
              product.images?.[0] ||
              product.image ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

            const categoryName =
              typeof product.category === 'object'
                ? product.category?.name
                : product.category || 'Hot Trend';

            const heatPercent = Math.min(96, Math.max(50, 95 - index * 15));

            return (
              <div
                key={product._id || index}
                className={`${styles.topCard} ${medal.cardClass}`}
              >
                {/* Huy hiệu Xếp Hạng */}
                <div className={`${styles.rankRibbon} ${medal.badgeClass}`}>
                  <span>{medal.crownText}</span>
                </div>

                {/* Ảnh Sản Phẩm */}
                <Link href={`/product/${product.slug}`} className={styles.imgContainer}>
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    sizes="(max-width: 767px) 240px, (max-width: 1200px) 33vw, 360px"
                    className={styles.productImg}
                    loading="lazy"
                  />
                  {discount > 0 && (
                    <div className={styles.discountBadge}>
                      -{discount}%
                    </div>
                  )}
                </Link>

                {/* Nội Dung Card */}
                <div className={styles.cardBody}>
                  <span className={styles.categoryTag}>{categoryName}</span>

                  <Link
                    href={`/product/${product.slug}`}
                    className={styles.productName}
                    title={product.name}
                  >
                    {product.name}
                  </Link>

                  {/* Đánh Giá Sao */}
                  <div className={styles.statsRow}>
                    <div className={styles.ratingGroup}>
                      <StarRating rating={rating} size={11} />
                      <span>{rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Thanh Nhiệt Doanh Số Shopee Fire Bar */}
                  <div className={styles.fireSoldBar}>
                    <div
                      className={styles.fireFill}
                      style={{ width: `${heatPercent}%` }}
                    />
                    <span className={styles.fireText}>
                      🔥 ĐÃ BÁN {formatSold(soldCount)}
                    </span>
                  </div>

                  {/* Giá Bán */}
                  <div className={styles.priceSection}>
                    <span className={styles.currentPrice}>
                      {formatPrice(effectivePrice)}
                    </span>
                    {effectiveOriginalPrice > effectivePrice && (
                      <span className={styles.oldPrice}>
                        {formatPrice(effectiveOriginalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Nút Thao Tác Mua Sắm */}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.btnQuickBuy}
                      onClick={(e) => onQuickAdd(e, product)}
                    >
                      <FiShoppingCart size={13} />
                      <span>Chọn mua</span>
                    </button>

                    <Link
                      href={`/product/${product.slug}`}
                      className={styles.btnDetailLink}
                    >
                      <span>Chi tiết</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chấm Chỉ Báo Vuốt Trang Trên Mobile */}
        <div className={styles.mobileDotsRow}>
          {top3.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${activeSlideIndex === i ? styles.dotActive : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const TopBestSellersSection = memo(TopBestSellersSectionComponent);
export default TopBestSellersSection;
```

---

### 1.2. [TẠO MỚI] `src/components/store/home/TopBestSellersSection.module.css`

Tạo file tại đường dẫn: `src/components/store/home/TopBestSellersSection.module.css` với toàn bộ nội dung sau:

```css
/* ======================================================== */
/* TOP 3 BEST SELLERS SECTION - DESKTOP & MOBILE OPTIMIZED   */
/* ======================================================== */

.sectionContainer {
  width: 100%;
  margin: 16px 0;
  padding: 16px 18px 20px;
  background: var(--bg-card, #13161f);
  border: 1px solid var(--border-color, #232838);
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.sectionContainer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 90px;
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.06) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}

.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}

.headerTitleGroup {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.crownIconBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #f59e0b 100%);
  color: #000000;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
  font-size: 15px;
  flex-shrink: 0;
}

.sectionTitle {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.2px;
  margin: 0;
  color: var(--text-main, #f8fafc);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
}

.highlightText {
  background: linear-gradient(90deg, #fbbf24 0%, #f97316 50%, var(--primary, #ee4d2d) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.seeAllBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color, #232838);
  border-radius: 999px;
  color: var(--primary, #ee4d2d);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.seeAllBtn:hover,
.seeAllBtn:active {
  background: var(--primary, #ee4d2d);
  color: #ffffff;
  border-color: var(--primary, #ee4d2d);
}

.trackWrapper {
  width: 100%;
  position: relative;
  z-index: 1;
}

.topGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
}

.topCard {
  background: var(--bg-main, #090a0f);
  border: 1px solid var(--border-color, #232838);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.25s ease;
  text-decoration: none;
  color: inherit;
  box-sizing: border-box;
}

.topCard:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.rank1Card {
  border: 1.5px solid rgba(251, 191, 36, 0.5);
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.05) 0%, var(--bg-main, #090a0f) 100%);
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.12);
}

.rank1Card:hover {
  border-color: #fbbf24;
  box-shadow: 0 10px 28px rgba(251, 191, 36, 0.22);
}

.rank2Card {
  border: 1.5px solid rgba(148, 163, 184, 0.4);
}

.rank2Card:hover {
  border-color: #cbd5e1;
}

.rank3Card {
  border: 1.5px solid rgba(217, 119, 6, 0.4);
}

.rank3Card:hover {
  border-color: #f59e0b;
}

.rankRibbon {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.medal1 {
  background: linear-gradient(135deg, #ffd700 0%, #f59e0b 100%);
  color: #000000;
}

.medal2 {
  background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%);
  color: #0f172a;
}

.medal3 {
  background: linear-gradient(135deg, #ffedd5 0%, #b45309 100%);
  color: #78350f;
}

.imgContainer {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
  margin-bottom: 10px;
  display: block;
}

.productImg {
  object-fit: cover;
  transition: transform 0.35s ease;
}

.topCard:hover .productImg {
  transform: scale(1.05);
}

.discountBadge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--primary, #ee4d2d);
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(238, 77, 45, 0.35);
}

.cardBody {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 5px;
}

.categoryTag {
  font-size: 10.5px;
  color: var(--text-muted, #94a3b8);
  font-weight: 700;
  text-transform: uppercase;
}

.productName {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main, #f8fafc);
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
  text-decoration: none;
}

.productName:hover {
  color: var(--primary, #ee4d2d);
}

.statsRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11.5px;
}

.ratingGroup {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #fbbf24;
  font-weight: 700;
}

.fireSoldBar {
  position: relative;
  height: 18px;
  background: rgba(238, 77, 45, 0.12);
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.fireFill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f97316 0%, var(--primary, #ee4d2d) 100%);
  border-radius: 999px;
  transition: width 0.4s ease;
  z-index: 1;
}

.fireText {
  position: relative;
  z-index: 2;
  color: var(--text-main, #ffffff);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  padding: 0 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.priceSection {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
}

.currentPrice {
  font-size: 16px;
  font-weight: 900;
  color: var(--primary, #ee4d2d);
}

.oldPrice {
  font-size: 11.5px;
  color: var(--text-dim, #64748b);
  text-decoration: line-through;
}

.cardActions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  margin-top: 8px;
}

.btnQuickBuy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 10px;
  background: var(--primary, #ee4d2d);
  color: #ffffff;
  border: none;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btnQuickBuy:hover,
.btnQuickBuy:active {
  background: var(--primary-hover, #d73211);
  transform: scale(0.98);
}

.btnDetailLink {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color, #232838);
  border-radius: 7px;
  color: var(--text-main, #f8fafc);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btnDetailLink:hover,
.btnDetailLink:active {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary, #ee4d2d);
  color: var(--primary, #ee4d2d);
}

.mobileDotsRow {
  display: none;
}

/* Mobile & Tablet (< 768px) */
@media (max-width: 767px) {
  .sectionContainer {
    padding: 12px 10px 14px;
    margin: 10px 0;
    border-radius: 10px;
  }

  .sectionHeader {
    margin-bottom: 10px;
  }

  .crownIconBadge {
    width: 24px;
    height: 24px;
    font-size: 13px;
  }

  .sectionTitle {
    font-size: 14.5px;
  }

  .seeAllBtn {
    padding: 4px 8px;
    font-size: 11.5px;
  }

  .topGrid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 10px;
    padding-bottom: 4px;
    scroll-padding: 0 4px;
  }

  .topGrid::-webkit-scrollbar {
    display: none;
  }

  .topCard {
    flex: 0 0 74%;
    max-width: 240px;
    min-width: 200px;
    scroll-snap-align: start;
    padding: 10px;
    border-radius: 10px;
  }

  .rankRibbon {
    top: 6px;
    left: 6px;
    padding: 2px 6px;
    font-size: 10px;
  }

  .discountBadge {
    top: 6px;
    right: 6px;
    padding: 2px 5px;
    font-size: 9.5px;
  }

  .productName {
    font-size: 12.5px;
    min-height: 34px;
  }

  .currentPrice {
    font-size: 15px;
  }

  .fireSoldBar {
    height: 16px;
  }

  .fireText {
    font-size: 9.5px;
  }

  .btnQuickBuy {
    padding: 6px 8px;
    font-size: 12px;
  }

  .btnDetailLink {
    padding: 6px 8px;
    font-size: 11.5px;
  }

  .mobileDotsRow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-top: 8px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--border-color, rgba(255, 255, 255, 0.2));
    transition: all 0.25s ease;
  }

  .dotActive {
    width: 16px;
    background: var(--primary, #ee4d2d);
  }
}

@media (max-width: 380px) {
  .topCard {
    flex: 0 0 82%;
    max-width: 230px;
  }
  .sectionTitle {
    font-size: 13.5px;
  }
}
```

---

### 1.3. [CẬP NHẬT] `src/app/(store)/page.tsx`

Mở file `src/app/(store)/page.tsx` và thêm 3 đoạn sau:

**1. Thêm import component (dòng ~18):**
```tsx
import TopBestSellersSection from '@/components/store/home/TopBestSellersSection';
```

**2. Thêm tính toán `topBestSellers` (dòng ~85):**
```tsx
  // Top 3 Best-Selling Products for Home Section Podium
  const topBestSellers = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products]
      .sort((a, b) => ((b.soldCount ?? b.sold ?? 0) - (a.soldCount ?? a.sold ?? 0)))
      .slice(0, 3);
  }, [products]);
```

**3. Thêm Section vào JSX Home Tab (dòng ~570):**
```tsx
            {/* 3. SHOPEE FLASH SALE */}
            <FlashSaleSection
              flashSaleConfig={flashSaleConfig}
              onSeeAll={() => handleQuickFilter(1, false)}
              sectionRef={flashSaleRef}
            />

            {/* 4. TOP 3 BEST SELLERS PODIUM SECTION */}
            <TopBestSellersSection
              products={topBestSellers}
              onQuickAdd={handleQuickAdd}
              onSeeAll={() => handleQuickFilter(2, false)}
            />

            {/* 5. SHOPEE CATEGORIES SHOWCASE */}
            <HomeCategoryShowcase
              categories={categories}
              categoryImageMap={categoryImageMap}
              onCategorySelect={handleCategoryTabClick}
              onSeeAll={() => handleCategoryTabClick('categories')}
            />
```

---

## PHẦN 2: SỬA LỖI ĐỒNG BỘ TIÊU ĐỀ META & FAVICON

### 2.1. [CẬP NHẬT TOÀN BỘ] `src/app/layout.tsx`

Thay thế toàn bộ nội dung file `src/app/layout.tsx` bằng mã sau:

```tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import DatabaseSetupBanner from '@/components/common/DatabaseSetupBanner';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'theme_settings' }).lean();
    const themeConfig = (setting as any)?.value || {};
    const pageTitles = themeConfig?.pageTitles || {};

    const title = pageTitles.siteTitle || 'Trải nghiệm mua sắm thời trang trực tuyến thời thượng,Miễn phí giao hàng nhanh chóng toàn quốc.';
    const description = pageTitles.metaDescription || 'Trải nghiệm mua sắm trực tuyến cao cấp, giao hàng nhanh chóng toàn quốc.';
    const rawFavicon = pageTitles.faviconUrl?.trim();
    const rawLogo = pageTitles.logoUrl?.trim();
    const faviconUrl = rawFavicon || rawLogo || '/favicon.ico';

    return {
      title,
      description,
      icons: {
        icon: [
          { url: faviconUrl },
        ],
        shortcut: [faviconUrl],
        apple: [faviconUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Trải nghiệm mua sắm thời trang trực tuyến thời thượng,Miễn phí giao hàng nhanh chóng toàn quốc.',
      description: 'Trải nghiệm mua sắm trực tuyến cao cấp, giao hàng nhanh chóng toàn quốc.',
      icons: {
        icon: [{ url: '/favicon.ico' }],
        shortcut: ['/favicon.ico'],
        apple: ['/favicon.ico'],
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={jakarta.variable}>
      <body className={jakarta.className}>
        <ThemeProvider>
          <DatabaseSetupBanner />
          <CustomerAuthProvider>
            <CartProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#13161f',
                    color: '#f8fafc',
                    border: '1px solid #232838',
                    borderRadius: '8px',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#13161f',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#13161f',
                    },
                  },
                }}
              />
            </CartProvider>
          </CustomerAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### 2.2. [CẬP NHẬT] `src/app/api/settings/theme/route.ts`

Trong file `src/app/api/settings/theme/route.ts`, cập nhật các vị trí sau:

**1. Đầu file (Dòng ~1-8):**
```ts
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

**2. Header trong hàm GET (Dòng ~185-197):**
```ts
    return NextResponse.json(
      {
        success: true,
        data: mergedData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
```

**3. Hàm POST sau khi lưu DB (Dòng ~248-254):**
```ts
    // Revalidate Next.js Server-Side Layouts & Metadata cache immediately
    try {
      revalidatePath('/', 'layout');
    } catch (revalErr) {
      console.warn('Revalidate layout path failed:', revalErr);
    }
```

---

### 2.3. [CẬP NHẬT] `src/contexts/ThemeContext.tsx`

Đảm bảo trong `applyCSSVariables` (dòng ~308-366) có cơ chế xóa thẻ icon cũ và chèn thẻ icon mới đúng MIME Type:

```ts
    // Dynamic Favicon & Browser Tab Icon Synchronization (Forces browser to repaint tab icon)
    const rawFavicon = config.pageTitles?.faviconUrl?.trim();
    const rawLogo = config.pageTitles?.logoUrl?.trim();
    const faviconToUse = rawFavicon || rawLogo;

    if (faviconToUse) {
      try {
        const existingIcons = document.querySelectorAll<HTMLLinkElement>(
          "link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
        );

        let alreadyMatched = false;
        if (existingIcons.length > 0) {
          existingIcons.forEach((el) => {
            const href = el.getAttribute('href');
            if (href === faviconToUse) {
              alreadyMatched = true;
            }
          });
        }

        if (!alreadyMatched) {
          existingIcons.forEach((el) => el.remove());

          let mimeType = 'image/x-icon';
          if (faviconToUse.endsWith('.png') || faviconToUse.includes('.png')) {
            mimeType = 'image/png';
          } else if (faviconToUse.endsWith('.svg') || faviconToUse.includes('.svg')) {
            mimeType = 'image/svg+xml';
          } else if (
            faviconToUse.endsWith('.jpg') ||
            faviconToUse.endsWith('.jpeg') ||
            faviconToUse.includes('.jpg') ||
            faviconToUse.includes('.jpeg')
          ) {
            mimeType = 'image/jpeg';
          } else if (faviconToUse.endsWith('.webp') || faviconToUse.includes('.webp')) {
            mimeType = 'image/webp';
          }

          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = mimeType;
          link.href = faviconToUse;
          document.head.appendChild(link);

          const shortcutLink = document.createElement('link');
          shortcutLink.rel = 'shortcut icon';
          shortcutLink.href = faviconToUse;
          document.head.appendChild(shortcutLink);

          const appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          appleLink.href = faviconToUse;
          document.head.appendChild(appleLink);
        }
      } catch (iconErr) {
        console.warn('Failed to update browser favicon:', iconErr);
      }
    }
```

Và trong hàm `loadFreshTheme` (dòng ~400):
```ts
    async function loadFreshTheme() {
      try {
        const res = await apiFetch(`/api/settings/theme?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        const data = await res.json();
        // ...
```

---

### 2.4. [CẬP NHẬT] `src/app/admin/settings/page.tsx`

Trong hàm `handleLogoUpload` (dòng ~452-463), tách biệt không tự ý ghi đè `faviconUrl`:

```ts
        const updated: ThemeConfig = {
          ...theme,
          pageTitles: {
            ...theme.pageTitles,
            logoUrl: data.data.url,
          },
        };
        setTheme(updated);
        applyCSSVariables(updated);
```

---

### 2.5. [XÓA FILE THỪA]

Xóa 2 file tĩnh sau nếu có trong thư mục `src/app/`:
- ❌ `src/app/favicon.ico`
- ❌ `src/app/icon.png`

*(Mục đích: Không cho Next.js App Router tự động chèn thẻ icon tĩnh đè lên Favicon động do bạn cài đặt).*
