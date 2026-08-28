"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, MeshReflectorMaterial } from "@react-three/drei";
import type * as THREE from "three";

// Component 1 khối hộp 3D tương tác
function InteractiveBox() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);

  // useFrame chạy 60fps
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <mesh
        ref={meshRef}
        scale={clicked ? 1.4 : 1.1}
        onClick={() => setClick(!clicked)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        cursor="pointer"
      >
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color={hovered ? "#ee4d2d" : "#6366f1"}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

// Khung cảnh 3D chính
export default function CubeScene() {
  return (
    <div style={{ width: "100%", height: "450px", background: "#0b0f19", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
      <Canvas camera={{ position: [0, 1.5, 5.5], fov: 50 }}>
        {/* Ánh sáng */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />

        {/* Khối hộp 3D */}
        <InteractiveBox />

        {/* Chữ 3D */}
        <Text
          position={[0, -2, 0]}
          fontSize={0.28}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          Kéo chuột để xoay 3D • Click để phóng to
        </Text>

        {/* Bộ điều khiển chuột */}
        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2 + 0.1} />
      </Canvas>
    </div>
  );
}
