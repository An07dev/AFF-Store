"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Box, Sparkles, Eye, Layers, Monitor, RotateCw } from "lucide-react";

// Dynamic import with SSR disabled for Three.js WebGL canvas
const Interactive3DLaptop = dynamic(
  () => import("@/components/3d/Interactive3DLaptop"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "680px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c16",
          borderRadius: "24px",
          color: "#94a3b8",
          gap: "12px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ fontSize: "36px" }}>💻</div>
        <p style={{ fontWeight: 700 }}>Đang khởi tạo chiếc Laptop 3D & Live Web...</p>
      </div>
    ),
  }
);

const InteractiveShowcase3D = dynamic(
  () => import("@/components/3d/InteractiveShowcase3D"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c16",
          borderRadius: "24px",
          color: "#94a3b8",
          gap: "12px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ fontSize: "32px" }}>✨</div>
        <p style={{ fontWeight: 700 }}>Đang khởi tạo WebGL 3D Canvas...</p>
      </div>
    ),
  }
);

export default function ThreeDDemoPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050811",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "36px 20px 80px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Navigation Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
            paddingBottom: "18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link
            href="/landing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.2s ease",
            }}
          >
            <ArrowLeft size={16} /> Quay lại Landing Page
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              padding: "6px 16px",
              borderRadius: "9999px",
              color: "#a5b4fc",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            <Sparkles size={16} /> 3D Laptop Live Screen Showcase
          </div>
        </div>

        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 900,
              letterSpacing: "-0.5px",
              marginBottom: "12px",
              background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Màn Hình 3D Laptop Live Interactive
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#94a3b8",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Mô hình chiếc Laptop 3D không gian thực với màn hình nhúng trực tiếp giao diện Web thật. Bạn có thể dùng chuột xoay 360°, đổi giữa Storefront, Admin và Landing Page.
          </p>
        </div>

        {/* SECTION 1: 3D LAPTOP INTERACTIVE SHOWCASE */}
        <div style={{ marginBottom: "60px" }}>
          <Interactive3DLaptop />
        </div>

        {/* SECTION 2: 4 CORE COMPONENTS & TECH ARCHITECTURE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Monitor size={18} color="#38bdf8" />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                1. &lt;Canvas&gt; WebGL
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Khung canvas bao bọc thế giới 3D, tự động điều chỉnh camera, renderer và quản lý chu kỳ khung hình 60fps.
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Sparkles size={18} color="#f59e0b" />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                2. Ánh Sáng (Lights)
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Kết hợp ánh sáng môi trường (ambient), ánh sáng định hướng (directional) và điểm sáng phản chiếu (pointLight).
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Box size={18} color="#ec4899" />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                3. Vật Thể (&lt;mesh&gt;)
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Geometry đa dạng (Torus, Sphere, Cube, Diamond) phủ vật liệu kim loại cao cấp (meshPhysicalMaterial).
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <RotateCw size={18} color="#10b981" />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                4. Điều Khiển (OrbitControls)
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Cho phép tương tác xoay 360°, phóng to/thu nhỏ bằng chuột mượt mà và tự động xoay chuyển động.
            </p>
          </div>
        </div>

        {/* GLTF Model notice banner */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "16px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Eye size={20} color="#a5b4fc" />
            <span style={{ fontSize: "13.5px", color: "#c7d2fe" }}>
              Hệ thống đã sẵn sàng hỗ trợ tải mô hình 3D thực tế <strong>.glb / .gltf</strong> từ thư mục <code>public/models/</code> qua hook <code>useGLTF()</code>.
            </span>
          </div>
          <Link
            href="/landing"
            style={{
              color: "#a5b4fc",
              fontSize: "13px",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Xem Landing Page ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
