"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { MOTION_EASE } from "@/components/motion/motion-tokens";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  preset: "store" | "admin";
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PageTransition({
  children,
  className,
  preset,
}: PageTransitionProps) {
  const { prefersReducedMotion } = useMotionPreferences();
  const isStorePreset = preset === "store";
  const ref = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const target = ref.current;

    if (!target || prefersReducedMotion) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        target,
        {
          opacity: 0,
          y: isStorePreset ? 16 : 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: isStorePreset ? 0.42 : 0.28,
          ease: MOTION_EASE,
          clearProps: "opacity,transform",
        },
      );
    }, target);

    return () => {
      context.revert();
    };
  }, [isStorePreset, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return <div ref={ref} className={className}>{children}</div>;
}
