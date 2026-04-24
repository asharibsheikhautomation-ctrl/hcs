"use client";

import type { ReactNode } from "react";
import { FadeUp } from "@/components/motion/fade-up";

interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function SectionTransition({
  children,
  className,
  delay = 0,
  once = true,
}: SectionTransitionProps) {
  return (
    <FadeUp
      className={className}
      delay={delay}
      distance={32}
      blur={4}
      duration={0.8}
      once={once}
      amount={0.14}
    >
      {children}
    </FadeUp>
  );
}
