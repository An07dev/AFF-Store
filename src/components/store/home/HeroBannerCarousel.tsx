'use client';

import React, { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './HeroBannerCarousel.module.css';

interface BannerItem {
  image: string;
  title?: string;
  tag?: string;
  link?: string;
}

interface HeroBannerCarouselProps {
  banners: BannerItem[];
  subBanners?: BannerItem[];
  onNavigateToProducts?: () => void;
}

const DEFAULT_SUB_BANNERS: BannerItem[] = [
  {
    tag: '9.9 Siêu Sale',
    title: 'Ăn Sáng Ngon Rẻ - Chỉ từ 10.000đ',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
    link: '/?tab=products',
  },
  {
    tag: 'Hàng Việt Tôi Yêu',
    title: 'Chất Lượng Chính Hãng - Freeship 0Đ',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
    link: '/?tab=products&filter=flash-sale',
  },
];

const HeroBannerCarouselComponent: React.FC<HeroBannerCarouselProps> = ({
  banners,
  subBanners,
  onNavigateToProducts,
}) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide isolated within this component (4 seconds)
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners?.length]);

  if (!banners || banners.length === 0) return null;

  const validSubBanners =
    subBanners && subBanners.length > 0
      ? subBanners.slice(0, 2)
      : DEFAULT_SUB_BANNERS;

  return (
    <div className={styles.heroBannerSection}>
      {/* 1. MAIN BANNER CAROUSEL (Full width on Mobile, ~66% on PC) */}
      <div className={styles.bannerCarousel}>
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((slide, idx) => (
            <div
              key={idx}
              className={styles.carouselSlide}
              onClick={() => {
                if (slide.link) {
                  router.push(slide.link);
                } else if (onNavigateToProducts) {
                  onNavigateToProducts();
                } else {
                  router.push('/?tab=products');
                }
              }}
            >
              <Image
                src={slide.image}
                alt={slide.title || 'Banner'}
                fill
                sizes="(max-width: 859px) 100vw, 66vw"
                className={styles.carouselImg}
                priority={idx === 0}
                quality={85}
              />
              {(slide.tag || slide.title) && (
                <div className={styles.carouselOverlay}>
                  {slide.tag && <span className={styles.carouselTag}>{slide.tag}</span>}
                  {slide.title && <h2 className={styles.carouselTitle}>{slide.title}</h2>}
                </div>
              )}
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.carouselNavBtn} ${styles.carouselPrevBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
              }}
              aria-label="Ảnh trước"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={`${styles.carouselNavBtn} ${styles.carouselNextBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev + 1) % banners.length);
              }}
              aria-label="Ảnh sau"
            >
              <FiChevronRight size={18} />
            </button>
          </>
        )}

        <div className={styles.carouselDots}>
          {banners.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${currentSlide === idx ? styles.activeDot : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. 2 SUB-BANNERS STACKED (Shown on PC/Desktop, Hidden on Mobile) */}
      {validSubBanners.length > 0 && (
        <div className={styles.sideBannersColumn}>
          {validSubBanners.map((sub, idx) => (
            <div
              key={idx}
              className={styles.sideBannerItem}
              onClick={() => {
                if (sub.link) {
                  router.push(sub.link);
                } else if (onNavigateToProducts) {
                  onNavigateToProducts();
                } else {
                  router.push('/?tab=products');
                }
              }}
            >
              <Image
                src={sub.image}
                alt={sub.title || `Banner phụ ${idx + 1}`}
                fill
                sizes="(max-width: 859px) 50vw, 33vw"
                className={styles.sideBannerImg}
                loading="lazy"
                quality={80}
              />
              {(sub.tag || sub.title) && (
                <div className={styles.sideBannerOverlay}>
                  {sub.tag && <span className={styles.sideBannerTag}>{sub.tag}</span>}
                  {sub.title && <h3 className={styles.sideBannerTitle}>{sub.title}</h3>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const HeroBannerCarousel = memo(HeroBannerCarouselComponent);
export default HeroBannerCarousel;
