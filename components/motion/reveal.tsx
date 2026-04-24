"use client";

import type { ReactNode } from "react";
import { FadeUp } from "@/components/motion/fade-up";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: RevealProps) {
  return (
    <FadeUp className={className} delay={delay} distance={y} blur={8}>
      {children}
    </FadeUp>
  );
}
