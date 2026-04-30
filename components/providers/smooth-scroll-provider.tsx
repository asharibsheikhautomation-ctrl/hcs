"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const { prefersReducedMotion } = useMotionPreferences();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    document.documentElement.classList.add("silky-scroll");

    return () => {
      document.documentElement.classList.remove("silky-scroll");
    };
  }, [prefersReducedMotion]);

  return <>{children}</>;
}
