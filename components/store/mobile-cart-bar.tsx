"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { StoreCartSummary } from "@/components/store/store-cart-summary";
import { calculateSubtotal } from "@/lib/checkout";
import { formatCurrency } from "@/lib/utils";

export function MobileCartBar() {
  const pathname = usePathname();
  const { isHydrated, itemCount, items } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const subtotal = calculateSubtotal(items);

  const shouldHide =
    pathname.startsWith("/admin") || pathname.startsWith("/checkout");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (shouldHide || !isHydrated || itemCount === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[var(--color-primary-dark)] p-3 shadow-[0_-8px_20px_rgba(17,17,17,0.18)] md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-[1rem] bg-[var(--color-accent)] px-4 py-3 text-left text-[var(--color-text-white)]"
        >
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.14)]">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">View Cart</span>
              <span className="block text-xs font-medium text-[rgba(255,255,255,0.82)]">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </span>
          </span>

          <span className="text-base font-extrabold">{formatCurrency(subtotal)}</span>
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setIsOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-[1.6rem] bg-[var(--color-bg-light)] p-4 shadow-[0_-12px_30px_rgba(17,17,17,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Your Order
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[var(--color-text-dark)]">
                  Cart Summary
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--color-text-dark)]"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <StoreCartSummary compact onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
