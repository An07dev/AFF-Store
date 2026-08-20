'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FiSearch,
  FiShare2,
  FiShoppingCart,
  FiChevronRight,
  FiGrid,
  FiList,
  FiTruck,
  FiZap,
  FiAward,
  FiDollarSign,
  FiGift,
  FiMessageSquare,
  FiCheckCircle,
  FiLayers,
  FiPlus,
  FiTrendingUp,
} from 'react-icons/fi';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { useTheme, defaultBanners } from '@/contexts/ThemeContext';
import StoreLoading from '@/components/store/StoreLoading';
import ProductDetailModal from '@/components/store/ProductDetailModal';
import BannerNotice from '@/components/common/BannerNotice';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  rating: number;
  soldCount?: number;
  sold?: number;
  reviewCount: number;
  isFeatured: boolean;
  tags?: string[];
  category?: any;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  productCount?: number;
}

const SHOP_INFO = {
  name: 'ShopTik Store',
  rating: 4.9,
  totalSold: '15.8K',
  followers: '10.2K',
};

const FILTER_PILLS = ['Tất cả', 'Flash Sale 🔥', 'Bán chạy', 'Hàng mới', 'Giá ↕'];



function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
}

function calcDiscount(price: number, salePrice: number) {
  if (!price || !salePrice || price <= salePrice) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

function formatSold(sold?: number) {
  const num = sold ?? 0;
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  return num.toString();
}

function StarRating({ rating, size = 11 }: { rating: number; size?: number }) {
  const safeRating = Math.round(rating || 5);
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= safeRating ? styles.starFilled : styles.starEmpty}
          style={{ fontSize: size }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function HomePageContent() {
  const { cartCount } = useCart();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const catParam = searchParams.get('category');

  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceSortAsc, setPriceSortAsc] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  const flashSaleRef = useRef<HTMLDivElement>(null);

  const shopDisplayName = theme?.pageTitles?.logoText || SHOP_INFO.name;
  const avatarInitials = shopDisplayName ? shopDisplayName.substring(0, 2).toUpperCase() : 'ST';

  const heroBanners = theme?.banners && theme.banners.length > 0 ? theme.banners : defaultBanners;

  // Auto Banner Slide (4 seconds)
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);



  const filterParam = searchParams.get('filter');

  // Sync activeTab, filter and category with URL params
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
      if (catParam) {
        setSelectedCategory(catParam);
        fetchProductsByParams(targetFilter, targetPriceAsc, searchQuery, catParam);
      } else {
        setSelectedCategory('all');
        setSearchQuery('');
        fetchProductsByParams(targetFilter, targetPriceAsc, '', 'all');
      }
    } else if (tabParam === 'categories') {
      setActiveTab(2);
    } else {
      setActiveTab(0);
    }
  }, [tabParam, catParam, filterParam]);

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
  }, []);

  // Fetch initial products and categories (API 2.1 & 3.1)
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        apiFetch('/api/products?limit=40&status=active&sort=popular'),
        apiFetch('/api/categories'),
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);

      if (prodData.success && Array.isArray(prodData.data)) {
        setProducts(prodData.data);
      }
      if (catData.success && Array.isArray(catData.data)) {
        setCategories(catData.data);
      }
    } catch (err) {
      console.error('Error loading products & categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch Products via API 2.1 (GET /api/products)
  const fetchProductsByParams = async (
    filterIndex: number,
    isAsc: boolean,
    query: string,
    categorySlug: string
  ) => {
    try {
      setLoading(true);
      let sort = 'popular';
      if (filterIndex === 1) sort = 'flash-sale';
      else if (filterIndex === 2) sort = 'popular';
      else if (filterIndex === 3) sort = 'newest';
      else if (filterIndex === 4) sort = isAsc ? 'price-asc' : 'price-desc';

      let url = `/api/products?limit=50&status=active&sort=${sort}`;
      if (query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;
      if (categorySlug && categorySlug !== 'all') url += `&category=${encodeURIComponent(categorySlug)}`;

      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        let list = data.data;
        if (filterIndex === 1) {
          list = [...list].sort((a: any, b: any) => {
            const discA = a.salePrice && a.salePrice < a.price ? (a.price - a.salePrice) / a.price : 0;
            const discB = b.salePrice && b.salePrice < b.price ? (b.price - b.salePrice) / b.price : 0;
            return discB - discA;
          });
        } else if (filterIndex === 4) {
          list = [...list].sort((a: any, b: any) => {
            const pA = a.salePrice && a.salePrice > 0 ? a.salePrice : a.price;
            const pB = b.salePrice && b.salePrice > 0 ? b.salePrice : b.price;
            return isAsc ? pA - pB : pB - pA;
          });
        }
        setProducts(list);
      }
    } catch (err) {
      console.error('Error calling /api/products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger API on filter change
  const handleFilterClick = (index: number) => {
    let nextAsc = priceSortAsc;
    if (index === 4 && activeFilter === 4) {
      nextAsc = !priceSortAsc;
      setPriceSortAsc(nextAsc);
    } else {
      setActiveFilter(index);
    }
    fetchProductsByParams(index, nextAsc, searchQuery, selectedCategory);
  };

  // Trigger API on search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab(1); // Switch to products tab
    fetchProductsByParams(activeFilter, priceSortAsc, searchQuery, selectedCategory);
  };

  // Trigger API on category click
  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setActiveTab(1); // Switch to products tab
    router.push(`/?tab=products&category=${encodeURIComponent(catSlug)}`);
    fetchProductsByParams(activeFilter, priceSortAsc, searchQuery, catSlug);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết cửa hàng!');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProductForModal(product);
  };

  // Flash Sale: Lọc và sắp xếp các sản phẩm có % giảm giá cao nhất (giảm dần)
  const flashSaleProducts = [...products]
    .filter((p) => p.salePrice && p.salePrice < p.price)
    .sort((a, b) => {
      const discountA = calcDiscount(a.price, a.salePrice || a.price);
      const discountB = calcDiscount(b.price, b.salePrice || b.price);
      return discountB - discountA;
    })
    .slice(0, 10);
  const displayedFilteredProducts = products;

  return (
    <div className={styles.page}>
      {/* ===== 1. SHOPEE INTEGRATED SEARCH HEADER ===== */}
      <header className={styles.header}>
        <form className={styles.headerSearchForm} onSubmit={handleSearchSubmit}>
          <FiSearch size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.headerSearchInput}
            placeholder="Tìm kiếm sản phẩm, thương hiệu trên shop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => {
                setSearchQuery('');
                fetchProductsByParams(activeFilter, priceSortAsc, '', selectedCategory);
              }}
            >
              ✕
            </button>
          )}
        </form>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.headerIconBtn}
            onClick={() => router.push('/chat')}
            aria-label="Tin nhắn"
            title="Chat với Shop"
          >
            <FiMessageSquare size={18} />
          </button>

          <Link href="/cart" className={styles.headerIconBtn} aria-label="Giỏ hàng" title="Giỏ hàng">
            <FiShoppingCart size={18} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>

          <button
            type="button"
            className={styles.headerIconBtn}
            onClick={handleShare}
            aria-label="Chia sẻ"
            title="Chia sẻ cửa hàng"
          >
            <FiShare2 size={17} />
          </button>
        </div>
      </header>

      {/* ===== SCROLLABLE CONTENT AREA ===== */}
      <div className={styles.scrollContent}>
        {/* Top Scrolling Banner Notice */}
        <BannerNotice />

        {/* ===== TAB CONTENT ===== */}

        {/* 1. TAB 0: TRANG CHỦ (SHOPEE STYLE) */}
        {activeTab === 0 && (
          <div>
            {/* 2. HERO BANNER CAROUSEL */}
            <div className={styles.bannerCarousel}>
              <div
                className={styles.carouselTrack}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {heroBanners.map((slide, idx) => (
                  <div
                    key={idx}
                    className={styles.carouselSlide}
                    onClick={() => {
                      if (slide.link) {
                        router.push(slide.link);
                      } else {
                        setActiveTab(1);
                        router.push('/?tab=products');
                      }
                    }}
                  >
                    <img src={slide.image} alt={slide.title || 'Banner'} className={styles.carouselImg} />
                    {(slide.tag || slide.title) && (
                      <div className={styles.carouselOverlay}>
                        {slide.tag && <span className={styles.carouselTag}>{slide.tag}</span>}
                        {slide.title && <h2 className={styles.carouselTitle}>{slide.title}</h2>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className={styles.carouselDots}>
                {heroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    className={`${styles.dot} ${currentSlide === idx ? styles.activeDot : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 3. SHOPEE 8-ICON QUICK ACTION HUB */}
            <div className={styles.quickHubGrid}>
              <button
                type="button"
                className={styles.quickHubItem}
                onClick={() => {
                  setActiveTab(1);
                  router.push('/?tab=products');
                  fetchProductsByParams(1, false, '', 'all');
                }}
              >
                <div className={`${styles.quickIconWrap} ${styles.iconOrange}`}>
                  <FiTruck />
                </div>
                <span className={styles.quickHubLabel}>Freeship 0Đ</span>
              </button>

              <button
                type="button"
                className={styles.quickHubItem}
                onClick={() => flashSaleRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className={`${styles.quickIconWrap} ${styles.iconYellow}`}>
                  <FiZap />
                </div>
                <span className={styles.quickHubLabel}>Flash Sale</span>
              </button>

              <button
                type="button"
                className={styles.quickHubItem}
                onClick={() => {
                  setActiveTab(1);
                  router.push('/?tab=products');
                  fetchProductsByParams(2, false, '', 'all');
                }}
              >
                <div className={`${styles.quickIconWrap} ${styles.iconRed}`}>
                  <FiTrendingUp />
                </div>
                <span className={styles.quickHubLabel}>Bán Chạy</span>
              </button>

              <button
                type="button"
                className={styles.quickHubItem}
                onClick={() => {
                  setActiveTab(1);
                  router.push('/?tab=products');
                }}
              >
                <div className={`${styles.quickIconWrap} ${styles.iconPink}`}>
                  <FiAward />
                </div>
                <span className={styles.quickHubLabel}>Shopee Mall</span>
              </button>

              <button
                type="button"
                className={styles.quickHubItem}
                onClick={() => {
                  setActiveTab(1);
                  setActiveFilter(4);
                  setPriceSortAsc(true);
                  router.push('/?tab=products&filter=price-asc');
                  fetchProductsByParams(4, true, '', 'all');
                }}
              >
                <div className={`${styles.quickIconWrap} ${styles.iconGreen}`}>
                  <FiDollarSign />
                </div>
                <span className={styles.quickHubLabel}>Gì Cũng Rẻ</span>
              </button>

              <button
                type="button"
                className={styles.quickHubItem}
                onClick={() => {
                  setActiveTab(1);
                  setActiveFilter(4);
                  setPriceSortAsc(true);
                  router.push('/?tab=products&filter=price-asc');
                  fetchProductsByParams(4, true, '', 'all');
                }}
              >
                <div className={`${styles.quickIconWrap} ${styles.iconPurple}`}>
                  <FiGift />
                </div>
                <span className={styles.quickHubLabel}>Deal sốc</span>
              </button>

              <button
                type="button"
                className={styles.quickHubItem}
                onClick={() => router.push('/tracking')}
              >
                <div className={`${styles.quickIconWrap} ${styles.iconCyan}`}>
                  <FiTruck />
                </div>
                <span className={styles.quickHubLabel}>Tra Cứu Đơn</span>
              </button>

              <button
                type="button"
                className={styles.quickHubItem}
                onClick={() => router.push('/chat')}
              >
                <div className={`${styles.quickIconWrap} ${styles.iconBlue}`}>
                  <FiMessageSquare />
                </div>
                <span className={styles.quickHubLabel}>Tư Vấn Shop</span>
              </button>
            </div>

            {/* 4. SHOPEE FLASH SALE */}
            <div ref={flashSaleRef} className={styles.flashSaleSection}>
              <div className={styles.flashHeader}>
                <div className={styles.flashTitleWrap}>
                  <span className={styles.flashLogo}>⚡ FLASH SALE</span>
                </div>
                <button
                  type="button"
                  className={styles.seeAllBtn}
                  onClick={() => {
                    setActiveTab(1);
                    setActiveFilter(1);
                    router.push('/?tab=products&filter=flash-sale');
                    fetchProductsByParams(1, priceSortAsc, searchQuery, selectedCategory);
                  }}
                >
                  Xem tất cả <FiChevronRight size={13} />
                </button>
              </div>

              <div className={styles.flashCarousel}>
                {(loading ? [1, 2, 3, 4] : (flashSaleProducts.length > 0 ? flashSaleProducts : products.slice(0, 6))).map(
                  (item: any, i) => {
                    const discount = item.salePrice && item.salePrice < item.price ? calcDiscount(item.price, item.salePrice) : 0;
                    const soldPercent = Math.min(95, Math.max(20, ((i + 3) * 15) % 100));
                    return (
                      <Link
                        href={loading ? '#' : `/product/${item.slug}`}
                        key={i}
                        className={styles.flashCard}
                      >
                        <div className={styles.flashImgWrap}>
                          {loading ? (
                            <div className={styles.skeleton} />
                          ) : (
                            <img
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                              alt={item.name || ''}
                              className={styles.flashImg}
                            />
                          )}
                          {discount > 0 && (
                            <div className={styles.shopeeDiscountFlag}>
                              -{discount}%
                            </div>
                          )}
                        </div>
                        <div className={styles.flashInfo}>
                          <div className={styles.flashPrice}>
                            {loading ? '...' : formatPrice(item.salePrice || item.price)}
                          </div>
                          {item.salePrice && item.salePrice < item.price && (
                            <div className={styles.flashOldPrice}>
                              {formatPrice(item.price)}
                            </div>
                          )}
                          <div className={styles.fireProgressBar}>
                            <div
                              className={styles.fireFill}
                              style={{ width: `${soldPercent}%` }}
                            />
                            <span className={styles.fireText}>
                              🔥 Đã bán {formatSold(item.soldCount ?? item.sold ?? 0)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            </div>

            {/* 5. SHOPEE MALL / TRUST COMMITMENTS */}
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

            {/* 6. SHOP PROFILE CARD */}
            <div className={styles.shopCard}>
              <div className={styles.shopLeft}>
                <div className={styles.shopAvatar}>
                  {theme?.pageTitles?.logoUrl ? (
                    <img
                      src={theme.pageTitles.logoUrl}
                      alt={shopDisplayName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                    />
                  ) : (
                    avatarInitials
                  )}
                </div>
                <div className={styles.shopInfo}>
                  <div className={styles.shopNameRow}>
                    <span className={styles.mallBadge}>Mall</span>
                    <span className={styles.shopName}>{shopDisplayName}</span>
                  </div>
                  <div className={styles.shopMeta}>
                    <span>⭐ {SHOP_INFO.rating}</span>
                    <span>•</span>
                    <span>{SHOP_INFO.totalSold} đã bán</span>
                    <span>•</span>
                    <span>{SHOP_INFO.followers} theo dõi</span>
                  </div>
                </div>
              </div>

              <div className={styles.shopRight}>
                {theme.socialLinks?.tiktokUrl && (
                  <a
                    href={theme.socialLinks.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                  >
                    <FaTiktok size={11} /> TikTok
                  </a>
                )}
                {theme.socialLinks?.facebookUrl && (
                  <a
                    href={theme.socialLinks.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                  >
                    <FaFacebook size={11} /> FB
                  </a>
                )}
              </div>
            </div>

            {/* 7. SHOPEE "GỢI Ý HÔM NAY" (DAILY DISCOVER FEED) */}
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
                      onClick={() => handleFilterClick(i)}
                    >
                      {pill} {i === 4 ? (priceSortAsc ? '↑' : '↓') : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Shopee Product Grid */}
              <div className={styles.productGrid}>
                {(loading ? [1, 2, 3, 4, 5, 6] : products).map((item: any, i: number) => {
                  const discount = item.salePrice && item.salePrice < item.price ? calcDiscount(item.price, item.salePrice) : null;
                  return (
                    <Link
                      href={loading ? '#' : `/product/${item.slug}`}
                      key={i}
                      className={styles.shopeeCard}
                    >
                      <div className={styles.cardImgWrap}>
                        {loading ? (
                          <div className={styles.skeleton} />
                        ) : (
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                            alt={item.name || ''}
                            className={styles.cardImg}
                          />
                        )}

                        {/* Badges */}
                        <div className={styles.favoriteBadge}>Yêu Thích+</div>
                        {discount && (
                          <div className={styles.discountBadge}>
                            <span className={styles.discountBadgePercent}>{discount}%</span>
                            <span className={styles.discountBadgeLabel}>GIẢM</span>
                          </div>
                        )}
                        <div className={styles.freeshipBanner}>
                          <FiTruck size={10} /> Freeship XTRA
                        </div>
                      </div>

                      <div className={styles.cardBody}>
                        <div>
                          <p className={styles.cardName}>{loading ? 'Đang tải...' : item.name}</p>
                          <div className={styles.cardPriceRow}>
                            <span className={styles.cardCurrentPrice}>
                              {loading ? '...' : formatPrice(item.salePrice || item.price)}
                            </span>
                            {!loading && item.salePrice && item.salePrice < item.price && (
                              <span className={styles.cardOldPrice}>
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.cardFooter}>
                          <div className={styles.cardRatingWrap}>
                            <StarRating rating={item.rating || 5} />
                            <span className={styles.cardSold}>
                              Đã bán {formatSold(item.soldCount ?? item.sold ?? 0)}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={styles.cardAddBtn}
                            onClick={(e) => handleQuickAdd(e, item)}
                            title="Thêm vào giỏ"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB 1: SẢN PHẨM */}
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
                      [{categories.find((c) => c.slug === selectedCategory || c._id === selectedCategory)?.name || selectedCategory}]
                    </strong>
                  )}
                  {searchQuery.trim() && (
                    <strong style={{ color: '#ffd839' }}>"{searchQuery}"</strong>
                  )}
                  {' '}({products.length} sản phẩm)
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
                >
                  <FiGrid size={15} />
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Xem danh sách"
                >
                  <FiList size={15} />
                </button>
              </div>
            </div>

            {/* LIST OR GRID VIEW */}
            {loading ? (
              <StoreLoading text="Đang tải danh sách sản phẩm..." />
            ) : viewMode === 'list' ? (
              <div className={styles.productList}>
                {displayedFilteredProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    Không tìm thấy sản phẩm nào phù hợp
                  </div>
                ) : (
                  displayedFilteredProducts.map((item: any, i: number) => {
                    const discount = item.salePrice && item.salePrice < item.price ? calcDiscount(item.price, item.salePrice) : null;
                    return (
                      <Link
                        href={`/product/${item.slug}`}
                        key={i}
                        className={styles.listCard}
                      >
                        <div className={styles.listImgWrap}>
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                            alt={item.name || ''}
                            className={styles.listImg}
                          />
                          {discount && (
                            <div className={styles.listDiscountBadge}>
                              -{discount}%
                            </div>
                          )}
                        </div>
                        <div className={styles.listInfo}>
                          <p className={styles.listName}>{item.name}</p>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <StarRating rating={item.rating || 5} />
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                              Đã bán {formatSold(item.soldCount ?? item.sold ?? 0)}
                            </span>
                          </div>
                          <div className={styles.listPriceRow}>
                            <span className={styles.listPrice}>
                              {formatPrice(item.salePrice || item.price)}
                            </span>
                            {item.salePrice && item.salePrice < item.price && (
                              <span className={styles.listOldPrice}>{formatPrice(item.price)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.buyBtn}
                          onClick={(e) => handleQuickAdd(e, item)}
                        >
                          <FiShoppingCart size={13} />
                          <span>Mua</span>
                        </button>
                      </Link>
                    );
                  })
                )}
              </div>
            ) : (
              <div className={styles.productGrid} style={{ padding: 10 }}>
                {displayedFilteredProducts.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    Không tìm thấy sản phẩm nào phù hợp
                  </div>
                ) : (
                  displayedFilteredProducts.map((item: any, i: number) => {
                    const discount = item.salePrice && item.salePrice < item.price ? calcDiscount(item.price, item.salePrice) : null;
                    return (
                      <Link
                        href={`/product/${item.slug}`}
                        key={i}
                        className={styles.shopeeCard}
                      >
                        <div className={styles.cardImgWrap}>
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                            alt={item.name || ''}
                            className={styles.cardImg}
                          />
                          <div className={styles.favoriteBadge}>Yêu Thích+</div>
                          {discount && (
                            <div className={styles.discountBadge}>
                              <span className={styles.discountBadgePercent}>{discount}%</span>
                              <span className={styles.discountBadgeLabel}>GIẢM</span>
                            </div>
                          )}
                          <div className={styles.freeshipBanner}>
                            <FiTruck size={10} /> Freeship XTRA
                          </div>
                        </div>

                        <div className={styles.cardBody}>
                          <div>
                            <p className={styles.cardName}>{item.name}</p>
                            <div className={styles.cardPriceRow}>
                              <span className={styles.cardCurrentPrice}>
                                {formatPrice(item.salePrice || item.price)}
                              </span>
                              {item.salePrice && item.salePrice < item.price && (
                                <span className={styles.cardOldPrice}>
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles.cardFooter}>
                            <div className={styles.cardRatingWrap}>
                              <StarRating rating={item.rating || 5} />
                              <span className={styles.cardSold}>
                                Đã bán {formatSold(item.soldCount ?? item.sold ?? 0)}
                              </span>
                            </div>
                            <button
                              type="button"
                              className={styles.cardAddBtn}
                              onClick={(e) => handleQuickAdd(e, item)}
                              title="Thêm vào giỏ"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. TAB 2: DANH MỤC */}
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
                <span className={styles.categoryTotalBadge}>
                  {categories.length} danh mục
                </span>
              </div>

              {categories.length > 0 ? (
                <div className={styles.categoryGrid}>
                  {categories.map((cat, i) => (
                    <div
                      key={cat._id || i}
                      className={styles.categoryCard}
                      onClick={() => handleCategorySelect(cat.slug || cat._id)}
                    >
                      <div className={styles.categoryTitleRow}>
                        <div className={styles.categoryIconWrap}>
                          <FiLayers size={16} />
                        </div>
                        <h3 className={styles.categoryName}>{cat.name}</h3>
                      </div>
                      <FiChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
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

      {/* ===== PRODUCT DETAIL BOTTOM SHEET MODAL ===== */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />
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