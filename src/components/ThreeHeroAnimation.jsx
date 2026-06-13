"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHeroAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- 1. SETUP SCENE, CAMERA, & RENDERER ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();

    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 12;

    // WebGL Renderer with Alpha (transparency)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Explicitly disable pointer events on the canvas element itself
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    containerRef.current.appendChild(renderer.domElement);

    // --- 2. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const orangeLight = new THREE.DirectionalLight(0xff6b00, 0.6);
    orangeLight.position.set(5, 5, 4);
    scene.add(orangeLight);

    const highlightLight = new THREE.PointLight(0xffffff, 0.8, 15);
    highlightLight.position.set(2, 2, 5);
    scene.add(highlightLight);

    // --- 3. TEXTURE LOADER & BACKGROUND REMOVAL ---
    const textureLoader = new THREE.TextureLoader();
    const loadedTextures = [];

    // Process image to remove checkerboard / gray-white background
    const removeBackground = (image) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Pass 1: Remove gray/white background pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // How close is the pixel to pure gray (R≈G≈B)?
        const maxChannel = Math.max(r, g, b);
        const minChannel = Math.min(r, g, b);
        const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;
        const brightness = (r + g + b) / 3;

        // Remove if: low saturation AND bright (gray/white checkerboard)
        if (saturation < 0.12 && brightness > 160) {
          data[i + 3] = 0; // fully transparent
        }
        // Soft edge: slightly desaturated bright pixels get partial transparency
        else if (saturation < 0.2 && brightness > 190) {
          const factor = (0.2 - saturation) / 0.08;
          const brightFactor = Math.min(1, (brightness - 190) / 65);
          const alphaReduction = factor * brightFactor;
          data[i + 3] = Math.round(data[i + 3] * (1 - alphaReduction * 0.85));
        }
      }

      // Pass 2: Erode — remove semi-transparent edge pixels next to fully transparent
      const w = canvas.width;
      const h = canvas.height;
      const alphaBuffer = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) {
        alphaBuffer[i] = data[i * 4 + 3];
      }

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          if (alphaBuffer[idx] === 0) continue;

          // Count transparent neighbors
          let transparentNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              if (alphaBuffer[(y + dy) * w + (x + dx)] === 0) {
                transparentNeighbors++;
              }
            }
          }

          // If surrounded by many transparent pixels, fade this one
          if (transparentNeighbors >= 5) {
            data[idx * 4 + 3] = 0;
          } else if (transparentNeighbors >= 3) {
            data[idx * 4 + 3] = Math.round(data[idx * 4 + 3] * 0.4);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const cleanTexture = new THREE.CanvasTexture(canvas);
      cleanTexture.colorSpace = THREE.SRGBColorSpace;
      return cleanTexture;
    };

    // Fruit configuration
    const fruitConfigs = [
      {
        name: "mango",
        path: "/fruit_mango.png",
        heroSize: 1.8,
        heroPos: [-0.2, 0.8, 0],
        heroRot: [0, 0, -0.12],
        rotSpeedZ: 0.002,
        floatSpeed: 0.005,
        floatRange: 0.15,
      },
      {
        name: "strawberry",
        path: "/fruit_strawberry.png",
        heroSize: 1.2,
        heroPos: [3.2, -0.8, 0.3],
        heroRot: [0, 0, 0.18],
        rotSpeedZ: -0.003,
        floatSpeed: 0.007,
        floatRange: 0.12,
      },
      {
        name: "kiwi",
        path: "/fruit_kiwi.png",
        heroSize: 1.3,
        heroPos: [2.5, 2.8, 0.1],
        heroRot: [0, 0, 0.35],
        rotSpeedZ: 0.0025,
        floatSpeed: 0.004,
        floatRange: 0.1,
      },
      {
        name: "banana",
        path: "/fruit_banana.png",
        heroSize: 1.6,
        heroPos: [-3.2, -1.0, 0.2],
        heroRot: [0, 0, -0.25],
        rotSpeedZ: -0.002,
        floatSpeed: 0.006,
        floatRange: 0.14,
      },
      {
        name: "orange",
        path: "/fruit_orange.png",
        heroSize: 1.4,
        heroPos: [1.2, -2.8, -0.1],
        heroRot: [0, 0, 0.12],
        rotSpeedZ: 0.003,
        floatSpeed: 0.005,
        floatRange: 0.12,
      },
      {
        name: "blueberry",
        path: "/fruit_blueberry.png",
        heroSize: 0.8,
        heroPos: [-1.8, -2.4, 0.4],
        heroRot: [0, 0, 0.1],
        rotSpeedZ: 0.004,
        floatSpeed: 0.008,
        floatRange: 0.18,
      },
    ];

    // --- 4. CREATE FRUIT SPRITE PLANES ---
    const heroFruitGroup = new THREE.Group();
    scene.add(heroFruitGroup);

    const backgroundGroup = new THREE.Group();
    scene.add(backgroundGroup);

    const bgMeshes = [];

    // Helper: create a textured plane mesh from a cleaned texture
    const createFruitPlane = (texture, size) => {
      const img = texture.image;
      const aspect = img ? img.width / img.height : 1;

      const planeWidth = size * aspect;
      const planeHeight = size;

      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.15,
        side: THREE.DoubleSide,
        roughness: 0.4,
        metalness: 0.0,
        depthWrite: false,
      });

      return new THREE.Mesh(geometry, material);
    };

    // Load all fruit textures, remove backgrounds, build the scene
    fruitConfigs.forEach((config) => {
      textureLoader.load(config.path, (loadedTexture) => {
        // Process to remove checkerboard background
        const texture = removeBackground(loadedTexture.image);
        loadedTextures.push(texture);

        // --- Hero fruit (main composition) ---
        const heroMesh = createFruitPlane(texture, config.heroSize);
        heroMesh.position.set(...config.heroPos);
        heroMesh.rotation.set(...config.heroRot);
        heroMesh.userData = {
          rotSpeedZ: config.rotSpeedZ,
          floatSpeed: config.floatSpeed,
          floatRange: config.floatRange,
          startY: config.heroPos[1],
        };
        heroFruitGroup.add(heroMesh);

        // --- Background fruit (smaller, scattered) ---
        const bgSize = config.heroSize * 0.45;
        const bgMesh = createFruitPlane(texture, bgSize);
        bgMesh.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 3 - 2.5
        );
        bgMesh.rotation.set(0, 0, Math.random() * Math.PI * 2);
        bgMesh.userData = {
          rotSpeedZ: (Math.random() - 0.5) * 0.004,
          floatSpeed: 0.003 + Math.random() * 0.006,
          floatRange: 0.2 + Math.random() * 0.4,
          startY: bgMesh.position.y,
        };
        bgMesh.material.opacity = 0.5;
        backgroundGroup.add(bgMesh);
        bgMeshes.push(bgMesh);
      });
    });

    // Add a second blueberry cluster to hero group
    textureLoader.load("/fruit_blueberry.png", (loadedTexture) => {
      const texture = removeBackground(loadedTexture.image);
      const blueberry2 = createFruitPlane(texture, 0.6);
      blueberry2.position.set(0.8, 2.2, 0.2);
      blueberry2.rotation.set(0, 0, -0.2);
      blueberry2.userData = {
        rotSpeedZ: -0.003,
        floatSpeed: 0.006,
        floatRange: 0.15,
        startY: 1.2,
      };
      heroFruitGroup.add(blueberry2);
    });

    // --- 5. MOUSE PARALLAX & RESPONSIVE POSITIONING ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let startGroupY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Setup positions based on width
    const updateLayoutPositions = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        heroFruitGroup.position.set(0, -1.8, 0);
        heroFruitGroup.scale.set(0.85, 0.85, 0.85);
        startGroupY = -1.8;
      } else {
        heroFruitGroup.position.set(2.8, 0.2, 0);
        heroFruitGroup.scale.set(1.15, 1.15, 1.15);
        startGroupY = 0.2;
      }
    };

    updateLayoutPositions();

    // --- 6. ANIMATION LOOP ---
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Background group slow drift
      backgroundGroup.rotation.z = Math.sin(elapsedTime * 0.1) * 0.03;
      bgMeshes.forEach((mesh) => {
        mesh.rotation.z += mesh.userData.rotSpeedZ;
        mesh.position.y =
          mesh.userData.startY +
          Math.sin(elapsedTime * mesh.userData.floatSpeed * 50) *
            mesh.userData.floatRange *
            0.25;
      });

      // Mouse Parallax Lerps
      targetX = mouseX * 2.5;
      targetY = mouseY * 1.5;

      // Gentle floating of the hero fruit group
      heroFruitGroup.position.y = startGroupY + Math.sin(elapsedTime * 1.6) * 0.2;

      // Individual floating/rotation of hero fruits
      heroFruitGroup.children.forEach((mesh) => {
        if (mesh.userData && mesh.userData.startY !== undefined) {
          mesh.position.y =
            mesh.userData.startY +
            Math.sin(elapsedTime * mesh.userData.floatSpeed * 50) *
              mesh.userData.floatRange *
              0.25;
          if (mesh.userData.rotSpeedZ) {
            mesh.rotation.z += mesh.userData.rotSpeedZ;
          }
        }
      });

      // Tilt hero fruit group based on mouse coordinates
      const targetGroupRotX = mouseY * 0.15;
      const targetGroupRotY = mouseX * 0.15;
      heroFruitGroup.rotation.x += (targetGroupRotX - heroFruitGroup.rotation.x) * 0.06;
      heroFruitGroup.rotation.y += (targetGroupRotY - heroFruitGroup.rotation.y) * 0.06;

      // Parallax shifts on background
      backgroundGroup.position.x +=
        (targetX * 0.5 - backgroundGroup.position.x) * 0.03;
      backgroundGroup.position.y +=
        (targetY * 0.5 - backgroundGroup.position.y) * 0.03;

      highlightLight.position.x = 2 + mouseX * 3;
      highlightLight.position.y = 2 + mouseY * 3;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // --- 7. RESIZE ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      updateLayoutPositions();
    };

    window.addEventListener("resize", handleResize);

    // --- 8. CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose all meshes in hero group
      heroFruitGroup.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });

      // Dispose all meshes in background group
      backgroundGroup.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });

      // Dispose loaded textures
      loadedTextures.forEach((t) => t.dispose());

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
}
