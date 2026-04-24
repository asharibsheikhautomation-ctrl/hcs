"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { useCart } from "@/components/providers/cart-provider";
import { ProductFeatureStrip } from "@/components/store/product-feature-strip";
import { ProductVisual } from "@/components/store/product-visual";
import { siteSettings } from "@/lib/demo-data";
import { createQuickProductOrderUrl } from "@/lib/whatsapp";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/commerce";

const toneChipClassNames = {
  gold: "bg-cheese-100 text-cheese-700",
  frost: "bg-frost-100 text-mist-500",
  ink: "bg-zinc-100 text-ink-700",
} as const;

interface ProductCardProps {
  product: Product;
  index: number;
  whatsappNumber?: string;
}

export function ProductCard({
  product,
  index,
  whatsappNumber = siteSettings.whatsappNumber,
}: ProductCardProps) {
  const { addProduct } = useCart();
  const [didAdd, setDidAdd] = useState(false);
  const previewImages = useMemo(
    () =>
      Array.from(
        new Set(
          [product.imageUrl, ...(product.galleryUrls ?? [])].filter(
            (value): value is string => Boolean(value),
          ),
        ),
      ).slice(0, 4),
    [product.galleryUrls, product.imageUrl],
  );
  const quickOrderUrl = createQuickProductOrderUrl(whatsappNumber, product, 1);

  function handleAddToCart() {
    addProduct(product, 1);
    setDidAdd(true);

    window.setTimeout(() => {
      setDidAdd(false);
    }, 1600);
  }

  return (
    <Reveal delay={index * 0.06}>
      <article className="luxe-panel glass-ring cheese-melt-card card-hover group relative overflow-hidden rounded-[2rem] p-5 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.52),transparent_30%)] opacity-70" />

        <div className="relative flex h-full flex-col">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-700/55">
                {product.categoryName}
              </p>
              <h3 className="mt-3 text-[1.8rem] font-semibold leading-[0.96] text-ink-950 sm:text-2xl md:text-3xl">
                {product.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              {product.badge ? (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                    toneChipClassNames[product.accentTone],
                  )}
                >
                  {product.badge}
                </span>
              ) : null}
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-700/50">
                {product.unitLabel}
              </span>
            </div>
          </div>

          <Link href={`/products/${product.slug}`} className="mt-5 block">
            <div className="relative">
              <ProductVisual
                product={product}
                imageUrl={previewImages[0]}
                sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 42vw, (min-width: 640px) 50vw, 100vw"
                className="card-hover-image min-h-[18rem] md:min-h-[20rem]"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                <div className="rounded-full border border-white/45 bg-white/86 px-3.5 py-2 text-sm font-semibold text-ink-950 shadow-[0_14px_28px_rgba(17,17,17,0.12)] backdrop-blur-xl">
                  {formatCurrency(product.price)}
                </div>
                <span className="rounded-full border border-white/35 bg-black/34 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-xl">
                  {product.stockStatus.replaceAll("_", " ")}
                </span>
              </div>
            </div>
          </Link>

          {previewImages.length > 1 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previewImages.slice(1, 4).map((imageUrl, previewIndex) => (
                <div
                  key={`${product.id}-${imageUrl}-${previewIndex}`}
                  className="glass-ring relative h-16 overflow-hidden rounded-[1rem] border border-white/70 bg-white/80"
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.name} preview ${previewIndex + 2}`}
                    fill
                    sizes="96px"
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex flex-1 flex-col justify-between">
            <div>
              <p className="line-clamp-2 text-[0.9rem] leading-6 text-ink-700/68">
                {product.shortDescription}
              </p>
              <ProductFeatureStrip product={product} compact className="mt-3" />
            </div>

            <div className="mt-6 border-t border-black/6 pt-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="text-2xl font-semibold text-ink-950">
                      {formatCurrency(product.price)}
                    </p>
                    {product.compareAtPrice ? (
                      <p className="text-sm text-ink-700/50 line-through">
                        {formatCurrency(product.compareAtPrice)}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cheese-600">
                  {product.unitLabel}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="btn-base btn-primary cheese-cta"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {didAdd ? "Added" : "Add to cart"}
                  </button>
                  <a
                    href={quickOrderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-base btn-secondary cheese-cta"
                  >
                    WhatsApp order
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  className="interactive-ring card-hover-link inline-flex items-center justify-between rounded-[1.25rem] border border-black/8 bg-white/72 px-4 py-3 text-sm font-semibold text-ink-950 transition-colors hover:border-cheese-300"
                >
                  Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
