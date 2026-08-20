'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiX,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiZap,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import {
  IProductOption,
  IVariantItem,
  findMatchingVariant,
} from '@/lib/variant-helper';
import styles from './ProductDetailModal.module.css';

interface ProductDetailModalProps {
  product: any | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const router = useRouter();
  const { addToCart, buyNow } = useCart();
  const { user } = useCustomerAuth();

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Extract options
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

  // Extract normalized variants
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

  // Initialize or reset selections when product opens
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setActiveImageIndex(0);

      const initialSelection: Record<string, string> = {};
      if (variants.length > 0) {
        const firstInStock = variants.find((v) => (v.stock ?? 0) > 0) || variants[0];
        if (firstInStock) {
          Object.assign(initialSelection, firstInStock.attributes || {});
        }
      }

      options.forEach((opt) => {
        if (!initialSelection[opt.name] && opt.values.length > 0) {
          initialSelection[opt.name] = opt.values[0];
        }
      });

      setSelectedAttributes(initialSelection);
    }
  }, [product, variants, options]);

  // Resolve matching variant
  const matchedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return findMatchingVariant(variants, selectedAttributes);
  }, [variants, selectedAttributes]);

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

  // Auto adjust quantity
  useEffect(() => {
    if (currentStock > 0 && quantity > currentStock) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(1);
    }
  }, [currentStock]);

  // Switch image if variant has dedicated image
  useEffect(() => {
    if (matchedVariant?.image && product?.images) {
      const idx = product.images.findIndex((img: string) => img === matchedVariant.image);
      if (idx > -1) {
        setActiveImageIndex(idx);
      }
    }
  }, [matchedVariant]);

  // Auto slide image every 3.5s
  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [product?.images]);

  if (!product) return null;

  const images: string[] =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'];

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
      toast.error('Phiên bản này hiện đã tạm hết hàng!');
      return false;
    }

    if (quantity > currentStock) {
      toast.error(`Chỉ còn ${currentStock} sản phẩm trong kho!`);
      setQuantity(currentStock);
      return false;
    }

    return true;
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addToCart(product, quantity, matchedVariant || undefined);
    onClose();
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    buyNow(product, quantity, matchedVariant || undefined);
    onClose();
    router.push('/checkout');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
          <FiX size={18} />
        </button>

        {/* Scrollable Modal Content */}
        <div className={styles.scrollBody}>
          {/* Image Container */}
          <div className={styles.imageContainer}>
            <img
              src={images[activeImageIndex] || images[0]}
              alt={product.name}
              className={styles.productImg}
            />
            {discountPercent && (
              <span className={styles.saleBadge}>Giảm {discountPercent}%</span>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navArrowBtn} ${styles.prevArrow}`}
                  onClick={handlePrevImage}
                  aria-label="Ảnh trước"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.navArrowBtn} ${styles.nextArrow}`}
                  onClick={handleNextImage}
                  aria-label="Ảnh sau"
                >
                  <FiChevronRight size={16} />
                </button>
                <span className={styles.imageCounter}>
                  {activeImageIndex + 1}/{images.length}
                </span>
              </>
            )}
          </div>

          {/* Info section */}
          <div className={styles.infoSection}>
            <h2 className={styles.productName}>{product.name}</h2>

            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <span className={styles.oldPrice}>{formatPrice(originalPrice)}</span>
              )}
            </div>

            {/* DYNAMIC OPTIONS */}
            {options.map((opt) => (
              <div key={opt.name} className={styles.variantBlock}>
                <div className={styles.variantTitle} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{opt.name}:</span>
                  {selectedAttributes[opt.name] && (
                    <span style={{ color: 'var(--primary, #3b82f6)', fontWeight: 600 }}>
                      {selectedAttributes[opt.name]}
                    </span>
                  )}
                </div>
                <div className={styles.variantChips}>
                  {opt.values.map((val) => {
                    const isSelected = selectedAttributes[opt.name] === val;
                    const isAvail = isOptionValueAvailable(opt.name, val);

                    return (
                      <button
                        key={val}
                        type="button"
                        className={`${styles.variantChip} ${isSelected ? styles.variantChipActive : ''} ${!isAvail && !isSelected ? styles.variantChipDisabled : ''}`}
                        onClick={() => handleSelectAttribute(opt.name, val)}
                        title={!isAvail && !isSelected ? 'Tùy chọn này tạm hết hàng' : undefined}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Fallback generic variants */}
            {options.length === 0 && variants.length > 0 && (
              <div className={styles.variantBlock}>
                <div className={styles.variantTitle}>Phân loại:</div>
                <div className={styles.variantChips}>
                  {variants.map((v, idx) => {
                    const isSelected = matchedVariant?._id === v._id || matchedVariant?.sku === v.sku;
                    const isAvail = v.stock > 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.variantChip} ${isSelected ? styles.variantChipActive : ''} ${!isAvail ? styles.variantChipDisabled : ''}`}
                        onClick={() => setSelectedAttributes(v.attributes || {})}
                      >
                        {v.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className={styles.quantityRow}>
              <span className={styles.variantTitle}>Số lượng:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={styles.stepper}>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <FiMinus size={12} />
                  </button>
                  <span className={styles.stepperVal}>{isOutOfStock ? 0 : quantity}</span>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                  >
                    <FiPlus size={12} />
                  </button>
                </div>
                <span className={styles.stockHint}>
                  {isOutOfStock ? (
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>Hết hàng</span>
                  ) : (
                    `Kho: ${currentStock}`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className={styles.btnRow}>
          <button
            type="button"
            className={styles.addCartBtn}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <FiShoppingCart size={15} />
            <span>{isOutOfStock ? 'Hết hàng' : 'Thêm giỏ'}</span>
          </button>
          <button
            type="button"
            className={styles.buyNowBtn}
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <FiZap size={15} />
            <span>{isOutOfStock ? 'Tạm hết hàng' : 'Mua ngay'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}