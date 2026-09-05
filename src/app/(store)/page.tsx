'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiGrid, FiList, FiChevronRight, FiChevronLeft, FiChevronDown, FiMessageSquare, FiLayers } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useTheme, defaultBanners, defaultSubBanners } from '@/contexts/ThemeContext';
import StoreLoading from '@/components/store/StoreLoading';
import BannerNotice from '@/components/common/BannerNotice';
import VoucherCollectionBar from '@/components/store/VoucherCollectionBar';
import { apiFetch } from '@/lib/api';
import { clientCache } from '@/lib/clientCache';
import StoreHeader from '@/components/store/home/StoreHeader';
import HeroBannerCarousel from '@/components/store/home/HeroBannerCarousel';
import FlashSaleSection from '@/components/store/home/FlashSaleSection';
import HomeCategoryShowcase from '@/components/store/home/HomeCategoryShowcase';
import TrustCommitmentBar from '@/components/store/home/TrustCommitmentBar';
import ShopProfileCard from '@/components/store/home/ShopProfileCard';
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
  image?: string;
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

const FILTER_PILLS = ['Tất cả', 'Flash Sale 🔥', 'Bán chạy', 'Hàng mới', 'Giá ↕'];

function HomePageContent() {
  const { cartCount } = useCart();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const catParam = searchParams.get('category');
  const filterParam = searchParams.get('filter');

  const [activeNavTab, setActiveNavTab] = useState<'home' | 'products' | string>('home');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceSortAsc, setPriceSortAsc] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false);
  const seeMoreRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLElement>(null);
  const [visibleCatCount, setVisibleCatCount] = useState<number>(categories.length);

  // Incremental "Xem Thêm" State for RECOMMENDED FOR YOU & Products (18 products per batch = 3 full rows)
  const PAGE_SIZE = 18;
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const recommendedSectionRef = useRef<HTMLElement>(null);
  const productsTabRef = useRef<HTMLDivElement>(null);

  const displayedProducts = useMemo(() => {
    return products.slice(0, displayCount);
  }, [products, displayCount]);

  const hasMore = displayCount < products.length;

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  }, []);

  // Dynamically calculate how many category tabs fit inside the nav bar box
  useEffect(() => {
    function updateVisibleTabs() {
      if (!navBarRef.current || !categories || categories.length === 0) {
        setVisibleCatCount(categories?.length || 0);
        return;
      }

      const navWidth = navBarRef.current.clientWidth;
      if (navWidth <= 0) return;

      const isMobile = window.innerWidth < 600;
      // Base width: Home + All Products + padding
      let currentWidth = isMobile ? 150 : 224;
      const seeMoreBtnWidth = isMobile ? 65 : 90;
      let count = 0;

      // Check if ALL categories can fit directly without the "Thêm" button
      let totalAllWidth = currentWidth;
      for (const cat of categories) {
        const tabWidth = isMobile
          ? Math.max(50, (cat.name?.length || 5) * 7.5 + 20)
          : Math.max(65, (cat.name?.length || 5) * 8.5 + 36);
        totalAllWidth += tabWidth;
      }

      if (totalAllWidth <= navWidth - 10) {
        // Everything fits! No "Thêm" button needed
        setVisibleCatCount(categories.length);
        return;
      }

      // Otherwise, calculate how many fit while reserving space for "Thêm ▾"
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const tabWidth = isMobile
          ? Math.max(50, (cat.name?.length || 5) * 7.5 + 20)
          : Math.max(65, (cat.name?.length || 5) * 8.5 + 36);

        if (currentWidth + tabWidth + seeMoreBtnWidth <= navWidth - 10) {
          currentWidth += tabWidth;
          count++;
        } else {
          break;
        }
      }

      setVisibleCatCount(Math.max(1, count));
    }

    updateVisibleTabs();
    window.addEventListener('resize', updateVisibleTabs);
    return () => window.removeEventListener('resize', updateVisibleTabs);
  }, [categories]);

  // Close dropdown on outside click or touch
  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (seeMoreRef.current && !seeMoreRef.current.contains(e.target as Node)) {
        setIsSeeMoreOpen(false);
      }
    }
    if (isSeeMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isSeeMoreOpen]);

  // Flash Sale State
  const [flashSaleConfig, setFlashSaleConfig] = useState<any>(null);
  const flashSaleRef = useRef<HTMLDivElement>(null);

  const shopDisplayName = theme?.pageTitles?.logoText || 'Shop Của Tôi';
  const avatarInitials = shopDisplayName ? shopDisplayName.substring(0, 2).toUpperCase() : 'ST';
  const heroBanners = theme?.banners && theme.banners.length > 0 ? theme.banners : defaultBanners;
  const subBanners = theme?.subBanners && theme.subBanners.length > 0 ? theme.subBanners : defaultSubBanners;

  // 1. Fetch Flash Sale
  useEffect(() => {
    async function loadFlashSale() {
      try {
        const data = await clientCache.fetchWithCache(
          'public_flash_sale_config',
          async () => {
            const res = await apiFetch('/api/flash-sale');
            return await res.json();
          },
          30000
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

  // 2. Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await clientCache.fetchWithCache(
          'public_categories_list',
          async () => {
            const res = await apiFetch('/api/categories');
            return await res.json();
          },
          60000
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

  // 3. Fetch Products
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
        let sort = 'popular';
        if (filterIndex === 2) sort = 'popular';
        else if (filterIndex === 3) sort = 'newest';
        else if (filterIndex === 4) sort = isAsc ? 'price-asc' : 'price-desc';

        let url = `/api/products?limit=120&status=active&sort=${sort}`;
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

  // 4. Sync state with URL params
  useEffect(() => {
    if (tabParam === 'products') {
      setActiveNavTab('products');
      let targetFilter = activeFilter;
      let targetPriceAsc = priceSortAsc;
      if (filterParam === 'flash-sale') {
        targetFilter = 1;
        setActiveFilter(1);
      }
      const targetCategory = catParam || 'all';
      setSelectedCategory(targetCategory);
      fetchProductsByParams(targetFilter, targetPriceAsc, searchQuery, targetCategory);
    } else if (tabParam === 'categories') {
      setActiveNavTab('categories');
      setSelectedCategory('all');
    } else if (catParam) {
      setActiveNavTab(catParam);
      setSelectedCategory(catParam);
      fetchProductsByParams(activeFilter, priceSortAsc, searchQuery, catParam);
    } else {
      setActiveNavTab('home');
      setSelectedCategory('all');
      fetchProductsByParams(0, false, '', 'all');
    }
  }, [tabParam, catParam, filterParam, fetchProductsByParams]);

  // Listen to reset events from BottomNav
  useEffect(() => {
    const handleResetHome = () => {
      setActiveNavTab('home');
      setSelectedCategory('all');
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchProductsByParams(0, false, '', 'all');
    };
    const handleResetProducts = () => {
      setActiveNavTab('products');
      setSelectedCategory('all');
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchProductsByParams(0, false, '', 'all');
    };

    window.addEventListener('reset-store-home', handleResetHome);
    window.addEventListener('reset-product-filters', handleResetProducts);
    return () => {
      window.removeEventListener('reset-store-home', handleResetHome);
      window.removeEventListener('reset-product-filters', handleResetProducts);
    };
  }, [fetchProductsByParams]);

  const handleSearchSubmit = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setDisplayCount(PAGE_SIZE);
      setActiveNavTab('products');
      fetchProductsByParams(activeFilter, priceSortAsc, query, selectedCategory);
    },
    [activeFilter, priceSortAsc, selectedCategory, fetchProductsByParams]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDisplayCount(PAGE_SIZE);
    fetchProductsByParams(activeFilter, priceSortAsc, '', selectedCategory);
  }, [activeFilter, priceSortAsc, selectedCategory, fetchProductsByParams]);

  const handleCategoryTabClick = useCallback(
    (catSlug: string) => {
      setDisplayCount(PAGE_SIZE);
      if (catSlug === 'home') {
        setActiveNavTab('home');
        setSelectedCategory('all');
        router.push('/');
        fetchProductsByParams(0, false, searchQuery, 'all');
      } else if (catSlug === 'all') {
        setActiveNavTab('products');
        setSelectedCategory('all');
        router.push('/?tab=products');
        fetchProductsByParams(activeFilter, priceSortAsc, searchQuery, 'all');
      } else if (catSlug === 'categories') {
        setActiveNavTab('categories');
        setSelectedCategory('all');
        router.push('/?tab=categories');
      } else {
        setActiveNavTab(catSlug);
        setSelectedCategory(catSlug);
        router.push(`/?tab=products&category=${encodeURIComponent(catSlug)}`);
        fetchProductsByParams(activeFilter, priceSortAsc, searchQuery, catSlug);
      }
    },
    [router, activeFilter, priceSortAsc, searchQuery, fetchProductsByParams]
  );

  const handleFilterClick = useCallback(
    (index: number) => {
      setDisplayCount(PAGE_SIZE);
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
      setDisplayCount(PAGE_SIZE);
      setActiveNavTab('products');
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
    <div className={styles.shopeePageContainer}>
      {/* 1. SHOPEE TOPBAR & SEARCH HEADER */}
      <StoreHeader
        logoUrl={theme?.pageTitles?.logoUrl}
        logoText={theme?.pageTitles?.logoText || 'Shopee'}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />

      {/* 2. MAIN CENTERED CONTAINER (MAX-WIDTH 1200PX) */}
      <main className={styles.shopeeMainContent}>
        {/* Top Notice */}
        <BannerNotice />

        {/* 3. SHOPEE SHOP PROFILE HEADER CARD */}
        <ShopProfileCard
          shopDisplayName={shopDisplayName}
          logoUrl={theme?.pageTitles?.logoUrl}
          avatarInitials={avatarInitials}
          productCount={products.length || 4}
          coverImages={heroBanners.map((b) => b.image).filter(Boolean)}
          coverImage={heroBanners[0]?.image}
          socialLinks={theme?.socialLinks}
        />

        {/* 4. SHOPEE SHOP NAVIGATION TABS BAR (WITH DYNAMIC SEE MORE) */}
        {(() => {
          const visibleCats = categories.slice(0, visibleCatCount);
          const overflowCats = categories.slice(visibleCatCount);
          const activeOverflowCat = overflowCats.find((c) => c.slug === selectedCategory);
          const isOverflowActive = Boolean(activeNavTab === 'products' && activeOverflowCat);

          return (
            <nav ref={navBarRef} className={styles.shopeeShopNavBar}>
              <button
                type="button"
                className={`${styles.shopeeNavTab} ${activeNavTab === 'home' ? styles.shopeeNavTabActive : ''}`}
                onClick={() => handleCategoryTabClick('home')}
              >
                Home
              </button>
              <button
                type="button"
                className={`${styles.shopeeNavTab} ${activeNavTab === 'products' && selectedCategory === 'all' ? styles.shopeeNavTabActive : ''}`}
                onClick={() => handleCategoryTabClick('all')}
              >
                All Products
              </button>

              {/* Directly visible category tabs */}
              {visibleCats.map((cat) => (
                <button
                  key={cat._id || cat.slug}
                  type="button"
                  className={`${styles.shopeeNavTab} ${activeNavTab === 'products' && selectedCategory === cat.slug ? styles.shopeeNavTabActive : ''}`}
                  onClick={() => handleCategoryTabClick(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}

              {/* See More (Thêm ▾) Dropdown ONLY when categories approach/exceed card box width */}
              {overflowCats.length > 0 && (
                <div
                  ref={seeMoreRef}
                  className={styles.seeMoreDropdownWrap}
                  onMouseEnter={() => {
                    if (typeof window !== 'undefined' && window.innerWidth >= 600) {
                      setIsSeeMoreOpen(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (typeof window !== 'undefined' && window.innerWidth >= 600) {
                      setIsSeeMoreOpen(false);
                    }
                  }}
                >
                  <button
                    type="button"
                    className={`${styles.shopeeNavTab} ${isOverflowActive ? styles.shopeeNavTabActive : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsSeeMoreOpen((prev) => !prev);
                    }}
                    aria-expanded={isSeeMoreOpen}
                  >
                    <span>{activeOverflowCat ? activeOverflowCat.name : 'Thêm'}</span>
                    <FiChevronDown
                      size={13}
                      style={{
                        transform: isSeeMoreOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>

                  {isSeeMoreOpen && (
                    <div
                      className={styles.seeMoreMenu}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {overflowCats.map((cat) => (
                        <button
                          key={cat._id || cat.slug}
                          type="button"
                          className={`${styles.seeMoreMenuItem} ${selectedCategory === cat.slug && activeNavTab === 'products' ? styles.seeMoreMenuItemActive : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCategoryTabClick(cat.slug);
                            setIsSeeMoreOpen(false);
                          }}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>
          );
        })()}

        {/* 5. TAB VIEW 1: HOME (DẠO SHOP) */}
        {activeNavTab === 'home' && (
          <div className={styles.shopeeHomeSections}>
            {/* 1. HERO BANNER CAROUSEL */}
            <HeroBannerCarousel
              banners={heroBanners}
              subBanners={subBanners}
              onNavigateToProducts={() => handleCategoryTabClick('all')}
            />

            {/* 2. VOUCHER COLLECTION BAR (NGAY DƯỚI BANNER) */}
            <VoucherCollectionBar />

            {/* 3. SHOPEE FLASH SALE */}
            <FlashSaleSection
              flashSaleConfig={flashSaleConfig}
              onSeeAll={() => handleQuickFilter(1, false)}
              sectionRef={flashSaleRef}
            />

            {/* 4. SHOPEE CATEGORIES SHOWCASE */}
            <HomeCategoryShowcase
              categories={categories}
              categoryImageMap={categoryImageMap}
              onCategorySelect={handleCategoryTabClick}
              onSeeAll={() => handleCategoryTabClick('categories')}
            />

            {/* SHOPEE TRUST COMMITMENTS */}
            <TrustCommitmentBar />

            {/* RECOMMENDED FOR YOU (GỢI Ý CHO BẠN - 6 COLUMNS GRID) */}
            <section ref={recommendedSectionRef} className={styles.shopeeRecommendedSection}>
              <div className={styles.shopeeSectionHeader}>
                <h2 className={styles.shopeeSectionTitle}>Gợi ý dành cho bạn</h2>
                <button
                  type="button"
                  className={styles.shopeeSeeAllBtn}
                  onClick={() => handleCategoryTabClick('all')}
                >
                  <span>See All</span>
                  <FiChevronRight size={14} />
                </button>
              </div>

              <div className={styles.shopee6ColGrid}>
                {loading ? (
                  <StoreLoading text="Đang tải sản phẩm..." />
                ) : displayedProducts.length === 0 ? (
                  <div className={styles.emptyState}>Không có sản phẩm nào</div>
                ) : (
                  displayedProducts.map((item, i) => (
                    <StoreProductCard
                      key={item._id || i}
                      product={item}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))
                )}
              </div>

              {/* SHOPEE LOAD MORE "XEM THÊM" BUTTON */}
              {!loading && products.length > 0 && (
                <div className={styles.shopeeLoadMoreContainer}>
                  {hasMore ? (
                    <button
                      type="button"
                      className={styles.shopeeLoadMoreBtn}
                      onClick={handleLoadMore}
                    >
                      <span>Xem Thêm</span>
                      <FiChevronDown size={16} />
                    </button>
                  ) : products.length > PAGE_SIZE ? (
                    <div className={styles.shopeeAllLoadedText}>
                      <span>✓ Đã hiển thị tất cả {products.length} sản phẩm</span>
                    </div>
                  ) : null}
                </div>
              )}
            </section>

            {/* SHOP DESCRIPTION / INTRODUCTION CARD */}
            <div className={styles.shopeeShopIntroCard}>
              <p>
                Chào các bạn! <strong>{shopDisplayName}</strong> rất hân hạnh được phục vụ trải nghiệm mua sắm cùng các bạn &lt;3
              </p>
              <p>
                {shopDisplayName} chuyên cung cấp các sản phẩm thời trang cao cấp, trẻ trung, cá tính theo xu hướng hiện đại. Rất mong được các bạn ủng hộ ^^
              </p>
            </div>
          </div>
        )}

        {/* 6. TAB VIEW 3: CATEGORIES VIEW */}
        {activeNavTab === 'categories' && (
          <div className={styles.shopeeCategoriesTabContainer}>
            <div className={styles.categoriesPageHeader}>
              <div className={styles.categoriesPageHeaderLeft}>
                <div className={styles.categoriesHeaderIconWrap}>
                  <FiLayers size={20} />
                </div>
                <div>
                  <h2 className={styles.categoriesPageTitle}>Danh Mục Sản Phẩm</h2>
                  <p className={styles.categoriesPageSubtitle}>
                    Tất cả {categories.length} danh mục sản phẩm của shop
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.categoriesPageGrid}>
              {categories.map((cat, idx) => {
                const gradient = iconGradients[idx % iconGradients.length];
                const catSlug = (cat.slug || '').toLowerCase().trim();
                const catId = (cat._id || '').toString().trim();
                const catName = (cat.name || '').toLowerCase().trim();
                const displayImage =
                  categoryImageMap[catId] ||
                  categoryImageMap[catSlug] ||
                  categoryImageMap[catName] ||
                  cat.image;

                return (
                  <div
                    key={cat._id || idx}
                    className={styles.categoryPageCard}
                    onClick={() => handleCategoryTabClick(cat.slug || cat._id)}
                  >
                    <div
                      className={styles.categoryPageImgWrap}
                      style={!displayImage ? { background: gradient } : undefined}
                    >
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 600px) 33vw, 200px"
                          className={styles.categoryPageImg}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.categoryPageFallbackIcon}>
                          <FiLayers size={26} />
                        </span>
                      )}
                    </div>
                    <div className={styles.categoryPageInfo}>
                      <span className={styles.categoryPageName}>{cat.name}</span>
                      <span className={styles.categoryPageCount}>
                        {cat.productCount !== undefined && cat.productCount > 0
                          ? `${cat.productCount} sản phẩm`
                          : 'Xem ngay →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. TAB VIEW 2: ALL PRODUCTS / CATEGORY FILTER */}
        {activeNavTab !== 'home' && activeNavTab !== 'categories' && (
          <div ref={productsTabRef} className={styles.shopeeProductsTabContainer}>
            {/* Filter Pills Bar */}
            <div className={styles.shopeeFilterBar}>
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
                  aria-label="Xem lưới"
                >
                  <FiGrid size={15} />
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Xem danh sách"
                  aria-label="Xem danh sách"
                >
                  <FiList size={15} />
                </button>
              </div>
            </div>

            {/* Products List/Grid */}
            {loading ? (
              <StoreLoading text="Đang tải danh sách sản phẩm..." />
            ) : viewMode === 'list' ? (
              <div className={styles.productList}>
                {displayedProducts.length === 0 ? (
                  <div className={styles.emptyState}>Không tìm thấy sản phẩm nào phù hợp</div>
                ) : (
                  displayedProducts.map((item, i) => (
                    <StoreProductCard
                      key={item._id || i}
                      product={item}
                      viewMode="list"
                      onQuickAdd={handleQuickAdd}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className={styles.shopee6ColGrid}>
                {displayedProducts.length === 0 ? (
                  <div className={styles.emptyState}>Không tìm thấy sản phẩm nào phù hợp</div>
                ) : (
                  displayedProducts.map((item, i) => (
                    <StoreProductCard
                      key={item._id || i}
                      product={item}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))
                )}
              </div>
            )}

            {/* Load More Button for Products Tab */}
            {!loading && products.length > 0 && (
              <div className={styles.shopeeLoadMoreContainer}>
                {hasMore ? (
                  <button
                    type="button"
                    className={styles.shopeeLoadMoreBtn}
                    onClick={handleLoadMore}
                  >
                    <span>Xem Thêm</span>
                    <FiChevronDown size={16} />
                  </button>
                ) : products.length > PAGE_SIZE ? (
                  <div className={styles.shopeeAllLoadedText}>
                    <span>✓ Đã hiển thị tất cả {products.length} sản phẩm</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 7. BOTTOM RIGHT FLOATING SHOPEE CHAT BUTTON */}
      <button
        type="button"
        className={styles.shopeeFloatingChatBtn}
        onClick={() => router.push('/chat')}
        aria-label="Chat với Shop"
      >
        <FiMessageSquare size={18} />
        <span>Chat</span>
      </button>

      {/* Bottom Sheet Quick Add Modal */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}
    </div>
  );
}

export default function StoreHomePage() {
  return (
    <Suspense fallback={<StoreLoading text="Đang tải Shopee Mall..." />}>
      <HomePageContent />
    </Suspense>
  );
}