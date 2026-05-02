"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Clock3, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { useMotionPreferences } from "@/hooks/use-motion-preferences";

interface ContactHeroVisualProps {
  phone: string;
  whatsapp: string;
  hours: string;
  address: string;
}

export function ContactHeroVisual({
  phone,
  whatsapp,
  hours,
  address,
}: ContactHeroVisualProps) {
  const { prefersReducedMotion } = useMotionPreferences();

  const floatingTransition = prefersReducedMotion
    ? undefined
    : {
        duration: 7.4,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
      };

  return (
    <div className="relative mx-auto w-full max-w-[34rem]">
      <div className="relative overflow-hidden rounded-[2.4rem] border-2 border-[var(--color-accent-dark)] bg-[rgba(255,248,231,0.96)] p-5 shadow-[0_26px_80px_rgba(92,16,16,0.18)] backdrop-blur-sm sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(245,168,0,0.20),transparent_18rem),radial-gradient(circle_at_16%_86%,rgba(123,26,26,0.12),transparent_14rem)]" />

        <motion.div
          className="relative mx-auto flex min-h-[20rem] items-center justify-center rounded-[2rem] border-2 border-[var(--color-accent-dark)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))] px-6 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:min-h-[23rem]"
          animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
          transition={floatingTransition}
        >
          <div className="absolute left-5 top-5 rounded-full border border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)] shadow-[0_10px_22px_rgba(17,17,17,0.08)]">
            Fast replies
          </div>
          <div className="absolute right-5 top-5 rounded-full border border-[var(--color-accent-dark)] bg-[var(--color-accent)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-dark)] shadow-[0_10px_22px_rgba(17,17,17,0.12)]">
            Same day help
          </div>

          <motion.div
            className="relative aspect-square w-full max-w-[15.5rem] drop-shadow-[0_22px_44px_rgba(17,17,17,0.16)] sm:max-w-[17rem]"
            animate={
              prefersReducedMotion
                ? undefined
                : { y: [0, -10, 0], rotate: [0, 1.5, -1.5, 0], scale: [1, 1.025, 1] }
            }
            transition={{
              duration: 8.4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          >
            <Image
              src="/cheese.png"
              alt="Melted cheese visual"
              fill
              sizes="(min-width: 640px) 272px, 220px"
              preload
              className="object-contain"
            />
          </motion.div>

          <motion.div
            className="absolute -bottom-3 left-1/2 h-12 w-40 -translate-x-1/2 rounded-full bg-black/18 blur-2xl"
            animate={prefersReducedMotion ? undefined : { scaleX: [0.88, 1, 0.88], opacity: [0.24, 0.34, 0.24] }}
            transition={{
              duration: 8.4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-4 shadow-[0_12px_24px_rgba(92,16,16,0.08)]">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <MessageCircle className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
                WhatsApp
              </p>
            </div>
            <p className="mt-3 text-lg font-semibold text-ink-950">{whatsapp}</p>
          </div>

          <div className="rounded-[1.5rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-4 shadow-[0_12px_24px_rgba(92,16,16,0.08)]">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <PhoneCall className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
                Call
              </p>
            </div>
            <p className="mt-3 text-lg font-semibold text-ink-950">{phone}</p>
          </div>

          <div className="rounded-[1.5rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-4 shadow-[0_12px_24px_rgba(92,16,16,0.08)]">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <Clock3 className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
                Hours
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-ink-950">{hours}</p>
          </div>

          <div className="rounded-[1.5rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-4 shadow-[0_12px_24px_rgba(92,16,16,0.08)]">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <MapPin className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
                Base
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-ink-950">{address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
