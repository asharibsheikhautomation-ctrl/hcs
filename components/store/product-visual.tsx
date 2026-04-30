import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/commerce";

const toneSurface = {
  gold: "bg-white",
  frost: "bg-white",
  ink: "bg-white",
} as const;

interface ProductVisualProps {
  product: Product;
  className?: string;
  imageUrl?: string | null;
  variant?: number;
  priority?: boolean;
  sizes?: string;
  quality?: 60 | 75 | 85;
}

export function ProductVisual({
  product,
  className,
  imageUrl,
  priority = false,
  sizes,
  quality,
}: ProductVisualProps) {
  const displayImageUrl =
    imageUrl ?? product.imageUrl ?? product.galleryUrls?.[0] ?? "/logo.png";
  const hasRealImage = Boolean(
    imageUrl ?? product.imageUrl ?? product.galleryUrls?.[0],
  );
  const responsiveSizes =
    sizes ?? "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw";
  const imageQuality = quality ?? (priority ? 75 : 60);

  return (
    <div
      className={cn(
        "glass-ring relative overflow-hidden rounded-[1.85rem] border border-black/8",
        toneSurface[product.accentTone],
        className,
      )}
    >
      <Image
        src={displayImageUrl}
        alt={product.name}
        fill
        sizes={responsiveSizes}
        quality={imageQuality}
        preload={priority}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]",
          hasRealImage
            ? "object-cover"
            : "object-contain bg-white p-6 sm:p-8",
        )}
      />
    </div>
  );
}
