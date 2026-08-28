"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Stars,
  Sparkles,
  ContactShadows,
  Center,
} from "@react-three/drei";
import type * as THREE from "three";

// 1. Dynamic Shape Mesh Component
function AnimatedShape({
  shapeType,
  color,
  isWireframe,
  speed,
}: {
  shapeType: "torus" | "sphere" | "cube" | "icosahedron";
  color: string;
  isWireframe: boolean;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.35 * speed;
      meshRef.current.rotation.y += delta * 0.55 * speed;
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={0.8} floatIntensity={1.2}>
      <mesh
        ref={meshRef}
        scale={clicked ? 1.3 : hovered ? 1.15 : 1}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {shapeType === "torus" && <torusKnotGeometry args={[1.05, 0.35, 128, 32]} />}
        {shapeType === "sphere" && <sphereGeometry args={[1.35, 64, 64]} />}
        {shapeType === "cube" && <boxGeometry args={[1.7, 1.7, 1.7]} />}
        {shapeType === "icosahedron" && <icosahedronGeometry args={[1.45, 0]} />}

        <meshPhysicalMaterial
          color={hovered ? "#ff007a" : color}
          roughness={0.15}
          metalness={0.85}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          wireframe={isWireframe}
        />
      </mesh>
    </Float>
  );
}

// 2. Main 3D Canvas Showcase
export default function InteractiveShowcase3D() {
  const [shapeType, setShapeType] = useState<"torus" | "sphere" | "cube" | "icosahedron">("torus");
  const [color, setColor] = useState("#6366f1");
  const [isWireframe, setIsWireframe] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);

  const colors = [
    { label: "Indigo Glow", hex: "#6366f1" },
    { label: "Cyber Pink", hex: "#ec4899" },
    { label: "Emerald Mint", hex: "#10b981" },
    { label: "Solar Gold", hex: "#f59e0b" },
    { label: "Neon Cyan", hex: "#06b6d4" },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "600px",
        borderRadius: "24px",
        overflow: "hidden",
        background: "#080c16",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
      }}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 1, 5.5], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lights */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 10]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1.2} color={color} />
        <spotLight position={[0, 10, 0]} intensity={1.0} angle={0.6} penumbra={1} color="#38bdf8" />

        {/* Dynamic Background Stars & Sparkles */}
        <Stars radius={50} depth={40} count={2000} factor={3} saturation={1} fade speed={1.2} />
        <Sparkles count={60} scale={7} size={3} speed={0.4} opacity={0.6} color={color} />

        {/* Animated Central 3D Shape */}
        <Center position={[0, 0.1, 0]}>
          <AnimatedShape
            shapeType={shapeType}
            color={color}
            isWireframe={isWireframe}
            speed={speed}
          />
        </Center>

        {/* Realtime Floor Shadow */}
        <ContactShadows position={[0, -2.2, 0]} opacity={0.6} scale={10} blur={2} far={4} color="#000000" />

        {/* Orbit Camera Controls */}
        <OrbitControls
          enableZoom={true}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2 * speed}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={3}
          maxDistance={9}
        />
      </Canvas>

      {/* Control Overlay Bar (Top Left) */}
      <div
        style={{
          position: "absolute",
          top: "18px",
          left: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 10,
          maxWidth: "260px",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#a5b4fc",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px",
            }}
          >
            🎮 Chọn Hình Dạng 3D
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {[
              { id: "torus", label: "🌀 Torus Knot" },
              { id: "sphere", label: "🔮 Sphere 3D" },
              { id: "cube", label: "📦 Cyber Cube" },
              { id: "icosahedron", label: "💎 Diamond" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setShapeType(item.id as any)}
                style={{
                  padding: "7px 8px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background:
                    shapeType === item.id
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(255,255,255,0.06)",
                  color: shapeType === item.id ? "#fff" : "#94a3b8",
                  transition: "all 0.2s ease",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Switcher */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            padding: "12px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            🎨 Màu Sắc & Vật Liệu
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                title={c.label}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: c.hex,
                  border: color === c.hex ? "2px solid #ffffff" : "2px solid transparent",
                  cursor: "pointer",
                  boxShadow: color === c.hex ? `0 0 12px ${c.hex}` : "none",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Control Overlay Bar (Top Right) */}
      <div
        style={{
          position: "absolute",
          top: "18px",
          right: "18px",
          display: "flex",
          gap: "8px",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setIsWireframe(!isWireframe)}
          style={{
            padding: "8px 14px",
            borderRadius: "12px",
            background: isWireframe ? "rgba(99, 102, 241, 0.9)" : "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          {isWireframe ? "🌐 Tắt Khung Dây" : "🕸️ Khung Dây (Wireframe)"}
        </button>

        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            padding: "8px 14px",
            borderRadius: "12px",
            background: autoRotate ? "rgba(16, 185, 129, 0.85)" : "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          {autoRotate ? "⏸️ Dừng Xoay" : "▶️ Tự Động Xoay"}
        </button>
      </div>

      {/* Speed Slider (Bottom Right) */}
      <div
        style={{
          position: "absolute",
          bottom: "18px",
          right: "18px",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(12px)",
          padding: "10px 16px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        <span>⚡ Tốc độ ({speed}x)</span>
        <input
          type="range"
          min="0.2"
          max="3"
          step="0.2"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          style={{ width: "90px", accentColor: "#6366f1", cursor: "pointer" }}
        />
      </div>

      {/* Helper Footer Hint (Bottom Center) */}
      <div
        style={{
          position: "absolute",
          bottom: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          padding: "6px 14px",
          borderRadius: "9999px",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: "12px",
          color: "#94a3b8",
          pointerEvents: "none",
        }}
      >
        🖱️ Kéo chuột để xoay 360° • Cuộn chuột để Zoom
      </div>
    </div>
  );
}
