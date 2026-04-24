"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import type { LenisOptions, VirtualScrollData } from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef | null>(null);
  const { prefersReducedMotion } = useMotionPreferences();
  const shouldUseLenis = !prefersReducedMotion;

  const lenisOptions = useMemo<LenisOptions>(
    () => ({
      anchors: true,
      autoResize: true,
      lerp: 0.06, // Ultra smooth 100% level
      orientation: "vertical",
      gestureOrientation: "vertical",
      overscroll: false,
      smoothWheel: true,
      syncTouch: true, // Smooth touch scrolling
      syncTouchLerp: 0.08,
      touchInertiaExponent: 0.9,
      touchMultiplier: 1.5,
      wheelMultiplier: 1.1,
      virtualScroll: (data: VirtualScrollData) => {
        // Ignore horizontal wheel deltas so touchpads cannot drag the page sideways.
        data.deltaX = 0;
        return true;
      },
    }),
    [],
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (!shouldUseLenis) {
      document.documentElement.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-scrolling",
        "lenis-stopped",
      );
      document.body.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-scrolling",
        "lenis-stopped",
      );
      return;
    }

    const lenis = lenisRef.current?.lenis;

    if (!lenis) {
      return;
    }

    const onRefresh = () => {
      lenis.resize();
    };

    const ensureLenisRunning = () => {
      lenis.start();
      document.documentElement.classList.remove("lenis-stopped");
      document.body.classList.remove("lenis-stopped");
    };

    lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.addEventListener("refresh", onRefresh);
    window.addEventListener("wheel", ensureLenisRunning, { passive: true });
    window.addEventListener("touchstart", ensureLenisRunning, {
      passive: true,
    });
    window.addEventListener("keydown", ensureLenisRunning);

    const refreshFrame = window.requestAnimationFrame(() => {
      ensureLenisRunning();
      lenis.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);

      window.removeEventListener("wheel", ensureLenisRunning);
      window.removeEventListener("touchstart", ensureLenisRunning);
      window.removeEventListener("keydown", ensureLenisRunning);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [shouldUseLenis]);

  if (!shouldUseLenis) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      ref={lenisRef}
      root
      autoRaf
      options={{
        ...lenisOptions,
      }}
    >
      {children}
    </ReactLenis>
  );
}
