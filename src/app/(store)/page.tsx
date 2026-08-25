'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiGrid, FiList, FiChevronRight, FiLayers } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useTheme, defaultBanners } from '@/contexts/ThemeContext';
import StoreLoading from '@/components/store/StoreLoading';
import BannerNotice from '@/components/common/BannerNotice';
import VoucherCollectionBar from '@/components/store/VoucherCollectionBar';
import { apiFetch } from '@/lib/api';
import { clientCache } from '@/lib/clientCache';
import StoreHeader from '@/components/store/home/StoreHeader';
import HeroBannerCarousel from '@/components/store/home/HeroBannerCarousel';
import QuickHub from '@/components/store/home/QuickHub';
import FlashSaleSection from '@/components/store/home/FlashSaleSection';
import HomeCategoryShowcase from '@/components/store/home/HomeCategoryShowcase';
import TrustCommitmentBar from '@/components/store/home/TrustCommitmentBar';
import ShopProfileCard from '@/components/store/home/ShopProfileCard';
import DailyDiscoverFeed from '@/components/store/home/DailyDiscoverFeed';
import StoreProductCard, { ProductItem } from '@/components/store/home/StoreProductCard';
import styles from './page.module.css';

// Lazy load bottom sheet product detail modal
const ProductDetailModal = dynamic(
  () => import('@/components/store/ProductDetailModal'),
  { ssr: false }
);

interface Category {
  _id: string;
  name: string;
  slug: string;
  productCount?: number;
  sampleImage?: string;
  image?: string;
}

const FILTER_PILLS = ['Tất cả', 'Flash Sale 🔥', 'Bán chạy', 'Hàng mới', 'Giá ↕'];

function HomePageContent() {
  const { cartCount } = useCart();
  const { theme, isLoading: isThemeLoading } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const catParam = searchParams.get('category');
  const filterParam = searchParams.get('filter');

  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceSortAsc, setPriceSortAsc] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
  const [tab1VisibleLimit, setTab1VisibleLimit] = useState(16);

  useEffect(() => {
    setTab1VisibleLimit(16);
  }, [activeFilter, selectedCategory, searchQuery]);

  // Flash Sale State
  const [flashSaleConfig, setFlashSaleConfig] = useState<any>(null);
  const flashSaleRef = useRef<HTMLDivElement>(null);

  const shopDisplayName = theme?.pageTitles?.logoText || 'ShopTik Store';
  const avatarInitials = shopDisplayName ? shopDisplayName.substring(0, 2).toUpperCase() : 'ST';
  const heroBanners = theme?.banners && theme.banners.length > 0 ? theme.banners : defaultBanners;

  // 1. Fetch Public Flash Sale with Client Cache
  useEffect(() => {
    async function loadFlashSale() {
      try {
        const data = await clientCache.fetchWithCache(
          'public_flash_sale_config',
          async () => {
            const res = await apiFetch('/api/flash-sale');
            return await res.json();
          },
          30000 // 30s cache
        );
        if (data?.success && data?.data) {
          setFlashSaleConfig(data.data);
        }
      } catch (e) {
        console.error('Error loading public flash sale:', e);
      }
    }
    loadFlashSale();
  }, []);

  // 2. Fetch categories with Client Cache
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await clientCache.fetchWithCache(
          'public_categories_list',
          async () => {
            const res = await apiFetch('/api/categories');
            return await res.json();
          },
          60000 // 60s cache
        );
        if (data?.success && Array.isArray(data?.data)) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products via API 2.1 (GET /api/products) - Optimized with Client-Side SWR Caching
  const fetchProductsByParams = useCallback(
    async (
      filterIndex: number,
      isAsc: boolean,
      query: string,
      categorySlug: string
    ) => {
      const queryKey = `products_${filterIndex}_${isAsc}_${query.trim().toLowerCase()}_${categorySlug}`;
      const cachedProducts = clientCache.get<ProductItem[]>(queryKey);

      if (cachedProducts) {
        setProducts(cachedProducts);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        // FLASH SALE FILTER: Direct optimized fetch from /api/flash-sale (No redundant /api/products request)
        if (filterIndex === 1) {
          try {
            const fsData = await clientCache.fetchWithCache(
              'public_flash_sale_config',
              async () => {
                const res = await apiFetch('/api/flash-sale');
                return await res.json();
              },
              30000
            );

            if (
              fsData?.success &&
              fsData?.data?.isActive &&
              fsData?.data?.isLive &&
              Array.isArray(fsData.data.items) &&
              fsData.data.items.length > 0
            ) {
              let flashProducts: ProductItem[] = fsData.data.items.map((it: any) => ({
                _id: it.productId || it._id,
                name: it.name,
                slug: it.slug,
                price: it.originalPrice || it.price || 0,
                salePrice: it.flashPrice || it.salePrice,
                flashPrice: it.flashPrice,
                images: it.images && it.images.length > 0 ? it.images : (it.image ? [it.image] : []),
                rating: 5,
                soldCount: it.soldCount || 0,
                sold: it.soldCount || 0,
                discountPercent: it.discountPercent,
                isFlashSale: true,
                category: it.category,
              }));

              if (categorySlug && categorySlug !== 'all') {
                flashProducts = flashProducts.filter(
                  (p: any) => p.category?.slug === categorySlug || p.category === categorySlug
                );
              }
              if (query.trim()) {
                const q = query.trim().toLowerCase();
                flashProducts = flashProducts.filter((p: any) => p.name?.toLowerCase().includes(q));
              }

              clientCache.set(queryKey, flashProducts, 30000);
              setProducts(flashProducts);
            } else {
              clientCache.set(queryKey, [], 30000);
              setProducts([]);
            }
          } catch (e) {
            console.error('Error fetching flash sale products in tab:', e);
            setProducts([]);
          } finally {
            setLoading(false);
          }
          return;
        }

        // REGULAR FILTERS
        let sort = 'popular';
        if (filterIndex === 2) sort = 'popular';
        else if (filterIndex === 3) sort = 'newest';
        else if (filterIndex === 4) sort = isAsc ? 'price-asc' : 'price-desc';

        let url = `/api/products?limit=50&status=active&sort=${sort}`;
        if (query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;
        if (categorySlug && categorySlug !== 'all') url += `&category=${encodeURIComponent(categorySlug)}`;

        const res = await apiFetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          let list = data.data;
          if (filterIndex === 4) {
            list = [...list].sort((a: any, b: any) => {
              const pA = a.salePrice && a.salePrice > 0 ? a.salePrice : a.price;
              const pB = b.salePrice && b.salePrice > 0 ? b.salePrice : b.price;
              return isAsc ? pA - pB : pB - pA;
            });
          }
          clientCache.set(queryKey, list, 45000);
          setProducts(list);
        }
      } catch (err) {
        console.error('Error calling /api/products:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 3. Sync activeTab, filter and category with URL params
  useEffect(() => {
    if (tabParam === 'products') {
      setActiveTab(1);
      let targetFilter = activeFilter;
      let targetPriceAsc = priceSortAsc;
      if (filterParam === 'flash-sale') {
        targetFilter = 1;
        setActiveFilter(1);
      } else if (filterParam === 'price-asc' || filterParam === 'cheap' || filterParam === 'deal-1k') {
        targetFilter = 4;
        targetPriceAsc = true;
        setActiveFilter(4);
        setPriceSortAsc(true);
      }
      const targetCategory = catParam || 'all';
      setSelectedCategory(targetCategory);
      if (!catParam) {
        setSearchQuery('');
      }
      fetchProductsByParams(targetFilter, targetPriceAsc, searchQuery, targetCategory);
    } else if (tabParam === 'categories') {
      setActiveTab(2);
    } else {
      setActiveTab(0);
      setSelectedCategory('all');
      fetchProductsByParams(0, false, '', 'all');
    }
  }, [tabParam, catParam, filterParam, fetchProductsByParams]);

  // Listen to custom events from BottomNav
  useEffect(() => {
    const handleResetProductFilters = () => {
      setSelectedCategory('all');
      setSearchQuery('');
      setActiveFilter(0);
      setActiveTab(1);
      fetchProductsByParams(0, false, '', 'all');
    };

    const handleResetStoreHome = () => {
      setSelectedCategory('all');
      setSearchQuery('');
      setActiveFilter(0);
      setActiveTab(0);
      fetchProductsByParams(0, false, '', 'all');
    };

    window.addEventListener('reset-product-filters', handleResetProductFilters);
    window.addEventListener('reset-store-home', handleResetStoreHome);
    return () => {
      window.removeEventListener('reset-product-filters', handleResetProductFilters);
      window.removeEventListener('reset-store-home', handleResetStoreHome);
    };
  }, [fetchProductsByParams]);

  // Handlers wrapped in useCallback for zero unnecessary child re-renders
  const handleFilterClick = useCallback(
    (index: number) => {
      let nextAsc = priceSortAsc;
      if (index === 4 && activeFilter === 4) {
        nextAsc = !priceSortAsc;
        setPriceSortAsc(nextAsc);
      } else {
        setActiveFilter(index);
      }
      fetchProductsByParams(index, nextAsc, searchQuery, selectedCategory);
    },
    [activeFilter, priceSortAsc, searchQuery, selectedCategory, fetchProductsByParams]
  );

  const handleSearchSubmit = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setActiveTab(1);
      fetchProductsByParams(activeFilter, priceSortAsc, query, selectedCategory);
    },
    [activeFilter, priceSortAsc, selectedCategory, fetchProductsByParams]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    fetchProductsByParams(activeFilter, priceSortAsc, '', selectedCategory);
  }, [activeFilter, priceSortAsc, selectedCategory, fetchProductsByParams]);

  const handleCategorySelect = useCallback(
    (catSlug: string) => {
      setSelectedCategory(catSlug);
      setActiveTab(1);
      router.push(`/?tab=products&category=${encodeURIComponent(catSlug)}`);
      fetchProductsByParams(activeFilter, priceSortAsc, searchQuery, catSlug);
    },
    [router, activeFilter, priceSortAsc, searchQuery, fetchProductsByParams]
  );

  const handleQuickAdd = useCallback((e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProductForModal(product);
  }, []);

  const handleScrollToFlashSale = useCallback(() => {
    flashSaleRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleQuickFilter = useCallback(
    (filterIndex: number, isAsc = false) => {
      setActiveTab(1);
      setActiveFilter(filterIndex);
      if (filterIndex === 4) setPriceSortAsc(isAsc);
      router.push(
        filterIndex === 1
          ? '/?tab=products&filter=flash-sale'
          : filterIndex === 4
          ? '/?tab=products&filter=price-asc'
          : '/?tab=products'
      );
      fetchProductsByParams(filterIndex, isAsc, '', 'all');
    },
    [router, fetchProductsByParams]
  );

  const handleNavigateToProducts = useCallback(() => {
    setActiveTab(1);
    router.push('/?tab=products');
  }, [router]);

  const handleNavigateToCategories = useCallback(() => {
    setActiveTab(2);
    router.push('/?tab=categories');
  }, [router]);

  // Memoized Filtered Products
  const displayedFilteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory && selectedCategory !== 'all') {
      const decodedSel = decodeURIComponent(selectedCategory).toLowerCase().trim();
      list = list.filter((p: any) => {
        if (!p.category) return false;
        const catSlug = (typeof p.category === 'object' ? p.category.slug : p.category || '').toLowerCase().trim();
        const catId = (typeof p.category === 'object' ? p.category._id : p.category || '').toString().trim();
        const catName = (typeof p.category === 'object' ? p.category.name : '').toLowerCase().trim();
        return (
          catSlug === decodedSel ||
          catId === decodedSel ||
          catName === decodedSel ||
          catSlug === selectedCategory.toLowerCase().trim()
        );
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p: any) => p.name?.toLowerCase().includes(q));
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  // Memoized Category Image Map
  const categoryImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p: any) => {
      if (!p.images || p.images.length === 0) return;
      const catSlug = (typeof p.category === 'object' ? p.category?.slug : p.category || '').toLowerCase().trim();
      const catId = (typeof p.category === 'object' ? p.category?._id : p.category || '').toString().trim();
      const catName = (typeof p.category === 'object' ? p.category?.name : '').toLowerCase().trim();

      const img = p.images[0];
      if (catSlug && !map[catSlug]) map[catSlug] = img;
      if (catId && !map[catId]) map[catId] = img;
      if (catName && !map[catName]) map[catName] = img;
    });
    return map;
  }, [products]);


  return (
    <div className={styles.page}>
      {/* 1. OPTIMIZED STORE HEADER (MEMOIZED & DEBOUNCED SEARCH) */}
      <StoreHeader
        logoUrl={theme?.pageTitles?.logoUrl}
        logoText={theme?.pageTitles?.logoText || 'ShopTik'}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className={styles.scrollContent}>
        {/* Top Scrolling Banner Notice */}
        <BannerNotice />

        {/* ===== TAB 0: TRANG CHỦ (SHOPEE STYLE) ===== */}
        {activeTab === 0 && (
          <div>
            {/* HERO BANNER CAROUSEL (ISOLATED 4S TIMER) */}
            <HeroBannerCarousel
              banners={heroBanners}
              onNavigateToProducts={handleNavigateToProducts}
            />

            {/* SHOPEE 8-ICON QUICK ACTION HUB (MEMOIZED) */}
            <QuickHub
              onScrollToFlashSale={handleScrollToFlashSale}
              onSelectQuickFilter={handleQuickFilter}
              onNavigateToProducts={handleNavigateToProducts}
            />

            {/* SHOPEE FLASH SALE WITH LIVE COUNTDOWN & SLOTS (ISOLATED 1S TIMER) */}
            <FlashSaleSection
              flashSaleConfig={flashSaleConfig}
              onSeeAll={() => handleQuickFilter(1, false)}
              sectionRef={flashSaleRef}
            />

            {/* SHOPEE CATEGORIES SHOWCASE (MEMOIZED) */}
            <HomeCategoryShowcase
              categories={categories}
              categoryImageMap={categoryImageMap}
              onCategorySelect={handleCategorySelect}
              onSeeAll={handleNavigateToCategories}
            />

            {/* VOUCHER COLLECTION BAR */}
            <VoucherCollectionBar />

            {/* SHOPEE MALL / TRUST COMMITMENTS (STATIC MEMOIZED) */}
            <TrustCommitmentBar />

            {/* SHOP PROFILE CARD (MEMOIZED) */}
            <ShopProfileCard
              shopDisplayName={shopDisplayName}
              logoUrl={theme?.pageTitles?.logoUrl}
              avatarInitials={avatarInitials}
              socialLinks={theme?.socialLinks}
            />

            {/* SHOPEE "GỢI Ý HÔM NAY" (DAILY DISCOVER FEED) */}
            <DailyDiscoverFeed
              products={products}
              loading={loading}
              activeFilter={activeFilter}
              priceSortAsc={priceSortAsc}
              onFilterClick={handleFilterClick}
              onQuickAdd={handleQuickAdd}
            />
          </div>
        )}

        {/* ===== TAB 1: SẢN PHẨM (GRID & LIST VIEW) ===== */}
        {activeTab === 1 && (
          <div>
            {/* Active Filter Indicators */}
            {(selectedCategory !== 'all' || searchQuery.trim()) && (
              <div
                style={{
                  padding: '8px 14px',
                  background: 'var(--bg-card, #13161f)',
                  borderBottom: '1px solid var(--border-color, #232838)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                <span>
                  Đang lọc:{' '}
                  {selectedCategory !== 'all' && (
                    <strong style={{ color: 'var(--primary, #3b82f6)', marginRight: 6 }}>
                      [{categories.find((c) => c.slug === selectedCategory || c._id === selectedCategory || c.name === selectedCategory)?.name || selectedCategory}]
                    </strong>
                  )}
                  {searchQuery.trim() && (
                    <strong style={{ color: '#ffd839' }}>"{searchQuery}"</strong>
                  )}
                  {' '}({displayedFilteredProducts.length} sản phẩm)
                </span>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary, #3b82f6)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    router.push('/?tab=products');
                    fetchProductsByParams(activeFilter, priceSortAsc, '', 'all');
                  }}
                >
                  Xóa lọc ✕
                </button>
              </div>
            )}

            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <div className={styles.filterPills}>
                {FILTER_PILLS.map((pill, i) => (
                  <button
                    key={i}
                    className={`${styles.filterPill} ${activeFilter === i ? styles.filterActive : ''}`}
                    onClick={() => handleFilterClick(i)}
                  >
                    {pill} {i === 4 ? (priceSortAsc ? '↑' : '↓') : ''}
                  </button>
                ))}
              </div>

              <div className={styles.viewToggle}>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Xem lưới"
                  aria-label="Xem dạng lưới"
                >
                  <FiGrid size={15} />
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Xem danh sách"
                  aria-label="Xem dạng danh sách"
                >
                  <FiList size={15} />
                </button>
              </div>
            </div>

            {/* LIST OR GRID VIEW */}
            {loading ? (
              <StoreLoading text="Đang tải danh sách sản phẩm..." />
            ) : viewMode === 'list' ? (
              <>
                <div className={styles.productList}>
                  {displayedFilteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                      {activeFilter === 1 ? (
                        <>
                          <div style={{ fontSize: '32px', marginBottom: 8 }}>⚡</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main, #f8fafc)', marginBottom: 6 }}>
                            Hiện chưa có khung giờ Flash Sale nào đang diễn ra
                          </div>
                          <div style={{ fontSize: '13px' }}>
                            Vui lòng quay lại vào khung giờ Flash Sale tiếp theo để săn ưu đãi giá sốc nhé!
                          </div>
                        </>
                      ) : (
                        <div>Không tìm thấy sản phẩm nào phù hợp</div>
                      )}
                    </div>
                  ) : (
                    displayedFilteredProducts.slice(0, tab1VisibleLimit).map((item: any, i: number) => (
                      <StoreProductCard
                        key={item._id || i}
                        product={item}
                        viewMode="list"
                        onQuickAdd={handleQuickAdd}
                      />
                    ))
                  )}
                </div>

                {displayedFilteredProducts.length > tab1VisibleLimit && (
                  <div style={{ textAlign: 'center', margin: '16px 0 24px' }}>
                    <button
                      type="button"
                      style={{
                        background: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        color: 'var(--text-main, #0f172a)',
                        padding: '9px 24px',
                        borderRadius: '9999px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                      onClick={() => setTab1VisibleLimit((prev) => prev + 16)}
                    >
                      <span>Xem thêm sản phẩm ({displayedFilteredProducts.length - tab1VisibleLimit}+)</span>
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.productGrid} style={{ padding: 10 }}>
                  {displayedFilteredProducts.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                      {activeFilter === 1 ? (
                        <>
                          <div style={{ fontSize: '32px', marginBottom: 8 }}>⚡</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main, #f8fafc)', marginBottom: 6 }}>
                            Hiện chưa có khung giờ Flash Sale nào đang diễn ra
                          </div>
                          <div style={{ fontSize: '13px' }}>
                            Vui lòng quay lại vào khung giờ Flash Sale tiếp theo để săn ưu đãi giá sốc nhé!
                          </div>
                        </>
                      ) : (
                        <div>Không tìm thấy sản phẩm nào phù hợp</div>
                      )}
                    </div>
                  ) : (
                    displayedFilteredProducts.slice(0, tab1VisibleLimit).map((item: any, i: number) => (
                      <StoreProductCard
                        key={item._id || i}
                        product={item}
                        viewMode="grid"
                        onQuickAdd={handleQuickAdd}
                      />
                    ))
                  )}
                </div>

                {displayedFilteredProducts.length > tab1VisibleLimit && (
                  <div style={{ textAlign: 'center', margin: '16px 0 24px' }}>
                    <button
                      type="button"
                      style={{
                        background: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        color: 'var(--text-main, #0f172a)',
                        padding: '9px 24px',
                        borderRadius: '9999px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                      onClick={() => setTab1VisibleLimit((prev) => prev + 16)}
                    >
                      <span>Xem thêm sản phẩm ({displayedFilteredProducts.length - tab1VisibleLimit}+)</span>
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== TAB 2: DANH MỤC ===== */}
        {activeTab === 2 && (
          loading && categories.length === 0 ? (
            <StoreLoading text="Đang tải danh mục..." />
          ) : (
            <div className={styles.categoryContainer}>
              <div className={styles.categoryHeader}>
                <div>
                  <h2 className={styles.categoryTitle}>Danh Mục Sản Phẩm</h2>
                  <p className={styles.categorySubtitle}>
                    Khám phá các dòng sản phẩm chất lượng cao của shop
                  </p>
                </div>
              </div>

              {categories.length > 0 ? (
                <div className={styles.categoryGrid}>
                  {categories.map((cat: any, i: number) => {
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
                        key={cat._id || i}
                        className={styles.categoryCard}
                        onClick={() => handleCategorySelect(cat.slug || cat._id)}
                      >
                        <div className={styles.categoryTitleRow}>
                          <div className={styles.categoryIconWrap} style={{ overflow: 'hidden' }}>
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={cat.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                loading="lazy"
                              />
                            ) : (
                              <FiLayers size={16} />
                            )}
                          </div>
                          <div>
                            <h3 className={styles.categoryName}>{cat.name}</h3>
                            {cat.productCount !== undefined && cat.productCount > 0 && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                                {cat.productCount} sản phẩm
                              </span>
                            )}
                          </div>
                        </div>
                        <FiChevronRight size={14} color="#94a3b8" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.categoryEmpty}>
                  <h3 className={styles.categoryEmptyTitle}>Chưa có danh mục nào</h3>
                  <p className={styles.categoryEmptyText}>
                    Danh mục sản phẩm sẽ tự động hiển thị tại đây khi được thêm từ trang quản trị.
                  </p>
                  <button
                    type="button"
                    className={styles.categoryEmptyBtn}
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setActiveTab(1);
                      router.push('/?tab=products');
                      fetchProductsByParams(0, false, '', 'all');
                    }}
                  >
                    Xem Tất Cả Sản Phẩm
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* ===== PRODUCT DETAIL BOTTOM SHEET MODAL (LAZY LOADED) ===== */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<StoreLoading text="Đang tải cửa hàng..." />}>
      <HomePageContent />
    </Suspense>
  );
}