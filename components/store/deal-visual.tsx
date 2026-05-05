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
  const [primaryImage] = previewImages;
  const displayImage = primaryImage ?? "/logo.png";
  const usesFallbackLogo = !primaryImage;
  void compact;

  return (
    <div
      className={cn(
        "glass-ring relative overflow-hidden rounded-[1.9rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)]",
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
            ? "object-contain bg-[var(--color-bg-white)] p-8"
            : "object-cover",
        )}
      />
      <div className="absolute left-4 top-4 rounded-full border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)] shadow-[0_12px_20px_rgba(92,16,16,0.14)]">
        {deal.includedItems.length} items
      </div>
    </div>
  );
}
