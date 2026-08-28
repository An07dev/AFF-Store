# HƯỚNG DẪN KIẾN TRÚC & TÍCH HỢP 3D WEB (THREE.JS + REACT THREE FIBER + DREI)

> **Dành cho:** AI Agents & Developers kế thừa dự án.  
> **Mục tiêu:** Hiểu rõ cách thức xây dựng, cấu hình, tối ưu và xử lý các lỗi thường gặp khi tích hợp không gian 3D WebGL tương tác thời gian thực vào Landing Page & Website Next.js App Router.

---

## 1. Công Nghệ & Phiên Bản Chuẩn (Tech Stack)

* **Framework:** Next.js 15+ (App Router) / React 19
* **Thư viện 3D cốt lõi:**
  * `three`: `^0.169.0` (LTS baseline ổn định nhất cho React Three Fiber).
  * `@types/three`: `^0.169.0`
  * `@react-three/fiber`: `^9.7.0` (React Renderer cho Three.js)
  * `@react-three/drei`: `^10.7.8` (Bộ helpers: `<Html>`, `<Float>`, `<ContactShadows>`, `<OrbitControls>`, `useGLTF`, etc.)
  * `motion`: `^13.1.1` (Framer Motion 3D scroll interpolation)

```bash
# Lệnh cài đặt chuẩn:
npm install three@^0.169.0 @react-three/fiber@^9.7.0 @react-three/drei@^10.7.8
npm install -D @types/three@^0.169.0
```

---

## 2. Các Nguyên Tắc Bắt Buộc (Critical Rules)

### ⚠️ Quy tắc 1: Luôn Import Dynamic với `{ ssr: false }`
Three.js cần truy cập vào đối tượng `window` và ngữ cảnh `WebGLRenderingContext`. Nếu render trên Server (SSR) sẽ gây crash ứng dụng.

```tsx
// ✅ CÁCH LÀM ĐÚNG trong Next.js App Router:
import dynamic from "next/dynamic";

const GlobalSpace3DCanvas = dynamic(
  () => import("@/components/3d/GlobalSpace3DCanvas"),
  { ssr: false }
);

const Interactive3DLaptop = dynamic(
  () => import("@/components/3d/Interactive3DLaptop"),
  { ssr: false }
);
```

### ⚠️ Quy tắc 2: Xử Lý Xung Đột Nền (Transparent Background Layering)
Khi gắn một Canvas 3D chạy ngầm toàn màn hình (`position: fixed; inset: 0; z-index: 0`):
* **Tất cả các thẻ cha và section đè lên trên** (`html`, `body`, `.page`, `.heroWrapper`, `<section>`) **BẮT BUỘC phải đặt `background-color: transparent;`**.
* Nếu bất kỳ section nào còn giữ màu nền đặc (ví dụ: `#111827` hoặc `#090a0f`), nó sẽ che phủ hoàn toàn Canvas 3D bên dưới.
* Áp dụng `backdrop-filter: blur(...)` với độ mờ trong suốt `rgba(15, 23, 42, 0.6)` để vừa đọc được chữ, vừa thấy chuyển động 3D lướt qua phía sau.

### ⚠️ Quy tắc 3: Kiểm Soát WebGL Context Lost
* Không tạo quá nhiều thẻ `<Canvas>` chạy đồng thời trên cùng một trang dài (gây tràn bộ nhớ GPU VRAM và crash `WebGLRenderer: Context Lost`).
* Khuyến nghị: Dùng **1 Canvas 3D Global cố định** cho hiệu ứng nền toàn trang, hoặc đóng gói các Canvas cục bộ với `powerPreference: "high-performance"`.

---

## 3. Kiến Trúc 3 Mảnh Ghép 3D Đã Xây Dựng

### 🪐 Module 1: Global Space 3D Camera Fly-Through (`GlobalSpace3DCanvas.tsx`)
* **Vị trí file:** `src/components/3d/GlobalSpace3DCanvas.tsx`
* **Nguyên lý:**
  1. Sử dụng `Points` và `bufferAttribute` tạo ~180 đến 600 hạt sao tinh vân đa màu sắc trong không gian hình trụ Z từ `+25` đến `-150`.
  2. Bố trí các vòng xoay Neon Torus, Octahedron 3D và lưới sàn Cyber Grid tại các mốc toạ độ Z theo chiều dọc của các section trên Landing Page.
  3. Hook `CameraFlyController` lắng nghe `scrollY / totalScroll` và nội suy camera di chuyển tịnh tiến xuyên qua đường hầm vũ trụ (`lerp(camera.position.z, targetZ, 0.08)`).
  4. Lắng nghe `mousemove` để tạo hiệu ứng nghiêng góc Parallax theo con trỏ chuột.

### 💻 Module 2: MacBook Pro 3D Live Interactive Screen (`Interactive3DLaptop.tsx`)
* **Vị trí file:** `src/components/3d/Interactive3DLaptop.tsx`
* **Nguyên lý:**
  1. Dựng khung Unibody chuẩn tỉ lệ $31.26\text{cm} \times 22.12\text{cm}$ với vật liệu nhôm Space Black / Silver (`meshPhysicalMaterial` với `metalness: 0.88`, `roughness: 0.22`, `clearcoat: 0.3`).
  2. Đầy đủ chi tiết phần cứng: Khay phím âm, 78 phím bấm, cảm biến Touch ID, Force Touch Trackpad, dải loa Stereo, cổng MagSafe 3 & Thunderbolt.
  3. **Nhúng Live Web thật 100% bằng `<Html transform>` của Drei:**
     * Khung Web kích thước $960\text{px} \times 626\text{px}$.
     * Tỉ lệ co giãn `scale={0.00295}` đặt tại `position={[0, 1.02, 0.006]}` trên nắp màn hình mở góc $108^\circ$ ($1.88\text{ rad}$).
     * Màn hình nằm phẳng tuyệt đối bên trong viền Bezel đen và cụm Camera Notch. Người dùng có thể click, cuộn trang web trực tiếp ngay trong không gian 3D.
  4. Bổ sung `<Float>` tạo độ bay bổng và `<ContactShadows>` tạo bóng đổ sàn thời gian thực.

### 🎴 Module 3: 3D Perspective Scroll Stacking (`Section3DCard.tsx`)
* **Vị trí file:** `src/components/ui/Section3DCard.tsx`
* **Nguyên lý:**
  1. Bao bọc section bằng container có `perspective: 850px` và `transformStyle: "preserve-3d"`.
  2. Sử dụng `useScroll` + `useTransform` của Framer Motion để biến đổi `rotateX (-18° -> 0° -> +14°)`, `translateZ (-140px -> 0px)`, `y` và `scale` theo tiến trình cuộn trang.
  3. Tạo hiệu ứng các khối nội dung trồi lên từ độ sâu và xếp tầng lật mở giống các sự kiện ra mắt của Apple.

---

## 4. Code Mẫu Chuẩn Cho AI Agent Kế Thừa

### Template 1: Tạo Vật Thể 3D Tương Tác Chuẩn (Rotating Mesh + Floating)

```tsx
"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Custom3DObject() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshPhysicalMaterial
        color="#6366f1"
        metalness={0.9}
        roughness={0.15}
        clearcoat={0.8}
      />
    </mesh>
  );
}

export default function SceneShowcase() {
  return (
    <div style={{ width: "100%", height: "500px", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#ec4899" />
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <Custom3DObject />
        </Float>
        <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}
```

### Template 2: Nhúng Giao Diện Web / React Component Vào Màn Hình 3D (`<Html transform>`)

```tsx
<group rotation={[-1.88, 0, 0]}>
  {/* Mặt kính viền màn hình */}
  <mesh position={[0, 1.025, 0.002]}>
    <boxGeometry args={[3.06, 1.99, 0.004]} />
    <meshPhysicalMaterial color="#05070a" roughness={0.1} metalness={0.3} />
  </mesh>

  {/* Giao diện HTML 3D tương tác */}
  <Html
    transform
    position={[0, 1.02, 0.006]}
    scale={0.00295}
    style={{
      width: "960px",
      height: "626px",
      borderRadius: "4px",
      overflow: "hidden",
      userSelect: "none",
    }}
  >
    <iframe
      src="https://shoptik.vn"
      style={{ width: "100%", height: "100%", border: "none" }}
    />
  </Html>
</group>
```

---

## 5. Bảng Checklist Khi Triển Khai Tính Năng 3D Mới

* [x] File chứa Canvas có `"use client";` ở dòng đầu tiên.
* [x] Component được import bằng `dynamic(() => import(...), { ssr: false })`.
* [x] Thẻ bao bọc không có background đen đè lên Canvas (`background-color: transparent`).
* [x] Sử dụng `useMemo` khi khởi tạo `BufferGeometry`, `Float32Array` hoặc layout phím để tránh re-render giật lag.
* [x] Tối ưu hóa số lượng hạt `Points` (khuyến nghị $\le 800$ hạt cho Landing Page, $\le 3000$ hạt cho trang chuyên dụng 3D Demo).
* [x] Luôn dùng `THREE.MathUtils.lerp` trong `useFrame` để chuyển động camera và góc xoay đạt chuẩn 60fps mượt mà.

---
*Tài liệu được khởi tạo và chuẩn hóa bởi Antigravity AI Engineer cho dự án ShopTik Landing Page.*
