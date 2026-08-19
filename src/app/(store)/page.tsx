'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FiChevronLeft,
  FiSearch,
  FiShare2,
  FiShoppingCart,
  FiChevronRight,
  FiGrid,
  FiList,
  FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import StoreLoading from '@/components/store/StoreLoading';
import ProductDetailModal from '@/components/store/ProductDetailModal';
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
  sold: number;
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
  rating: 4.8,
  totalSold: '12.5K',
  followers: '8.2K',
};

const FILTER_PILLS = ['Đề xuất', 'Bán chạy', 'Hàng mới ra mắt', 'Giá ↕'];

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

function formatSold(sold: number) {
  if (!sold) return '0';
  if (sold >= 1000) return (sold / 1000).toFixed(1).replace('.0', '') + 'K';
  return sold.toString();
}

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
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
  const { cartCount, addToCart, openDrawer } = useCart();
  const { theme } = useTheme();
  const { user, openAuthModal } = useCustomerAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [priceSortAsc, setPriceSortAsc] = useState(false);

  // Sync activeTab with URL tabParam
  useEffect(() => {
    if (tabParam === 'products') {
      setActiveTab(1);
    } else if (tabParam === 'categories') {
      setActiveTab(2);
    } else {
      setActiveTab(0);
    }
  }, [tabParam]);

  // Interactivity states
  const [isFollowed, setIsFollowed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);

  const tabsRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState('all');

  const shopDisplayName = theme?.pageTitles?.logoText || SHOP_INFO.name;
  const avatarInitials = shopDisplayName ? shopDisplayName.substring(0, 2).toUpperCase() : 'ST';

  // Fetch initial products and categories (API 2.1 & 3.1)
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        apiFetch('/api/products?limit=30&status=active&sort=popular'),
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
      if (filterIndex === 1) sort = 'popular';
      else if (filterIndex === 2) sort = 'newest';
      else if (filterIndex === 3) sort = isAsc ? 'price-asc' : 'price-desc';

      let url = `/api/products?limit=30&status=active&sort=${sort}`;
      if (query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;
      if (categorySlug && categorySlug !== 'all') url += `&category=${encodeURIComponent(categorySlug)}`;

      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
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
    if (index === 3 && activeFilter === 3) {
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

  const topProducts = products.slice(0, 5);
  const hotDeals = products.filter((p) => p.salePrice && p.salePrice < p.price).slice(0, 6);
  const recommended = products.slice(0, 12);
  const displayedFilteredProducts = products;

  return (
    <div className={styles.page}>
      {/* ===== HEADER ===== */}
      <header className={styles.header}>
        <button
          className={styles.headerBtn}
          onClick={() => window.history.back()}
          aria-label="Quay lại"
        >
          <FiChevronLeft size={22} />
        </button>

        <div className={styles.headerTitle}>{shopDisplayName}</div>

        <div className={styles.headerRight}>
          <button
            className={styles.headerBtn}
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Tìm kiếm"
          >
            <FiSearch size={20} />
          </button>
          <button className={styles.headerBtn} onClick={handleShare} aria-label="Chia sẻ">
            <FiShare2 size={20} />
          </button>
          <Link href="/cart" className={styles.headerBtn} aria-label="Giỏ hàng">
            <FiShoppingCart size={20} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
        </div>
      </header>

      {/* ===== EXPANDABLE SEARCH BAR ===== */}
      {showSearch && (
        <form className={styles.searchExpand} onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm trong shop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className={styles.headerBtn}
            style={{ color: 'var(--primary, #00BFA5)', flexShrink: 0 }}
          >
            <FiSearch size={18} />
          </button>
        </form>
      )}

      {/* ===== SCROLLABLE CONTENT AREA ===== */}
      <div className={styles.scrollContent}>
        {/* Top Banner Notice from Theme Setting */}
        {theme?.pageTitles?.showBannerNotice && (
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary, #00BFA5) 0%, #26C6DA 100%)',
              color: 'var(--primary-text, #ffffff)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 12px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>{theme.pageTitles.bannerNotice || '🔥 Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ'}</span>
          </div>
        )}

        {/* ===== SHOP INFO CARD ===== */}
        <div className={styles.shopCard}>
          <div className={styles.shopTop}>
            <div className={styles.shopAvatar}>
              {theme?.pageTitles?.logoUrl ? (
                <img
                  src={theme.pageTitles.logoUrl}
                  alt={shopDisplayName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }}
                />
              ) : (
                <span className={styles.shopAvatarText}>{avatarInitials}</span>
              )}
            </div>
            <div className={styles.shopInfo}>
              <div className={styles.shopNameRow}>
                <span className={styles.shopName}>{shopDisplayName}</span>
                <FiChevronRight size={14} color="#888" />
              </div>
              <div className={styles.shopMeta}>
                <span className={styles.shopRating}>⭐ {SHOP_INFO.rating}</span>
                <span className={styles.shopSold}>{SHOP_INFO.totalSold} đã bán</span>
              </div>
            </div>
          <div className={styles.shopActions}>
            <button
              className={`${styles.followBtn} ${isFollowed ? styles.followed : ''}`}
              onClick={() => {
                setIsFollowed(!isFollowed);
                toast.success(
                  !isFollowed ? 'Đã theo dõi ShopTik Store!' : 'Đã bỏ theo dõi shop'
                );
              }}
            >
              {isFollowed ? (
                <>
                  <FiCheck size={12} style={{ display: 'inline', marginRight: 2 }} /> Đang theo dõi
                </>
              ) : (
                '+ Theo dõi'
              )}
            </button>
            <button
              className={styles.chatBtn}
              onClick={() => toast('Hệ thống CSKH 24/7: Hotline 1900 6868', { icon: '💬' })}
            >
              Tin nhắn
            </button>
          </div>
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}

      {/* 1. TAB 0: TRANG CHỦ */}
      {activeTab === 0 && (
        <div>
          {/* Section 1: Top Products Horizontal Scroll */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>⭐ Sản phẩm hàng đầu</h2>
              <button
                className={styles.seeMore}
                onClick={() => setActiveTab(1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Xem thêm <FiChevronRight size={14} />
              </button>
            </div>
            <div className={styles.topProductsScroll}>
              {(loading ? [1, 2, 3, 4] : topProducts).map((item: any, i) => (
                <Link
                  href={loading ? '#' : `/product/${item.slug}`}
                  key={i}
                  className={styles.topProductCard}
                >
                  <div className={styles.topRank}>{i + 1}</div>
                  <div className={styles.topImgWrap}>
                    {loading ? (
                      <div className={styles.skeleton}></div>
                    ) : (
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                        alt={item.name || ''}
                        className={styles.topImg}
                      />
                    )}
                  </div>
                  <p className={styles.topName}>{loading ? 'Đang tải...' : item.name}</p>
                  <span className={styles.topPrice}>
                    {loading ? '...' : formatPrice(item.salePrice || item.price)}đ
                  </span>
                  <span className={styles.topSold}>
                    Đã bán {loading ? '0' : formatSold(item.sold || 120)}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Section 2: Sale Event Banner */}
          <div className={styles.saleBanner}>
            <div className={styles.saleBannerContent}>
              <span className={styles.saleBannerTag}>8.8</span>
              <div>
                <div className={styles.saleBannerTitle}>Sale Vui</div>
                <div className={styles.saleBannerSub}>Giựt Deal Siêu Đã Hôm Nay</div>
              </div>
            </div>
          </div>

          {/* Section 3: Hot Deals */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🔥 Ưu đãi nóng</h2>
            </div>
            <div className={styles.productGrid}>
              {(loading ? [1, 2, 3, 4] : (hotDeals.length > 0 ? hotDeals : products.slice(0, 4))).map(
                (item: any, i) => (
                  <Link
                    href={loading ? '#' : `/product/${item.slug}`}
                    key={i}
                    className={styles.gridCard}
                  >
                    <div className={styles.gridImgWrap}>
                      {loading ? (
                        <div className={styles.skeleton}></div>
                      ) : (
                        <img
                          src={
                            item.images?.[0] ||
                            'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'
                          }
                          alt={item.name || ''}
                          className={styles.gridImg}
                        />
                      )}
                      <div className={styles.badgeRow}>
                        <span className={styles.badgeXtra}>Freeship</span>
                        {!loading && item.salePrice && (
                          <span className={styles.badgeBonus}>Bonus</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.gridInfo}>
                      {!loading && <span className={styles.badge88}>8.8</span>}
                      <p className={styles.gridName}>{loading ? '...' : item.name}</p>
                      <div className={styles.gridBadges}>
                        <span className={styles.tagFreeship}>Freeship</span>
                        {!loading && item.salePrice && item.salePrice < item.price && (
                          <span className={styles.tagDiscount}>
                            Giảm {calcDiscount(item.price, item.salePrice)}%
                          </span>
                        )}
                      </div>
                      <div className={styles.gridRating}>
                        <StarRating rating={loading ? 5 : item.rating || 5} />
                        <span className={styles.gridRatingNum}>
                          {loading ? '' : item.rating || 5}
                        </span>
                        <span className={styles.gridSold}>
                          Đã bán {loading ? '0' : formatSold(item.sold || 98)}
                        </span>
                      </div>
                      <div className={styles.gridPriceRow}>
                        <span className={styles.gridPrice}>
                          {loading ? '...' : formatPrice(item.salePrice || item.price)}
                        </span>
                        {!loading && item.salePrice && item.salePrice < item.price && (
                          <span className={styles.gridOldPrice}>
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                      <button
                        className={styles.gridCartBtn}
                        onClick={(e) => handleQuickAdd(e, item)}
                        title="Thêm vào giỏ"
                      >
                        <FiShoppingCart size={14} />
                      </button>
                    </div>
                  </Link>
                )
              )}
            </div>
          </section>

          {/* Section 5: Recommended For You */}
          <section className={styles.section}>
            <div className={styles.recommendedHeader}>
              <span className={styles.recommendedLine}></span>
              <h2 className={styles.sectionTitleCenter}>💖 Đề xuất cho bạn</h2>
              <span className={styles.recommendedLine}></span>
            </div>
            <div className={styles.productGrid}>
              {(loading ? [1, 2, 3, 4, 5, 6] : recommended).map((item: any, i) => (
                <Link
                  href={loading ? '#' : `/product/${item.slug}`}
                  key={i}
                  className={styles.gridCard}
                >
                  <div className={styles.gridImgWrap}>
                    {loading ? (
                      <div className={styles.skeleton}></div>
                    ) : (
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'
                        }
                        alt={item.name || ''}
                        className={styles.gridImg}
                      />
                    )}
                    <div className={styles.badgeRow}>
                      <span className={styles.badgeXtra}>Freeship</span>
                    </div>
                  </div>
                  <div className={styles.gridInfo}>
                    <p className={styles.gridName}>{loading ? '...' : item.name}</p>
                    <div className={styles.gridBadges}>
                      <span className={styles.tagFreeship}>Freeship</span>
                      {!loading && item.salePrice && item.salePrice < item.price && (
                        <span className={styles.tagDiscount}>
                          Giảm {calcDiscount(item.price, item.salePrice)}%
                        </span>
                      )}
                    </div>
                    <div className={styles.gridRating}>
                      <StarRating rating={loading ? 5 : item.rating || 5} />
                      <span className={styles.gridSold}>
                        Đã bán {loading ? '0' : formatSold(item.sold || 50)}
                      </span>
                    </div>
                    <div className={styles.gridPriceRow}>
                      <span className={styles.gridPrice}>
                        {loading ? '...' : formatPrice(item.salePrice || item.price)}đ
                      </span>
                      {!loading && item.salePrice && item.salePrice < item.price && (
                        <span className={styles.gridOldPrice}>{formatPrice(item.price)}đ</span>
                      )}
                    </div>
                    <button
                      className={styles.gridCartBtn}
                      onClick={(e) => handleQuickAdd(e, item)}
                      title="Thêm vào giỏ"
                    >
                      <FiShoppingCart size={14} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 2. TAB 1: SẢN PHẨM */}
      {activeTab === 1 && (
        <div>
          {/* Active Filter Indicators */}
          {(selectedCategory !== 'all' || searchQuery.trim()) && (
            <div
              style={{
                padding: '8px 16px',
                background: '#ffffff',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#555555',
              }}
            >
              <span>
                Đang lọc:{' '}
                {selectedCategory !== 'all' && (
                  <strong style={{ color: '#00BFA5', marginRight: 6 }}>
                    [{categories.find((c) => c.slug === selectedCategory || c._id === selectedCategory)?.name || selectedCategory}]
                  </strong>
                )}
                {searchQuery.trim() && (
                  <strong style={{ color: '#FE2C55' }}>"{searchQuery}"</strong>
                )}
                {' '}({products.length} sản phẩm)
              </span>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FE2C55',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  fetchProductsByParams(activeFilter, priceSortAsc, '', 'all');
                }}
              >
                Xóa lọc ✕
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className={styles.filterBar}>
            <div className={styles.filterPills}>
              {FILTER_PILLS.map((pill, i) => (
                <button
                  key={i}
                  className={`${styles.filterPill} ${activeFilter === i ? styles.filterActive : ''}`}
                  onClick={() => handleFilterClick(i)}
                >
                  {pill} {i === 3 ? (priceSortAsc ? '↑' : '↓') : ''}
                </button>
              ))}
            </div>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                onClick={() => setViewMode('list')}
                title="Xem danh sách"
              >
                <FiList size={16} />
              </button>
              <button
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                onClick={() => setViewMode('grid')}
                title="Xem lưới"
              >
                <FiGrid size={16} />
              </button>
            </div>
          </div>

          {/* LIST VIEW */}
          {loading ? (
            <StoreLoading text="Đang tải danh sách sản phẩm..." />
          ) : viewMode === 'list' ? (
            <div className={styles.productList}>
              {displayedFilteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  Không tìm thấy sản phẩm nào phù hợp
                </div>
              ) : (
                displayedFilteredProducts.map((item: any, i: number) => (
                  <Link
                    href={`/product/${item.slug}`}
                    key={i}
                    className={styles.listCard}
                  >
                    <div className={styles.listImgWrap}>
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'
                        }
                        alt={item.name || ''}
                        className={styles.listImg}
                      />
                      <div className={styles.listBadgeOverlay}>
                        <span className={styles.badgeXtra}>XTRA</span>
                        <span className={styles.badgeXtra}>Freeship</span>
                      </div>
                    </div>
                    <div className={styles.listInfo}>
                      <p className={styles.listName}>{item.name}</p>
                      <div className={styles.listTags}>
                        <span className={styles.tagFreeship}>🚚 Freeship</span>
                        {item.salePrice && item.salePrice < item.price && (
                          <span className={styles.tagDiscount}>
                            Giảm {calcDiscount(item.price, item.salePrice)}%
                          </span>
                        )}
                        <span className={styles.tagGift}>Quà tặng</span>
                      </div>
                      <div className={styles.listRatingRow}>
                        <StarRating rating={item.rating || 5} />
                        <span className={styles.listRatingNum}>
                          {item.rating || 5}
                        </span>
                        <span className={styles.listDivider}>|</span>
                        <span className={styles.listSold}>
                          Đã bán online {formatSold(item.sold || 60)}
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
                      className={styles.buyBtn}
                      onClick={(e) => handleQuickAdd(e, item)}
                    >
                      <FiShoppingCart size={14} />
                      <span>Mua</span>
                    </button>
                  </Link>
                ))
              )}
            </div>
          ) : (
            <div className={styles.productGrid} style={{ padding: 12 }}>
              {displayedFilteredProducts.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  Không tìm thấy sản phẩm nào phù hợp
                </div>
              ) : (
                displayedFilteredProducts.map((item: any, i: number) => (
                  <Link
                    href={`/product/${item.slug}`}
                    key={i}
                    className={styles.gridCard}
                  >
                    <div className={styles.gridImgWrap}>
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'
                        }
                        alt={item.name || ''}
                        className={styles.gridImg}
                      />
                      <div className={styles.badgeRow}>
                        <span className={styles.badgeXtra}>Freeship</span>
                      </div>
                    </div>
                    <div className={styles.gridInfo}>
                      <p className={styles.gridName}>{item.name}</p>
                      <div className={styles.gridBadges}>
                        <span className={styles.tagFreeship}>Freeship</span>
                        {item.salePrice && item.salePrice < item.price && (
                          <span className={styles.tagDiscount}>
                            Giảm {calcDiscount(item.price, item.salePrice)}%
                          </span>
                        )}
                      </div>
                      <div className={styles.gridRating}>
                        <StarRating rating={item.rating || 5} />
                        <span className={styles.gridSold}>
                          Đã bán {formatSold(item.sold || 40)}
                        </span>
                      </div>
                      <div className={styles.gridPriceRow}>
                        <span className={styles.gridPrice}>
                          {formatPrice(item.salePrice || item.price)}
                        </span>
                        {item.salePrice && item.salePrice < item.price && (
                          <span className={styles.gridOldPrice}>{formatPrice(item.price)}</span>
                        )}
                      </div>
                      <button
                        className={styles.gridCartBtn}
                        onClick={(e) => handleQuickAdd(e, item)}
                        title="Thêm vào giỏ"
                      >
                        <FiShoppingCart size={14} />
                      </button>
                    </div>
                  </Link>
                ))
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
          <div className={styles.categoryGrid}>
            {categories.length > 0
              ? categories.map((cat, i) => {
                  const emojis = ['👗', '👕', '👟', '👜', '🕶️', '💄', '📱', '🏠'];
                  return (
                    <div
                      key={cat._id}
                      className={styles.categoryCard}
                      onClick={() => handleCategorySelect(cat.slug || cat._id)}
                    >
                      <span className={styles.categoryEmoji}>{emojis[i % emojis.length]}</span>
                      <span className={styles.categoryName}>{cat.name}</span>
                      <span className={styles.categoryCount}>
                        {cat.productCount || 0} sản phẩm
                      </span>
                    </div>
                  );
                })
              : [
                  { name: 'Thời trang Nam', emoji: '👕' },
                { name: 'Thời trang Nữ', emoji: '👗' },
                { name: 'Giày Sneaker', emoji: '👟' },
                { name: 'Túi Xách & Balo', emoji: '👜' },
                { name: 'Phụ Kiện Kính Mũ', emoji: '🕶️' },
                { name: 'Mỹ Phẩm Skincare', emoji: '💄' },
              ].map((cat, i) => (
                <div
                  key={i}
                  className={styles.categoryCard}
                  onClick={() => {
                    setSearchQuery(cat.name);
                    setActiveTab(1);
                  }}
                >
                  <span className={styles.categoryEmoji}>{cat.emoji}</span>
                  <span className={styles.categoryName}>{cat.name}</span>
                </div>
              ))}
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