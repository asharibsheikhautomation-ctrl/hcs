"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { useCart } from "@/components/providers/cart-provider";
import { DealVisual } from "@/components/store/deal-visual";
import { formatDealDiscount, formatDealValidity } from "@/lib/deal-utils";
import { cn, formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/commerce";

const toneClasses = {
  gold: {
    surface: "border-cheese-200 bg-cheese-50/96",
    banner: "bg-cheese-50/96",
    chip: "bg-cheese-100 text-ink-950",
  },
  frost: {
    surface: "border-cheese-200 bg-cheese-50/96",
    banner: "bg-cheese-50/96",
    chip: "bg-cheese-100 text-ink-950",
  },
  ink: {
    surface: "border-black/10 bg-cheese-50/96",
    banner: "bg-cheese-50/96",
    chip: "bg-zinc-100 text-ink-950",
  },
} as const;

interface DealCardProps {
  deal: Deal;
  index: number;
}

export function DealCard({ deal, index }: DealCardProps) {
  const { addDeal } = useCart();
  const [didAdd, setDidAdd] = useState(false);
  const tone = toneClasses[deal.accentTone];
  const summaryText = deal.headline || deal.description;
  const featuredItems = deal.includedItems.slice(0, 3);

  function handleAddToCart() {
    addDeal(deal, 1);
    setDidAdd(true);

    window.setTimeout(() => {
      setDidAdd(false);
    }, 1600);
  }

  return (
    <Reveal delay={index * 0.08}>
      <article
        className={cn(
          "glass-ring card-hover group overflow-hidden rounded-[2rem] border shadow-[0_14px_34px_rgba(17,17,17,0.08)]",
          tone.surface,
        )}
      >
        <div className="grid gap-5 p-4 sm:p-5 md:p-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
          <DealVisual
            deal={deal}
            className="min-h-[18rem] xl:min-h-full"
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 42vw, 100vw"
          />

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em]",
                    tone.chip,
                  )}
                >
                  {formatDealDiscount(deal)}
                </span>
                <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-ink-700">
                  {formatDealValidity(deal)}
                </span>
                {deal.isFeatured ? (
                  <span className="rounded-full border border-black/8 bg-ink-950 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">
                    Featured
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-ink-800/60">
                Deal
              </p>
              <h3 className="mt-3 text-[1.65rem] font-semibold leading-[0.95] text-ink-950 sm:text-[2rem] md:text-[2.4rem]">
                {deal.name}
              </h3>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-700/76">
                {summaryText}
              </p>

              <div className="mt-5 flex flex-wrap items-end gap-4 rounded-[1.5rem] border border-black/6 bg-cheese-50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-700/55">
                    Price
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="text-3xl font-semibold text-ink-950">
                      {formatCurrency(deal.dealPrice)}
                    </p>
                    {deal.originalTotal > deal.dealPrice ? (
                      <p className="text-sm text-ink-700/50 line-through">
                        {formatCurrency(deal.originalTotal)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="ml-auto rounded-full bg-cheese-200 px-3.5 py-2 text-sm font-semibold text-ink-950">
                  {deal.savingsLabel}
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                <div className="rounded-[1.2rem] border border-black/6 bg-white/90 px-4 py-3 text-sm font-medium text-ink-700 sm:hidden">
                  {featuredItems.length > 0
                    ? `${featuredItems.length} items included`
                    : "Linked items appear here."}
                </div>
                {featuredItems.length > 0 ? (
                  featuredItems.map((item) => (
                    <div
                      key={item.id}
                      className="hidden items-center gap-3 rounded-[1.2rem] border border-black/6 bg-white/90 px-3.5 py-3 sm:flex"
                    >
                      <div className="glass-ring relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.9rem] border border-black/8 bg-cheese-50">
                        <Image
                          src={item.imageUrl || "/img3.png"}
                          alt={item.productName}
                          fill
                          sizes="48px"
                          loading="lazy"
                          decoding="async"
                          className={cn(
                            "h-full w-full",
                            item.imageUrl ? "object-cover" : "object-contain p-2",
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-950">
                          {item.productName}
                        </p>
                        <p className="text-xs uppercase tracking-[0.22em] text-ink-700/55">
                          {item.quantity} x {item.unitLabel ?? "item"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-ink-950">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-black/10 bg-white/90 px-4 py-4 text-sm text-ink-700/72">
                    Linked items appear here.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-base btn-primary w-full"
              >
                <ShoppingBag className="h-4 w-4" />
                {didAdd ? "Deal added" : "Add deal to cart"}
              </button>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
