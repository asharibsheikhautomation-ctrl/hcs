"use client";

import type { ReactNode } from "react";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { useGsapReveal } from "@/components/motion/use-gsap-reveal";

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  amount?: number;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  distance?: number;
  blur?: number;
}

export function StaggerGroup({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  once = true,
  amount = 0.15,
}: StaggerGroupProps) {
  const { prefersReducedMotion } = useMotionPreferences();
  const ref = useGsapReveal<HTMLDivElement>({
    delay,
    once,
    amount,
    stagger,
    selector: "[data-stagger-item]",
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

export function StaggerItem(props: StaggerItemProps) {
  const {
    children,
    className,
    distance = 20,
  } = props;
  const { prefersReducedMotion } = useMotionPreferences();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={className}
      data-stagger-item
      data-reveal-distance={distance}
    >
      {children}
    </div>
  );
}
