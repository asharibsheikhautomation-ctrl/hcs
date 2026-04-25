"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Shield, ShoppingBag } from "lucide-react";
import { LogoMark } from "@/components/common/logo-mark";
import { useCart } from "@/components/providers/cart-provider";
import { publicNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { createWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/types/commerce";

const depthTransition = {
  type: "spring",
  stiffness: 280,
  damping: 22,
  mass: 0.8,
} as const;

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const primaryNavigation = publicNavigation.filter(
    (item) => item.href !== "/checkout",
  );
  const whatsappHref = createWhatsAppOrderUrl(
    settings.whatsappNumber,
    "Hello Hyderabad Cheese Store, I need help with products or delivery.",
  );

  return (
    <header className="cheese-header-shell sticky top-0 z-50 overflow-x-clip border-b border-black/8 bg-[linear-gradient(180deg,rgba(22,20,16,0.96),rgba(18,18,18,0.88))] shadow-[0_22px_56px_rgba(17,17,17,0.18)] backdrop-blur-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_18%_8%,rgba(246,221,125,0.34),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(246,221,125,0.18),transparent_20%)]"
      />
      <div aria-hidden="true" className="cheese-header-drip" />

      {settings.announcementBar ? (
        <div className="border-b border-white/8 bg-white/[0.03]">
          <div className="mx-auto w-full max-w-[88rem] px-4 py-2 text-center text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-cheese-200 sm:px-5 sm:text-[0.72rem] sm:tracking-[0.28em] lg:px-6">
            {settings.announcementBar}
          </div>
        </div>
      ) : null}

      <motion.div
        className="mx-auto w-full max-w-[88rem] px-4 py-3 sm:px-5 sm:py-4 lg:px-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-3 xl:grid xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center xl:gap-4">
          <motion.div
            className="flex min-w-0 items-center justify-between gap-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04, duration: 0.3, ease: "easeOut" }}
          >
            <Link
              href="/"
              aria-label="Hyderabad Cheese Store home"
              className="min-w-0 max-w-full flex-1"
            >
              <LogoMark className="[&_p]:!text-white [&_p:last-child]:!text-white/72" />
            </Link>

            <motion.div
              whileHover={{ y: -2, rotateX: -8 }}
              whileTap={{ scale: 0.98 }}
              transition={depthTransition}
              className="hidden [transform-style:preserve-3d] sm:block lg:hidden"
            >
              <Link
                href="/admin"
                className="inline-flex min-h-[2.95rem] items-center justify-center rounded-full border border-white/10 bg-white/6 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl"
              >
                <Shield className="h-4 w-4" />
                <span className="ml-2">Admin</span>
              </Link>
            </motion.div>
          </motion.div>

          <nav className="min-w-0">
            <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <motion.ul
                className="flex min-w-max items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_38px_rgba(0,0,0,0.22)] [transform-style:preserve-3d] xl:justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.34, ease: "easeOut" }}
              >
                {primaryNavigation.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <motion.li
                      key={item.href}
                      className="min-w-0 shrink-0 [transform-style:preserve-3d]"
                      whileHover={{ y: -3, rotateX: -10, scale: 1.01 }}
                      whileTap={{ y: 0, scale: 0.985 }}
                      transition={depthTransition}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "inline-flex min-h-[46px] items-center justify-center whitespace-nowrap rounded-full px-4 py-2.5 text-center text-sm font-semibold tracking-[0.02em] transition-colors duration-200 sm:px-5",
                          isActive
                            ? "bg-[linear-gradient(135deg,rgba(255,230,113,1),rgba(216,170,24,1))] text-ink-950 shadow-[0_14px_28px_rgba(216,170,24,0.34)]"
                            : "bg-white/[0.03] !text-white hover:bg-white/[0.08] hover:!text-white",
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </div>
          </nav>

          <motion.div
            className="flex flex-wrap items-center gap-2 lg:justify-end"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.16, duration: 0.32, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{ y: -3, rotateX: -8 }}
              whileTap={{ scale: 0.98 }}
              transition={depthTransition}
              className="[transform-style:preserve-3d]"
            >
              <Link
                href="/checkout"
                className="inline-flex min-h-[3.05rem] items-center justify-center rounded-full border border-white/10 bg-white/6 px-4 text-sm font-semibold !text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:px-5"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="ml-2">Checkout</span>
                {itemCount > 0 ? (
                  <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-cheese-300 px-1.5 text-xs font-bold text-ink-950">
                    {itemCount}
                  </span>
                ) : null}
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, rotateX: -8 }}
              whileTap={{ scale: 0.98 }}
              transition={depthTransition}
              className="hidden [transform-style:preserve-3d] lg:block"
            >
              <Link
                href="/admin"
                className="inline-flex min-h-[3.05rem] items-center justify-center rounded-full border border-white/10 bg-white/6 px-5 text-sm font-semibold !text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl"
              >
                <Shield className="h-4 w-4" />
                <span className="ml-2">Admin</span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, rotateX: -10, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              transition={depthTransition}
              className="[transform-style:preserve-3d]"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="cheese-cta inline-flex min-h-[3.05rem] items-center justify-center rounded-full border border-cheese-200/90 bg-[linear-gradient(135deg,rgba(255,230,113,1),rgba(216,170,24,1))] px-5 text-sm font-semibold !text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_20px_38px_rgba(216,170,24,0.28)] sm:min-w-[210px]"
              >
                Order on WhatsApp
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}
