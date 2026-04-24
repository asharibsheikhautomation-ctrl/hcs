"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { cn } from "@/lib/utils";

type CardTone = "gold" | "frost" | "neutral";
type CardDirection = "left" | "right" | "center";

interface CinematicScrollCardProps {
  children: ReactNode;
  className?: string;
  tone?: CardTone;
  direction?: CardDirection;
  intensity?: number;
  as?: "div" | "article";
}

const toneGlowClassNames: Record<CardTone, string> = {
  gold:
    "bg-[radial-gradient(circle_at_30%_18%,rgba(246,221,125,0.34),transparent_42%),radial-gradient(circle_at_85%_84%,rgba(255,255,255,0.52),transparent_30%)]",
  frost:
    "bg-[radial-gradient(circle_at_26%_18%,rgba(189,223,255,0.36),transparent_42%),radial-gradient(circle_at_82%_86%,rgba(255,255,255,0.5),transparent_30%)]",
  neutral:
    "bg-[radial-gradient(circle_at_24%_16%,rgba(255,255,255,0.44),transparent_38%),radial-gradient(circle_at_82%_86%,rgba(17,17,17,0.04),transparent_30%)]",
};

const directionConfig: Record<
  CardDirection,
  {
    x: [number, number];
    rotateZ: [number, number];
    rotateX: [number, number];
    rotateY: [number, number];
    z: [number, number];
  }
> = {
  left: {
    x: [-18, 12],
    rotateZ: [-3, 1.5],
    rotateX: [12, -8],
    rotateY: [-15, 8],
    z: [-100, 40],
  },
  right: {
    x: [18, -12],
    rotateZ: [3, -1.5],
    rotateX: [12, -8],
    rotateY: [15, -8],
    z: [-100, 40],
  },
  center: {
    x: [0, 0],
    rotateZ: [-1.5, 0.8],
    rotateX: [15, -10],
    rotateY: [0, 0],
    z: [-120, 50],
  },
};

export function CinematicScrollCard({
  children,
  className,
  tone = "neutral",
  direction = "center",
  intensity = 1,
  as = "div",
}: CinematicScrollCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, prefersSimplifiedMotion } =
    useMotionPreferences();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 96%", "end 12%"],
  });
  
  // Extra smooth spring for the cinematic 3D feel
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 1.2,
  });

  const depthFactor = prefersSimplifiedMotion ? 0.2 : 1;
  
  const x = useTransform(
    progress,
    [0, 1],
    directionConfig[direction].x.map((value) => value * depthFactor * intensity),
  );
  const y = useTransform(
    progress,
    [0, 1],
    [50 * depthFactor * intensity, -30 * depthFactor * intensity],
  );
  const z = useTransform(
    progress,
    [0, 1],
    directionConfig[direction].z.map((value) => value * depthFactor * intensity),
  );
  const rotateZ = useTransform(
    progress,
    [0, 1],
    directionConfig[direction].rotateZ.map(
      (value) => value * depthFactor * intensity,
    ),
  );
  const rotateX = useTransform(
    progress,
    [0, 1],
    directionConfig[direction].rotateX.map(
      (value) => value * depthFactor * intensity,
    ),
  );
  const rotateY = useTransform(
    progress,
    [0, 1],
    directionConfig[direction].rotateY.map(
      (value) => value * depthFactor * intensity,
    ),
  );
  const scale = useTransform(
    progress,
    [0, 0.45, 1],
    prefersSimplifiedMotion ? [1, 1, 1] : [0.94, 1.02, 0.98],
  );
  
  // Dynamic sheens based on 3D rotation
  const sheenX = useTransform(
    progress,
    [0, 1],
    prefersSimplifiedMotion ? [-20, 20] : [-120, 160],
  );
  const sheenOpacity = useTransform(
    progress,
    [0, 0.3, 0.7, 1],
    [0.08, 0.42, 0.28, 0.05],
  );
  const glowScale = useTransform(progress, [0, 1], [0.92, 1.08]);
  const glowOpacity = useTransform(progress, [0, 1], [0.4, 0.9]);
  const shadowScale = useTransform(progress, [0, 1], [0.75, 1.25]);
  const shadowOpacity = useTransform(
    progress,
    [0, 0.5, 1],
    prefersSimplifiedMotion ? [0.08, 0.12, 0.1] : [0.05, 0.28, 0.12],
  );

  const MotionTag = as === "article" ? motion.article : motion.div;

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={cn("relative", className)}>
        <div className="relative h-full">{children}</div>
      </div>
    );
  }

  return (
    <div className="perspective-wrapper [perspective:1400px] [transform-style:preserve-3d]">
      <MotionTag
        ref={ref}
        className={cn("relative transform-gpu will-change-transform [transform-style:preserve-3d]", className)}
        style={{
          x,
          y,
          z,
          rotateX,
          rotateY,
          rotateZ,
          scale,
        }}
      >
        <motion.div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] [transform:translateZ(-1px)]",
            toneGlowClassNames[tone],
          )}
          style={{
            scale: glowScale,
            opacity: glowOpacity,
          }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[12%] left-[-28%] h-[145%] w-[44%] rounded-full bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.65),transparent)] blur-2xl [transform:translateZ(10px)]"
          style={{
            x: sheenX,
            opacity: sheenOpacity,
          }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[14%] bottom-[-16%] h-16 rounded-full bg-black/15 blur-3xl [transform:translateZ(-20px)]"
          style={{
            scaleX: shadowScale,
            opacity: shadowOpacity,
          }}
        />
        <div className="relative h-full [transform:translateZ(20px)] [transform-style:preserve-3d]">{children}</div>
      </MotionTag>
    </div>
  );
}
