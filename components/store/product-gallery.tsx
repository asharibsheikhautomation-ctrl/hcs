"use client";

import { useState } from "react";
import { ProductVisual } from "@/components/store/product-visual";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/commerce";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const galleryItems = product.galleryUrls?.filter(Boolean) ?? [];
  const slides = galleryItems.length > 0 ? galleryItems : [null, null, null];
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-4">
      <ProductVisual
        product={product}
        imageUrl={slides[selectedIndex]}
        variant={selectedIndex}
        priority
        sizes="(min-width: 1280px) 44vw, (min-width: 768px) 50vw, 100vw"
        quality={75}
        className="min-h-[17rem] sm:min-h-[24rem] md:min-h-[34rem]"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slides.map((slide, index) => (
          <button
            key={`${product.id}-${index}`}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "group overflow-hidden rounded-[1.4rem] border p-1 text-left transition-all duration-300",
              selectedIndex === index
                ? "border-cheese-300 bg-cheese-50 shadow-[0_10px_28px_rgba(216,170,24,0.18)]"
                : "border-black/8 bg-white/70 hover:border-cheese-200 hover:bg-white",
            )}
          >
            <ProductVisual
              product={product}
              imageUrl={slide}
              variant={index}
              sizes="(min-width: 640px) 24vw, 44vw"
              className="min-h-[6.25rem] sm:min-h-[8rem]"
            />
            <div className="px-3 pb-3 pt-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-ink-700/55">
                {index === 0 ? "Hero" : index === 1 ? "Texture" : "Serving"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
