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
  FiEdit3,
  FiX,
  FiCamera,
  FiCheckCircle,
  FiZap,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import StoreLoading from '@/components/store/StoreLoading';
import BannerNotice from '@/components/common/BannerNotice';
import VoucherCollectionBar from '@/components/store/VoucherCollectionBar';
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
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Flash Sale & FOMO state
  const [flashSaleItem, setFlashSaleItem] = useState<any | null>(null);
  const [flashCountdown, setFlashCountdown] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [fomoSettings, setFomoSettings] = useState<any>(null);

  // Reviews preview state
  const [reviewsPreview, setReviewsPreview] = useState<any[]>([]);
  const [reviewsStats, setReviewsStats] = useState<{ averageRating: number; totalReviews: number }>({
    averageRating: 5.0,
    totalReviews: 0,
  });

  // Write Review Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [authorInput, setAuthorInput] = useState('');
  const [variantInput, setVariantInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const reviewFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const EMOTION_LABELS: Record<number, string> = {
    1: '1★ Rất không hài lòng',
    2: '2★ Không hài lòng',
    3: '3★ Bình thường',
    4: '4★ Hài lòng',
    5: '5★ Rất tuyệt vời',
  };

  const QUICK_TAGS = [
    'Chất lượng sản phẩm tuyệt vời 🌟',
    'Đóng gói hàng cẩn thận 📦',
    'Giao hàng siêu nhanh chóng 🚀',
    'Đáng tiền 💯',
    'Tư vấn nhiệt tình 💬',
  ];

  const loadReviewsPreview = async () => {
    if (!params.slug) return;
    try {
      const res = await apiFetch(`/api/reviews?slug=${encodeURIComponent(params.slug as string)}&limit=3`);
      const data = await res.json();
      if (data.success) {
        setReviewsPreview(data.data || []);
        if (data.stats) {
          setReviewsStats({
            averageRating: data.stats.averageRating || 5.0,
            totalReviews: data.stats.totalReviews || 0,
          });
        }
      }
    } catch (e) {
      console.error('Error loading reviews preview:', e);
    }
  };

  useEffect(() => {
    loadReviewsPreview();
  }, [params.slug]);

  // Handle Photo Upload in Review
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (uploadedImages.length >= 5) {
      toast.error('Bạn chỉ có thể tải lên tối đa 5 hình ảnh');
      return;
    }
    setIsUploading(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setUploadedImages((prev) => [...prev, data.data.url]);
        toast.success('Đã tải ảnh lên thành công!');
      } else {
        toast.error(data.message || 'Lỗi khi tải ảnh lên');
      }
    } catch (err) {
      toast.error('Không thể kết nối máy chủ để upload ảnh');
    } finally {
      setIsUploading(false);
      if (reviewFileInputRef.current) reviewFileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorInput.trim()) {
      toast.error('Vui lòng nhập họ và tên của bạn');
      return;
    }
    if (!commentInput.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá nhận xét');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: params.slug,
          author: authorInput.trim(),
          rating: ratingInput,
          variantTitle: variantInput.trim(),
          comment: commentInput.trim(),
          images: uploadedImages,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Gửi đánh giá thành công! Cảm ơn nhận xét của bạn.');
        setIsWriteModalOpen(false);
        setCommentInput('');
        setUploadedImages([]);
        loadReviewsPreview();
      } else {
        toast.error(data.message || 'Gửi đánh giá thất bại');
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

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

          // Trigger ViewContent tracking event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('shoptik-track-event', {
                detail: {
                  eventName: 'ViewContent',
                  customData: {
                    content_name: prod.name,
                    content_ids: [prod._id || prod.slug],
                    content_type: 'product',
                    value: prod.salePrice || prod.price,
                    currency: 'VND',
                  },
                },
              })
            );
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

  // Check if product is in active Flash Sale
  useEffect(() => {
    async function loadFlashSale() {
      try {
        const res = await apiFetch('/api/flash-sale');
        const data = await res.json();
        if (data.success && data.data && data.data.isActive && data.data.isLive) {
          setFomoSettings(data.data.fomoSettings);
          const matched = (data.data.items || []).find(
            (it: any) =>
              it.slug === params.slug ||
              (product && (it.productId === product._id || it.name === product.name))
          );
          if (matched) {
            setFlashSaleItem(matched);
          } else {
            setFlashSaleItem(null);
          }
        } else {
          setFlashSaleItem(null);
        }
      } catch (e) {
        console.error('Error checking product flash sale:', e);
      }
    }
    if (product) {
      loadFlashSale();
    }
  }, [product, params.slug]);

  // Flash Countdown ticker
  useEffect(() => {
    if (!flashSaleItem) return;
    const updateTimer = () => {
      const now = new Date();
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const curSec = now.getSeconds();

      const endHour = curHour < 9 ? 9 : curHour < 12 ? 12 : curHour < 18 ? 18 : curHour < 21 ? 21 : 24;
      const diffSeconds = Math.max(0, endHour * 3600 - (curHour * 3600 + curMin * 60 + curSec));

      const h = String(Math.floor(diffSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((diffSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(diffSeconds % 60).padStart(2, '0');
      setFlashCountdown({ hours: h, minutes: m, seconds: s });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [flashSaleItem]);

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
  const currentPrice = flashSaleItem
    ? flashSaleItem.flashPrice
    : matchedVariant
    ? (matchedVariant.salePrice && matchedVariant.salePrice > 0 ? matchedVariant.salePrice : matchedVariant.price)
    : (product?.salePrice && product.salePrice > 0 ? product.salePrice : (product?.price || 0));

  const originalPrice = flashSaleItem
    ? (flashSaleItem.originalPrice || product?.price || 0)
    : matchedVariant
    ? matchedVariant.price
    : (product?.price || 0);

  const hasDiscount = !!flashSaleItem || (originalPrice > currentPrice && currentPrice > 0);

  const discountPercent = flashSaleItem
    ? flashSaleItem.discountPercent
    : hasDiscount && originalPrice > 0
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
    if (!isOptionValueAvailable(optionName, value)) return;
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
    const productToAdd = flashSaleItem
      ? {
          ...product,
          flashPrice: flashSaleItem.flashPrice,
          salePrice: flashSaleItem.flashPrice,
          originalPrice: flashSaleItem.originalPrice || product.price,
        }
      : product;
    addToCart(productToAdd, quantity, matchedVariant || undefined);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('shoptik-track-event', {
          detail: {
            eventName: 'AddToCart',
            customData: {
              content_name: product.name,
              content_ids: [product._id || product.slug],
              content_type: 'product',
              value: currentPrice * quantity,
              currency: 'VND',
              num_items: quantity,
            },
          },
        })
      );
    }
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    const productToBuy = flashSaleItem
      ? {
          ...product,
          flashPrice: flashSaleItem.flashPrice,
          salePrice: flashSaleItem.flashPrice,
          originalPrice: flashSaleItem.originalPrice || product.price,
        }
      : product;
    const boughtItem = buyNow(productToBuy, quantity, matchedVariant || undefined);
    if (!boughtItem) return;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('shoptik-track-event', {
          detail: {
            eventName: 'AddToCart',
            customData: {
              content_name: product.name,
              content_ids: [product._id || product.slug],
              content_type: 'product',
              value: currentPrice * quantity,
              currency: 'VND',
              num_items: quantity,
            },
          },
        })
      );
    }
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

        {/* SHOPEE FLASH SALE BAR (IF PRODUCT IN ACTIVE FLASH SALE) */}
        {flashSaleItem && (
          <div className={styles.shopeeFlashBar}>
            <div className={styles.flashBarLeft}>
              <FiZap size={18} style={{ fill: '#fff' }} />
              <span className={styles.flashBarTitle}>FLASH SALE GIÁ SỐC</span>
            </div>

            <div className={styles.flashBarRight}>
              <span className={styles.flashBarCountdownLabel}>KẾT THÚC TRONG</span>
              <div className={styles.flashBarCountdownTimer}>
                <span className={styles.flashBarDigit}>{flashCountdown.hours}</span>
                <span className={styles.flashBarColon}>:</span>
                <span className={styles.flashBarDigit}>{flashCountdown.minutes}</span>
                <span className={styles.flashBarColon}>:</span>
                <span className={styles.flashBarDigit}>{flashCountdown.seconds}</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. MAIN INFO CARD */}
        <div className={styles.mainCard}>
          <div className={styles.priceRow}>
            <span
              className={styles.currentPrice}
              style={{ color: flashSaleItem ? '#f97316' : undefined }}
            >
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className={styles.oldPrice}>{formatPrice(originalPrice)}</span>
                {discountPercent && (
                  <span
                    className={styles.discountBadge}
                    style={{
                      background: flashSaleItem ? '#ea580c' : undefined,
                      color: flashSaleItem ? '#ffffff' : undefined,
                    }}
                  >
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>

          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.metaRow}>
            <Link href={`/product/${product.slug}/reviews`} className={styles.ratingLink}>
              <span className={styles.rating}>
                <FiStar style={{ fill: '#FFB800' }} size={13} /> {reviewsStats.averageRating || product.rating || 5.0}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>
                  ({reviewsStats.totalReviews} đánh giá)
                </span>
              </span>
            </Link>
            <span className={styles.sold}>
              Đã bán {product.soldCount ?? product.sold ?? 0}
            </span>
            <span className={styles.stock}>
              {isOutOfStock ? (
                <span className={styles.outOfStockBadge}>Tạm hết hàng</span>
              ) : (
                `Kho: ${currentStock} có sẵn`
              )}
            </span>
          </div>

          {/* FOMO Real-time Viewer Notice */}
          {fomoSettings?.enableViewerCount !== false && (
            <div className={styles.viewerCountNotice}>
              <FiZap /> 🔥 <strong>18 người</strong> đang cùng xem sản phẩm này
            </div>
          )}
        </div>

        {/* 2.5 SHOP VOUCHERS WALLET / COLLECTION */}
        <VoucherCollectionBar />

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
                        disabled={!isAvailable}
                        className={`${styles.variantBtn} ${isSelected ? styles.activeVariant : ''} ${!isAvailable ? styles.disabledVariant : ''}`}
                        onClick={() => isAvailable && handleSelectAttribute(opt.name, val)}
                        title={!isAvailable ? 'Tùy chọn này tạm hết hàng' : undefined}
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
                        disabled={!isAvail}
                        className={`${styles.variantBtn} ${isSelected ? styles.activeVariant : ''} ${!isAvail ? styles.disabledVariant : ''}`}
                        onClick={() => isAvail && setSelectedAttributes(v.attributes || {})}
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
          <h2 className={styles.descTitle}>
            <span>📋 Chi Tiết Sản Phẩm</span>
          </h2>
          
          <div
            className={`${styles.descContentWrapper} ${
              !isDescExpanded && (product.description?.length || 0) > 300
                ? styles.descContentCollapsed
                : ''
            }`}
          >
            <div className={styles.descContent}>
              {product.description ||
                'Chất liệu cao cấp, đường may tỉ mỉ, form dáng chuẩn thời trang hiện đại.\nThiết kế trẻ trung năng động, dễ phối đồ phù hợp đi học, đi chơi, đi làm.'}
            </div>

            {!isDescExpanded && (product.description?.length || 0) > 300 && (
              <div className={styles.descFadeOverlay} />
            )}
          </div>

          {(product.description?.length || 0) > 300 && (
            <button
              type="button"
              className={styles.descToggleBtn}
              onClick={() => setIsDescExpanded(!isDescExpanded)}
            >
              {isDescExpanded ? (
                <>
                  Thu gọn mô tả <FiChevronUp size={14} />
                </>
              ) : (
                <>
                  Xem toàn bộ mô tả chi tiết <FiChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>

        {/* 6. REVIEWS & RATINGS SUMMARY CARD */}
        <div className={styles.reviewsCard}>
          <div className={styles.reviewsCardHeader}>
            <div>
              <h2 className={styles.reviewsCardTitle}>Đánh Giá & Nhận Xét</h2>
              <div className={styles.reviewsRatingSummary}>
                <span className={styles.reviewsScoreBig}>{reviewsStats.averageRating || '5.0'}</span>
                <div className={styles.reviewsStarsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FiStar
                      key={i}
                      size={13}
                      style={{
                        fill: i <= Math.round(reviewsStats.averageRating) ? '#fbbf24' : 'none',
                        color: '#fbbf24',
                      }}
                    />
                  ))}
                </div>
                <span className={styles.reviewsCountText}>({reviewsStats.totalReviews} đánh giá)</span>
              </div>
            </div>
            <Link href={`/product/${product.slug}/reviews`} className={styles.seeAllReviewsLink}>
              Xem tất cả <FiChevronRight size={13} />
            </Link>
          </div>

          {/* Reviews Preview List or Empty Prompt */}
          {reviewsPreview.length > 0 ? (
            <div className={styles.reviewsPreviewList}>
              {reviewsPreview.map((rev) => (
                <div key={rev._id} className={styles.previewReviewItem}>
                  <div className={styles.previewReviewHeader}>
                    <div className={styles.previewAuthor}>
                      {rev.author ? (rev.author.length <= 2 ? rev.author + '***' : rev.author[0] + '***' + rev.author[rev.author.length - 1]) : 'Khách hàng'}
                    </div>
                    <div className={styles.previewStars}>
                      {[1, 2, 3, 4, 5].map((s: number) => (
                        <FiStar
                          key={s}
                          size={11}
                          style={{
                            fill: s <= rev.rating ? '#fbbf24' : 'none',
                            color: '#fbbf24',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.variantTitle && (
                    <span className={styles.previewVariant}>Phân loại: {rev.variantTitle}</span>
                  )}
                  <p className={styles.previewComment}>{rev.comment}</p>
                  {Array.isArray(rev.images) && rev.images.length > 0 && (
                    <div className={styles.previewImgs}>
                      {rev.images.slice(0, 3).map((imgUrl: string, idx: number) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt="Review"
                          className={styles.previewImg}
                          onClick={() => setLightboxImage(imgUrl)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noReviewsYet}>
              <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          )}

          <button
            type="button"
            className={styles.writeReviewCtaBtn}
            onClick={() => setIsWriteModalOpen(true)}
          >
            <FiEdit3 size={15} />
            <span>Viết đánh giá cho sản phẩm này</span>
          </button>
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
        <Link href={`/product/${product.slug}/reviews`} className={styles.actionIconBtn}>
          <FiStar size={18} />
          <span>Đánh giá</span>
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

      {/* ===== WRITE REVIEW MODAL ===== */}
      {isWriteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsWriteModalOpen(false)}>
          <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Đánh Giá Sản Phẩm</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsWriteModalOpen(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className={styles.modalBody}>
              {/* Interactive Star Rating Selector */}
              <div className={styles.ratingSelectorWrap}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                  Chất lượng sản phẩm
                </span>
                <div className={styles.starPicker}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.starBtn} ${star <= ratingInput ? styles.starBtnFilled : ''}`}
                      onClick={() => setRatingInput(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className={styles.ratingEmotionLabel}>{EMOTION_LABELS[ratingInput]}</span>
              </div>

              {/* Author Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Họ và tên của bạn *</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  required
                />
              </div>

              {/* Variant Selector */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phân loại hàng đã mua (tùy chọn)</label>
                {product?.variants && product.variants.length > 0 ? (
                  <select
                    className={styles.inputField}
                    value={variantInput}
                    onChange={(e) => setVariantInput(e.target.value)}
                  >
                    <option value="">-- Chọn phân loại sản phẩm --</option>
                    {product.variants.map((v: any, idx: number) => (
                      <option key={idx} value={v.title || v.name || `Phân loại ${idx + 1}`}>
                        {v.title || v.name || `Phân loại ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Ví dụ: Màu Đen, Size L..."
                    value={variantInput}
                    onChange={(e) => setVariantInput(e.target.value)}
                  />
                )}
              </div>

              {/* Quick Tags Suggestions */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Gợi ý nhận xét nhanh</label>
                <div className={styles.quickTags}>
                  {QUICK_TAGS.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={styles.quickTagBtn}
                      onClick={() => {
                        setCommentInput((prev) => (prev ? `${prev}. ${tag}` : tag));
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nhận xét chi tiết *</label>
                <textarea
                  className={styles.textareaField}
                  placeholder="Hãy chia sẻ trải nghiệm sử dụng thực tế của bạn về sản phẩm này nhé..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  required
                />
              </div>

              {/* Upload Photos */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Thêm hình ảnh thực tế ({uploadedImages.length}/5)
                </label>
                <div className={styles.uploadedPhotosGrid}>
                  {uploadedImages.map((url, i) => (
                    <div key={i} className={styles.uploadedThumbWrap}>
                      <img src={url} alt={`Upload ${i + 1}`} className={styles.uploadedThumb} />
                      <button
                        type="button"
                        className={styles.removeThumbBtn}
                        onClick={() => handleRemovePhoto(i)}
                        title="Xóa ảnh"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {uploadedImages.length < 5 && (
                    <button
                      type="button"
                      className={styles.uploadPhotoBtn}
                      onClick={() => reviewFileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <FiCamera size={18} />
                      <span>{isUploading ? 'Đang tải...' : 'Thêm ảnh'}</span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={reviewFileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleUploadPhoto}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== LIGHTBOX MODAL ===== */}
      {lightboxImage && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxImage(null)}>
          <button
            type="button"
            className={styles.closeLightboxBtn}
            onClick={() => setLightboxImage(null)}
          >
            ✕
          </button>
          <img src={lightboxImage} alt="Ảnh phóng to" className={styles.lightboxImg} />
        </div>
      )}
    </div>
  );
}