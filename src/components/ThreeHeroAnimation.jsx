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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const orangeLight = new THREE.DirectionalLight(0xff6b00, 1.8);
    orangeLight.position.set(5, 5, 4);
    scene.add(orangeLight);

    const greenLight = new THREE.PointLight(0x15803d, 2.0, 25);
    greenLight.position.set(-6, -3, 3);
    scene.add(greenLight);

    // Light reflecting on pouch face
    const highlightLight = new THREE.PointLight(0xffffff, 1.2, 15);
    highlightLight.position.set(2, 2, 5);
    scene.add(highlightLight);

    // --- 3. TEXTURE LOADER & 3D POUCH ---
    const textureLoader = new THREE.TextureLoader();
    
    // Load the pouch mockup image as texture
    const pouchTexture = textureLoader.load("/hero_pouch_mockup.png");
    pouchTexture.minFilter = THREE.LinearFilter;
    pouchTexture.generateMipmaps = false;

    // Create a deformed PlaneGeometry to represent a puffed up 3D stand-up pouch
    const pouchWidth = 3.0;
    const pouchHeight = 4.0;
    const pouchGeo = new THREE.PlaneGeometry(pouchWidth, pouchHeight, 32, 32);
    
    // Deform geometry along Z-axis (cosine bulge center-tapered to edges)
    const pos = pouchGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Bulge is maximum in the middle, and 0 at x/y borders
      const z = Math.cos((x / (pouchWidth / 2)) * Math.PI / 2) * 
                Math.cos((y / (pouchHeight / 2)) * Math.PI / 2) * 0.35;
      pos.setZ(i, z);
    }
    pouchGeo.computeVertexNormals();

    const pouchMaterial = new THREE.MeshStandardMaterial({
      map: pouchTexture,
      transparent: true,
      roughness: 0.15,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    const pouchMesh = new THREE.Mesh(pouchGeo, pouchMaterial);
    scene.add(pouchMesh);

    // --- 4. RESPONSIVE SOFT DROP SHADOW ---
    const createShadowTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
      gradient.addColorStop(0, "rgba(26, 21, 16, 0.18)");
      gradient.addColorStop(0.5, "rgba(26, 21, 16, 0.08)");
      gradient.addColorStop(1, "rgba(26, 21, 16, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const shadowGeo = new THREE.PlaneGeometry(2.6, 0.7);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: createShadowTexture(),
      transparent: true,
      blending: THREE.MultiplyBlending
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
    shadowMesh.rotation.x = -Math.PI / 2.2; // tilt shadow flat
    scene.add(shadowMesh);

    // --- 5. BACKGROUND FLOATING FRUITS GROUP ---
    const backgroundGroup = new THREE.Group();
    scene.add(backgroundGroup);

    const bgMeshes = [];

    // Geometries
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.4, 0.8, 0, 1.6);
    leafShape.quadraticCurveTo(-0.4, 0.8, 0, 0);
    const leafGeo = new THREE.ShapeGeometry(leafShape);

    const mangoGeo = new THREE.SphereGeometry(0.4, 32, 16);
    const strawberryGeo = new THREE.ConeGeometry(0.3, 0.6, 16);
    
    // Banana Slice: Flat cylinder
    const bananaGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
    
    // Kiwi Slice: Flat green cylinder
    const kiwiGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);

    // Materials
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
    const mangoMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.2 });
    const strawberryMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 });
    const bananaMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 }); // Light yellow
    const kiwiMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 }); // Bright green

    // Spawn helper
    const spawnMesh = (geo, mat, scaleVec, isBananaOrKiwi = false) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.copy(scaleVec);
      
      // Position spread through the scene background
      mesh.position.set(
        (Math.random() - 0.5) * 11,
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 4 - 2.5 // set slightly in the background
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.008,
        rotSpeedY: (Math.random() - 0.5) * 0.012,
        floatSpeed: 0.003 + Math.random() * 0.008,
        floatRange: 0.3 + Math.random() * 0.5,
        startY: mesh.position.y
      };

      backgroundGroup.add(mesh);
      bgMeshes.push(mesh);
    };

    // Spawn 6 leaves
    for (let i = 0; i < 6; i++) spawnMesh(leafGeo, leafMat, new THREE.Vector3(0.6, 0.6, 0.6));
    // Spawn 4 mangoes (scaled sphere)
    for (let i = 0; i < 4; i++) spawnMesh(mangoGeo, mangoMat, new THREE.Vector3(1.3, 0.85, 0.85));
    // Spawn 4 strawberries
    for (let i = 0; i < 4; i++) spawnMesh(strawberryGeo, strawberryMat, new THREE.Vector3(1, 1, 1));
    // Spawn 3 banana slices
    for (let i = 0; i < 3; i++) spawnMesh(bananaGeo, bananaMat, new THREE.Vector3(1, 1, 1), true);
    // Spawn 3 kiwi slices
    for (let i = 0; i < 3; i++) spawnMesh(kiwiGeo, kiwiMat, new THREE.Vector3(1, 1, 1), true);

    // --- 6. GLOWING ORGANIC PARTICLES ---
    const particlesCount = 100;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    const orangeColor = new THREE.Color(0xff6b00);
    const greenColor = new THREE.Color(0x15803d);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 12;
      posArray[i + 1] = (Math.random() - 0.5) * 8;
      posArray[i + 2] = (Math.random() - 0.5) * 6;

      const pColor = Math.random() > 0.55 ? orangeColor : greenColor;
      colorArray[i] = pColor.r;
      colorArray[i + 1] = pColor.g;
      colorArray[i + 2] = pColor.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
      return new THREE.CanvasTexture(canvas);
    };

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      map: createParticleTexture(),
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMaterial);
    scene.add(particleSystem);

    // --- 7. MOUSE PARALLAX & RESPONSIVE POSITIONING VARIABLES ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    let startPouchY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Setup positions based on width
    const updateLayoutPositions = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        // Center on mobile, positioned lower to sit under text
        pouchMesh.position.set(0, -1.8, 0);
        pouchMesh.scale.set(0.85, 0.85, 0.85);
        
        shadowMesh.position.set(0, -4.1, -0.2);
        shadowMesh.scale.set(0.75, 0.75, 1);
        startPouchY = -1.8;
      } else {
        // Floating on the right column on desktop
        pouchMesh.position.set(2.8, 0.2, 0);
        pouchMesh.scale.set(1.15, 1.15, 1.15);
        
        shadowMesh.position.set(2.8, -2.4, -0.2);
        shadowMesh.scale.set(1.1, 1.1, 1);
        startPouchY = 0.2;
      }
    };

    updateLayoutPositions();

    // --- 8. ANIMATION LOOP ---
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Slow background float
      backgroundGroup.rotation.y = elapsedTime * 0.015;
      bgMeshes.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;
        mesh.position.y = mesh.userData.startY + Math.sin(elapsedTime * mesh.userData.floatSpeed * 50) * mesh.userData.floatRange * 0.25;
      });

      // Particle system movement
      particleSystem.rotation.y = elapsedTime * 0.008;
      particleSystem.rotation.x = elapsedTime * 0.004;

      // Mouse Parallax Lerps
      targetX = mouseX * 2.5;
      targetY = mouseY * 1.5;

      // Gentle floating of the pouch
      pouchMesh.position.y = startPouchY + Math.sin(elapsedTime * 1.6) * 0.2;
      
      // Tilt pouch based on mouse coordinates
      const targetPouchRotX = mouseY * 0.35;
      const targetPouchRotY = mouseX * 0.35;
      pouchMesh.rotation.x += (targetPouchRotX - pouchMesh.rotation.x) * 0.08;
      pouchMesh.rotation.y += (targetPouchRotY - pouchMesh.rotation.y) * 0.08;
      pouchMesh.rotation.z = Math.sin(elapsedTime * 0.8) * 0.02; // light sway

      // Adjust Drop Shadow based on pouch height
      const heightDiff = pouchMesh.position.y - startPouchY;
      shadowMesh.scale.x = (window.innerWidth < 1024 ? 0.75 : 1.1) * (1 - heightDiff * 0.25);
      shadowMesh.scale.y = (window.innerWidth < 1024 ? 0.75 : 1.1) * (1 - heightDiff * 0.25);
      shadowMaterial.opacity = 0.85 - heightDiff * 0.3;

      // Sync shadow x-coordinate with pouch tilt
      shadowMesh.position.x = pouchMesh.position.x + (pouchMesh.rotation.y * 0.3);

      // Parallax shifts on background elements and lights
      backgroundGroup.position.x += (targetX * 0.6 - backgroundGroup.position.x) * 0.04;
      backgroundGroup.position.y += (targetY * 0.6 - backgroundGroup.position.y) * 0.04;
      
      particleSystem.position.x += (targetX * 0.4 - particleSystem.position.x) * 0.03;
      particleSystem.position.y += (targetY * 0.4 - particleSystem.position.y) * 0.03;

      highlightLight.position.x = 2 + mouseX * 3;
      highlightLight.position.y = 2 + mouseY * 3;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // --- 9. RESIZE & DYNAMIC LAYOUTS ---
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

    // --- 10. CLEANUP GEOMETRIES, MATERIALS & EVENT LISTENERS ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      pouchGeo.dispose();
      pouchMaterial.dispose();
      shadowGeo.dispose();
      shadowMaterial.dispose();
      
      leafGeo.dispose();
      mangoGeo.dispose();
      strawberryGeo.dispose();
      bananaGeo.dispose();
      kiwiGeo.dispose();
      
      leafMat.dispose();
      mangoMat.dispose();
      strawberryMat.dispose();
      bananaMat.dispose();
      kiwiMat.dispose();
      
      particlesGeo.dispose();
      particlesMaterial.dispose();
      
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
