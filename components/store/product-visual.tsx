import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/commerce";

const toneSurface = {
  gold: "from-cheese-100 via-white to-cheese-200",
  frost: "from-frost-100 via-white to-frost-200",
  ink: "from-zinc-100 via-white to-zinc-50",
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
        "glass-ring relative overflow-hidden rounded-[1.85rem] border border-white/65 bg-gradient-to-br",
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(17,17,17,0.04)_100%)]" />
    </div>
  );
}
