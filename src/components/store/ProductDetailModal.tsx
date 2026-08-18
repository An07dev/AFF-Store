'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiX,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiZap,
  FiStar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import styles from './ProductDetailModal.module.css';

interface ProductDetailModalProps {
  product: any | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const router = useRouter();
  const { addToCart, buyNow } = useCart();
  const { user, openAuthModal } = useCustomerAuth();

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Initialize or reset selections when product opens
  useEffect(() => {
    if (product) {
      setQuantity(1);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
        if (product.variants[0].color) setSelectedColor(product.variants[0].color);
        if (product.variants[0].size) setSelectedSize(product.variants[0].size);
      } else {
        setSelectedVariant(null);
        setSelectedColor('');
        setSelectedSize('');
      }
    }
  }, [product]);

  if (!product) return null;

  // Extract distinct colors and sizes if available
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

  // Handle color/size combination matching
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
    onClose();
  };

  const handleBuyNow = () => {
    buyNow(product, quantity, selectedVariant);
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
              src={
                (product.images && product.images[0]) ||
                'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'
              }
              alt={product.name}
              className={styles.productImg}
            />
            {discountPercent && (
              <span className={styles.saleBadge}>Giảm {discountPercent}%</span>
            )}
          </div>

          {/* Info Section */}
          <div className={styles.infoSection}>
            <h3 className={styles.productName}>{product.name}</h3>

            <div className={styles.metaRow}>
              <span className={styles.rating}>
                <FiStar style={{ fill: '#FFB800' }} size={12} /> {product.rating || 5}
              </span>
              <span>•</span>
              <span>Đã bán {product.sold || product.soldCount || 120}</span>
              <span>•</span>
              <span className={styles.stockHint}>Còn {currentStock} sp</span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>{formatPrice(currentPrice)}</span>
              {product.salePrice && product.salePrice < product.price && (
                <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
              )}
            </div>
          </div>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className={styles.variantBlock}>
              <div className={styles.variantTitle}>Màu sắc:</div>
              <div className={styles.variantChips}>
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`${styles.variantChip} ${selectedColor === color ? styles.variantChipActive : ''}`}
                    onClick={() => handleSelectColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className={styles.variantBlock}>
              <div className={styles.variantTitle}>Kích cỡ:</div>
              <div className={styles.variantChips}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`${styles.variantChip} ${selectedSize === size ? styles.variantChipActive : ''}`}
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
            <div className={styles.variantBlock}>
              <div className={styles.variantTitle}>Phân loại:</div>
              <div className={styles.variantChips}>
                {product.variants.map((v: any, idx: number) => {
                  const label = v.name || `Tùy chọn ${idx + 1}`;
                  const isSelected = selectedVariant?._id === v._id || selectedVariant === v;
                  return (
                    <button
                      key={idx}
                      className={`${styles.variantChip} ${isSelected ? styles.variantChipActive : ''}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Row */}
          <div className={styles.quantityRow}>
            <span className={styles.variantTitle}>Số lượng:</span>
            <div className={styles.stepper}>
              <button
                className={styles.stepperBtn}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <FiMinus size={12} />
              </button>
              <span className={styles.stepperVal}>{quantity}</span>
              <button
                className={styles.stepperBtn}
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
              >
                <FiPlus size={12} />
              </button>
            </div>
          </div>

          {/* Short description preview if present */}
          {product.description && (
            <div className={styles.descPreview}>
              {product.description}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footerActions}>
          <button className={styles.addCartBtn} onClick={handleAddToCart}>
            <FiShoppingCart size={15} />
            <span>Thêm giỏ hàng</span>
          </button>
          <button className={styles.buyNowBtn} onClick={handleBuyNow}>
            <FiZap size={15} />
            <span>Mua ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}