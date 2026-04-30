"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Menu,
  Shield,
  ShoppingBag,
  X,
} from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const primaryNavigation = publicNavigation.filter(
    (item) => item.href !== "/checkout",
  );
  const whatsappHref = createWhatsAppOrderUrl(
    settings.whatsappNumber,
    "Hello Hyderabad Cheese Store, I need help with products or delivery.",
  );

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header className="cheese-header-shell sticky top-0 z-50 overflow-x-clip border-b border-black/10 bg-cheese-300 shadow-[0_10px_28px_rgba(17,17,17,0.12)]">
      {settings.announcementBar ? (
        <div className="border-b border-black/10 bg-cheese-200">
          <div className="mx-auto w-full max-w-[88rem] px-4 py-2 text-center text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-ink-950 sm:px-5 sm:text-[0.72rem] sm:tracking-[0.28em] lg:px-6">
            {settings.announcementBar}
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[88rem] px-4 py-3 sm:px-5 sm:py-4 lg:px-6">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Link
            href="/"
            aria-label="Hyderabad Cheese Store home"
            className="min-w-0 flex-1"
          >
            <LogoMark className="[&_p]:!text-ink-950 [&_p:last-child]:!text-ink-950/70" />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/checkout"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-black/12 bg-white px-4 text-sm font-semibold text-ink-950 shadow-[0_10px_24px_rgba(17,17,17,0.1)]"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 ? (
                <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-cheese-300 px-1.5 text-xs font-bold text-ink-950">
                  {itemCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-full border border-black/12 bg-white text-ink-950 shadow-[0_10px_24px_rgba(17,17,17,0.1)]"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <motion.div
          className="hidden lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-4"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
          <motion.div
            className="flex min-w-0 items-center gap-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04, duration: 0.3, ease: "easeOut" }}
          >
            <Link
              href="/"
              aria-label="Hyderabad Cheese Store home"
              className="min-w-0 max-w-full flex-1"
            >
              <LogoMark className="[&_p]:!text-ink-950 [&_p:last-child]:!text-ink-950/70" />
            </Link>
          </motion.div>

          <nav className="min-w-0">
            <motion.ul
              className="flex min-w-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white p-2 shadow-[0_10px_24px_rgba(17,17,17,0.08)]"
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
                    className="shrink-0"
                    whileHover={{ y: -3, rotateX: -10, scale: 1.01 }}
                    whileTap={{ y: 0, scale: 0.985 }}
                    transition={depthTransition}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex min-h-[46px] items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-center text-sm font-semibold tracking-[0.02em] transition-colors duration-200",
                        isActive
                          ? "bg-ink-950 text-cheese-200 shadow-[0_10px_20px_rgba(17,17,17,0.14)]"
                          : "bg-transparent !text-ink-950 hover:bg-cheese-200 hover:!text-ink-950",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
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
            >
              <Link
                href="/checkout"
                className="inline-flex min-h-[3.05rem] items-center justify-center rounded-full border border-black/12 bg-white px-4 text-sm font-semibold !text-ink-950 shadow-[0_10px_24px_rgba(17,17,17,0.1)] sm:px-5"
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
            >
              <Link
                href="/admin"
                className="inline-flex min-h-[3.05rem] items-center justify-center rounded-full border border-black/12 bg-white px-5 text-sm font-semibold !text-ink-950 shadow-[0_10px_24px_rgba(17,17,17,0.1)]"
              >
                <Shield className="h-4 w-4" />
                <span className="ml-2">Admin</span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, rotateX: -10, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              transition={depthTransition}
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="cheese-cta inline-flex min-h-[3.05rem] items-center justify-center rounded-full border border-black/12 bg-cheese-300 px-5 text-sm font-semibold !text-ink-950 shadow-[0_10px_24px_rgba(17,17,17,0.12)]"
              >
                WhatsApp Help
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.aside
              className="absolute right-0 top-0 flex h-full w-full max-w-[22rem] flex-col gap-5 bg-cheese-300 px-5 pb-6 pt-5 shadow-[0_18px_48px_rgba(17,17,17,0.18)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <LogoMark compact />
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-full border border-black/12 bg-white text-ink-950"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-2 rounded-[1.7rem] border border-black/10 bg-white/92 p-2">
                {primaryNavigation.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "rounded-[1.15rem] px-4 py-3 text-base font-semibold transition-colors",
                        isActive
                          ? "bg-ink-950 text-cheese-200"
                          : "text-ink-950 hover:bg-cheese-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="grid gap-3">
                <Link href="/checkout" onClick={() => setIsMenuOpen(false)} className="btn-base btn-primary w-full">
                  <ShoppingBag className="h-4 w-4" />
                  Checkout
                  {itemCount > 0 ? (
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-ink-950">
                      {itemCount}
                    </span>
                  ) : null}
                </Link>
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="btn-base btn-secondary w-full">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-base btn-secondary w-full"
                >
                  WhatsApp Help
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
