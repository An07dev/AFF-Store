'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './LazyImage.module.css';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  wrapperClassName?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export default function LazyImage({
  src,
  alt,
  fallbackSrc = '/file.svg',
  aspectRatio,
  wrapperClassName,
  objectFit = 'cover',
  className,
  style,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    // IntersectionObserver for true lazy loading on scroll
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '100px' } // Preload when within 100px of viewport
      );

      observer.observe(imgRef.current);

      return () => {
        observer.disconnect();
      };
    } else {
      setIsInView(true);
    }
  }, []);

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={`${styles.wrapper} ${wrapperClassName || ''}`}
      style={{
        aspectRatio: aspectRatio || undefined,
        ...style,
      }}
    >
      {/* Shimmer Placeholder while loading */}
      {!isLoaded && <div className={styles.shimmer} />}

      {/* Lazy Image */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          className={`${styles.img} ${isLoaded ? styles.loaded : ''} ${className || ''}`}
          style={{ objectFit }}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}
