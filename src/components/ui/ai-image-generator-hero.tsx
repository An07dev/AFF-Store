"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./ai-image-generator-hero.module.css";

export interface ImageCard {
  id: string;
  src: string;
  alt: string;
  rotation: number;
}

export interface ImageCarouselHeroProps {
  title: string;
  subtitle?: string;
  description: string;
  ctaText: string;
  onCtaClick?: () => void;
  images: ImageCard[];
  features?: Array<{
    title: string;
    description: string;
  }>;
  onCardClick?: (index: number) => void;
}

export function ImageCarouselHero({
  title,
  subtitle,
  description,
  ctaText,
  onCtaClick,
  images,
  features = [
    {
      title: "Realistic Results",
      description: "Realistic Results Photos that look professionally crafted",
    },
    {
      title: "Fast Generation",
      description: "Turn ideas into images in seconds.",
    },
    {
      title: "Diverse Styles",
      description: "Choose from a wide range of artistic options.",
    },
  ],
  onCardClick,
}: ImageCarouselHeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const [rotatingCards, setRotatingCards] = useState<number[]>([]);
  const [radius, setRadius] = useState(300);

  // Responsive radius calculation for landscape PC cards
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 640) {
          setRadius(190);
        } else if (window.innerWidth < 1024) {
          setRadius(270);
        } else {
          setRadius(350);
        }
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingCards((prev) =>
        prev.map((val) => (val + 0.35) % 360)
      );
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Initialize rotating cards
  useEffect(() => {
    if (images.length > 0) {
      setRotatingCards(images.map((_, i) => i * (360 / images.length)));
    }
  }, [images.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div className={styles.heroWrapper}>
      {/* Animated Background Lights */}
      <div className={styles.ambientGlow1} />
      <div className={styles.ambientGlow2} />

      <div className={styles.heroContainer}>
        {/* Subtitle Pill Badge */}
        {subtitle && (
          <div className={styles.badgePill}>
            ✨ {subtitle}
          </div>
        )}

        {/* 3D Carousel Stage - Horizontal Landscape Cards */}
        <div
          className={styles.carouselContainer}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setMousePosition({ x: 0.5, y: 0.5 });
          }}
        >
          <div className={styles.stage3D}>
            {images.map((image, index) => {
              const currentAngleDeg =
                rotatingCards[index] !== undefined
                  ? rotatingCards[index]
                  : index * (360 / images.length);
              const angleRad = (currentAngleDeg * Math.PI) / 180;

              // 3D Elliptical orbit calculations for landscape cards
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * (radius * 0.42);

              // 3D perspective effect based on mouse hover position
              const perspectiveX = isHovering ? (mousePosition.x - 0.5) * 20 : 0;
              const perspectiveY = isHovering ? (mousePosition.y - 0.5) * 20 : 0;

              // Depth scaling: front cards are larger, back cards are slightly smaller
              const depthFactor = (Math.sin(angleRad) + 1) / 2; // 0 to 1
              const scale = 0.84 + depthFactor * 0.3;
              const zIndex = Math.round(depthFactor * 50);
              const opacity = 0.65 + depthFactor * 0.35;

              return (
                <div
                  key={image.id || index}
                  className={styles.cardWrapper}
                  style={{
                    transform: `
                      translate(${x}px, ${y}px)
                      scale(${scale})
                      rotateX(${perspectiveY}deg)
                      rotateY(${perspectiveX}deg)
                      rotateZ(${image.rotation * 0.6}deg)
                    `,
                    zIndex,
                    opacity,
                  }}
                >
                  <div
                    className={styles.cardInner}
                    onClick={() => onCardClick?.(index)}
                    title={image.alt || "Bấm để xem ảnh lớn"}
                  >
                    {/* PC Window Top Chrome Bar */}
                    <div className={styles.browserBar}>
                      <div className={styles.browserDots}>
                        <span className={styles.dotRed} />
                        <span className={styles.dotYellow} />
                        <span className={styles.dotGreen} />
                      </div>
                      <span className={styles.browserUrl}>
                        shoptik.vn/admin
                      </span>
                    </div>

                    {/* Screenshot Image Container */}
                    <div className={styles.imageContainer}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.src}
                        alt={image.alt || "ShopTik PC Screen"}
                        className={styles.cardImage}
                        loading="lazy"
                      />
                      <div className={styles.cardShine} />
                      <div className={styles.cardGradient} />
                      {image.alt && (
                        <div className={styles.cardTitleOverlay}>
                          {image.alt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>

          {/* Gradient CTA Button */}
          <button
            type="button"
            onClick={onCtaClick}
            className={styles.ctaButton}
          >
            <span>{ctaText}</span>
            <ArrowRight size={18} className={styles.ctaIcon} />
          </button>
        </div>

        {/* Features Section */}
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
