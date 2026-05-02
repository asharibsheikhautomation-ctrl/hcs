import {
  Package2,
  Snowflake,
  Sparkles,
} from "lucide-react";
import {
  getProductQuantityLabel,
  getProductUsageTag,
} from "@/lib/product-copy";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/commerce";

interface ProductFeatureStripProps {
  product: Product;
  compact?: boolean;
  className?: string;
}

export function ProductFeatureStrip({
  product,
  compact = false,
  className,
}: ProductFeatureStripProps) {
  const quantityLabel =
    getProductQuantityLabel(product) ||
    (product.unitLabel && product.unitLabel.toLowerCase() !== "unit"
      ? product.unitLabel
      : "");
  const features = [
    {
      icon: product.isFrozen ? Snowflake : Sparkles,
      label: product.isFrozen ? "Cold" : "Fresh",
    },
    {
      icon: Package2,
      label: quantityLabel || "Pack",
    },
    {
      icon: Sparkles,
      label: getProductUsageTag(product),
    },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <span
            key={feature.label}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] font-semibold text-[var(--color-primary)] shadow-[0_10px_24px_rgba(92,16,16,0.08)]",
              compact
                ? "px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.18em]"
                : "px-3.5 py-2 text-[0.72rem] uppercase tracking-[0.2em]",
            )}
          >
            <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
            {feature.label}
          </span>
        );
      })}
    </div>
  );
}
