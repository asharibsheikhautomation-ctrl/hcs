"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Shield, ShoppingBag, X } from "lucide-react";
import { LogoMark } from "@/components/common/logo-mark";
import { useCart } from "@/components/providers/cart-provider";
import { publicNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/commerce";

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navItems = [
    ...publicNavigation,
    { href: "/checkout", label: "Checkout" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
      <div className="container-main py-3">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] bg-[var(--color-primary)] px-3 py-2"
            aria-label={`${settings.siteName} home`}
          >
            <LogoMark className="[&_p]:!text-black [&_p:last-child]:!text-[rgba(17,17,17,0.76)]" />
          </Link>

          <Link
            href="/checkout"
            className="relative inline-flex h-12 min-w-12 items-center justify-center rounded-[1rem] bg-[var(--color-accent)] text-white"
            aria-label="Checkout"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-xs font-black text-black">
                {itemCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-[var(--color-primary)] bg-black text-white"
            aria-label="Open navigation"
            aria-expanded={isMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/"
            className="flex items-center rounded-[1.35rem] bg-[var(--color-primary)] px-4 py-3"
            aria-label={`${settings.siteName} home`}
          >
            <LogoMark className="[&_p]:!text-black [&_p:last-child]:!text-[rgba(17,17,17,0.76)]" />
          </Link>

          <nav className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-[rgba(245,168,0,0.3)] bg-[#141414] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {publicNavigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-sm font-bold transition-colors",
                    isActive
                      ? "bg-[var(--color-primary)] text-black"
                      : "!text-white hover:bg-[rgba(245,168,0,0.14)] hover:!text-[var(--color-accent)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/checkout"
              className="relative inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-[var(--color-primary)]"
            >
              <ShoppingBag className="h-4 w-4" />
              Checkout
              {itemCount > 0 ? (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-xs font-black text-white">
                  {itemCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)] px-4 py-3 text-sm font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-black"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          className="fixed inset-0 z-[60] bg-black/60 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-[20rem] flex-col gap-5 bg-black px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-[var(--color-primary)] px-3 py-2">
              <LogoMark compact className="[&_p]:!text-black" />
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-2">
              {navItems.map((item) => {
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
                      "rounded-[1rem] px-4 py-3 text-base font-bold transition-colors",
                      isActive
                        ? "bg-[var(--color-primary)] text-black"
                        : "border border-black/10 bg-white text-black",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 text-base font-bold text-black"
              >
                Admin
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
