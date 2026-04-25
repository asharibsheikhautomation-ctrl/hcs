"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import type { Product } from "@/types/commerce";

interface HeroProductStackProps {
  leadProduct: Product | null;
  supportProducts: Product[];
}

export function HeroProductStack({
  leadProduct: _leadProduct,
  supportProducts: _supportProducts,
}: HeroProductStackProps) {
  void _leadProduct;
  void _supportProducts;

  const { prefersReducedMotion, prefersSimplifiedMotion } =
    useMotionPreferences();
  const progress = useMotionValue(0.5);

  const cheeseX = useTransform(progress, [0, 1], [-18, 24]);
  const cheeseY = useTransform(progress, [0, 1], [-54, -24]);
  const cheeseRotateZ = useTransform(progress, [0, 1], [-7, 6]);
  const cheeseRotateX = useTransform(progress, [0, 1], [9, -5]);
  const cheeseRotateY = useTransform(progress, [0, 1], [-10, 11]);
  const cheeseScale = useTransform(
    progress,
    [0, 1],
    prefersSimplifiedMotion ? [1, 1] : [0.98, 1.05],
  );
  const orbScale = useTransform(progress, [0, 1], [1.06, 0.92]);
  const orbOpacity = useTransform(progress, [0, 1], [0.7, 0.34]);
  const shadowScale = useTransform(progress, [0, 1], [0.82, 1.14]);
  const shadowOpacity = useTransform(progress, [0, 1], [0.14, 0.28]);

  return (
    <div className="relative flex min-h-[16.5rem] items-center justify-center depth-stack sm:min-h-[24rem] lg:min-h-[42rem]">
      <div className="relative h-full w-full max-w-[44rem] overflow-visible">
        <div className="pointer-events-none absolute inset-x-[8%] top-[12%] bottom-[18%] rounded-[50%] bg-[radial-gradient(circle,rgba(255,255,255,0.98),rgba(255,246,208,0.78)_36%,rgba(44,34,12,0.34)_72%,transparent_100%)] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-[14%] top-[22%] bottom-[12%] rounded-[50%] bg-[radial-gradient(circle,rgba(17,17,17,0.28),rgba(17,17,17,0.06)_54%,transparent_80%)] blur-3xl" />

        <motion.div
          aria-hidden="true"
          className="absolute left-[6%] top-[12%] hidden h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(246,221,125,0.62),rgba(246,221,125,0)_72%)] blur-3xl sm:block"
          style={{ scale: orbScale, opacity: orbOpacity }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-[12%] right-[8%] hidden h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,218,79,0.42),rgba(255,218,79,0)_72%)] blur-3xl sm:block"
          style={{ scale: orbScale, opacity: orbOpacity }}
        />

        <div className="absolute inset-x-[2%] top-[-8%] z-20 sm:inset-x-[6%] sm:top-[-6%]">
          <motion.div
            style={{
              x: prefersSimplifiedMotion ? 0 : cheeseX,
              y: prefersSimplifiedMotion ? 0 : cheeseY,
              rotateX: prefersSimplifiedMotion ? 0 : cheeseRotateX,
              rotateY: prefersSimplifiedMotion ? 0 : cheeseRotateY,
              rotateZ: prefersSimplifiedMotion ? 0 : cheeseRotateZ,
              scale: cheeseScale,
              transformStyle: "preserve-3d",
            }}
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -18, 0],
                      rotateZ: [0, 1.6, 0],
                      rotateY: [0, -2.5, 0, 2.5, 0],
                      scale: [1, 1.02, 1],
                    }
              }
              transition={{
                duration: 6.6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="relative mx-auto w-full max-w-[30rem] sm:max-w-[33rem]"
            >
              <div className="pointer-events-none absolute inset-0 scale-[1.12] rounded-full bg-[radial-gradient(circle,rgba(246,221,125,0.48),rgba(246,221,125,0)_68%)] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-[10%] bottom-[8%] h-10 rounded-full bg-black/28 blur-3xl" />

              <div className="relative mx-auto aspect-square w-full max-w-[30rem] overflow-visible">
                <Image
                  src="/cheese.png"
                  alt="3D cheese visual"
                  width={900}
                  height={900}
                  priority
                  className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-[1.16] object-contain opacity-[0.16] blur-[6px]"
                  sizes="(min-width: 1280px) 38vw, (min-width: 1024px) 42vw, 88vw"
                />
                <Image
                  src="/cheese.png"
                  alt="3D cheese visual"
                  width={900}
                  height={900}
                  priority
                  className="pointer-events-none relative z-10 h-auto w-full scale-[1.1] object-contain saturate-[1.22] contrast-[1.16] brightness-[1.02] drop-shadow-[0_56px_88px_rgba(17,17,17,0.34)]"
                  sizes="(min-width: 1280px) 38vw, (min-width: 1024px) 42vw, 88vw"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-[18%] bottom-[9%] hidden sm:block">
          <motion.div
            aria-hidden="true"
            className="h-14 rounded-full bg-black/16 blur-3xl"
            style={{
              scaleX: shadowScale,
              opacity: shadowOpacity,
            }}
          />
        </div>
      </div>
    </div>
  );
}
