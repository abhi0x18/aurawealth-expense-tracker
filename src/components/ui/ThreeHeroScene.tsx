"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { TrendingUp, Coffee, MousePointerClick } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

export function ThreeHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { formatMoney } = useCurrency();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Group for entire interactive assembly
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // Centerpiece: 3D Credit / Wealth Card
    const cardGeo = new THREE.BoxGeometry(3.6, 2.2, 0.12);
    const cardMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    heroGroup.add(cardMesh);

    // Glowing Neon Rim for Card
    const rimGeo = new THREE.BoxGeometry(3.68, 2.28, 0.08);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    heroGroup.add(rimMesh);

    // Gold EMV Chip Mesh on Card
    const chipGeo = new THREE.BoxGeometry(0.55, 0.42, 0.14);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.25,
    });
    const chipMesh = new THREE.Mesh(chipGeo, chipMat);
    chipMesh.position.set(-1.1, 0.4, 0.05);
    heroGroup.add(chipMesh);

    // Orbiting Floating 3D Coins
    const coins: { mesh: THREE.Mesh; baseY: number; speed: number; offset: number }[] = [];
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2,
    });

    const coinPositions = [
      { x: -2.3, y: -1.0, z: 0.8, offset: 0, speed: 1.2 },
      { x: 2.2, y: 1.1, z: 1.0, offset: 2.1, speed: 0.9 },
      { x: 1.8, y: -1.3, z: -0.6, offset: 4.2, speed: 1.4 },
    ];

    coinPositions.forEach((pos) => {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(pos.x, pos.y, pos.z);
      coin.rotation.x = Math.PI / 3;
      coin.rotation.z = Math.PI / 6;
      heroGroup.add(coin);
      coins.push({ mesh: coin, baseY: pos.y, speed: pos.speed, offset: pos.offset });
    });

    // Levitating Torus Halo Ring
    const torusGeo = new THREE.TorusGeometry(2.4, 0.04, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.5,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI / 2.3;
    heroGroup.add(torusMesh);

    // Breathing 3D Financial Bar Pillars
    const bars: { mesh: THREE.Mesh; phase: number }[] = [];
    const barData = [
      { x: -1.7, h: 0.8, color: 0x10b981 },
      { x: -1.2, h: 1.3, color: 0x14b8a6 },
      { x: -0.7, h: 1.0, color: 0x06b6d4 },
      { x: 0.7, h: 1.5, color: 0x6366f1 },
      { x: 1.2, h: 1.9, color: 0x8b5cf6 },
      { x: 1.7, h: 1.2, color: 0xa855f7 },
    ];

    barData.forEach((b, i) => {
      const geo = new THREE.BoxGeometry(0.24, b.h, 0.24);
      const mat = new THREE.MeshStandardMaterial({
        color: b.color,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, -1.8 + b.h / 2, -0.6);
      heroGroup.add(mesh);
      bars.push({ mesh, phase: i * 0.8 });
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(5, 7, 5);
    scene.add(dirLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 2.5, 10);
    emeraldLight.position.set(-3, 2, 3);
    scene.add(emeraldLight);

    const indigoLight = new THREE.PointLight(0x6366f1, 2.2, 10);
    indigoLight.position.set(3, -2, 3);
    scene.add(indigoLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let spinImpulse = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;
    };

    const handleClick = () => {
      spinImpulse = 1.2;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth interpolation for mouse tilt
      heroGroup.rotation.y += (targetRotY + spinImpulse - heroGroup.rotation.y) * 0.08;
      heroGroup.rotation.x += (targetRotX - heroGroup.rotation.x) * 0.08;
      spinImpulse *= 0.94;

      // Gentle levitation
      heroGroup.position.y = Math.sin(elapsed * 1.5) * 0.12;

      // Rotate torus
      torusMesh.rotation.z = elapsed * 0.4;

      // Coins orbit & bob
      coins.forEach((c) => {
        c.mesh.rotation.y += 0.02;
        c.mesh.rotation.x += 0.01;
        c.mesh.position.y = c.baseY + Math.sin(elapsed * c.speed + c.offset) * 0.15;
      });

      // Subtle breathing on financial bars
      bars.forEach((b) => {
        const scale = 1 + Math.sin(elapsed * 2.5 + b.phase) * 0.15;
        b.mesh.scale.y = scale;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center">
      {/* Interactive Hint Pill */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full glass-panel text-xs font-mono font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 pointer-events-none shadow-md">
        <MousePointerClick className="w-4 h-4 text-emerald-500 animate-pulse" />
        <span>Move cursor to tilt • Click card to spin</span>
      </div>

      {/* Floating Micro-Widget 1: Top Left Savings Badge */}
      <div className="absolute top-10 left-2 sm:left-4 z-20 glass-panel rounded-2xl p-4 shadow-xl border border-emerald-500/30 animate-float-slow pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Saved</p>
            <p className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">
              +{formatMoney(3840000)}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Micro-Widget 2: Bottom Right Budget Health */}
      <div className="absolute bottom-8 right-2 sm:right-4 z-20 glass-panel rounded-2xl p-4 shadow-xl border border-indigo-500/30 animate-float-delayed pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Dining & Coffee</p>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">84% Optimal</span>
            </div>
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full"
                style={{ width: "84%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden"
      />
    </div>
  );
}
