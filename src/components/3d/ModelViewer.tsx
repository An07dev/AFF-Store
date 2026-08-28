"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Float, Environment, ContactShadows } from "@react-three/drei";

interface ModelViewerProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
}

function Model({ modelPath, scale = 1.5, position = [0, 0, 0] }: ModelViewerProps) {
  const { scene } = useGLTF(modelPath);
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <primitive object={scene} scale={scale} position={position} />
    </Float>
  );
}

export default function ModelViewer({
  modelPath = "/models/sample.glb",
  scale = 1.5,
  position = [0, 0, 0],
  autoRotate = true,
}: Partial<ModelViewerProps>) {
  return (
    <div style={{ width: "100%", height: "480px", position: "relative" }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Suspense fallback={null}>
          <Model modelPath={modelPath} scale={scale} position={position} />
          <Environment preset="city" />
          <ContactShadows opacity={0.5} scale={10} blur={1.5} far={10} resolution={256} color="#000000" />
        </Suspense>

        <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1.2} enableZoom={true} />
      </Canvas>
    </div>
  );
}
