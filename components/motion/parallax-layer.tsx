"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";
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
  const { prefersReducedMotion, isMobileViewport } = useMotionPreferences();
  const progress = useMotionValue(0.5);

  const direction = speed > 0 ? 1 : -1;
  const absSpeed = Math.abs(speed);

  const movement = useTransform(progress, [0, 1], [absSpeed * 8 * direction, -absSpeed * 8 * direction]);
  const rotateX = useTransform(progress, [0, 1], [absSpeed * 0.4 * direction, -absSpeed * 0.4 * direction]);
  const rotateY = useTransform(progress, [0, 1], [-absSpeed * 0.2 * direction, absSpeed * 0.2 * direction]);

  if (prefersReducedMotion || (disabledOnMobile && isMobileViewport)) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("perspective-wrapper [perspective:1000px]", className)} {...props}>
      <motion.div
        className="transform-gpu will-change-transform [transform-style:preserve-3d]"
        style={{
          ...(axis === "y" ? { y: movement } : { x: movement }),
          rotateX: axis === "y" ? rotateX : 0,
          rotateY: axis === "y" ? rotateY : rotateX,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
