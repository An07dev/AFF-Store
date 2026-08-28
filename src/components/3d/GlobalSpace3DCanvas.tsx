"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ============================================================================
// 1. MINIMAL, REFINED PARTICLES (SUBTLE 180 PARTICLES)
// ============================================================================
function CosmicWarpStars({ count = 180 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color("#ffffff"), // Diamond White
      new THREE.Color("#818cf8"), // Indigo Soft
      new THREE.Color("#38bdf8"), // Sky Blue
      new THREE.Color("#c084fc"), // Soft Lavender
    ];

    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const z = 20 - Math.random() * 150; // from Z = +20 to Z = -130

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.sin(theta) * radius;
      pos[i * 3 + 2] = z;

      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += delta * 0.025;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.24}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ============================================================================
// 2. MINIMAL FLOATING CYBER RINGS & GEOMETRIC GATEWAYS
// ============================================================================
function CyberTunnelGates() {
  const gatesRef = useRef<THREE.Group>(null!);

  const gatePositions = useMemo(
    () => [
      { z: 6, color: "#818cf8", scale: 3.2, type: "ring" },
      { z: -20, color: "#38bdf8", scale: 3.8, type: "torus" },
      { z: -50, color: "#c084fc", scale: 4.0, type: "octa" },
      { z: -80, color: "#34d399", scale: 3.6, type: "ring" },
      { z: -110, color: "#fbbf24", scale: 4.2, type: "torus" },
    ],
    []
  );

  useFrame((_, delta) => {
    if (gatesRef.current) {
      gatesRef.current.children.forEach((child, i) => {
        child.rotation.z += delta * (0.12 + (i % 3) * 0.05);
        child.rotation.x += delta * 0.04;
      });
    }
  });

  return (
    <group ref={gatesRef}>
      {gatePositions.map((gate, idx) => (
        <group key={idx} position={[0, 0, gate.z]} scale={gate.scale}>
          {gate.type === "ring" && (
            <mesh>
              <ringGeometry args={[1.5, 1.6, 64]} />
              <meshBasicMaterial
                color={gate.color}
                side={THREE.DoubleSide}
                transparent
                opacity={0.35}
              />
            </mesh>
          )}
          {gate.type === "torus" && (
            <mesh>
              <torusGeometry args={[1.7, 0.035, 16, 64]} />
              <meshBasicMaterial
                color={gate.color}
                transparent
                opacity={0.4}
              />
            </mesh>
          )}
          {gate.type === "octa" && (
            <mesh>
              <octahedronGeometry args={[2.0, 0]} />
              <meshBasicMaterial
                color={gate.color}
                wireframe
                transparent
                opacity={0.22}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Subtle Grid Floor */}
      <mesh position={[0, -6, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 180, 15, 60]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// 3. CAMERA CONTROLLER: FLIES THROUGH Z-AXIS BASED ON PAGE SCROLL
// ============================================================================
function CameraFlyController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    // Camera starts at Z = 22 and flies down to Z = -95 smoothly
    const targetZ = 22 - scrollProgress * 110;
    const targetY = Math.sin(scrollProgress * Math.PI * 2) * 1.8 + mouseRef.current.y * 0.4;
    const targetX = Math.cos(scrollProgress * Math.PI * 2) * 1.5 + mouseRef.current.x * 0.5;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);

    // Subtle dynamic banking
    const targetRotZ = Math.sin(scrollProgress * Math.PI * 3) * 0.12 + mouseRef.current.x * 0.04;
    const targetRotY = -mouseRef.current.x * 0.04;
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRotZ, 0.04);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY, 0.04);
  });

  return null;
}

// ============================================================================
// 4. MAIN GLOBAL 3D BACKGROUND CANVAS
// ============================================================================
export default function GlobalSpace3DCanvas() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalScroll)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        background: "radial-gradient(circle at 50% 40%, #0d1222 0%, #060913 60%, #020408 100%)",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 22], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 0, 15]} intensity={2.0} color="#818cf8" />
        <pointLight position={[0, -5, -40]} intensity={1.5} color="#38bdf8" />

        {/* Minimal 3D Cosmic Space & Neon Elements */}
        <CosmicWarpStars count={180} />
        <CyberTunnelGates />

        {/* Realtime Scroll Camera Fly-Through Controller */}
        <CameraFlyController scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
