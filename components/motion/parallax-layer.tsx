"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type HTMLAttributes, type ReactNode } from "react";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { cn } from "@/lib/utils";

interface ParallaxLayerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  speed?: number;
  axis?: "x" | "y";
  disabledOnMobile?: boolean;
}

export function ParallaxLayer({
  children,
  className,
  speed = 10,
  axis = "y",
  disabledOnMobile = false,
  ...props
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useMotionPreferences();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 1.2,
  });

  const direction = speed > 0 ? 1 : -1;
  const absSpeed = Math.abs(speed);
  
  // Create a realistic 3D feel by adding rotation alongside movement
  const movement = useTransform(progress, [0, 1], [absSpeed * 8 * direction, -absSpeed * 8 * direction]);
  const rotateX = useTransform(progress, [0, 1], [absSpeed * 0.4 * direction, -absSpeed * 0.4 * direction]);
  const rotateY = useTransform(progress, [0, 1], [-absSpeed * 0.2 * direction, absSpeed * 0.2 * direction]);

  if (prefersReducedMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("perspective-wrapper [perspective:1000px]", className)} {...props}>
      <motion.div
        className="transform-gpu will-change-transform [transform-style:preserve-3d]"
        style={{
          ...(axis === "y" ? { y: movement } : { x: movement }),
          rotateX: axis === "y" ? rotateX : 0,
          rotateY: axis === "y" ? rotateY : rotateX, // Give X axis a bit of rotation too
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
