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
    surface:
      "border-cheese-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,249,223,0.9),rgba(246,221,125,0.82))]",
    banner:
      "bg-[radial-gradient(circle_at_top_left,rgba(246,221,125,0.4),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.72),rgba(246,221,125,0.4),rgba(17,17,17,0.12))]",
    chip: "bg-cheese-100/90 text-cheese-700",
  },
  frost: {
    surface:
      "border-frost-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,251,255,0.96),rgba(189,223,255,0.7))]",
    banner:
      "bg-[radial-gradient(circle_at_top_left,rgba(189,223,255,0.4),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.74),rgba(189,223,255,0.34),rgba(17,17,17,0.14))]",
    chip: "bg-frost-100/90 text-mist-600",
  },
  ink: {
    surface:
      "border-black/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(248,248,248,0.94),rgba(229,229,229,0.82))]",
    banner:
      "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.36),transparent_32%),linear-gradient(145deg,rgba(34,34,34,0.9),rgba(89,89,89,0.62),rgba(255,255,255,0.18))]",
    chip: "bg-black/6 text-ink-700",
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
          "glass-ring cheese-melt-card card-hover group overflow-hidden rounded-[2rem] border shadow-[0_28px_90px_rgba(17,17,17,0.08)]",
          tone.surface,
        )}
      >
        <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
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
                <span className="rounded-full border border-black/8 bg-white/78 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-ink-700">
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
              <h3 className="mt-3 text-[2rem] font-semibold leading-[0.95] text-ink-950 md:text-[2.4rem]">
                {deal.name}
              </h3>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-700/76">
                {summaryText}
              </p>

              <div className="mt-5 flex flex-wrap items-end gap-4 rounded-[1.5rem] border border-black/6 bg-white/80 p-4">
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

                <div className="ml-auto rounded-full bg-cheese-100 px-3.5 py-2 text-sm font-semibold text-cheese-700">
                  {deal.savingsLabel}
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                {featuredItems.length > 0 ? (
                  featuredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-[1.2rem] border border-black/6 bg-white/76 px-3.5 py-3"
                    >
                      <div className="glass-ring relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.9rem] border border-white/70 bg-white">
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
                  <div className="rounded-[1.2rem] border border-dashed border-black/10 bg-white/70 px-4 py-4 text-sm text-ink-700/72">
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
