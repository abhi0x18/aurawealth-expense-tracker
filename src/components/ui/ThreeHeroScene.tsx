"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { TrendingUp, Coffee, MousePointerClick, Sparkles } from "lucide-react";
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
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Group for entire interactive assembly
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // 1. Centerpiece: 3D Credit / Wealth Card
    const cardGeo = new THREE.BoxGeometry(3.6, 2.2, 0.12);
    const cardMat = new THREE.MeshPhysicalMaterial({
      color: 0x070b14,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    heroGroup.add(cardMesh);

    // Glowing Neon Rim for Card
    const rimGeo = new THREE.BoxGeometry(3.66, 2.26, 0.08);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    heroGroup.add(rimMesh);

    // Gold EMV Metallic Chip Mesh on Card
    const chipGeo = new THREE.BoxGeometry(0.55, 0.42, 0.14);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.2,
    });
    const chipMesh = new THREE.Mesh(chipGeo, chipMat);
    chipMesh.position.set(-1.1, 0.4, 0.06);
    heroGroup.add(chipMesh);

    // 2. Swirling 3D Spatial Star / Particle Dust
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.5;

      particlePos[i * 3] = Math.cos(theta) * radius;
      particlePos[i * 3 + 1] = y;
      particlePos[i * 3 + 2] = Math.sin(theta) * radius;
      particleSpeeds.push(0.3 + Math.random() * 0.8);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.07,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    heroGroup.add(particleSystem);

    // 3. Orbiting Floating 3D Gold Coins
    const coins: { mesh: THREE.Mesh; angle: number; radius: number; baseY: number; speed: number }[] = [];
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.92,
      roughness: 0.18,
    });

    const coinData = [
      { radius: 2.6, baseY: -0.6, speed: 0.8, angle: 0 },
      { radius: 2.8, baseY: 0.9, speed: 1.1, angle: 2.1 },
      { radius: 2.3, baseY: -1.2, speed: 0.9, angle: 4.2 },
    ];

    coinData.forEach((cd) => {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.x = Math.PI / 3;
      coin.rotation.z = Math.PI / 6;
      heroGroup.add(coin);
      coins.push({ mesh: coin, angle: cd.angle, radius: cd.radius, baseY: cd.baseY, speed: cd.speed });
    });

    // 4. Levitating Multi-Color Halo Rings
    const ring1Geo = new THREE.TorusGeometry(2.5, 0.035, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.6,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 2.3;
    heroGroup.add(ring1Mesh);

    const ring2Geo = new THREE.TorusGeometry(2.9, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.4,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 2.6;
    heroGroup.add(ring2Mesh);

    // 5. Breathing 3D Financial Bar Pillars
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
        metalness: 0.8,
        roughness: 0.25,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, -1.8 + b.h / 2, -0.6);
      heroGroup.add(mesh);
      bars.push({ mesh, phase: i * 0.8 });
    });

    // Dynamic Pulsing Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 7, 5);
    scene.add(dirLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 3.0, 12);
    emeraldLight.position.set(-3, 2, 3);
    scene.add(emeraldLight);

    const indigoLight = new THREE.PointLight(0x6366f1, 2.8, 12);
    indigoLight.position.set(3, -2, 3);
    scene.add(indigoLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.2, 10);
    cyanLight.position.set(0, 3, 2);
    scene.add(cyanLight);

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;
    let spinImpulse = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.55;
      targetRotX = -y * 0.4;
    };

    const handleClick = () => {
      spinImpulse = 2.4;
      emeraldLight.intensity = 6.0;
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

      // Reset impulse light flare smoothly
      if (emeraldLight.intensity > 3.0) {
        emeraldLight.intensity -= 0.1;
      }

      // Gentle vertical levitation
      heroGroup.position.y = Math.sin(elapsed * 1.6) * 0.16;

      // Rotate dual halo rings at contrasting speeds
      ring1Mesh.rotation.z = elapsed * 0.5;
      ring2Mesh.rotation.z = -elapsed * 0.35;

      // Swirl stardust particles in vortex
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const speed = particleSpeeds[i];
        let x = positions[i * 3];
        let z = positions[i * 3 + 2];
        const angle = Math.atan2(z, x) + 0.008 * speed;
        const r = Math.sqrt(x * x + z * z);
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 2] = Math.sin(angle) * r;
        positions[i * 3 + 1] += Math.sin(elapsed * 2 + i) * 0.003;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Coins orbit in continuous circle & spin
      coins.forEach((c) => {
        c.angle += 0.015 * c.speed;
        c.mesh.position.x = Math.cos(c.angle) * c.radius;
        c.mesh.position.z = Math.sin(c.angle) * c.radius;
        c.mesh.position.y = c.baseY + Math.sin(elapsed * 2.2 + c.angle) * 0.18;
        c.mesh.rotation.y += 0.035;
        c.mesh.rotation.x += 0.02;
      });

      // Breathing rhythm on financial bars
      bars.forEach((b) => {
        const scale = 1 + Math.sin(elapsed * 2.6 + b.phase) * 0.18;
        b.mesh.scale.y = scale;
      });

      // Dynamic light pulse
      cyanLight.intensity = 1.8 + Math.sin(elapsed * 3) * 0.7;

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
    <div className="relative w-full h-[470px] sm:h-[520px] flex items-center justify-center">
      {/* Interactive Hint Pill with glowing pulse */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full glass-panel text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 pointer-events-none shadow-lg border border-emerald-500/30">
        <MousePointerClick className="w-4 h-4 text-emerald-400 animate-bounce" />
        <span>Hover to tilt in 3D • Click card for impulse spin</span>
      </div>

      {/* Floating Micro-Widget 1: Top Left Savings Badge with gentle hover glow */}
      <div className="absolute top-12 left-2 sm:left-4 z-20 glass-panel rounded-2xl p-4 shadow-2xl border border-emerald-500/35 animate-float-slow pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Saved</p>
            <p className="font-mono font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
              +{formatMoney(3840000)}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Micro-Widget 2: Bottom Right Budget Health */}
      <div className="absolute bottom-8 right-2 sm:right-4 z-20 glass-panel rounded-2xl p-4 shadow-2xl border border-indigo-500/35 animate-float-delayed pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/35">
            <Coffee className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dining & Coffee</p>
              <span className="text-[11px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400">84% Optimal</span>
            </div>
            <div className="w-32 h-2.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden mt-2 p-0.5 shadow-inner">
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
