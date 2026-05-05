"use client";

import Image from "next/image";
import { motion } from "framer-motion";
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

  const { prefersReducedMotion } = useMotionPreferences();

  return (
    <div className="relative flex min-h-[19rem] items-center justify-center sm:min-h-[24rem] lg:min-h-[32rem]">
      <div className="relative w-full max-w-[28rem] rounded-[2rem] border-4 border-[var(--color-accent)] bg-white p-5 shadow-[0_22px_50px_rgba(0,0,0,0.18)] sm:p-6">
        <div className="absolute -left-4 top-5 z-20 rounded-[1.65rem] border-2 border-[var(--color-accent)] bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
          <div className="absolute -bottom-2 left-2 h-14 w-14 rounded-[1.2rem] bg-[var(--color-primary)]" />
          <div className="relative h-14 w-14 overflow-hidden rounded-[1.1rem] bg-white md:h-16 md:w-16">
            <Image
              src="/logo.png"
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="absolute -right-3 bottom-8 z-20 rounded-full border-2 border-[var(--color-accent)] bg-black p-1.5 shadow-[0_14px_26px_rgba(0,0,0,0.2)]">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white md:h-14 md:w-14">
            <Image
              src="/logo.png"
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        </div>

        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, -8, 0],
                  rotate: [0, -2, 0, 2, 0],
                }
          }
          transition={{
            duration: 5.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <div className="absolute inset-x-[12%] bottom-[3%] h-10 rounded-full bg-black/18 blur-2xl" />
          <Image
            src="/cheese.png"
            alt="Cheese visual"
            width={900}
            height={900}
            priority
            className="relative z-10 mx-auto h-auto w-full max-w-[22rem] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.22)]"
            sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 36vw, 82vw"
          />
        </motion.div>
      </div>
    </div>
  );
}
