"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface Section3DCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  intensity?: "subtle" | "medium" | "deep";
  cardMode?: boolean;
}

export function Section3DCard({
  children,
  className = "",
  id,
  style = {},
  intensity = "deep",
  cardMode = true,
}: Section3DCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Angles & Depth configurations based on intensity
  const rotAngle = intensity === "subtle" ? 8 : intensity === "medium" ? 14 : 18;
  const scaleMin = intensity === "subtle" ? 0.92 : intensity === "medium" ? 0.88 : 0.84;
  const zDepth = intensity === "subtle" ? -80 : intensity === "medium" ? -140 : -200;
  const yOffset = intensity === "subtle" ? 50 : intensity === "medium" ? 90 : 120;

  // 3D Apple-style stacking curve:
  // 0: Entering viewport from bottom (tilted backwards -18deg, scaled down 0.84, pushed deep -200px, y 120px)
  // 0.28 -> 0.72: In central focus (flat 0deg, scale 1.0, z 0px, y 0px)
  // 1: Leaving viewport at top (tilted forward +14deg, pushed deep -220px, y -90px)
  const rotateX = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [-rotAngle, 0, 0, rotAngle * 0.75]);
  const scale = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [scaleMin, 1, 1, scaleMin * 1.02]);
  const y = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [yOffset, 0, 0, -yOffset * 0.7]);
  const z = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [zDepth, 0, 0, zDepth * 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.35, 1, 1, 0.3]);
  const borderOpacity = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [0.08, 0.25, 0.25, 0.08]);

  return (
    <div
      ref={containerRef}
      style={{
        perspective: "850px",
        perspectiveOrigin: "50% 45%",
        transformStyle: "preserve-3d",
        width: "100%",
        position: "relative",
        margin: "30px 0",
      }}
    >
      <motion.div
        id={id}
        className={className}
        style={{
          rotateX,
          scale,
          y,
          z,
          opacity,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
          transformOrigin: "50% 50%",
          borderRadius: cardMode ? "32px" : "0px",
          border: cardMode ? "1px solid rgba(99, 102, 241, 0.25)" : "none",
          background: cardMode ? "rgba(11, 16, 28, 0.82)" : "transparent",
          backdropFilter: cardMode ? "blur(16px)" : "none",
          boxShadow: cardMode
            ? "0 35px 90px rgba(0, 0, 0, 0.85), 0 0 45px rgba(99, 102, 241, 0.16)"
            : "none",
          overflow: "hidden",
          position: "relative",
          ...style,
        }}
      >
        {/* Subtle Ambient Light Reflections on Card Edges */}
        {cardMode && (
          <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "20%",
                right: "20%",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(165, 180, 252, 0.8), transparent)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.12)",
                filter: "blur(50px)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -60,
                left: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(168, 85, 247, 0.12)",
                filter: "blur(50px)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </>
        )}

        {children}
      </motion.div>
    </div>
  );
}

export default Section3DCard;
