"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { calculateSubtotal } from "@/lib/checkout";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StoreCartSummaryProps {
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
}

export function StoreCartSummary({
  className,
  compact = false,
  onNavigate,
}: StoreCartSummaryProps) {
  const { clear, isHydrated, itemCount, items, removeItem, updateQuantity } = useCart();
  const subtotal = calculateSubtotal(items);

  return (
    <aside
      className={cn(
        "rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.08)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Your Order
          </p>
          <h3 className="mt-2 text-2xl font-extrabold text-[var(--color-text-dark)]">
            Cart
          </h3>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-dark)]"
          >
            Clear
          </button>
        ) : null}
      </div>

      {!isHydrated ? (
        <div className="space-y-3 pt-4">
          <div className="h-20 rounded-2xl bg-[var(--color-bg-light)]" />
          <div className="h-20 rounded-2xl bg-[var(--color-bg-light)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm font-medium text-[rgba(17,17,17,0.7)]">
            Your cart is empty.
          </p>
          <Link
            href="/products"
            onClick={onNavigate}
            className="btn-base btn-secondary mt-4 w-full"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto py-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.2rem] border border-black/8 bg-[var(--color-bg-light)] p-3"
              >
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white">
                    <Image
                      src={item.imageUrl || "/logo.png"}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className={item.imageUrl ? "object-cover" : "object-contain p-2"}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="line-clamp-2 text-sm font-bold leading-5 text-[var(--color-text-dark)]">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[rgba(17,17,17,0.58)]">
                          {item.unitLabel || item.categoryName || "item"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--color-accent)] transition-colors hover:bg-[rgba(198,40,40,0.08)]"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-bg-light)]"
                          aria-label={`Decrease ${item.productName}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-bold text-[var(--color-text-dark)]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-bg-light)]"
                          aria-label={`Increase ${item.productName}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-sm font-extrabold text-[var(--color-accent)]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-3 border-t border-black/10 pt-4">
            <div className="flex items-center justify-between text-sm text-[rgba(17,17,17,0.8)]">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[rgba(17,17,17,0.8)]">
              <span>Delivery</span>
              <span>At checkout</span>
            </div>
            <div className="flex items-center justify-between text-lg font-extrabold text-[var(--color-text-dark)]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-xs leading-5 text-[rgba(17,17,17,0.62)]">
              Delivery charges are calculated after you select zone and area at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={onNavigate}
              className="btn-base btn-primary w-full"
            >
              <ShoppingBag className="h-4 w-4" />
              {compact ? "Checkout" : "Proceed to Checkout"}
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}
