'use client';

import React, { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from '@/app/(store)/page.module.css';

interface BannerItem {
  image: string;
  title?: string;
  tag?: string;
  link?: string;
}

interface HeroBannerCarouselProps {
  banners: BannerItem[];
  onNavigateToProducts?: () => void;
}

const HeroBannerCarouselComponent: React.FC<HeroBannerCarouselProps> = ({
  banners,
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

  return (
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
            <img
              src={slide.image}
              alt={slide.title || 'Banner'}
              className={styles.carouselImg}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              // @ts-ignore
              fetchpriority={idx === 0 ? 'high' : 'auto'}
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
  );
};

export const HeroBannerCarousel = memo(HeroBannerCarouselComponent);
export default HeroBannerCarousel;
