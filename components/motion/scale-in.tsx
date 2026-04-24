"use client";

import type { ReactNode } from "react";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { useGsapReveal } from "@/components/motion/use-gsap-reveal";

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  scale?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  scale = 0.96,
  duration = 0.68,
  once = true,
  amount = 0.2,
}: ScaleInProps) {
  const { prefersReducedMotion } = useMotionPreferences();
  const ref = useGsapReveal<HTMLDivElement>({
    delay,
    distance: Math.round((1 - scale) * 100) || 18,
    duration,
    once,
    amount,
  });

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
