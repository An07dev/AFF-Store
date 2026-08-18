'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  minHeight?: number | string;
  rootMargin?: string;
  className?: string;
}

export default function LazySection({
  children,
  placeholder,
  minHeight = 200,
  rootMargin = '150px',
  className = '',
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    } else {
      setIsVisible(true);
    }
  }, [rootMargin]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: !isVisible ? minHeight : undefined }}
    >
      {isVisible ? children : placeholder || null}
    </div>
  );
}
