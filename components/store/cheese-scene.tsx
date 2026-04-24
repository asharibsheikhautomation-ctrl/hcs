"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { cn } from "@/lib/utils";

interface CheeseSceneProps {
  className?: string;
}

export function CheeseScene({ className }: CheeseSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isMobileViewport } = useMotionPreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.5, 5.4);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileViewport ? 1.4 : 2));

    const root = new THREE.Group();
    scene.add(root);

    const cheeseCluster = new THREE.Group();
    root.add(cheeseCluster);
    cheeseCluster.position.set(0.2, 0.05, 0);

    const warmMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#f5c21f"),
      emissive: new THREE.Color("#7c4d00"),
      emissiveIntensity: 0.14,
      roughness: 0.36,
      metalness: 0.02,
      clearcoat: 0.72,
      clearcoatRoughness: 0.26,
    });

    const softMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffe17a"),
      emissive: new THREE.Color("#7f5c00"),
      emissiveIntensity: 0.1,
      roughness: 0.42,
      metalness: 0,
      clearcoat: 0.48,
      clearcoatRoughness: 0.32,
    });

    const holeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f4d659"),
      roughness: 1,
      metalness: 0,
    });

    const cheeseBlock = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 1.3, 1.18, 7, 7, 7),
      warmMaterial,
    );
    cheeseBlock.castShadow = false;
    cheeseBlock.receiveShadow = false;
    cheeseBlock.rotation.set(-0.2, 0.58, -0.05);
    cheeseCluster.add(cheeseBlock);

    const cheeseWedge = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.82, 0.9, 5, 5, 5),
      softMaterial,
    );
    cheeseWedge.position.set(-1.42, -0.16, -0.5);
    cheeseWedge.rotation.set(0.12, -0.62, 0.18);
    root.add(cheeseWedge);

    const holePlacements = [
      [0.55, 0.2, 0.56, 0.16],
      [-0.12, -0.18, 0.56, 0.12],
      [-0.58, 0.26, 0.54, 0.18],
      [0.25, -0.34, 0.52, 0.13],
      [-0.85, -0.05, 0.48, 0.1],
      [-1.48, -0.1, -0.06, 0.11],
      [-1.26, 0.14, 0.14, 0.08],
    ] as const;

    for (const [x, y, z, size] of holePlacements) {
      const hole = new THREE.Mesh(
        new THREE.SphereGeometry(size, 24, 24),
        holeMaterial,
      );
      hole.position.set(x, y, z);
      hole.scale.set(1, 0.74, 0.92);
      root.add(hole);
    }

    const dripGroups: THREE.Group[] = [];
    const dripMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffd74d"),
      emissive: new THREE.Color("#845300"),
      emissiveIntensity: 0.08,
      roughness: 0.46,
      metalness: 0,
      clearcoat: 0.36,
      clearcoatRoughness: 0.32,
    });

    const dripOffsets = [-0.5, 0.02, 0.58] as const;
    dripOffsets.forEach((offset, index) => {
      const group = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.1, 0.64 + index * 0.08, 18),
        dripMaterial,
      );
      stem.position.y = -0.34;
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.14 + index * 0.01, 20, 20),
        dripMaterial,
      );
      bulb.position.set(0, -0.71 - index * 0.05, 0);
      bulb.scale.set(1, 1.16, 1);
      group.position.set(offset, -0.48, 0.48);
      group.add(stem, bulb);
      cheeseCluster.add(group);
      dripGroups.push(group);
    });

    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.7, -0.18, 0.24),
      new THREE.Vector3(1.34, -0.42, 0.1),
      new THREE.Vector3(1.48, -0.86, -0.18),
      new THREE.Vector3(1.12, -1.24, -0.34),
    ]);
    const ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(ribbonCurve, 90, 0.08, 18, false),
      dripMaterial,
    );
    ribbon.rotation.z = 0.16;
    cheeseCluster.add(ribbon);

    const sparkleGroup = new THREE.Group();
    root.add(sparkleGroup);
    const sparkleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#fff5cc"),
      transparent: true,
      opacity: 0.72,
    });

    for (let index = 0; index < 6; index += 1) {
      const sparkle = new THREE.Mesh(
        new THREE.SphereGeometry(0.045 + index * 0.008, 12, 12),
        sparkleMaterial,
      );
      sparkle.position.set(
        Math.cos(index * 1.18) * 1.6,
        0.8 + Math.sin(index) * 0.56,
        Math.sin(index * 1.18) * 0.72,
      );
      sparkleGroup.add(sparkle);
    }

    const ambientLight = new THREE.AmbientLight("#fff5dd", 1.7);
    const keyLight = new THREE.DirectionalLight("#fff1b3", 2.4);
    keyLight.position.set(4.5, 4.2, 5.8);
    const fillLight = new THREE.DirectionalLight("#d7ecff", 1.2);
    fillLight.position.set(-5.2, 2.4, 3.4);
    const rimLight = new THREE.PointLight("#f6dd7d", 2.6, 12);
    rimLight.position.set(0, -0.4, 2.2);
    scene.add(ambientLight, keyLight, fillLight, rimLight);

    const pointer = { x: 0, y: 0 };
    let scrollProgress = 0;
    let frameId = 0;

    const resizeScene = () => {
      const bounds = container.getBoundingClientRect();
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, isMobileViewport ? 1.4 : 2),
      );
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const normalizedX = (event.clientX - bounds.left) / bounds.width;
      const normalizedY = (event.clientY - bounds.top) / bounds.height;
      pointer.x = normalizedX * 2 - 1;
      pointer.y = normalizedY * 2 - 1;
    };

    const handlePointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    const handleScroll = () => {
      const bounds = container.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const rawProgress = 1 - (bounds.top + bounds.height * 0.18) / (viewport * 1.12);
      scrollProgress = THREE.MathUtils.clamp(rawProgress, 0, 1);
    };

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const drift = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.75) * 0.06;
      const targetRotationY = 0.26 + pointer.x * 0.38 + scrollProgress * 0.22;
      const targetRotationX = -0.16 + pointer.y * -0.16 + scrollProgress * 0.08;
      const targetPositionY = 0.18 - scrollProgress * 0.72 + drift;

      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, targetRotationY, 0.06);
      root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, targetRotationX, 0.06);
      root.position.y = THREE.MathUtils.lerp(root.position.y, targetPositionY, 0.08);
      root.position.x = THREE.MathUtils.lerp(root.position.x, pointer.x * 0.14, 0.06);

      cheeseBlock.rotation.z = -0.05 + Math.sin(elapsed * 0.9) * 0.02;
      cheeseWedge.rotation.z = 0.18 + Math.sin(elapsed * 1.1 + 0.6) * 0.03;
      ribbon.rotation.y = 0.1 + Math.sin(elapsed * 1.2) * 0.18;

      dripGroups.forEach((group, index) => {
        const sway = prefersReducedMotion
          ? 1
          : 1 + Math.sin(elapsed * 1.2 + index * 0.7) * 0.06;
        group.scale.y = sway;
        group.rotation.z = Math.sin(elapsed * 0.8 + index * 0.45) * 0.04;
      });

      sparkleGroup.children.forEach((sparkle, index) => {
        sparkle.position.y += Math.sin(elapsed * 1.1 + index) * 0.0009;
        sparkle.scale.setScalar(
          0.9 + Math.sin(elapsed * 1.8 + index * 0.9) * 0.08,
        );
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resizeScene();
    handleScroll();
    animate();

    const resizeObserver = new ResizeObserver(resizeScene);
    resizeObserver.observe(container);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);

      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, [isMobileViewport, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]",
        className,
      )}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
