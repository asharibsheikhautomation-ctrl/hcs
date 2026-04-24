"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRef } from "react";
import { CheeseScene } from "@/components/store/cheese-scene";
import { ProductFeatureStrip } from "@/components/store/product-feature-strip";
import { ProductVisual } from "@/components/store/product-visual";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/commerce";

interface HeroProductStackProps {
  leadProduct: Product | null;
  supportProducts: Product[];
}

const supportCardShellClasses = [
  "bottom-[12%] left-[5%] z-10 hidden w-56 md:block [transform:translateZ(72px)]",
  "bottom-[6%] right-[7%] z-10 hidden w-52 md:block [transform:translateZ(86px)]",
  "left-[3%] top-[41%] z-0 hidden w-48 lg:block [transform:translateZ(52px)]",
] as const;

export function HeroProductStack({
  leadProduct,
  supportProducts,
}: HeroProductStackProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, prefersSimplifiedMotion } =
    useMotionPreferences();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.2,
  });

  const leadX = useTransform(
    progress,
    [0, 1],
    prefersSimplifiedMotion ? [0, 14] : [-20, 34],
  );
  const leadY = useTransform(
    progress,
    [0, 1],
    prefersSimplifiedMotion ? [0, 26] : [-18, 72],
  );
  const leadRotateX = useTransform(
    progress,
    [0, 1],
    prefersSimplifiedMotion ? [0, 0] : [15, -6],
  );
  const leadRotateY = useTransform(
    progress,
    [0, 1],
    prefersSimplifiedMotion ? [0, 0] : [-14, 12],
  );
  const leadRotateZ = useTransform(
    progress,
    [0, 1],
    prefersSimplifiedMotion ? [0, 0] : [-6, 8],
  );
  const leadScale = useTransform(
    progress,
    [0, 1],
    prefersSimplifiedMotion ? [1, 0.98] : [1.05, 0.92],
  );

  const supportOneX = useTransform(progress, [0, 1], [0, -42]);
  const supportOneY = useTransform(progress, [0, 1], [0, 18]);
  const supportOneRotate = useTransform(progress, [0, 1], [-12, 3]);
  const supportOneScale = useTransform(progress, [0, 1], [0.94, 1.02]);

  const supportTwoX = useTransform(progress, [0, 1], [0, 34]);
  const supportTwoY = useTransform(progress, [0, 1], [0, 46]);
  const supportTwoRotate = useTransform(progress, [0, 1], [12, -4]);
  const supportTwoScale = useTransform(progress, [0, 1], [0.98, 0.93]);

  const supportThreeX = useTransform(progress, [0, 1], [0, -26]);
  const supportThreeY = useTransform(progress, [0, 1], [0, -34]);
  const supportThreeRotate = useTransform(progress, [0, 1], [-14, 2]);
  const supportThreeScale = useTransform(progress, [0, 1], [0.9, 1]);

  const plateLeftX = useTransform(progress, [0, 1], [0, -54]);
  const plateLeftY = useTransform(progress, [0, 1], [0, 22]);
  const plateLeftRotate = useTransform(progress, [0, 1], [-16, -5]);
  const plateRightX = useTransform(progress, [0, 1], [0, 40]);
  const plateRightY = useTransform(progress, [0, 1], [0, -28]);
  const plateRightRotate = useTransform(progress, [0, 1], [12, 4]);
  const orbScale = useTransform(progress, [0, 1], [1.1, 0.92]);
  const orbOpacity = useTransform(progress, [0, 1], [0.75, 0.38]);
  const shadowScale = useTransform(progress, [0, 1], [0.8, 1.18]);
  const shadowOpacity = useTransform(progress, [0, 1], [0.16, 0.28]);

  const supportMotion = [
    {
      x: supportOneX,
      y: supportOneY,
      rotateZ: supportOneRotate,
      scale: supportOneScale,
      float: prefersReducedMotion
        ? undefined
        : {
            y: [0, -10, 0],
            rotateZ: [-1, 1.5, -1],
          },
    },
    {
      x: supportTwoX,
      y: supportTwoY,
      rotateZ: supportTwoRotate,
      scale: supportTwoScale,
      float: prefersReducedMotion
        ? undefined
        : {
            y: [0, -14, 0],
            rotateZ: [1.5, -1.5, 1.5],
          },
    },
    {
      x: supportThreeX,
      y: supportThreeY,
      rotateZ: supportThreeRotate,
      scale: supportThreeScale,
      float: prefersReducedMotion
        ? undefined
        : {
            y: [0, -8, 0],
            rotateZ: [-1.5, 1, -1.5],
          },
    },
  ] as const;

  return (
    <div
      ref={ref}
      className="relative flex min-h-[16.5rem] items-center justify-center depth-stack [perspective:1900px] sm:min-h-[24rem] lg:min-h-[42rem]"
    >
      <div className="relative h-full w-full max-w-[44rem] overflow-hidden rounded-[2.8rem]">
        <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_32%_16%,rgba(246,221,125,0.24),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.55),transparent_20%),radial-gradient(circle_at_72%_78%,rgba(246,221,125,0.18),transparent_34%)]" />
        <CheeseScene className="opacity-[0.92]" />

        <motion.div
          aria-hidden="true"
          className="absolute left-[4%] top-[8%] hidden h-40 w-40 rounded-[2.5rem] bg-[radial-gradient(circle,rgba(246,221,125,0.65),rgba(246,221,125,0)_72%)] blur-2xl sm:block"
          style={{
            scale: orbScale,
            opacity: orbOpacity,
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-[2%] top-[6%] hidden h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(189,223,255,0.44),rgba(189,223,255,0)_70%)] blur-3xl sm:block"
          style={{
            scale: orbScale,
            opacity: orbOpacity,
          }}
        />

        <div className="absolute left-[9%] top-[14%] hidden [transform:translateZ(36px)] sm:block">
          <motion.div
            aria-hidden="true"
            className="h-36 w-40 rounded-[2.2rem] border border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.76),rgba(246,221,125,0.34))] shadow-[0_24px_70px_rgba(216,170,24,0.14)] backdrop-blur-2xl"
            style={{
              x: plateLeftX,
              y: plateLeftY,
              rotateZ: plateLeftRotate,
            }}
          />
        </div>

        <div className="absolute right-[4%] top-[8%] hidden [transform:translateZ(22px)] sm:block">
          <motion.div
            aria-hidden="true"
            className="relative h-56 w-44 rounded-[2.5rem] border border-white/75 bg-[linear-gradient(145deg,rgba(225,242,255,0.92),rgba(255,255,255,0.75))] shadow-[0_24px_72px_rgba(93,127,152,0.18)] backdrop-blur-2xl"
            style={{
              x: plateRightX,
              y: plateRightY,
              rotateZ: plateRightRotate,
            }}
          >
            <div className="absolute inset-5 rounded-[1.7rem] border border-white/70 bg-white/30" />
            <div className="absolute bottom-6 left-6 right-6 rounded-[1.4rem] bg-white/75 px-4 py-3 text-sm font-semibold text-mist-500 shadow-[0_18px_38px_rgba(93,127,152,0.16)]">
              Frozen selection
            </div>
          </motion.div>
        </div>

        {leadProduct ? (
          <div className="absolute left-[2%] right-[2%] top-[8%] z-20 [transform:translateZ(110px)] sm:left-[10%] sm:right-[12%] sm:top-[16%]">
            <motion.div
              style={{
                x: leadX,
                y: leadY,
                rotateX: leadRotateX,
                rotateY: leadRotateY,
                rotateZ: leadRotateZ,
                scale: leadScale,
                transformStyle: "preserve-3d",
              }}
            >
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, -12, 0],
                        rotateZ: [0, 1.1, 0],
                      }
                }
                transition={{
                  duration: 7.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="cheese-melt-card relative rounded-[2rem] border border-white/75 bg-white/58 p-3 shadow-[0_30px_90px_rgba(17,17,17,0.14)] backdrop-blur-2xl sm:rounded-[2.3rem] sm:p-4 sm:shadow-[0_36px_100px_rgba(17,17,17,0.14)]"
              >
                <div className="absolute inset-x-[8%] top-4 h-12 rounded-full bg-white/55 blur-2xl" />
                <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.56),transparent_42%,rgba(246,221,125,0.16))]" />

                <div className="relative">
                  <ProductVisual
                    product={leadProduct}
                    priority
                    sizes="(min-width: 1280px) 34vw, (min-width: 1024px) 44vw, 92vw"
                    quality={75}
                    className="card-hover-image min-h-[11.5rem] rounded-[1.7rem] sm:min-h-[21rem] sm:rounded-[2rem] lg:min-h-[25rem]"
                  />

                  <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between sm:inset-x-5 sm:top-5">
                    <span className="rounded-full border border-white/70 bg-white/82 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-cheese-500 shadow-[0_14px_34px_rgba(216,170,24,0.14)] sm:text-[0.68rem]">
                      Signature product
                    </span>
                    <span className="rounded-full bg-ink-950 px-3 py-2 text-xs font-semibold text-white shadow-[0_16px_30px_rgba(17,17,17,0.16)] sm:px-4">
                      {formatCurrency(leadProduct.price)}
                    </span>
                  </div>
                </div>

                <div className="relative mt-3 flex flex-col gap-3 px-1 pb-1 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:px-2 sm:pb-2">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-ink-700/52">
                      <Sparkles className="h-3.5 w-3.5 text-cheese-500" />
                      Premium Shelf
                    </p>
                    <p className="mt-2 text-[1.75rem] font-semibold leading-[0.96] text-ink-950 sm:text-3xl">
                      {leadProduct.name}
                    </p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-ink-700/66 sm:text-[0.92rem]">
                      {leadProduct.shortDescription}
                    </p>
                  </div>
                </div>

                <ProductFeatureStrip
                  product={leadProduct}
                  compact
                  className="relative px-1 pb-2 sm:px-2"
                />
              </motion.div>
            </motion.div>
          </div>
        ) : null}

        {supportProducts.slice(0, 3).map((product, index) => {
          const motionConfig = supportMotion[index];

          if (!motionConfig) {
            return null;
          }

          return (
            <div
              key={product.id}
              className={cn(
                "cheese-melt-card absolute rounded-[1.8rem] border border-white/72 bg-white/72 p-3 shadow-[0_24px_80px_rgba(17,17,17,0.1)] backdrop-blur-2xl",
                supportCardShellClasses[index],
              )}
            >
              <motion.div
                style={{
                  x: prefersSimplifiedMotion ? 0 : motionConfig.x,
                  y: prefersSimplifiedMotion ? 0 : motionConfig.y,
                  rotateZ: prefersSimplifiedMotion ? 0 : motionConfig.rotateZ,
                  scale: prefersSimplifiedMotion ? 1 : motionConfig.scale,
                  transformStyle: "preserve-3d",
                }}
              >
                <motion.div
                  animate={motionConfig.float}
                  transition={{
                    duration: 6.2 + index,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <ProductVisual
                    product={product}
                    sizes="(min-width: 1280px) 18vw, (min-width: 768px) 22vw, 100vw"
                    className="min-h-[10rem] rounded-[1.35rem]"
                    variant={index + 1}
                  />
                  <div className="px-1 pb-1 pt-3">
                    <p className="text-sm font-semibold text-ink-950">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-ink-700/55">
                      {product.categoryName}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          );
        })}

        <div className="absolute inset-x-[14%] bottom-[4%] hidden [transform:translateZ(0)] sm:block">
          <motion.div
            aria-hidden="true"
            className="h-12 rounded-full bg-black/10 blur-3xl"
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
