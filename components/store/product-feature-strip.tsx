import {
  MessageCircle,
  Package2,
  ShieldCheck,
  Snowflake,
  Sparkles,
} from "lucide-react";
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
  const features = [
    {
      icon: product.isFrozen ? Snowflake : Sparkles,
      label: product.isFrozen ? "Cold" : "Fresh",
    },
    {
      icon: Package2,
      label: product.unitLabel,
    },
    {
      icon: product.compareAtPrice ? ShieldCheck : MessageCircle,
      label: product.compareAtPrice ? "Value" : "Quick chat",
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
              "inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/76 font-semibold text-ink-700 shadow-[0_10px_24px_rgba(17,17,17,0.05)]",
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
