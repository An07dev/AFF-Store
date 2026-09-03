"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Bot,
  Package,
  ShoppingCart,
  Truck,
  Zap,
  Palette,
  Target,
} from "lucide-react";
import styles from "./ai-image-generator-hero.module.css";

export interface ImageCard {
  id: string;
  src: string;
  alt: string;
  rotation?: number;
}

export interface ImageCarouselHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText: string;
  onCtaClick?: () => void;
  images: ImageCard[];
  features?: Array<{
    title: string;
    description: string;
  }>;
  onCardClick?: (index: number) => void;
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  "admin-dashboard": <BarChart3 size={15} />,
  "admin-chat": <Bot size={15} />,
  "admin-products": <Package size={15} />,
  "admin-orders": <ShoppingCart size={15} />,
  "admin-shipping": <Truck size={15} />,
  "admin-vietqr": <Zap size={15} />,
  "admin-theme": <Palette size={15} />,
  "admin-marketing": <Target size={15} />,
};

const TAB_SHORT_LABELS: Record<string, string> = {
  "admin-dashboard": "Tổng Quan Báo Cáo",
  "admin-chat": "AI CSKH 24/7",
  "admin-products": "Kho Hàng & Biến Thể",
  "admin-orders": "Quản Lý Đơn Hàng",
  "admin-shipping": "Đẩy Đơn GHN / GHTK",
  "admin-vietqr": "Cổng VietQR SePay",
  "admin-theme": "7 Multi-Themes",
  "admin-marketing": "Meta & TikTok CAPI",
};

const TAB_URLS: Record<string, string> = {
  "admin-dashboard": "shopbig.vn/admin",
  "admin-chat": "shopbig.vn/admin/chat",
  "admin-products": "shopbig.vn/admin/products",
  "admin-orders": "shopbig.vn/admin/orders",
  "admin-shipping": "shopbig.vn/admin/shipping",
  "admin-vietqr": "shopbig.vn/admin/payment",
  "admin-theme": "shopbig.vn/admin/settings",
  "admin-marketing": "shopbig.vn/admin/marketing",
};

const TAB_BADGES: Record<string, string> = {
  "admin-dashboard": "Doanh Thu Realtime",
  "admin-chat": "AI Live Chốt Đơn",
  "admin-products": "Multi-Variants 19+ SP",
  "admin-orders": "Khớp Lệnh 1s",
  "admin-shipping": "GHN / GHTK / VTP",
  "admin-vietqr": "0% Phí Sàn",
  "admin-theme": "7 Themes Đa Sắc",
  "admin-marketing": "100% Data CAPI",
};

export function ImageCarouselHero({
  title,
  subtitle,
  description,
  ctaText,
  onCtaClick,
  images = [],
  features = [],
  onCardClick,
}: ImageCarouselHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Auto-switch tabs every 4.5 seconds if not hovered
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, images.length]);

  // Auto-scroll active tab into view inside the tab container ONLY (never scrolls window)
  useEffect(() => {
    if (tabListRef.current) {
      const container = tabListRef.current;
      const activeTabBtn = container.children[activeIndex] as HTMLElement;
      if (activeTabBtn) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTabBtn.getBoundingClientRect();
        const currentScrollLeft = container.scrollLeft;
        const targetScrollLeft =
          currentScrollLeft +
          (tabRect.left - containerRect.left) -
          container.clientWidth / 2 +
          tabRect.width / 2;

        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[activeIndex] || images[0];
  const currentKey = currentImage?.id || "";
  const currentUrl = TAB_URLS[currentKey] || "shopbig.vn/admin";
  const currentBadge = TAB_BADGES[currentKey] || "ShopBig Admin";

  return (
    <div className={styles.heroWrapper}>
      {/* Ambient Background Glows */}
      <div className={styles.ambientGlow1} />
      <div className={styles.ambientGlow2} />

      <div className={styles.heroContainer}>
        {/* Subtitle Pill Badge */}
        {subtitle && (
          <div className={styles.badgePill}>
            ✨ {subtitle}
          </div>
        )}

        {/* Section Title & Description */}
        <div className={styles.contentSection}>
          <h2 className={styles.title}>{title}</h2>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : (
            <p className={styles.description}>
            </p>
          )}
        </div>

        {/* Interactive Showcase Container */}
        <div
          className={styles.showcaseBox}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 1. Horizontal Scrollable Feature Tabs */}
          <div className={styles.tabsContainer} ref={tabListRef}>
            {images.map((img, idx) => {
              const isSelected = activeIndex === idx;
              const icon = TAB_ICONS[img.id] || <BarChart3 size={15} />;
              const label = TAB_SHORT_LABELS[img.id] || img.alt || `Tính năng ${idx + 1}`;

              return (
                <button
                  key={img.id || idx}
                  type="button"
                  className={`${styles.tabBtn} ${isSelected ? styles.tabBtnActive : ""}`}
                  onClick={() => {
                    setActiveIndex(idx);
                    setIsPaused(true);
                  }}
                >
                  <span className={styles.tabIcon}>{icon}</span>
                  <span className={styles.tabText}>{label}</span>
                  {isSelected && <span className={styles.activeDot} />}
                </button>
              );
            })}
          </div>

          {/* 2. Main High-Definition Mockup Window Frame */}
          <div className={styles.mockupWindowWrapper}>
            <div className={styles.mockupWindow}>
              {/* Window Top Chrome Bar */}
              <div className={styles.browserBar}>
                <div className={styles.browserDots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>

                <div className={styles.browserUrlBox}>
                  <span className={styles.urlProtocol}>https://</span>
                  <span className={styles.browserUrl}>{currentUrl}</span>
                </div>

                <div
                  className={styles.zoomHintBtn}
                  onClick={() => onCardClick?.(activeIndex)}
                  title="Nhấn để phóng to ảnh xem chi tiết"
                >
                  <ZoomIn size={13} />
                  <span className={styles.zoomHintText}>Phóng to ảnh</span>
                </div>
              </div>

              {/* Main Image Stage */}
              <div
                className={styles.imageStage}
                onClick={() => onCardClick?.(activeIndex)}
                title="Bấm để mở xem ảnh kích thước lớn"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={currentImage?.src}
                  src={currentImage?.src}
                  alt={currentImage?.alt || "ShopBig Admin Feature"}
                  className={styles.mockupImage}
                />

                <div className={styles.imageOverlayGradient} />

                {/* Bottom Caption Pill & Counter */}
                <div className={styles.imageCaptionBar}>
                  <div className={styles.captionLeft}>
                    <span className={styles.featureBadgePill}>{currentBadge}</span>
                    <span className={styles.featureTitleText}>{currentImage?.alt}</span>
                  </div>
                  <span className={styles.counterBadge}>
                    {activeIndex + 1} / {images.length}
                  </span>
                </div>

                {/* Hover Quick Zoom Button */}
                <div className={styles.hoverZoomOverlay}>
                  <div className={styles.zoomCenterBadge}>
                    <ZoomIn size={18} />
                    <span>Xem Chi Tiết Màn Hình Này</span>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows for Direct Control */}
              <button
                type="button"
                className={`${styles.navArrowBtn} ${styles.navPrevBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Tính năng trước"
                title="Tính năng trước"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                className={`${styles.navArrowBtn} ${styles.navNextBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Tính năng tiếp theo"
                title="Tính năng tiếp theo"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Pagination Dots Bar */}
            <div className={styles.dotsBar}>
              {images.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  aria-label={`Chuyển tới ảnh ${dotIdx + 1}`}
                  className={`${styles.dotItem} ${activeIndex === dotIdx ? styles.dotItemActive : ""}`}
                  onClick={() => setActiveIndex(dotIdx)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Gradient Action CTA */}
        <div className={styles.ctaWrap}>
          <button
            type="button"
            onClick={onCtaClick}
            className={styles.ctaButton}
          >
            <span>{ctaText}</span>
            <ArrowRight size={18} className={styles.ctaIcon} />
          </button>
        </div>

        {/* 4. Three Core Value Pillars */}
        {features && features.length > 0 && (
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageCarouselHero;
