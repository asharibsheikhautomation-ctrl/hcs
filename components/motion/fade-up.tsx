"use client";

import type { ReactNode } from "react";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { useGsapReveal } from "@/components/motion/use-gsap-reveal";

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  blur?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

export function FadeUp(props: FadeUpProps) {
  const {
    children,
    className,
    delay = 0,
    distance = 24,
    duration = 0.72,
    once = true,
    amount = 0.2,
  } = props;
  const { prefersReducedMotion } = useMotionPreferences();
  const ref = useGsapReveal<HTMLDivElement>({
    delay,
    distance,
    duration,
    once,
    amount,
  });

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
    >
      {children}
    </div>
  );
}
