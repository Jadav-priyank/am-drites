"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import ProductModel from "./ProductModel";
import FruitSprites from "./FruitSprites";

/**
 * The R3F Canvas scene.
 * Separated from ProductHero.jsx so it can be dynamically imported (ssr: false).
 */
export default function ProductScene({ mousePos, isMobile }) {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      {/* ── CAMERA ────────────────────────────────────────────────── */}
      <PerspectiveCamera
        makeDefault
        position={[0, 0, isMobile ? 7.2 : 6.0]}
        fov={isMobile ? 52 : 44}
        near={0.1}
        far={100}
      />

      {/* ── ENVIRONMENT (HDRI reflections) ─────────────────────── */}
      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>

      {/* ── LIGHTING ──────────────────────────────────────────────── */}
      {/* Warm ambient fill */}
      <ambientLight color="#fff5e6" intensity={1.4} />

      {/* Key light — warm directional from upper-left */}
      <directionalLight
        position={[4, 8, 5]}
        color="#fff8f0"
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Rim light — cool from behind for product edge highlight */}
      <directionalLight
        position={[-3, 2, -5]}
        color="#c8e4ff"
        intensity={0.6}
      />

      {/* Orange fill from front-right */}
      <pointLight
        position={[3, 1, 4]}
        color="#ff9a4d"
        intensity={0.8}
        distance={12}
      />

      {/* Soft ground bounce */}
      <pointLight
        position={[0, -3, 2]}
        color="#ffd08a"
        intensity={0.35}
        distance={8}
      />

      {/* ── CONTACT SHADOW ────────────────────────────────────────── */}
      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={0.28}
        scale={isMobile ? 5 : 7}
        blur={2.8}
        far={3}
        color="#7c3d12"
      />

      {/* ── 3D PRODUCT MODEL ──────────────────────────────────────── */}
      <Suspense fallback={null}>
        <ProductModel mousePos={mousePos} />
      </Suspense>

      {/* ── ORBITING FRUIT SPRITES ────────────────────────────────── */}
      <Suspense fallback={null}>
        <FruitSprites isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
}
