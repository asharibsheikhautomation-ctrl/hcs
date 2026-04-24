"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import {
  MOTION_EASE,
  getRevealStart,
  REVEAL_DISTANCE,
  REVEAL_DURATION,
  REVEAL_STAGGER,
} from "@/components/motion/motion-tokens";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

interface UseGsapRevealOptions {
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  stagger?: number;
  selector?: string;
}

function getDistanceFromElement(element: HTMLElement, fallback: number) {
  const raw = element.dataset.revealDistance;
  const parsed = raw ? Number.parseFloat(raw) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function useGsapReveal<T extends HTMLElement>({
  delay = 0,
  distance = REVEAL_DISTANCE,
  duration = REVEAL_DURATION,
  once = true,
  amount = 0.2,
  stagger = REVEAL_STAGGER,
  selector,
}: UseGsapRevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const { prefersSimplifiedMotion } = useMotionPreferences();

  useIsomorphicLayoutEffect(() => {
    const target = ref.current;

    if (!target || prefersSimplifiedMotion) {
      return;
    }

    const elements = selector
      ? Array.from(target.querySelectorAll<HTMLElement>(selector))
      : [target];

    if (elements.length === 0) {
      return;
    }

    const context = gsap.context(() => {
      gsap.set(elements, {
        opacity: 0,
        y: (_, element) =>
          getDistanceFromElement(element as HTMLElement, distance),
        willChange: "transform, opacity",
      });

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: MOTION_EASE,
        stagger: elements.length > 1 ? stagger : 0,
        overwrite: "auto",
        clearProps: "willChange",
        scrollTrigger: {
          trigger: target,
          start: getRevealStart(amount),
          once,
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    }, target);

    return () => {
      context.revert();
    };
  }, [
    amount,
    delay,
    distance,
    duration,
    once,
    prefersSimplifiedMotion,
    selector,
    stagger,
  ]);

  return ref;
}
