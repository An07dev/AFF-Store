# 🌌 MASTER GUIDE & AI PROMPT: XÂY DỰNG WEBSITE HIỆU ỨNG 3D LUSION.CO
> **Chủ đề:** Hướng dẫn kỹ thuật và Master Prompt cho AI để lập trình hiệu ứng **Particle Morphing (Hạt 3D tan chảy & biến hình)** + **Fluid Curl Noise (Chất lỏng mô phỏng GPU)** + **Section-to-Section Scrollytelling Transitions** theo phong cách website đoạt giải [Lusion.co](https://lusion.co/).

---

## 🎯 1. MỤC TIÊU & NGUYÊN LÝ HOẠT ĐỘNG (CORE CONCEPTS)

Một website chuẩn phong cách Lusion bao gồm 4 tầng kiến trúc hoạt động đồng bộ:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HTML CONTENT LAYER (z-index: 1, pointer-events: auto)    │
│    - Section 1 (Hero) -> Section 2 (Features) -> Section 3  │
│    - Nền trong suốt (Transparent), chữ & nút bấm nổi lên    │
├─────────────────────────────────────────────────────────────┤
│ 2. POST-PROCESSING LAYER (Glow & Cinematics)                │
│    - Unreal Bloom (Phát sáng neon), Chromatic Aberration    │
├─────────────────────────────────────────────────────────────┤
│ 3. 3D WEBGL PARTICLE SYSTEM (GLSL Shaders trên GPU)         │
│    - 15,000 ~ 50,000 hạt tính toán tọa độ thời gian thực    │
│    - Nội suy Morphing: Shape A -> Shape B -> Shape C       │
│    - Sóng cuộn hữu cơ (Curl Noise simulation)                │
├─────────────────────────────────────────────────────────────┤
│ 4. SMOOTH SCROLL ENGINE (Lenis / GSAP / R3F ScrollControls) │
│    - map % cuộn trang (0.0 -> 1.0) vào uniform uProgress    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 2. TECH STACK & DEPENDENCIES

```bash
# Cài đặt các gói thư viện chuẩn cho Next.js / React
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis
npm install -D @types/three
```

---

## 💻 3. MÃ NGUỒN CHUẨN (PRODUCTION-READY CODE)

### 📄 File: `src/components/3d/LusionMorphScene.tsx`

```tsx
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// 1. GLSL SHADER DEFINITION (Tính toán hạt và chất lỏng trực tiếp trên GPU)
// ============================================================================
const LusionParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // Nhận giá trị từ 0.0 (Section 1) -> 1.0 (Section cuối)
    uColorA: { value: new THREE.Color('#6366f1') }, // Tím Cyberpunk
    uColorB: { value: new THREE.Color('#ee4d2d') }, // Cam Neon
    uColorC: { value: new THREE.Color('#10b981') }, // Xanh Emerald
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aTargetPosition1; // Hình thái 2
    attribute vec3 aTargetPosition2; // Hình thái 3
    varying vec3 vPosition;
    varying float vProgress;

    // Thuật toán Curl Noise mô phỏng dòng chảy chất lỏng
    vec3 curlNoise(vec3 p) {
      float x = sin(p.y * 1.8 + uTime * 0.7) * cos(p.z * 1.5 + uTime * 0.5);
      float y = cos(p.z * 1.8 + uTime * 0.7) * sin(p.x * 1.5 + uTime * 0.5);
      float z = sin(p.x * 1.8 + uTime * 0.7) * cos(p.y * 1.5 + uTime * 0.5);
      return vec3(x, y, z) * 0.45;
    }

    void main() {
      vec3 mixedPos;
      
      // Biến đổi 3 giai đoạn (Morphing qua 3 Section)
      if (uProgress < 0.5) {
        float t = uProgress * 2.0; // 0.0 -> 1.0
        mixedPos = mix(position, aTargetPosition1, smoothstep(0.0, 1.0, t));
      } else {
        float t = (uProgress - 0.5) * 2.0; // 0.0 -> 1.0
        mixedPos = mix(aTargetPosition1, aTargetPosition2, smoothstep(0.0, 1.0, t));
      }

      // Thêm lực chảy chất lỏng cực mạnh tại các điểm giao thoa chuyển Section
      float fluidIntensity = sin(uProgress * 3.14159265 * 2.0);
      mixedPos += curlNoise(mixedPos) * abs(fluidIntensity);

      vPosition = mixedPos;
      vProgress = uProgress;

      vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
      gl_PointSize = (22.0 / -mvPosition.z); // Perspective scale: hạt gần to, hạt xa nhỏ
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec3 vPosition;
    varying float vProgress;

    void main() {
      // Bo tròn hạt với viền sáng mờ mịn (Soft circular glow)
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = smoothstep(0.5, 0.08, dist);

      // Chuyển dải màu gradient theo tiến trình cuộn
      vec3 finalColor;
      if (vProgress < 0.5) {
        finalColor = mix(uColorA, uColorB, vProgress * 2.0);
      } else {
        finalColor = mix(uColorB, uColorC, (vProgress - 0.5) * 2.0);
      }

      gl_FragColor = vec4(finalColor, alpha * 0.9);
    }
  `,
};

// ============================================================================
// 2. PARTICLE MESH (Khởi tạo dữ liệu tọa độ các hình khối)
// ============================================================================
function MorphingParticleMesh({ count = 20000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const scroll = useScroll();

  const { initialPositions, shape2Positions, shape3Positions } = useMemo(() => {
    const pos1 = new Float32Array(count * 3); // Khối cầu (Sphere)
    const pos2 = new Float32Array(count * 3); // Vòng xoắn Torus (Donut Ring)
    const pos3 = new Float32Array(count * 3); // Mặt sóng ma trận (Wave Plane)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // SHAPE 1: Quả cầu lượng tử (Sphere)
      const u1 = Math.random();
      const v1 = Math.random();
      const theta1 = u1 * 2.0 * Math.PI;
      const phi1 = Math.acos(2.0 * v1 - 1.0);
      const r1 = Math.cbrt(Math.random()) * 2.3;
      pos1[i3] = r1 * Math.sin(phi1) * Math.cos(theta1);
      pos1[i3 + 1] = r1 * Math.sin(phi1) * Math.sin(theta1);
      pos1[i3 + 2] = r1 * Math.cos(phi1);

      // SHAPE 2: Vòng xoắn năng lượng (Torus Ring)
      const u2 = Math.random() * Math.PI * 2;
      const v2 = Math.random() * Math.PI * 2;
      const R = 2.6; // Bán kính vòng ngoài
      const tube = 0.7; // Bán kính ống xoắn
      pos2[i3] = (R + tube * Math.cos(v2)) * Math.cos(u2);
      pos2[i3 + 1] = (R + tube * Math.cos(v2)) * Math.sin(u2);
      pos2[i3 + 2] = tube * Math.sin(v2);

      // SHAPE 3: Dải ngân hà sóng lượn (Cyber Wave)
      const x = (Math.random() - 0.5) * 8.0;
      const z = (Math.random() - 0.5) * 8.0;
      const y = Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.8;
      pos3[i3] = x;
      pos3[i3 + 1] = y;
      pos3[i3 + 2] = z;
    }

    return {
      initialPositions: pos1,
      shape2Positions: pos2,
      shape3Positions: pos3,
    };
  }, [count]);

  // Vòng lặp Render 60 FPS cập nhật theo scroll.offset
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      // Nội suy mượt mà (Lerp) giá trị scroll từ 0 -> 1
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        scroll.offset,
        0.06
      );
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[initialPositions, 3]} />
        <bufferAttribute attach="attributes-aTargetPosition1" args={[shape2Positions, 3]} />
        <bufferAttribute attach="attributes-aTargetPosition2" args={[shape3Positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[LusionParticleShader]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ============================================================================
// 3. MASTER EXPORT: 3D CANVAS WRAPPER CỐ ĐỊNH CHẠY NGẦM
// ============================================================================
export default function LusionMorphScene() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: 'radial-gradient(circle at center, #0e121d 0%, #050608 100%)',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 2]} // Tối ưu GPU Retina display
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <ScrollControls pages={3} damping={0.25}>
          <MorphingParticleMesh count={20000} />
        </ScrollControls>

        {/* Hậu kỳ phát sáng & Tán sắc lăng kính Lusion Style */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            offset={new THREE.Vector2(0.002, 0.002)}
            radialModulation={false}
            modulationOffset={0}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
```

---

### 📄 File: `src/app/page.tsx` (Cách ghép nối với HTML UI)

```tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamic import không chạy SSR cho WebGL Canvas
const LusionMorphScene = dynamic(() => import('@/components/3d/LusionMorphScene'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main style={{ position: 'relative', width: '100%', minHeight: '300vh', color: '#fff' }}>
      {/* 3D Background Canvas */}
      <LusionMorphScene />

      {/* SECTION 1: HERO (0 - 100vh) */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, textAlign: 'center', padding: 24 }}>
        <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 4, color: '#818cf8', marginBottom: 16 }}>
          ⚡ Quantum Interaction
        </span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, maxWidth: 900 }}>
          Future of Digital <span style={{ color: '#6366f1' }}>Experiences</span>
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', marginTop: 20, maxWidth: 600 }}>
          Cuộn chuột để chiêm ngưỡng các hạt lượng tử tan chảy và biến hình trong không gian 3 chiều.
        </p>
      </section>

      {/* SECTION 2: TRANSFORMATION (100vh - 200vh) */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, textAlign: 'center', padding: 24 }}>
        <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 4, color: '#f97316', marginBottom: 16 }}>
          🌊 Fluid Morphing
        </span>
        <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', fontWeight: 900, maxWidth: 900 }}>
          Nội suy Chất lỏng <span style={{ color: '#ee4d2d' }}>Realtime GPU</span>
        </h2>
        <p style={{ fontSize: 18, color: '#94a3b8', marginTop: 20, maxWidth: 600 }}>
          Thuật toán Curl Noise bẻ cong không gian và điều hướng từng dòng hạt chuyển động mượt mà ở 60 FPS.
        </p>
      </section>

      {/* SECTION 3: CALL TO ACTION (200vh - 300vh) */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, textAlign: 'center', padding: 24 }}>
        <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 4, color: '#34d399', marginBottom: 16 }}>
          🚀 Ready to Launch
        </span>
        <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', fontWeight: 900, maxWidth: 900 }}>
          Bùng nổ Sáng tạo cùng <span style={{ color: '#10b981' }}>ShopTik 3D</span>
        </h2>
        <button style={{ marginTop: 32, padding: '16px 40px', fontSize: 16, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 9999, cursor: 'pointer', boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)' }}>
          Trải Nghiệm Ngay ↗
        </button>
      </section>
    </main>
  );
}
```

---

## 📋 4. MASTER PROMPT DÀNH CHO AI (COPY-PASTE VÀO BẤT KỲ AI NÀO)

```text
[SYSTEM PROMPT FOR AI CODE GENERATOR]
Role: Senior Creative Technologist & WebGL / Three.js Expert.

Objective:
Build a Next.js (App Router, TypeScript) landing page featuring a full-screen interactive 3D particle morphing scene inspired by Lusion.co (https://lusion.co/).

Core Technical Requirements:
1. Framework & Libraries:
   - Next.js 14/15/16, React Three Fiber (@react-three/fiber), Drei (@react-three/drei), Postprocessing (@react-three/postprocessing), Three.js.
2. 3D Background Canvas:
   - Fixed full-screen Canvas (position: fixed, top: 0, left: 0, width: 100vw, height: 100vh, zIndex: 0, pointerEvents: none).
   - 20,000 to 30,000 points (THREE.Points) computed with a custom GLSL ShaderMaterial.
3. Morphing & Liquid Simulation:
   - Generate at least 3 distinct shapes in Float32Array: Shape 1 (Sphere), Shape 2 (Torus Ring), Shape 3 (Wave Plane).
   - In the Vertex Shader, smoothly interpolate position using mix() driven by a uniform float uProgress (0.0 to 1.0).
   - Implement a 3D Curl Noise function in the vertex shader to simulate turbulent fluid dynamics during transition phases (sin(uProgress * PI)).
4. Scroll Synchronization:
   - Use Drei's <ScrollControls pages={3}> and useScroll() hook to sync the scroll progress smoothly (with lerp) into the shader's uProgress uniform.
5. Post-processing:
   - Wrap the scene with <EffectComposer> containing Unreal <Bloom> (intensity 1.8) and <ChromaticAberration> for cinematic neon glow.
6. HTML Overlay UI:
   - Place 3 distinct full-viewport sections (min-height: 100vh) over the 3D canvas (position: relative, z-index: 1) with transparent backgrounds, modern dark typography, badges, and CTA buttons.
7. Performance Optimization:
   - Disable antialias when post-processing is active, clamp DPR to [1, 2], set dynamic ssr: false on the canvas component.

Please output complete, production-ready, clean, and bug-free code with file paths.
```

---

## ⚡ 5. BẢNG CHECKLIST TỐI ƯU HIỆU NĂNG (60 FPS GUARANTEE)

* [x] **DPR Clamping:** Luôn đặt `dpr={[1, 2]}` trên `<Canvas>` để tránh sụt giảm FPS trên màn hình Retina 4K/5K.
* [x] **Disabling Default Antialias:** Khi dùng `<EffectComposer>`, đặt `gl={{ antialias: false }}` để tiết kiệm 30-40% tài nguyên GPU.
* [x] **Dynamic Import SSR:** Luôn bọc Component chứa Canvas bằng `dynamic(() => import(...), { ssr: false })` để tránh lỗi `window is not defined` trong Next.js.
* [x] **Additive Blending:** Đặt `blending={THREE.AdditiveBlending}` và `depthWrite={false}` để các hạt phát sáng chồng lên nhau mà không bị lỗi viền đen.
