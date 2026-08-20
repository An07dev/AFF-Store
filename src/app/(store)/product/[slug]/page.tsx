'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import StoreLoading from '@/components/store/StoreLoading';
import BannerNotice from '@/components/common/BannerNotice';
import { apiFetch } from '@/lib/api';
import {
  IProductOption,
  IVariantItem,
  findMatchingVariant,
} from '@/lib/variant-helper';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cartCount, addToCart, buyNow } = useCart();
  const { theme } = useTheme();
  const { user } = useCustomerAuth();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Selected Attributes state: { [optionName: string]: string }
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/products/${params.slug}`);
        const data = await res.json();
        if (data.success && data.data) {
          const prod = data.data;
          setProduct(prod);

          // Extract options and variants
          const variants: any[] = prod.variants || [];
          let options: IProductOption[] = prod.options || [];

          // If no options, extract from variants
          if (options.length === 0 && variants.length > 0) {
            const attrMap: Record<string, Set<string>> = {};
            variants.forEach((v) => {
              if (v.attributes) {
                const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
                Object.entries(attrs).forEach(([k, val]: any) => {
                  if (typeof val === 'string' && val.trim()) {
                    if (!attrMap[k]) attrMap[k] = new Set();
                    attrMap[k].add(val.trim());
                  }
                });
              } else {
                if (v.color?.trim()) {
                  if (!attrMap['Màu sắc']) attrMap['Màu sắc'] = new Set();
                  attrMap['Màu sắc'].add(v.color.trim());
                }
                if (v.size?.trim()) {
                  if (!attrMap['Kích cỡ']) attrMap['Kích cỡ'] = new Set();
                  attrMap['Kích cỡ'].add(v.size.trim());
                }
              }
            });

            options = Object.entries(attrMap).map(([name, set]) => ({
              name,
              values: Array.from(set),
            }));
          }

          // Initialize default selection (prefer first in-stock variant)
          const initialSelection: Record<string, string> = {};
          if (variants.length > 0) {
            const firstInStock = variants.find((v) => (v.stock ?? 0) > 0) || variants[0];
            if (firstInStock) {
              if (firstInStock.attributes) {
                const attrs = firstInStock.attributes instanceof Map ? Object.fromEntries(firstInStock.attributes) : firstInStock.attributes;
                Object.assign(initialSelection, attrs);
              } else {
                if (firstInStock.color) initialSelection['Màu sắc'] = firstInStock.color;
                if (firstInStock.size) initialSelection['Kích cỡ'] = firstInStock.size;
              }
            }
          }

          // Fallback for options without initial value
          options.forEach((opt) => {
            if (!initialSelection[opt.name] && opt.values.length > 0) {
              initialSelection[opt.name] = opt.values[0];
            }
          });

          setSelectedAttributes(initialSelection);
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

  // Extract normalized options list
  const options: IProductOption[] = useMemo(() => {
    if (!product) return [];
    if (product.options && Array.isArray(product.options) && product.options.length > 0) {
      return product.options.filter((o: any) => o.name && o.values && o.values.length > 0);
    }
    if (product.variants && product.variants.length > 0) {
      const attrMap: Record<string, Set<string>> = {};
      product.variants.forEach((v: any) => {
        if (v.attributes) {
          const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
          Object.entries(attrs).forEach(([k, val]: any) => {
            if (typeof val === 'string' && val.trim()) {
              if (!attrMap[k]) attrMap[k] = new Set();
              attrMap[k].add(val.trim());
            }
          });
        } else {
          if (v.color?.trim()) {
            if (!attrMap['Màu sắc']) attrMap['Màu sắc'] = new Set();
            attrMap['Màu sắc'].add(v.color.trim());
          }
          if (v.size?.trim()) {
            if (!attrMap['Kích cỡ']) attrMap['Kích cỡ'] = new Set();
            attrMap['Kích cỡ'].add(v.size.trim());
          }
        }
      });

      return Object.entries(attrMap).map(([name, set]) => ({
        name,
        values: Array.from(set),
      }));
    }
    return [];
  }, [product]);

  // Normalized variants list
  const variants: IVariantItem[] = useMemo(() => {
    if (!product || !product.variants) return [];
    return product.variants.map((v: any, idx: number) => {
      let attrs: Record<string, string> = {};
      if (v.attributes) {
        attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
      } else {
        if (v.color) attrs['Màu sắc'] = v.color;
        if (v.size) attrs['Kích cỡ'] = v.size;
      }
      return {
        _id: v._id,
        sku: v.sku || `SKU-${idx + 1}`,
        title: v.title || v.name || Object.values(attrs).filter(Boolean).join(' / ') || `Biến thể ${idx + 1}`,
        attributes: attrs,
        price: v.price !== undefined ? v.price : (product.salePrice || product.price),
        salePrice: v.salePrice,
        stock: v.stock ?? 0,
        image: v.image || '',
      };
    });
  }, [product]);

  // Resolve matching variant based on selected attributes
  const matchedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return findMatchingVariant(variants, selectedAttributes);
  }, [variants, selectedAttributes]);

  // Real-time calculated price & stock
  const currentPrice = matchedVariant
    ? (matchedVariant.salePrice && matchedVariant.salePrice > 0 ? matchedVariant.salePrice : matchedVariant.price)
    : (product?.salePrice && product.salePrice > 0 ? product.salePrice : (product?.price || 0));

  const originalPrice = matchedVariant ? matchedVariant.price : (product?.price || 0);

  const hasDiscount = matchedVariant
    ? (matchedVariant.salePrice !== undefined && matchedVariant.salePrice > 0 && matchedVariant.salePrice < matchedVariant.price)
    : (product?.salePrice !== undefined && product.salePrice > 0 && product.salePrice < product.price);

  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const currentStock = matchedVariant
    ? (matchedVariant.stock ?? 0)
    : (product?.stock ?? 0);

  const isOutOfStock = currentStock <= 0;

  // Auto adjust quantity if stock changes
  useEffect(() => {
    if (currentStock > 0 && quantity > currentStock) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(1);
    }
  }, [currentStock]);

  // Switch image if variant has a dedicated image
  useEffect(() => {
    if (matchedVariant?.image && product?.images) {
      const idx = product.images.findIndex((img: string) => img === matchedVariant.image);
      if (idx > -1) {
        setActiveImageIndex(idx);
      }
    }
  }, [matchedVariant]);

  // Auto slide image every 3 seconds for products with multiple images
  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3500);
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

  // Check if a specific option value can be selected and has available stock
  const isOptionValueAvailable = (optionName: string, value: string): boolean => {
    if (variants.length === 0) return true;
    const trialSelection = { ...selectedAttributes, [optionName]: value };
    return variants.some((v) => {
      const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
      const isMatch = Object.keys(trialSelection).every((key) => attrs[key] === trialSelection[key]);
      return isMatch && v.stock > 0;
    });
  };

  const handleSelectAttribute = (optionName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Rigorous error check before adding to cart / buying
  const validateSelection = (): boolean => {
    if (options.length > 0) {
      for (const opt of options) {
        if (!selectedAttributes[opt.name]) {
          toast.error(`Vui lòng chọn ${opt.name}!`);
          return false;
        }
      }
    }

    if (variants.length > 0 && !matchedVariant) {
      toast.error('Phiên bản phân loại đã chọn không tồn tại!');
      return false;
    }

    if (isOutOfStock) {
      toast.error('Phiên bản này hiện đã tạm hết hàng trong kho!');
      return false;
    }

    if (quantity > currentStock) {
      toast.error(`Chỉ còn ${currentStock} sản phẩm trong kho!`);
      setQuantity(currentStock);
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addToCart(product, quantity, matchedVariant || undefined);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    buyNow(product, quantity, matchedVariant || undefined);
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
            {hasDiscount && (
              <>
                <span className={styles.oldPrice}>{formatPrice(originalPrice)}</span>
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
            <span className={styles.stock}>
              {isOutOfStock ? (
                <span className={styles.outOfStockBadge}>Tạm hết hàng</span>
              ) : (
                `Kho: ${currentStock} có sẵn`
              )}
            </span>
          </div>
        </div>

        {/* 3. DYNAMIC MULTI-DIMENSIONAL VARIANT SELECTION CARD */}
        {(options.length > 0 || (variants.length > 0 && options.length === 0)) && (
          <div className={styles.variantCard}>
            {options.map((opt) => (
              <div key={opt.name} className={styles.variantSection}>
                <div className={styles.variantTitle}>
                  <span>{opt.name}</span>
                  {selectedAttributes[opt.name] && (
                    <span style={{ color: 'var(--primary, #3b82f6)', fontWeight: 600 }}>
                      {selectedAttributes[opt.name]}
                    </span>
                  )}
                </div>
                <div className={styles.variantChips}>
                  {opt.values.map((val) => {
                    const isSelected = selectedAttributes[opt.name] === val;
                    const isAvailable = isOptionValueAvailable(opt.name, val);

                    return (
                      <button
                        key={val}
                        type="button"
                        className={`${styles.variantBtn} ${isSelected ? styles.activeVariant : ''} ${!isAvailable && !isSelected ? styles.disabledVariant : ''}`}
                        onClick={() => handleSelectAttribute(opt.name, val)}
                        title={!isAvailable && !isSelected ? 'Tùy chọn này tạm hết hàng' : undefined}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Fallback for single generic variants list */}
            {options.length === 0 && variants.length > 0 && (
              <div className={styles.variantSection}>
                <div className={styles.variantTitle}>Phân loại hàng</div>
                <div className={styles.variantChips}>
                  {variants.map((v, idx) => {
                    const isSelected = matchedVariant?._id === v._id || matchedVariant?.sku === v.sku;
                    const isAvail = v.stock > 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.variantBtn} ${isSelected ? styles.activeVariant : ''} ${!isAvail ? styles.disabledVariant : ''}`}
                        onClick={() => setSelectedAttributes(v.attributes || {})}
                      >
                        {v.title}
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
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <FiMinus size={12} />
                </button>
                <span className={styles.qtyValue}>{isOutOfStock ? 0 : quantity}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                >
                  <FiPlus size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. SHOP INFO CARD */}
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

        {/* 5. DESCRIPTION CARD */}
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
        <Link
          href={`/chat?product=${product.slug || ''}`}
          className={styles.actionIconBtn}
        >
          <FiMessageSquare size={18} />
          <span>Chat</span>
        </Link>
        <Link href="/cart" className={styles.actionIconBtn}>
          <FiShoppingCart size={18} />
          <span>Giỏ</span>
        </Link>
        <button
          type="button"
          className={styles.addCartBtn}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <span>{isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
        </button>
        <button
          type="button"
          className={styles.buyNowBtn}
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <span>{isOutOfStock ? 'Tạm hết hàng' : 'Mua ngay'}</span>
        </button>
      </div>
    </div>
  );
}