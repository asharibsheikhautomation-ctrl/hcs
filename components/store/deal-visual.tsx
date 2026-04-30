import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types/commerce";

interface DealVisualProps {
  deal: Deal;
  className?: string;
  sizes?: string;
  priority?: boolean;
  compact?: boolean;
}

function getDealPreviewImages(deal: Deal) {
  const imageUrls = [
    deal.bannerImageUrl,
    ...deal.includedItems.map((item) => item.imageUrl ?? null),
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(imageUrls)).slice(0, 3);
}

export function DealVisual({
  deal,
  className,
  sizes = "(min-width: 1280px) 36vw, (min-width: 768px) 48vw, 100vw",
  priority = false,
  compact = false,
}: DealVisualProps) {
  const previewImages = getDealPreviewImages(deal);
  const [primaryImage, secondaryImage, tertiaryImage] = previewImages;
  const displayImage = primaryImage ?? "/logo.png";
  const usesFallbackLogo = !primaryImage;

  return (
    <div
      className={cn(
        "glass-ring relative overflow-hidden rounded-[1.9rem] border border-black/8 bg-white",
        className,
      )}
    >
      <Image
        src={displayImage}
        alt={`${deal.name} visual`}
        fill
        sizes={sizes}
        preload={priority}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "absolute inset-0 h-full w-full",
          usesFallbackLogo
            ? "object-contain bg-white p-8"
            : "object-cover",
        )}
      />
      <div className="absolute left-4 top-4 rounded-full border border-black/8 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink-950 shadow-[0_8px_18px_rgba(17,17,17,0.08)]">
        {deal.includedItems.length} items
      </div>

      {secondaryImage ? (
        <div
          className={cn(
            "absolute overflow-hidden rounded-[1.2rem] border border-black/8 bg-white shadow-[0_14px_28px_rgba(17,17,17,0.12)]",
            compact
              ? "bottom-4 left-4 h-18 w-18 rotate-[-8deg]"
              : "bottom-5 left-5 h-22 w-22 rotate-[-8deg] sm:h-24 sm:w-24",
          )}
        >
          <Image
            src={secondaryImage}
            alt={`${deal.name} included item`}
            fill
            sizes="96px"
            loading="lazy"
            decoding="async"
            className="object-cover"
          />
        </div>
      ) : null}

      {tertiaryImage ? (
        <div
          className={cn(
            "absolute overflow-hidden rounded-[1.2rem] border border-black/8 bg-white shadow-[0_14px_28px_rgba(17,17,17,0.12)]",
            compact
              ? "right-4 top-12 h-16 w-16 rotate-[9deg]"
              : "right-5 top-5 h-20 w-20 rotate-[9deg] sm:h-24 sm:w-24",
          )}
        >
          <Image
            src={tertiaryImage}
            alt={`${deal.name} extra visual`}
            fill
            sizes="96px"
            loading="lazy"
            decoding="async"
            className="object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}
