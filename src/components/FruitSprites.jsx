"use client";

import { useRef, useMemo } from "react";
import { useFrame, useTexture } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Floating fruit sprites that orbit around the 3D pouch.
 * Uses transparent PNG planes with MeshBasicMaterial.
 * Each fruit has its own orbital radius, speed, phase, and float amplitude.
 * On mobile (viewport < 1024) the orbit radii scale down automatically.
 */

const FRUIT_CONFIGS = [
  {
    name: "mango",
    path: "/fruit_mango.png",
    size: 0.72,
    orbitRadius: 2.4,
    orbitSpeed: 0.18,
    phase: 0,
    floatAmp: 0.18,
    floatFreq: 0.9,
    rotZ: -0.15,
    rotSpeedZ: 0.004,
    depth: 0.4,
    opacity: 0.92,
  },
  {
    name: "strawberry",
    path: "/fruit_strawberry.png",
    size: 0.58,
    orbitRadius: 2.8,
    orbitSpeed: 0.14,
    phase: Math.PI * 0.33,
    floatAmp: 0.14,
    floatFreq: 1.1,
    rotZ: 0.22,
    rotSpeedZ: -0.005,
    depth: 0.2,
    opacity: 0.88,
  },
  {
    name: "kiwi",
    path: "/fruit_kiwi.png",
    size: 0.62,
    orbitRadius: 2.6,
    orbitSpeed: 0.22,
    phase: Math.PI * 0.66,
    floatAmp: 0.16,
    floatFreq: 0.75,
    rotZ: 0.35,
    rotSpeedZ: 0.003,
    depth: -0.3,
    opacity: 0.90,
  },
  {
    name: "banana",
    path: "/fruit_banana.png",
    size: 0.78,
    orbitRadius: 2.9,
    orbitSpeed: 0.12,
    phase: Math.PI,
    floatAmp: 0.20,
    floatFreq: 0.65,
    rotZ: -0.28,
    rotSpeedZ: -0.003,
    depth: 0.5,
    opacity: 0.85,
  },
  {
    name: "orange",
    path: "/fruit_orange.png",
    size: 0.65,
    orbitRadius: 2.5,
    orbitSpeed: 0.20,
    phase: Math.PI * 1.33,
    floatAmp: 0.12,
    floatFreq: 1.2,
    rotZ: 0.10,
    rotSpeedZ: 0.006,
    depth: -0.2,
    opacity: 0.88,
  },
  {
    name: "blueberry",
    path: "/fruit_blueberry.png",
    size: 0.42,
    orbitRadius: 2.2,
    orbitSpeed: 0.28,
    phase: Math.PI * 1.66,
    floatAmp: 0.22,
    floatFreq: 1.4,
    rotZ: 0.05,
    rotSpeedZ: -0.007,
    depth: 0.1,
    opacity: 0.82,
  },
];

function FruitSprite({ config, isMobile }) {
  const meshRef = useRef();
  const rotRef = useRef(config.rotZ);

  const texture = useTexture(config.path);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: config.opacity,
      }),
    [texture, config.opacity]
  );

  // Compute aspect ratio so the sprite isn't stretched
  const aspect = texture.image
    ? texture.image.width / texture.image.height
    : 1;
  const spriteW = config.size * aspect;
  const spriteH = config.size;

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;
    const radiusScale = isMobile ? 0.62 : 1.0;
    const r = config.orbitRadius * radiusScale;
    const angle = config.phase + t * config.orbitSpeed;

    // Orbit in XY plane with gentle Z offset
    meshRef.current.position.x = Math.cos(angle) * r;
    meshRef.current.position.y =
      Math.sin(t * config.floatFreq + config.phase) * config.floatAmp;
    meshRef.current.position.z =
      Math.sin(angle) * r * 0.4 + config.depth;

    // Slow Z roll
    rotRef.current += config.rotSpeedZ;
    meshRef.current.rotation.z = rotRef.current;

    // Always face camera (billboard effect)
    meshRef.current.rotation.y = -angle * 0.35;
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[spriteW, spriteH]} />
    </mesh>
  );
}

/**
 * Renders all fruit sprites. Accepts `isMobile` prop so orbit
 * radii automatically scale down on smaller viewports.
 */
export default function FruitSprites({ isMobile = false }) {
  return (
    <group>
      {FRUIT_CONFIGS.map((config) => (
        <FruitSprite key={config.name} config={config} isMobile={isMobile} />
      ))}
    </group>
  );
}
