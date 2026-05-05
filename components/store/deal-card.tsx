"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { useCart } from "@/components/providers/cart-provider";
import { DealVisual } from "@/components/store/deal-visual";
import { formatDealDiscount, formatDealValidity } from "@/lib/deal-utils";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/commerce";

interface DealCardProps {
  deal: Deal;
  index: number;
}

export function DealCard({ deal, index }: DealCardProps) {
  const { addDeal } = useCart();
  const [didAdd, setDidAdd] = useState(false);
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
    <Reveal delay={index * 0.05}>
      <article className="overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-[0_10px_24px_rgba(17,17,17,0.08)] transition-transform duration-200 hover:-translate-y-1">
        <div className="flex h-full flex-col lg:flex-row">
          <DealVisual
            deal={deal}
            className="min-h-[16rem] lg:w-[17rem] lg:shrink-0"
            sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 24vw, 100vw"
          />

          <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white">
                {formatDealDiscount(deal)}
              </span>
              <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-black">
                {formatDealValidity(deal)}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-[1.55rem] font-extrabold leading-[1] text-black sm:text-[1.75rem]">
                {deal.name}
              </h3>
              <p className="line-clamp-2 text-sm leading-6 text-[rgba(17,17,17,0.72)]">
                {summaryText}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {featuredItems.length > 0 ? (
                featuredItems.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full border border-black/10 bg-[var(--color-bg-light)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[rgba(17,17,17,0.78)]"
                  >
                    {item.productName} x{item.quantity}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-black/10 bg-[var(--color-bg-light)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[rgba(17,17,17,0.78)]">
                  Bundle deal
                </span>
              )}
            </div>

            {deal.originalTotal > 0 ? (
              <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.18em]">
                <span className="rounded-full bg-[var(--color-bg-light)] px-3 py-1 text-[rgba(17,17,17,0.72)]">
                  Worth {formatCurrency(deal.originalTotal)}
                </span>
                <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-white">
                  Offer {formatCurrency(deal.dealPrice)}
                </span>
              </div>
            ) : null}

            <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-[1.8rem] font-extrabold leading-none text-[var(--color-accent)]">
                  {formatCurrency(deal.dealPrice)}
                </p>
                {deal.originalTotal > deal.dealPrice ? (
                  <p className="text-sm text-[rgba(17,17,17,0.5)] line-through">
                    {formatCurrency(deal.originalTotal)}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-base btn-primary sm:w-auto"
              >
                <ShoppingBag className="h-4 w-4" />
                {didAdd ? "Added" : "Add deal"}
              </button>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
