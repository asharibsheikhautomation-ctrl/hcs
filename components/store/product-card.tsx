"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { useCart } from "@/components/providers/cart-provider";
import { ProductVisual } from "@/components/store/product-visual";
import {
  getProductCardDescription,
  getProductDisplayTitle,
  getProductQuantityLabel,
} from "@/lib/product-copy";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/commerce";

const toneChipClassNames = {
  gold: "bg-cheese-100 text-ink-950",
  frost: "bg-cheese-100 text-ink-950",
  ink: "bg-zinc-100 text-ink-950",
} as const;

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addProduct } = useCart();
  const [didAdd, setDidAdd] = useState(false);
  const displayTitle = getProductDisplayTitle(product);
  const quantityLabel = getProductQuantityLabel(product);
  const descriptionText = getProductCardDescription(product);

  function handleAddToCart() {
    addProduct(product, 1);
    setDidAdd(true);

    window.setTimeout(() => {
      setDidAdd(false);
    }, 1600);
  }

  return (
    <Reveal delay={index * 0.04}>
      <article className="card-hover group overflow-hidden rounded-[1.8rem] border border-black/8 bg-white p-4 shadow-[0_12px_30px_rgba(17,17,17,0.08)] sm:p-5">
        <div className="flex h-full flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-ink-700/60">
              {product.categoryName}
            </span>
            {quantityLabel ? (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em]",
                  toneChipClassNames[product.accentTone],
                )}
              >
                {quantityLabel}
              </span>
            ) : null}
          </div>

          <Link href={`/products/${product.slug}`} className="block">
            <ProductVisual
              product={product}
              imageUrl={product.imageUrl ?? product.galleryUrls?.[0]}
              sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 32vw, (min-width: 640px) 45vw, 100vw"
              className="card-hover-image min-h-[18rem] rounded-[1.5rem] sm:min-h-[19rem]"
            />
          </Link>

          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="space-y-4">
              <Link href={`/products/${product.slug}`} className="block">
                <h3 className="font-sans text-[1.7rem] font-black leading-[0.96] tracking-[-0.04em] text-ink-950 sm:text-[1.95rem]">
                  {displayTitle}
                </h3>
              </Link>
              <p className="line-clamp-2 text-sm font-medium leading-6 text-ink-700/82">
                {descriptionText}
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-[1.85rem] font-black text-ink-950">
                  {formatCurrency(product.price)}
                </p>
                {product.compareAtPrice ? (
                  <p className="text-sm text-ink-700/50 line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-base btn-primary w-full"
            >
              <ShoppingBag className="h-4 w-4" />
              {didAdd ? "Added to cart" : "Add to cart"}
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
