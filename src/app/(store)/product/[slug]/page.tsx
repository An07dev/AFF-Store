'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiChevronLeft,
  FiChevronRight,
  FiShare2,
  FiShoppingCart,
  FiStar,
  FiPlus,
  FiMinus,
  FiMessageSquare,
  FiTruck,
  FiTag,
  FiShield,
  FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import StoreLoading from '@/components/store/StoreLoading';
import BannerNotice from '@/components/common/BannerNotice';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cartCount, addToCart, buyNow, openDrawer } = useCart();
  const { theme } = useTheme();
  const { user, openAuthModal } = useCustomerAuth();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/products/${params.slug}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
          if (data.data.variants && data.data.variants.length > 0) {
            setSelectedVariant(data.data.variants[0]);
            if (data.data.variants[0].color) setSelectedColor(data.data.variants[0].color);
            if (data.data.variants[0].size) setSelectedSize(data.data.variants[0].size);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  // Auto slide image every 3 seconds for products with multiple images
  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [product?.images]);

  if (loading) return <StoreLoading />;
  if (!product) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>Không tìm thấy sản phẩm</h3>
          <p style={{ color: '#888', marginTop: 8 }}>Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: 'var(--primary, #3b82f6)',
              color: 'var(--primary-text, #ffffff)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Extract distinct colors and sizes
  const colors: string[] = Array.from(
    new Set(
      (product.variants || [])
        .map((v: any) => v.color)
        .filter(Boolean)
    )
  );

  const sizes: string[] = Array.from(
    new Set(
      (product.variants || [])
        .map((v: any) => v.size)
        .filter(Boolean)
    )
  );

  const currentPrice = selectedVariant?.price || product.salePrice || product.price;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 99;
  const discountPercent =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    const match = (product.variants || []).find(
      (v: any) => v.color === color && (selectedSize ? v.size === selectedSize : true)
    );
    if (match) setSelectedVariant(match);
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    const match = (product.variants || []).find(
      (v: any) => v.size === size && (selectedColor ? v.color === selectedColor : true)
    );
    if (match) setSelectedVariant(match);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    buyNow(product, quantity, selectedVariant);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết sản phẩm!');
    }
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600'];

  return (
    <div className={styles.page}>
      {/* ===== FIXED TOP NAVIGATION ===== */}
      <nav className={styles.topNav}>
        <button
          className={styles.navBtn}
          onClick={() => router.back()}
          aria-label="Quay lại"
        >
          <FiChevronLeft size={22} />
        </button>

        <div className={styles.navTitle}>Chi tiết sản phẩm</div>

        <div className={styles.navRight}>
          <button className={styles.navBtn} onClick={handleShare} aria-label="Chia sẻ">
            <FiShare2 size={20} />
          </button>
          <Link href="/cart" className={styles.navBtn} aria-label="Giỏ hàng">
            <FiShoppingCart size={20} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
        </div>
      </nav>

      {/* ===== SCROLLABLE CONTENT AREA ===== */}
      <div className={styles.scrollArea}>
        {/* Top Scrolling Banner Notice */}
        <BannerNotice />

        {/* 1. PRODUCT GALLERY */}
        <div className={styles.gallery}>
          <img
            src={images[activeImageIndex] || images[0]}
            alt={product.name}
            className={styles.mainImage}
          />
          {images.length > 1 && (
            <>
              {/* Prev & Next Navigation Buttons */}
              <button
                type="button"
                className={`${styles.galleryNavBtn} ${styles.galleryPrevBtn}`}
                onClick={handlePrevImage}
                aria-label="Ảnh trước"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                type="button"
                className={`${styles.galleryNavBtn} ${styles.galleryNextBtn}`}
                onClick={handleNextImage}
                aria-label="Ảnh sau"
              >
                <FiChevronRight size={20} />
              </button>

              {/* Dots indicator */}
              <div className={styles.dotsContainer}>
                {images.map((_: any, idx: number) => (
                  <span
                    key={idx}
                    className={`${styles.dot} ${activeImageIndex === idx ? styles.activeDot : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  />
                ))}
              </div>

              <span className={styles.imageCounter}>
                {activeImageIndex + 1}/{images.length}
              </span>
            </>
          )}
        </div>

        {/* 2. MAIN INFO CARD */}
        <div className={styles.mainCard}>
          <div className={styles.priceRow}>
            <span className={styles.currentPrice}>{formatPrice(currentPrice)}</span>
            {product.salePrice && product.salePrice < product.price && (
              <>
                <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
                {discountPercent && (
                  <span className={styles.discountBadge}>-{discountPercent}%</span>
                )}
              </>
            )}
          </div>

          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.metaRow}>
            <span className={styles.rating}>
              <FiStar style={{ fill: '#FFB800' }} size={13} /> {product.rating || 5.0}
            </span>
            <span className={styles.sold}>
              Đã bán {product.sold || product.soldCount || 150}
            </span>
            <span className={styles.stock}>Kho: {currentStock} có sẵn</span>
          </div>
        </div>

        {/* 3. VARIANT SELECTION CARD */}
        <div className={styles.variantCard}>
          {/* Colors */}
          {colors.length > 0 && (
            <div className={styles.variantSection}>
              <div className={styles.variantTitle}>
                <span>Màu sắc</span>
                {selectedColor && <span style={{ color: 'var(--primary, #3b82f6)' }}>{selectedColor}</span>}
              </div>
              <div className={styles.variantChips}>
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`${styles.variantBtn} ${selectedColor === color ? styles.activeVariant : ''}`}
                    onClick={() => handleSelectColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className={styles.variantSection}>
              <div className={styles.variantTitle}>
                <span>Kích cỡ</span>
                {selectedSize && <span style={{ color: 'var(--primary, #3b82f6)' }}>{selectedSize}</span>}
              </div>
              <div className={styles.variantChips}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`${styles.variantBtn} ${selectedSize === size ? styles.activeVariant : ''}`}
                    onClick={() => handleSelectSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generic Variants if no separate color/size */}
          {colors.length === 0 && sizes.length === 0 && product.variants && product.variants.length > 0 && (
            <div className={styles.variantSection}>
              <div className={styles.variantTitle}>Phân loại hàng</div>
              <div className={styles.variantChips}>
                {product.variants.map((v: any, idx: number) => {
                  const label = v.name || `Tùy chọn ${idx + 1}`;
                  const isSelected = selectedVariant?._id === v._id || selectedVariant === v;
                  return (
                    <button
                      key={idx}
                      className={`${styles.variantBtn} ${isSelected ? styles.activeVariant : ''}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className={styles.quantityRow}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Số lượng</span>
            <div className={styles.quantityControl}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <FiMinus size={12} />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
              >
                <FiPlus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* 6. SHOP INFO CARD */}
        <div className={styles.shopCard}>
          <div className={styles.shopLeft}>
            <div className={styles.shopAvatar}>
              {theme?.pageTitles?.logoUrl ? (
                <img
                  src={theme.pageTitles.logoUrl}
                  alt={theme?.pageTitles?.logoText || 'ShopTik Store'}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }}
                />
              ) : (
                theme?.pageTitles?.logoText ? theme.pageTitles.logoText.substring(0, 2).toUpperCase() : 'ST'
              )}
            </div>
            <div>
              <div className={styles.shopName}>{theme?.pageTitles?.logoText || 'ShopTik Store'}</div>
              <div className={styles.shopMeta}>⭐ 4.8 | 12.5K đã bán</div>
            </div>
          </div>
          <Link href="/" className={styles.viewShopBtn}>
            Xem Shop
          </Link>
        </div>

        {/* 7. DESCRIPTION CARD */}
        <div className={styles.descCard}>
          <h2 className={styles.descTitle}>Mô tả sản phẩm</h2>
          <div className={styles.descContent}>
            {product.description ||
              'Chất liệu cao cấp, đường may tỉ mỉ, form dáng chuẩn thời trang hiện đại.\nThiết kế trẻ trung năng động, dễ phối đồ phù hợp đi học, đi chơi, đi làm.'}
          </div>
        </div>
      </div>

      {/* ===== FIXED BOTTOM ACTION BAR ===== */}
      <div className={styles.bottomBar}>
        <button
          className={styles.actionIconBtn}
          onClick={() => toast('Hệ thống CSKH 24/7: Hotline 1900 6868', { icon: '💬' })}
        >
          <FiMessageSquare size={18} />
          <span>Chat</span>
        </button>
        <Link href="/cart" className={styles.actionIconBtn}>
          <FiShoppingCart size={18} />
          <span>Giỏ</span>
        </Link>
        <button className={styles.addCartBtn} onClick={handleAddToCart}>
          <span>Thêm vào giỏ</span>
        </button>
        <button className={styles.buyNowBtn} onClick={handleBuyNow}>
          <span>Mua ngay</span>
        </button>
      </div>
    </div>
  );
}