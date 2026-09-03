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
  FiHome,
  FiPackage,
  FiRefreshCw,
  FiMaximize2,
  FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import StoreLoading from '@/components/store/StoreLoading';
import BannerNotice from '@/components/common/BannerNotice';
import VoucherCollectionBar from '@/components/store/VoucherCollectionBar';
import StoreProductCard, { ProductItem } from '@/components/store/home/StoreProductCard';
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

  // Handle Safe Back Navigation
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const hasSameOriginReferrer =
        Boolean(document.referrer) &&
        (document.referrer.startsWith(window.location.origin) ||
          document.referrer.includes(window.location.host));

      if (hasSameOriginReferrer) {
        router.back();
        return;
      }

      const isExternalReferrer =
        Boolean(document.referrer) &&
        !document.referrer.includes(window.location.host);

      if (isExternalReferrer || window.history.length <= 1) {
        router.push('/');
        return;
      }

      router.back();
      return;
    }
    router.push('/');
  };

  // Dynamic Selected Attributes state: { [optionName: string]: string }
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // PC Tab State (Mô tả vs Đánh giá vs Gợi ý)
  const [pcTab, setPcTab] = useState<'desc' | 'reviews' | 'related'>('desc');

  // Related products state ("Có thể bạn cũng thích")
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);

  // Expand Modal State (For full description & full reviews view on PC)
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [expandModalTab, setExpandModalTab] = useState<'desc' | 'reviews' | 'related'>('desc');

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
      const res = await apiFetch(`/api/reviews?slug=${encodeURIComponent(params.slug as string)}&limit=10`);
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
      toast.error('Vui lòng nhập tên của bạn');
      return;
    }
    if (!commentInput.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?._id,
          productSlug: product?.slug,
          productName: product?.name,
          productImage: product?.images?.[0] || product?.image,
          author: authorInput.trim(),
          rating: ratingInput,
          comment: commentInput.trim(),
          variantTitle: variantInput.trim() || undefined,
          images: uploadedImages,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cảm ơn bạn! Đánh giá đã được gửi thành công.');
        setIsWriteModalOpen(false);
        setCommentInput('');
        setUploadedImages([]);
        loadReviewsPreview();
      } else {
        toast.error(data.message || 'Không thể gửi đánh giá');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch product data & flash sale status
  useEffect(() => {
    if (!params.slug) return;

    setLoading(true);
    Promise.all([
      apiFetch(`/api/products/${params.slug}`).then((r) => r.json()),
      apiFetch(`/api/flash-sale`).then((r) => r.json()).catch(() => null),
      apiFetch(`/api/settings/fomo`).then((r) => r.json()).catch(() => null),
    ])
      .then(([prodData, fsData, fomoData]) => {
        if (prodData.success && prodData.data) {
          const p = prodData.data;
          setProduct(p);

          // 1. Check if the product itself from API has an active LIVE flash sale
          if (p.flashSale && p.flashSale.isLive) {
            setFlashSaleItem(p.flashSale);
          } else if (p.flashPrice && p.isFlashSale) {
            setFlashSaleItem({
              flashPrice: p.flashPrice,
              originalPrice: p.price,
              isLive: true,
            });
          } else {
            setFlashSaleItem(null);
          }

          // Initialize default attributes from first available variant or option defaults
          const initAttrs: Record<string, string> = {};
          if (p.options && Array.isArray(p.options) && p.options.length > 0) {
            p.options.forEach((opt: IProductOption) => {
              if (opt.values && opt.values.length > 0) {
                initAttrs[opt.name] = opt.values[0];
              }
            });
          }
          setSelectedAttributes(initAttrs);

          // 2. Cross-verify with live /api/flash-sale data
          // ONLY attach flash sale when flash sale campaign is active AND currently LIVE in real-time
          if (fsData && fsData.success && fsData.data && fsData.data.isActive && fsData.data.isLive) {
            const pIdStr = String(p._id);
            let liveFsProduct: any = null;

            // Check live items in active slot
            if (Array.isArray(fsData.data.items) && fsData.data.items.length > 0) {
              liveFsProduct = fsData.data.items.find(
                (item: any) =>
                  String(item.productId?._id || item.productId || item._id) === pIdStr ||
                  item.slug === p.slug
              );
            }

            // Check active live slot if available
            if (!liveFsProduct && fsData.data.activeSlot && Array.isArray(fsData.data.activeSlot.items)) {
              liveFsProduct = fsData.data.activeSlot.items.find(
                (item: any) =>
                  (item.isActive ?? true) &&
                  (String(item.productId?._id || item.productId || item._id) === pIdStr ||
                    item.slug === p.slug)
              );
            }

            if (liveFsProduct) {
              const activeEndTime =
                fsData.data.activeSlot?.endTime ||
                fsData.data.slots?.find((s: any) => s.status === 'live')?.endTime ||
                '23:59';

              setFlashSaleItem({
                ...liveFsProduct,
                isLive: true,
                endTime: activeEndTime,
              });
            } else {
              setFlashSaleItem(null);
            }
          } else {
            // Flash sale is not active or not currently live -> strictly clear flashSaleItem
            setFlashSaleItem(null);
          }

          // Set FOMO settings
          if (fomoData && fomoData.success && fomoData.data) {
            setFomoSettings(fomoData.data);
          }
        } else {
          setProduct(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching product detail:', err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Flash sale countdown timer
  useEffect(() => {
    if (!flashSaleItem) return;

    const updateCountdown = () => {
      const now = new Date();
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const curSec = now.getSeconds();
      const curTotalSec = curHour * 3600 + curMin * 60 + curSec;

      let endTotalSec = 24 * 3600;
      if (flashSaleItem.endTime) {
        const [eh, em] = flashSaleItem.endTime.split(':').map((n: string) => parseInt(n, 10) || 0);
        endTotalSec = eh * 3600 + (em || 0) * 60;
      }

      const diff = Math.max(0, endTotalSec - curTotalSec);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setFlashCountdown({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [flashSaleItem]);

  // Fetch related products ("Có thể bạn cũng thích")
  useEffect(() => {
    if (!product?._id) return;

    let catParam = '';
    if (typeof product.category === 'string') {
      catParam = product.category;
    } else if (product.category?.slug) {
      catParam = product.category.slug;
    } else if (product.category?._id) {
      catParam = String(product.category._id);
    }

    async function loadRelated() {
      const currentIdStr = String(product._id);
      let list: any[] = [];

      if (catParam && catParam !== 'all') {
        try {
          const res = await apiFetch(`/api/products?category=${encodeURIComponent(catParam)}&limit=12&status=active`);
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            list = data.data.filter((p: any) => String(p._id) !== currentIdStr && p.slug !== product.slug);
          }
        } catch (e) {}
      }

      if (list.length < 4) {
        try {
          const res = await apiFetch(`/api/products?limit=12&status=active&sort=popular`);
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const fallbackList = data.data.filter((p: any) => String(p._id) !== currentIdStr && p.slug !== product.slug);
            const existingIds = new Set(list.map((it) => String(it._id)));
            fallbackList.forEach((it: any) => {
              if (!existingIds.has(String(it._id))) {
                list.push(it);
                existingIds.add(String(it._id));
              }
            });
          }
        } catch (e) {}
      }

      setRelatedProducts(list.slice(0, 10));
    }

    loadRelated();
  }, [product?._id, product?.category, product?.slug]);

  const handleQuickAddRelated = (e: React.MouseEvent, relProd: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(relProd, 1);
    toast.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  // Derive Options and Variants from Product Data
  const options: IProductOption[] = useMemo(() => {
    if (product?.options && Array.isArray(product.options) && product.options.length > 0) {
      return product.options;
    }
    return [];
  }, [product]);

  const variants: IVariantItem[] = useMemo(() => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    return [];
  }, [product]);

  // Match current selected attributes to a variant
  const matchedVariant: IVariantItem | null = useMemo(() => {
    if (!variants.length) return null;
    return findMatchingVariant(variants, selectedAttributes);
  }, [variants, selectedAttributes]);

  // Pricing calculation
  const basePrice = product?.price || 0;
  const baseOriginalPrice = product?.originalPrice || (product?.comparePrice ?? null);

  const currentPrice = useMemo(() => {
    if (flashSaleItem?.flashPrice && flashSaleItem?.isLive) {
      return flashSaleItem.flashPrice;
    }
    if (matchedVariant) {
      if (typeof matchedVariant.salePrice === 'number' && matchedVariant.salePrice > 0) {
        return matchedVariant.salePrice;
      }
      if (typeof product?.salePrice === 'number' && product.salePrice > 0 && product.salePrice < (matchedVariant.price || basePrice)) {
        return product.salePrice;
      }
      if (typeof matchedVariant.price === 'number' && matchedVariant.price > 0) {
        return matchedVariant.price;
      }
    }
    if (typeof product?.salePrice === 'number' && product.salePrice > 0) {
      return product.salePrice;
    }
    return basePrice;
  }, [flashSaleItem, matchedVariant, product, basePrice]);

  const originalPrice = useMemo(() => {
    if (flashSaleItem?.originalPrice && flashSaleItem?.isLive) {
      return flashSaleItem.originalPrice;
    }
    if (flashSaleItem?.flashPrice && flashSaleItem?.isLive && (product?.originalPrice || product?.price)) {
      return product?.originalPrice || product?.price;
    }
    if (matchedVariant) {
      if (
        typeof matchedVariant.salePrice === 'number' &&
        matchedVariant.salePrice > 0 &&
        matchedVariant.price > matchedVariant.salePrice
      ) {
        return matchedVariant.price;
      }
      if (matchedVariant.originalPrice && matchedVariant.originalPrice > currentPrice) {
        return matchedVariant.originalPrice;
      }
      if (matchedVariant.price && matchedVariant.price > currentPrice) {
        return matchedVariant.price;
      }
    }
    if (baseOriginalPrice && baseOriginalPrice > currentPrice) {
      return baseOriginalPrice;
    }
    if (product?.salePrice && product.price > product.salePrice) {
      return product.price;
    }
    return null;
  }, [flashSaleItem, matchedVariant, baseOriginalPrice, currentPrice, product]);

  const hasDiscount = originalPrice !== null && originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  // Stock Calculation
  const totalStock = useMemo(() => {
    if (variants && variants.length > 0) {
      return variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    }
    if (typeof product?.stock === 'number') {
      return product.stock;
    }
    return 0;
  }, [variants, product]);

  const currentStock = useMemo(() => {
    if (matchedVariant && typeof matchedVariant.stock === 'number') {
      return matchedVariant.stock;
    }
    if (variants && variants.length > 0) {
      return totalStock;
    }
    if (typeof product?.stock === 'number') {
      return product.stock;
    }
    return 0;
  }, [matchedVariant, variants, totalStock, product]);

  const isOutOfStock = currentStock <= 0;
  const isProductOutOfStock = totalStock <= 0;

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600'];

  // Auto adjust quantity when selected variant's stock changes
  useEffect(() => {
    if (currentStock > 0 && quantity > currentStock) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(1);
    }
  }, [currentStock]);

  // Switch image if variant has dedicated image
  useEffect(() => {
    if (matchedVariant?.image && images.length > 0) {
      const idx = images.findIndex((img: string) => img === matchedVariant.image);
      if (idx > -1) {
        setActiveImageIndex(idx);
      }
    }
  }, [matchedVariant, images]);

  // Check if an option value is available given current selections
  const isOptionValueAvailable = (optName: string, val: string) => {
    if (!variants.length) return true;
    const testAttrs = { ...selectedAttributes, [optName]: val };
    const matching = variants.find((v: any) => {
      const rawAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {});
      const isMatch = Object.entries(testAttrs).every(([k, vVal]) => {
        if (!vVal) return true;
        return rawAttrs[k] === vVal || (k === 'Màu sắc' && v.color === vVal) || (k === 'Kích cỡ' && v.size === vVal);
      });
      return isMatch && (v.stock ?? 1) > 0;
    });
    return !!matching;
  };

  const handleSelectAttribute = (optName: string, val: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [optName]: val,
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (isOutOfStock) {
      toast.error('Sản phẩm tạm thời hết hàng');
      return;
    }

    const prodWithFlash = (flashSaleItem?.flashPrice && flashSaleItem?.isLive)
      ? { ...product, flashPrice: flashSaleItem.flashPrice, isFlashSale: true }
      : product;

    addToCart(prodWithFlash, quantity, matchedVariant || undefined);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (isOutOfStock) {
      toast.error('Sản phẩm tạm thời hết hàng');
      return;
    }

    const prodWithFlash = (flashSaleItem?.flashPrice && flashSaleItem?.isLive)
      ? { ...product, flashPrice: flashSaleItem.flashPrice, isFlashSale: true }
      : product;

    buyNow(prodWithFlash, quantity, matchedVariant || undefined);
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

  const handleOpenExpandModal = (tab: 'desc' | 'reviews') => {
    setExpandModalTab(tab);
    setIsExpandModalOpen(true);
  };

  if (loading) {
    return <StoreLoading />;
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <FiAlertCircle size={40} color="#ef4444" style={{ marginBottom: 12 }} />
          <h3>Không tìm thấy sản phẩm</h3>
          <p style={{ color: 'var(--text-muted)' }}>Sản phẩm có thể đã bị xóa hoặc ngưng kinh doanh.</p>
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              borderRadius: 9999,
              background: 'var(--primary, #ee4d2d)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* =========================================================================
          1. MOBILE VIEW (< 1024px) - 100% ORIGINAL & UNTOUCHED MOBILE STRUCTURE
          ========================================================================= */}
      <div className={styles.mobileView}>
        {/* Fixed Top Navigation */}
        <nav className={styles.mobileTopNav}>
          <button
            className={styles.navBtn}
            onClick={handleBack}
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

        {/* Scrollable Content Area */}
        <div className={styles.mobileScrollArea}>
          <BannerNotice />

          {/* 1. Mobile Gallery */}
          <div className={styles.mobileGallery}>
            <img
              src={images[activeImageIndex] || images[0]}
              alt={product.name}
              className={styles.mobileMainImage}
            />
            {images.length > 1 && (
              <>
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

          {/* Mobile Flash Sale Bar */}
          {flashSaleItem && flashSaleItem.isLive && (
            <div className={styles.mobileFlashBar}>
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

          {/* 2. Mobile Main Card */}
          <div className={styles.mobileMainCard}>
            <div className={styles.mobilePriceRow}>
              <span
                className={styles.mobileCurrentPrice}
                style={{ color: (flashSaleItem && flashSaleItem.isLive) ? '#f97316' : undefined }}
              >
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className={styles.mobileOldPrice}>{formatPrice(originalPrice)}</span>
                  {discountPercent && (
                    <span
                      className={styles.mobileDiscountBadge}
                      style={{
                        background: (flashSaleItem && flashSaleItem.isLive) ? '#ea580c' : undefined,
                        color: (flashSaleItem && flashSaleItem.isLive) ? '#ffffff' : undefined,
                      }}
                    >
                      -{discountPercent}%
                    </span>
                  )}
                </>
              )}
            </div>

            <h1 className={styles.mobileTitle}>{product.name}</h1>

            <div className={styles.mobileMetaRow}>
              <Link href={`/product/${product.slug}/reviews`} className={styles.ratingLink}>
                <span className={styles.mobileRating}>
                  <FiStar style={{ fill: '#FFB800' }} size={13} /> {reviewsStats.averageRating || product.rating || 5.0}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>
                    ({reviewsStats.totalReviews} đánh giá)
                  </span>
                </span>
              </Link>
              <span className={styles.mobileSold}>
                Đã bán {product.soldCount ?? product.sold ?? 0}
              </span>
              <span className={styles.mobileStock}>
                {isProductOutOfStock ? (
                  <span className={styles.outOfStockBadge}>Tạm hết hàng</span>
                ) : (
                  `Kho: ${totalStock} có sẵn`
                )}
              </span>
            </div>

            {/* FOMO Notice */}
            {fomoSettings?.enableViewerCount !== false && (
              <div className={styles.mobileViewerCountNotice}>
                <FiZap /> 🔥 <strong>18 người</strong> đang cùng xem sản phẩm này
              </div>
            )}
          </div>

          {/* 2.5 Voucher Collection Bar */}
          <VoucherCollectionBar />

          {/* 3. Mobile Variant Selection Card */}
          {(options.length > 0 || (variants.length > 0 && options.length === 0)) && (
            <div className={styles.mobileVariantCard}>
              {options.map((opt) => (
                <div key={opt.name} className={styles.variantSection}>
                  <div className={styles.variantTitle}>
                    <span>{opt.name}:</span>
                    {selectedAttributes[opt.name] && (
                      <span style={{ color: 'var(--primary, #ee4d2d)', fontWeight: 700, marginLeft: 4 }}>
                        {selectedAttributes[opt.name]}
                        {matchedVariant && typeof matchedVariant.stock === 'number' && (
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted, #64748b)', fontWeight: 500, marginLeft: 6 }}>
                            (Còn {matchedVariant.stock} sp)
                          </span>
                        )}
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
              <div className={styles.mobileQuantityRow}>
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

          {/* 4. Mobile Shop Info Card */}
          <div className={styles.mobileShopCard}>
            <div className={styles.shopLeft}>
              <div className={styles.shopAvatar}>
                {theme?.pageTitles?.logoUrl ? (
                  <img
                    src={theme.pageTitles.logoUrl}
                    alt={theme?.pageTitles?.logoText || 'ShopBig Store'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }}
                  />
                ) : (
                  theme?.pageTitles?.logoText ? theme.pageTitles.logoText.substring(0, 2).toUpperCase() : 'ST'
                )}
              </div>
              <div>
                <div className={styles.shopName}>{theme?.pageTitles?.logoText || 'ShopBig Store'}</div>
                <div className={styles.shopMeta}>⭐ 4.8 | 12.5K đã bán</div>
              </div>
            </div>
            <Link href="/" className={styles.viewShopBtn}>
              Xem Shop
            </Link>
          </div>

          {/* 5. Mobile Description Card */}
          <div className={styles.mobileDescCard}>
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

          {/* 6. Mobile Reviews Card */}
          <div className={styles.mobileReviewsCard}>
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

          {/* 6. Mobile Related Products: Có Thể Bạn Cũng Thích */}
          {relatedProducts.length > 0 && (
            <div className={styles.relatedSection}>
              <div className={styles.relatedHeader}>
                <div className={styles.relatedTitleGroup}>
                  <span className={styles.relatedSparkleIcon}>✨</span>
                  <h3 className={styles.relatedTitle}>CÓ THỂ BẠN CŨNG THÍCH</h3>
                </div>
                <Link href="/?tab=products" className={styles.relatedSeeAllBtn}>
                  <span>Xem thêm</span>
                  <FiChevronRight size={13} />
                </Link>
              </div>

              <div className={styles.relatedGrid}>
                {relatedProducts.map((relProd) => (
                  <StoreProductCard
                    key={relProd._id}
                    product={relProd}
                    onQuickAdd={handleQuickAddRelated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Fixed Bottom Action Bar */}
        <div className={styles.mobileBottomBar}>
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
      </div>

      {/* =========================================================================
          2. PC VIEW (>= 1024px) - LUXURY SINGLE-VIEWPORT NO-SCROLL LAYOUT
          ========================================================================= */}
      <div className={styles.pcView}>
        {/* Top PC Nav / Breadcrumbs */}
        <nav className={styles.pcTopNav}>
          <div className={styles.topNavLeft}>
            <button
              className={styles.navBtn}
              onClick={handleBack}
              aria-label="Quay lại"
            >
              <FiChevronLeft size={22} />
            </button>
            <div className={styles.breadcrumbGroup}>
              <Link href="/" className={styles.breadcrumbLink}>
                <FiHome size={13} /> Trang Chủ
              </Link>
              <span className={styles.breadcrumbDivider}>/</span>
              <span className={styles.breadcrumbActive}>{product.name}</span>
            </div>
          </div>

          <div className={styles.navRight}>
            <button className={styles.navBtn} onClick={handleShare} aria-label="Chia sẻ" title="Chia sẻ sản phẩm">
              <FiShare2 size={18} />
            </button>
            <Link href="/cart" className={styles.navBtn} aria-label="Giỏ hàng" title="Giỏ hàng">
              <FiShoppingCart size={18} />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>
          </div>
        </nav>

        {/* 2-Column Main Showcase Grid */}
        <div className={styles.pcViewportGrid}>
          {/* Left Column: Media Showcase */}
          <div className={styles.pcLeftColumn}>
            <div className={styles.pcGallery}>
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className={styles.pcMainImage}
              />

              <div className={styles.badgeOverlay}>
                <span className={styles.mallBadge}>MALL</span>
                {discountPercent && (
                  <span className={styles.discountOverlayBadge}>
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <>
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

            {images.length > 1 && (
              <div className={styles.pcThumbnailsReel}>
                {images.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.thumbnailBtn} ${activeImageIndex === idx ? styles.activeThumbnail : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className={styles.thumbImg} />
                  </button>
                ))}
              </div>
            )}

            <div className={styles.pcTrustBadgesRow}>
              <div className={styles.trustItem}>
                <FiShield className={styles.trustIcon} />
                <span>100% Chính Hãng</span>
              </div>
              <div className={styles.trustItem}>
                <FiRefreshCw className={styles.trustIcon} />
                <span>Đổi trả 7 ngày</span>
              </div>
              <div className={styles.trustItem}>
                <FiTruck className={styles.trustIcon} />
                <span>Freeship từ 500k</span>
              </div>
            </div>

            <div className={styles.pcShopCardMini}>
              <div className={styles.shopLeft}>
                <div className={styles.shopAvatar}>
                  {theme?.pageTitles?.logoUrl ? (
                    <img
                      src={theme.pageTitles.logoUrl}
                      alt={theme?.pageTitles?.logoText || 'Shop'}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }}
                    />
                  ) : (
                    theme?.pageTitles?.logoText ? theme.pageTitles.logoText.substring(0, 2).toUpperCase() : 'ST'
                  )}
                </div>
                <div>
                  <div className={styles.shopName}>{theme?.pageTitles?.logoText || 'ShopBig Store'}</div>
                  <div className={styles.shopMeta}>⭐ 4.9 • 15.2K đã bán • Phản hồi 99%</div>
                </div>
              </div>
              <Link href="/" className={styles.viewShopBtn}>
                Xem Shop
              </Link>
            </div>
          </div>

          {/* Right Column: Command Center */}
          <div className={styles.pcRightColumn}>
            <div className={styles.pcProductHeaderBox}>
              <h1 className={styles.pcTitle}>{product.name}</h1>

              <div className={styles.pcMetaRow}>
                <span className={styles.rating}>
                  <FiStar style={{ fill: '#FFB800' }} size={13} /> {reviewsStats.averageRating || product.rating || 5.0}
                  <span className={styles.ratingCount}>
                    ({reviewsStats.totalReviews} đánh giá)
                  </span>
                </span>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.sold}>
                  Đã bán {product.soldCount ?? product.sold ?? 0}
                </span>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.stock}>
                  {isProductOutOfStock ? (
                    <span className={styles.outOfStockBadge}>Tạm hết hàng</span>
                  ) : (
                    `Kho: ${totalStock} có sẵn`
                  )}
                </span>
              </div>

              {flashSaleItem && flashSaleItem.isLive && (
                <div className={styles.shopeeFlashBar}>
                  <div className={styles.flashBarLeft}>
                    <FiZap size={16} style={{ fill: '#fff' }} />
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

              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className={styles.oldPrice}>{formatPrice(originalPrice)}</span>
                    {discountPercent && (
                      <span className={styles.discountBadge}>
                        -{discountPercent}%
                      </span>
                    )}
                  </>
                )}
              </div>

              {fomoSettings?.enableViewerCount !== false && (
                <div className={styles.viewerCountNotice}>
                  <FiZap size={13} /> 🔥 <strong>18 người</strong> đang cùng xem sản phẩm này
                </div>
              )}
            </div>

            <div className={styles.voucherSectionWrap}>
              <VoucherCollectionBar />
            </div>

            {(options.length > 0 || (variants.length > 0 && options.length === 0)) && (
              <div className={styles.pcVariantCard}>
                {options.map((opt) => (
                  <div key={opt.name} className={styles.variantSection}>
                    <div className={styles.variantTitle}>
                      <span>{opt.name}:</span>
                      {selectedAttributes[opt.name] && (
                        <span className={styles.selectedVariantText}>
                          {' '}{selectedAttributes[opt.name]}
                          {matchedVariant && typeof matchedVariant.stock === 'number' && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', fontWeight: 500, marginLeft: 6 }}>
                              (Còn {matchedVariant.stock} sản phẩm)
                            </span>
                          )}
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
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {options.length === 0 && variants.length > 0 && (
                  <div className={styles.variantSection}>
                    <div className={styles.variantTitle}>Phân loại hàng:</div>
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

                <div className={styles.quantityRow}>
                  <span className={styles.qtyLabel}>Số lượng:</span>
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
                  <span className={styles.stockNoticeText}>
                    {currentStock} sản phẩm có sẵn
                  </span>
                </div>
              </div>
            )}

            {/* Desktop Action Buttons */}
            <div className={styles.pcActionButtons}>
              <Link
                href={`/chat?product=${product.slug || ''}`}
                className={styles.pcChatBtn}
                title="Chat với Shop"
              >
                <FiMessageSquare size={17} />
                <span>Chat Ngay</span>
              </Link>

              <button
                type="button"
                className={styles.pcAddCartBtn}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <FiShoppingCart size={17} />
                <span>Thêm Vào Giỏ</span>
              </button>

              <button
                type="button"
                className={styles.pcBuyNowBtn}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                <FiZap size={17} />
                <span>{isOutOfStock ? 'Tạm Hết Hàng' : 'Mua Ngay'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Full Description & Customer Reviews Card */}
        <div className={styles.pcDetailsCard}>
          <div className={styles.tabHeader}>
            <div className={styles.tabButtonsGroup}>
              <button
                type="button"
                className={`${styles.tabBtn} ${pcTab === 'desc' ? styles.activeTabBtn : ''}`}
                onClick={() => setPcTab('desc')}
              >
                <FiPackage size={15} />
                <span>Chi Tiết Mô Tả Sản Phẩm</span>
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${pcTab === 'reviews' ? styles.activeTabBtn : ''}`}
                onClick={() => setPcTab('reviews')}
              >
                <FiStar size={15} />
                <span>Đánh Giá Khách Hàng ({reviewsStats.totalReviews})</span>
              </button>
            </div>
          </div>

          <div className={styles.pcDetailsBody}>
            {pcTab === 'desc' ? (
              <div className={styles.fullDescContent}>
                <div className={styles.descHighlightsBox}>
                  <h4>🌟 Đặc điểm nổi bật</h4>
                  <p>{product.name}</p>
                </div>
                <div className={styles.fullDescText}>
                  {product.description ||
                    'Chất liệu cao cấp, đường may tỉ mỉ, form dáng chuẩn thời trang hiện đại.\nThiết kế trẻ trung năng động, dễ phối đồ phù hợp đi học, đi chơi, đi làm.'}
                </div>

                <div className={styles.policyGuarantees}>
                  <div className={styles.policyItem}>
                    <FiShield size={20} color="var(--primary, #ee4d2d)" />
                    <div>
                      <strong>Cam kết chính hãng 100%</strong>
                      <p>Đảm bảo nguồn gốc xuất xứ rõ ràng, hoàn tiền nếu phát hiện hàng giả.</p>
                    </div>
                  </div>
                  <div className={styles.policyItem}>
                    <FiRefreshCw size={20} color="var(--primary, #ee4d2d)" />
                    <div>
                      <strong>Chính sách đổi trả trong 7 ngày</strong>
                      <p>Hỗ trợ đổi size hoặc hoàn tiền nếu sản phẩm có lỗi từ nhà sản xuất.</p>
                    </div>
                  </div>
                  <div className={styles.policyItem}>
                    <FiTruck size={20} color="var(--primary, #ee4d2d)" />
                    <div>
                      <strong>Giao hàng toàn quốc siêu tốc</strong>
                      <p>Kiểm tra hàng thoải mái trước khi thanh toán COD.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.fullReviewsContent}>
                <div className={styles.fullReviewsStatsCard}>
                  <div className={styles.fullReviewsScoreGroup}>
                    <span className={styles.fullReviewsScoreNum}>{reviewsStats.averageRating || '5.0'}</span>
                    <div className={styles.fullReviewsStarsBig}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FiStar
                          key={i}
                          size={16}
                          style={{
                            fill: i <= Math.round(reviewsStats.averageRating) ? '#fbbf24' : 'none',
                            color: '#fbbf24',
                          }}
                        />
                      ))}
                    </div>
                    <span className={styles.fullReviewsCount}>Dựa trên {reviewsStats.totalReviews} lượt đánh giá thực tế</span>
                  </div>

                  <button
                    type="button"
                    className={styles.writeReviewCtaBtn}
                    onClick={() => setIsWriteModalOpen(true)}
                  >
                    <FiEdit3 size={15} />
                    <span>Viết đánh giá cho sản phẩm này</span>
                  </button>
                </div>

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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noReviewsYet}>
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. PC Related Products: Có Thể Bạn Cũng Thích */}
        {relatedProducts.length > 0 && (
          <div className={styles.pcRelatedSection}>
            <div className={styles.relatedHeader}>
              <div className={styles.relatedTitleGroup}>
                <span className={styles.relatedSparkleIcon}>✨</span>
                <h3 className={styles.relatedTitle}>CÓ THỂ BẠN CŨNG THÍCH</h3>
              </div>
              <Link href="/?tab=products" className={styles.relatedSeeAllBtn}>
                <span>Xem tất cả</span>
                <FiChevronRight size={14} />
              </Link>
            </div>

            <div className={styles.pcRelatedGrid}>
              {relatedProducts.map((relProd) => (
                <StoreProductCard
                  key={relProd._id}
                  product={relProd}
                  onQuickAdd={handleQuickAddRelated}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. EXPAND MODAL (FOR FULL DESCRIPTION & ALL REVIEWS)
          ========================================================================= */}
      {isExpandModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsExpandModalOpen(false)}>
          <div className={styles.expandModalSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.expandModalHeader}>
              <div className={styles.expandModalTabs}>
                <button
                  type="button"
                  className={`${styles.expandTabHeaderBtn} ${expandModalTab === 'desc' ? styles.activeExpandTab : ''}`}
                  onClick={() => setExpandModalTab('desc')}
                >
                  <FiPackage size={15} />
                  <span>Chi Tiết Mô Tả Sản Phẩm</span>
                </button>
                <button
                  type="button"
                  className={`${styles.expandTabHeaderBtn} ${expandModalTab === 'reviews' ? styles.activeExpandTab : ''}`}
                  onClick={() => setExpandModalTab('reviews')}
                >
                  <FiStar size={15} />
                  <span>Đánh Giá Từ Khách Hàng ({reviewsStats.totalReviews})</span>
                </button>
              </div>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsExpandModalOpen(false)}
                aria-label="Đóng"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className={styles.expandModalBody}>
              {expandModalTab === 'desc' ? (
                <div className={styles.fullDescContent}>
                  <div className={styles.descHighlightsBox}>
                    <h4>🌟 Đặc điểm nổi bật</h4>
                    <p>{product.name}</p>
                  </div>
                  <div className={styles.fullDescText}>
                    {product.description ||
                      'Chất liệu cao cấp, đường may tỉ mỉ, form dáng chuẩn thời trang hiện đại.\nThiết kế trẻ trung năng động, dễ phối đồ phù hợp đi học, đi chơi, đi làm.'}
                  </div>

                  <div className={styles.policyGuarantees}>
                    <div className={styles.policyItem}>
                      <FiShield size={20} color="var(--primary, #ee4d2d)" />
                      <div>
                        <strong>Cam kết chính hãng 100%</strong>
                        <p>Đảm bảo nguồn gốc xuất xứ rõ ràng, hoàn tiền nếu phát hiện hàng giả.</p>
                      </div>
                    </div>
                    <div className={styles.policyItem}>
                      <FiRefreshCw size={20} color="var(--primary, #ee4d2d)" />
                      <div>
                        <strong>Chính sách đổi trả trong 7 ngày</strong>
                        <p>Hỗ trợ đổi size hoặc hoàn tiền nếu sản phẩm có lỗi từ nhà sản xuất.</p>
                      </div>
                    </div>
                    <div className={styles.policyItem}>
                      <FiTruck size={20} color="var(--primary, #ee4d2d)" />
                      <div>
                        <strong>Giao hàng toàn quốc siêu tốc</strong>
                        <p>Kiểm tra hàng thoải mái trước khi thanh toán COD.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.fullReviewsContent}>
                  <div className={styles.fullReviewsStatsCard}>
                    <div className={styles.fullReviewsScoreGroup}>
                      <span className={styles.fullReviewsScoreNum}>{reviewsStats.averageRating || '5.0'}</span>
                      <div className={styles.fullReviewsStarsBig}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <FiStar
                            key={i}
                            size={16}
                            style={{
                              fill: i <= Math.round(reviewsStats.averageRating) ? '#fbbf24' : 'none',
                              color: '#fbbf24',
                            }}
                          />
                        ))}
                      </div>
                      <span className={styles.fullReviewsCountText}>{reviewsStats.totalReviews} đánh giá thực tế</span>
                    </div>

                    <button
                      type="button"
                      className={styles.writeReviewCtaBtn}
                      onClick={() => {
                        setIsExpandModalOpen(false);
                        setIsWriteModalOpen(true);
                      }}
                    >
                      <FiEdit3 size={15} />
                      <span>Viết Đánh Giá Ngay</span>
                    </button>
                  </div>

                  <div className={styles.fullReviewsList}>
                    {reviewsPreview.length > 0 ? (
                      reviewsPreview.map((rev) => (
                        <div key={rev._id} className={styles.fullReviewCard}>
                          <div className={styles.fullReviewTop}>
                            <div className={styles.fullReviewUserWrap}>
                              <div className={styles.userAvatarCircle}>
                                <FiUser size={14} />
                              </div>
                              <div>
                                <strong className={styles.fullReviewAuthor}>
                                  {rev.author || 'Khách hàng'}
                                </strong>
                                <div className={styles.verifiedBuyerTag}>
                                  <FiCheckCircle size={10} /> Đã mua hàng
                                </div>
                              </div>
                            </div>

                            <div className={styles.fullReviewStars}>
                              {[1, 2, 3, 4, 5].map((s: number) => (
                                <FiStar
                                  key={s}
                                  size={12}
                                  style={{
                                    fill: s <= rev.rating ? '#fbbf24' : 'none',
                                    color: '#fbbf24',
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          {rev.variantTitle && (
                            <span className={styles.fullReviewVariant}>
                              Phân loại: <strong>{rev.variantTitle}</strong>
                            </span>
                          )}

                          <p className={styles.fullReviewCommentText}>{rev.comment}</p>

                          {Array.isArray(rev.images) && rev.images.length > 0 && (
                            <div className={styles.fullReviewPhotos}>
                              {rev.images.map((imgUrl: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt="Review"
                                  className={styles.fullReviewPhotoImg}
                                  onClick={() => setLightboxImage(imgUrl)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className={styles.noReviewsFull}>
                        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.expandModalFooter}>
              <button
                type="button"
                className={styles.modalCloseFooterBtn}
                onClick={() => setIsExpandModalOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className={styles.modalBuyNowFooterBtn}
                onClick={() => {
                  setIsExpandModalOpen(false);
                  handleBuyNow();
                }}
              >
                <FiZap size={16} />
                <span>Mua Ngay ({formatPrice(currentPrice)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. WRITE REVIEW MODAL
          ========================================================================= */}
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

      {/* =========================================================================
          5. LIGHTBOX MODAL
          ========================================================================= */}
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