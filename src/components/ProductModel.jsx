"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Procedural stand-up food pouch model.
 * - Body: rounded CylinderGeometry (slightly tapered, pillow-shaped)
 * - Front label: PlaneGeometry mapped with the front product image
 * - Back label: PlaneGeometry mapped with the back product image
 * - Top seal: BoxGeometry strip
 * - Bottom gusset: slightly wider BoxGeometry strip
 * - Materials: MeshStandardMaterial with roughness/metalness for sheen
 */
export default function ProductModel({ mousePos }) {
  const groupRef = useRef();
  const bodyRef = useRef();

  // Load textures for the pouch label
  const [frontTex, backTex] = useTexture([
    "/strawberrySliceFront.jpg",
    "/strawberrySliceBack.jpg",
  ]);

  // Fix texture color space
  useMemo(() => {
    [frontTex, backTex].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
    });
  }, [frontTex, backTex]);

  // Pouch dimensions
  const POUCH_HEIGHT = 2.8;
  const POUCH_RADIUS_TOP = 0.62;
  const POUCH_RADIUS_BOTTOM = 0.72;
  const SEAL_HEIGHT = 0.22;
  const GUSSET_HEIGHT = 0.18;
  const LABEL_WIDTH = 1.1;
  const LABEL_HEIGHT = 2.0;

  // Animation state
  const clock = useRef({ rotation: 0, floatOffset: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });
  const ROTATION_SPEED = 0.15; // rad/s as per spec

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Continuous Y-axis auto-rotation
    clock.current.rotation += ROTATION_SPEED * delta;

    // 2. Subtle float on Y
    const floatY = Math.sin(state.clock.elapsedTime * 0.8) * 0.12;

    // 3. Mouse tilt (premium — subtle)
    const targetX = (mousePos?.y ?? 0) * 0.18;
    const targetY = (mousePos?.x ?? 0) * 0.14 + clock.current.rotation;
    const lerpFactor = 0.04;

    currentTilt.current.x += (targetX - currentTilt.current.x) * lerpFactor;
    currentTilt.current.y += (targetY - currentTilt.current.y) * lerpFactor;

    // Apply all transforms
    groupRef.current.position.y = floatY;
    groupRef.current.rotation.x = currentTilt.current.x;
    groupRef.current.rotation.y = currentTilt.current.y;
  });

  // Pouch body material — premium matte-sheen plastic
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xf8f0e8),
        roughness: 0.22,
        metalness: 0.38,
        envMapIntensity: 1.6,
      }),
    []
  );

  // Seal/gusset material — slightly different sheen
  const sealMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfaebd5),
        roughness: 0.15,
        metalness: 0.55,
        envMapIntensity: 2.0,
      }),
    []
  );

  // Front label material
  const frontLabelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.35,
        metalness: 0.1,
        transparent: false,
        envMapIntensity: 0.5,
      }),
    [frontTex]
  );

  // Back label material
  const backLabelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.35,
        metalness: 0.1,
        transparent: false,
        envMapIntensity: 0.5,
      }),
    [backTex]
  );

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── POUCH BODY ────────────────────────────────────────── */}
      <mesh
        ref={bodyRef}
        castShadow
        receiveShadow
        material={bodyMaterial}
      >
        <cylinderGeometry
          args={[
            POUCH_RADIUS_TOP,    // radiusTop
            POUCH_RADIUS_BOTTOM, // radiusBottom
            POUCH_HEIGHT,        // height
            48,                  // radialSegments — smooth
            4,                   // heightSegments
            false,               // openEnded
          ]}
        />
      </mesh>

      {/* ── FRONT LABEL ───────────────────────────────────────── */}
      <mesh
        position={[0, -0.08, POUCH_RADIUS_TOP + 0.002]}
        castShadow
        material={frontLabelMaterial}
      >
        <planeGeometry args={[LABEL_WIDTH, LABEL_HEIGHT, 1, 1]} />
      </mesh>

      {/* ── BACK LABEL ────────────────────────────────────────── */}
      <mesh
        position={[0, -0.08, -(POUCH_RADIUS_TOP + 0.002)]}
        rotation={[0, Math.PI, 0]}
        castShadow
        material={backLabelMaterial}
      >
        <planeGeometry args={[LABEL_WIDTH, LABEL_HEIGHT, 1, 1]} />
      </mesh>

      {/* ── TOP SEAL ──────────────────────────────────────────── */}
      <mesh
        position={[0, POUCH_HEIGHT / 2 + SEAL_HEIGHT / 2, 0]}
        castShadow
        material={sealMaterial}
      >
        <boxGeometry
          args={[
            POUCH_RADIUS_TOP * 2 + 0.04, // width
            SEAL_HEIGHT,                  // height
            POUCH_RADIUS_TOP * 0.22,      // depth (flat seal)
          ]}
        />
      </mesh>

      {/* ── TOP SEAL ROUND NOTCH ──────────────────────────────── */}
      <mesh
        position={[0, POUCH_HEIGHT / 2 + SEAL_HEIGHT + 0.04, 0]}
        castShadow
        material={sealMaterial}
      >
        <cylinderGeometry args={[0.09, 0.09, 0.08, 24]} />
      </mesh>

      {/* ── BOTTOM GUSSET ─────────────────────────────────────── */}
      <mesh
        position={[0, -(POUCH_HEIGHT / 2) - GUSSET_HEIGHT / 2, 0]}
        castShadow
        material={sealMaterial}
      >
        <boxGeometry
          args={[
            POUCH_RADIUS_BOTTOM * 2 + 0.08,
            GUSSET_HEIGHT,
            POUCH_RADIUS_BOTTOM * 1.55,
          ]}
        />
      </mesh>

      {/* ── BOTTOM CAP (closes cylinder bottom) ───────────────── */}
      <mesh
        position={[0, -(POUCH_HEIGHT / 2) - GUSSET_HEIGHT + 0.01, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        material={sealMaterial}
      >
        <circleGeometry args={[POUCH_RADIUS_BOTTOM, 48]} />
      </mesh>
    </group>
  );
}
