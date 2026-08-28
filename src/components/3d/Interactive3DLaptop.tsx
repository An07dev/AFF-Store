"use client";

import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Html,
  Float,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import { ShoppingBag, BarChart3, Monitor, RotateCcw, Sparkles } from "lucide-react";

// ============================================================================
// REALISTIC MACBOOK PRO 14" COMPONENT (PERFECTLY FLUSH SCREEN)
// ============================================================================
function MacBookPro({
  activeScreenUrl,
  finish = "space-black",
}: {
  activeScreenUrl: string;
  finish?: "space-black" | "silver";
}) {
  const isSilver = finish === "silver";

  // Aluminum body colors
  const bodyColor = isSilver ? "#dbe0ea" : "#2e3442";
  const bodyMetalness = isSilver ? 0.85 : 0.88;
  const bodyRoughness = isSilver ? 0.25 : 0.22;

  // Keyboard deck colors
  const keyboardWellColor = isSilver ? "#1e2430" : "#141822";
  const keycapColor = "#0d1017";

  return (
    <group position={[0, -0.3, 0]}>
      {/* ----------------------------------------------------------------------
          1. LAPTOP BASE (CHASSIS)
          ---------------------------------------------------------------------- */}
      <group position={[0, 0, 0]}>
        {/* Main Base Body */}
        <mesh position={[0, -0.04, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.12, 0.08, 2.18]} />
          <meshPhysicalMaterial
            color={bodyColor}
            metalness={bodyMetalness}
            roughness={bodyRoughness}
            clearcoat={0.3}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Keyboard Recessed Well Tray */}
        <mesh position={[0, 0.001, -0.35]}>
          <boxGeometry args={[2.74, 0.005, 1.12]} />
          <meshStandardMaterial color={keyboardWellColor} roughness={0.6} metalness={0.3} />
        </mesh>

        {/* Realistic Keyboard Key Grid */}
        <group position={[0, 0.006, -0.35]}>
          {/* Row 1 - Function Keys */}
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`f-${i}`} position={[-1.24 + i * 0.19, 0, -0.46]}>
              <boxGeometry args={[0.165, 0.012, 0.09]} />
              <meshStandardMaterial color={keycapColor} roughness={0.5} />
            </mesh>
          ))}

          {/* Row 2 - Number Keys */}
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`n-${i}`} position={[-1.24 + i * 0.19, 0, -0.3]}>
              <boxGeometry args={[0.165, 0.012, 0.15]} />
              <meshStandardMaterial color={keycapColor} roughness={0.5} />
            </mesh>
          ))}

          {/* Row 3 - QWERTY */}
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`q-${i}`} position={[-1.24 + i * 0.19, 0, -0.12]}>
              <boxGeometry args={[0.165, 0.012, 0.15]} />
              <meshStandardMaterial color={keycapColor} roughness={0.5} />
            </mesh>
          ))}

          {/* Row 4 - ASDF */}
          {Array.from({ length: 13 }).map((_, i) => (
            <mesh key={`a-${i}`} position={[-1.2 + i * 0.2, 0, 0.06]}>
              <boxGeometry args={[0.175, 0.012, 0.15]} />
              <meshStandardMaterial color={keycapColor} roughness={0.5} />
            </mesh>
          ))}

          {/* Row 5 - ZXCV */}
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={`z-${i}`} position={[-1.15 + i * 0.21, 0, 0.24]}>
              <boxGeometry args={[0.185, 0.012, 0.15]} />
              <meshStandardMaterial color={keycapColor} roughness={0.5} />
            </mesh>
          ))}

          {/* Row 6 - Spacebar & Modifiers */}
          <mesh position={[-1.15, 0, 0.42]}>
            <boxGeometry args={[0.22, 0.012, 0.15]} />
            <meshStandardMaterial color={keycapColor} roughness={0.5} />
          </mesh>
          <mesh position={[-0.85, 0, 0.42]}>
            <boxGeometry args={[0.22, 0.012, 0.15]} />
            <meshStandardMaterial color={keycapColor} roughness={0.5} />
          </mesh>
          {/* Spacebar */}
          <mesh position={[0, 0, 0.42]}>
            <boxGeometry args={[1.0, 0.012, 0.15]} />
            <meshStandardMaterial color={keycapColor} roughness={0.5} />
          </mesh>
          <mesh position={[0.85, 0, 0.42]}>
            <boxGeometry args={[0.22, 0.012, 0.15]} />
            <meshStandardMaterial color={keycapColor} roughness={0.5} />
          </mesh>
          <mesh position={[1.15, 0, 0.42]}>
            <boxGeometry args={[0.22, 0.012, 0.15]} />
            <meshStandardMaterial color={keycapColor} roughness={0.5} />
          </mesh>
        </group>

        {/* Touch ID Circle */}
        <mesh position={[1.27, 0.008, -0.81]}>
          <cylinderGeometry args={[0.065, 0.065, 0.012, 24]} />
          <meshPhysicalMaterial color="#05070a" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Glass Force Touch Trackpad */}
        <mesh position={[0, 0.002, 0.54]}>
          <boxGeometry args={[1.22, 0.004, 0.82]} />
          <meshPhysicalMaterial
            color={bodyColor}
            metalness={0.8}
            roughness={0.3}
            clearcoat={0.6}
          />
        </mesh>
        {/* Trackpad subtle border */}
        <mesh position={[0, 0.001, 0.54]}>
          <boxGeometry args={[1.24, 0.002, 0.84]} />
          <meshBasicMaterial color={isSilver ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)"} />
        </mesh>

        {/* Left & Right Laser Speaker Grilles */}
        <mesh position={[-1.46, 0.002, -0.35]}>
          <boxGeometry args={[0.09, 0.003, 1.05]} />
          <meshStandardMaterial color="#0c1017" roughness={0.9} />
        </mesh>
        <mesh position={[1.46, 0.002, -0.35]}>
          <boxGeometry args={[0.09, 0.003, 1.05]} />
          <meshStandardMaterial color="#0c1017" roughness={0.9} />
        </mesh>

        {/* Front Opening Thumb Scoop */}
        <mesh position={[0, -0.01, 1.085]}>
          <boxGeometry args={[0.48, 0.025, 0.02]} />
          <meshStandardMaterial color="#0a0d14" />
        </mesh>

        {/* Left Ports: MagSafe 3 + 2x Thunderbolt */}
        <mesh position={[-1.565, -0.03, -0.55]}>
          <boxGeometry args={[0.02, 0.024, 0.065]} />
          <meshBasicMaterial color="#05070a" />
        </mesh>
        <mesh position={[-1.565, -0.03, -0.35]}>
          <boxGeometry args={[0.02, 0.02, 0.05]} />
          <meshBasicMaterial color="#05070a" />
        </mesh>
        <mesh position={[-1.565, -0.03, -0.2]}>
          <boxGeometry args={[0.02, 0.02, 0.05]} />
          <meshBasicMaterial color="#05070a" />
        </mesh>

        {/* Right Ports: HDMI + SDXC + Thunderbolt */}
        <mesh position={[1.565, -0.03, -0.45]}>
          <boxGeometry args={[0.02, 0.025, 0.08]} />
          <meshBasicMaterial color="#05070a" />
        </mesh>
        <mesh position={[1.565, -0.03, -0.25]}>
          <boxGeometry args={[0.02, 0.02, 0.05]} />
          <meshBasicMaterial color="#05070a" />
        </mesh>
      </group>

      {/* ----------------------------------------------------------------------
          2. DISPLAY LID (HINGED AT Z = -1.08, ANGLED AT ~108 DEGREES)
          ---------------------------------------------------------------------- */}
      <group position={[0, 0.02, -1.08]} rotation={[-1.88, 0, 0]}>
        {/* Aluminum Screen Back Shell */}
        <mesh position={[0, 1.025, -0.02]} castShadow>
          <boxGeometry args={[3.12, 2.05, 0.04]} />
          <meshPhysicalMaterial
            color={bodyColor}
            metalness={bodyMetalness}
            roughness={bodyRoughness}
            clearcoat={0.35}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Apple Mirror Logo on the Lid Back */}
        <mesh position={[0, 1.025, -0.042]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>

        {/* Black Glass Screen Bezel */}
        <mesh position={[0, 1.025, 0.002]}>
          <boxGeometry args={[3.06, 1.99, 0.004]} />
          <meshPhysicalMaterial
            color="#05070a"
            roughness={0.1}
            metalness={0.3}
            clearcoat={0.95}
          />
        </mesh>

        {/* Top Camera Notch */}
        <mesh position={[0, 1.96, 0.006]}>
          <boxGeometry args={[0.22, 0.06, 0.004]} />
          <meshBasicMaterial color="#020305" />
        </mesh>

        {/* ------------------------------------------------------------------
            3. INTERACTIVE LIVE HTML SCREEN (PERFECTLY FLUSH WITH BEZEL)
            ------------------------------------------------------------------ */}
        <Html
          transform
          position={[0, 1.02, 0.006]}
          scale={0.00295}
          style={{
            width: "960px",
            height: "626px",
            background: "#080c16",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "inset 0 0 15px rgba(0,0,0,0.8)",
            userSelect: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              background: "#0a0e1a",
              color: "#fff",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {/* macOS Browser Header */}
            <div
              style={{
                height: "34px",
                background: "#070a12",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981" }} />
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.06)",
                  padding: "3px 20px",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                }}
              >
                🔒 https://shoptik.vn{activeScreenUrl}
              </div>
              <div style={{ fontSize: "11px", color: "#10b981", fontWeight: 800 }}>
                ● LIVE SHOPTIK
              </div>
            </div>

            {/* Embedded Live Web Screen */}
            <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
              <iframe
                src={activeScreenUrl}
                title="ShopTik 3D Live Screen"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                  background: "#0b0f19",
                }}
              />
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ============================================================================
// MAIN COMPONENT EXPORT
// ============================================================================
export default function Interactive3DLaptop() {
  const [activeScreenUrl, setActiveScreenUrl] = useState<string>("/");
  const [finish, setFinish] = useState<"space-black" | "silver">("space-black");
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const controlsRef = useRef<any>(null);

  const screenOptions = [
    {
      id: "storefront",
      label: "Cửa Hàng Storefront",
      icon: <ShoppingBag size={14} />,
      url: "/",
    },
    {
      id: "admin",
      label: "Admin Dashboard",
      icon: <BarChart3 size={14} />,
      url: "/admin/products",
    },
    {
      id: "landing",
      label: "Landing Page",
      icon: <Monitor size={14} />,
      url: "/landing",
    },
  ];

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "720px",
        borderRadius: "28px",
        overflow: "hidden",
        background: "radial-gradient(circle at 50% 35%, #1a243a 0%, #0d1322 55%, #050811 100%)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 30px 80px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      {/* Background Lighting Glows */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.18)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "20%",
          width: "440px",
          height: "440px",
          borderRadius: "50%",
          background: "rgba(168, 85, 247, 0.18)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 1.3, 4.6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Comprehensive Studio Lighting */}
        <ambientLight intensity={1.4} />
        <directionalLight position={[6, 12, 6]} intensity={2.4} color="#ffffff" castShadow />
        <directionalLight position={[-6, 10, -4]} intensity={1.5} color="#94a3b8" />
        <directionalLight position={[0, -4, 4]} intensity={0.8} color="#6366f1" />
        <pointLight position={[0, 3, 2]} intensity={1.2} color="#ffffff" />

        {/* Floating 3D Laptop */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <MacBookPro activeScreenUrl={activeScreenUrl} finish={finish} />
        </Float>

        {/* Contact Floor Shadow */}
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.85}
          scale={10}
          blur={2.4}
          far={4}
          color="#000000"
        />

        {/* 3D Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          autoRotate={isAutoRotate}
          autoRotateSpeed={0.8}
          minDistance={3.0}
          maxDistance={7.5}
          maxPolarAngle={Math.PI / 2 + 0.05}
          minPolarAngle={Math.PI / 8}
        />
      </Canvas>

      {/* Top Header Controls Bar */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          zIndex: 20,
        }}
      >
        {/* Screen Switch Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "6px 8px",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {screenOptions.map((tab) => {
            const isActive = activeScreenUrl === tab.url;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveScreenUrl(tab.url)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  background: isActive
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  boxShadow: isActive ? "0 4px 15px rgba(99, 102, 241, 0.45)" : "none",
                  transition: "all 0.25s ease",
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Finish Switcher */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(15, 23, 42, 0.85)",
              padding: "4px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <button
              type="button"
              onClick={() => setFinish("space-black")}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                background: finish === "space-black" ? "#1e293b" : "transparent",
                color: finish === "space-black" ? "#fff" : "#94a3b8",
              }}
            >
              ⚫ Space Black
            </button>
            <button
              type="button"
              onClick={() => setFinish("silver")}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                background: finish === "silver" ? "#1e293b" : "transparent",
                color: finish === "silver" ? "#fff" : "#94a3b8",
              }}
            >
              ⚪ Silver
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "12px",
              background: isAutoRotate
                ? "rgba(16, 185, 129, 0.2)"
                : "rgba(15, 23, 42, 0.85)",
              border: isAutoRotate
                ? "1px solid rgba(16, 185, 129, 0.4)"
                : "1px solid rgba(255, 255, 255, 0.12)",
              color: isAutoRotate ? "#34d399" : "#94a3b8",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
            }}
          >
            <Sparkles size={14} />
            <span>{isAutoRotate ? "Xoay 3D: BẬT" : "Xoay 3D: TẮT"}</span>
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            title="Khôi phục góc nhìn thẳng ban đầu"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
            }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Interaction Hint */}
      <div
        style={{
          position: "absolute",
          bottom: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(12px)",
          padding: "8px 20px",
          borderRadius: "9999px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          fontSize: "12.5px",
          fontWeight: 700,
          color: "#cbd5e1",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
        }}
      >
        <span>💻</span>
        <span>MacBook Pro 14&Prime; 3D • Kéo chuột xoay 360° • Trực tiếp click & cuộn trang trên màn hình</span>
      </div>
    </div>
  );
}
