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
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/commerce";

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
      <article className="overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-[0_10px_24px_rgba(17,17,17,0.08)] transition-transform duration-200 hover:-translate-y-1">
        <div className="flex h-full flex-col sm:flex-row">
          <Link
            href={`/products/${product.slug}`}
            className="block sm:w-[11.5rem] sm:shrink-0"
          >
            <ProductVisual
              product={product}
              imageUrl={product.imageUrl ?? product.galleryUrls?.[0]}
              sizes="(min-width: 1280px) 16vw, (min-width: 640px) 28vw, 100vw"
              className="min-h-[13.5rem] rounded-none sm:min-h-full"
            />
          </Link>

          <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-black">
                {product.categoryName}
              </span>
              {quantityLabel ? (
                <span className="rounded-full bg-black px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white">
                  {quantityLabel}
                </span>
              ) : null}
            </div>

            <div className="space-y-3">
              <Link href={`/products/${product.slug}`} className="block">
                <h3 className="text-[1.55rem] font-extrabold leading-[1] text-black sm:text-[1.75rem]">
                  {displayTitle}
                </h3>
              </Link>
              <p className="line-clamp-2 text-sm leading-6 text-[rgba(17,17,17,0.72)]">
                {descriptionText}
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-[1.8rem] font-extrabold leading-none text-[var(--color-accent)]">
                  {formatCurrency(product.price)}
                </p>
                {product.compareAtPrice ? (
                  <p className="text-sm text-[rgba(17,17,17,0.5)] line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-base btn-primary sm:w-auto"
              >
                <ShoppingBag className="h-4 w-4" />
                {didAdd ? "Added" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
