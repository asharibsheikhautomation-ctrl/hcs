import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StoreStatePanelProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
  tone?: "default" | "error";
}

export function StoreStatePanel({
  eyebrow,
  title,
  description,
  actions,
  className,
  tone = "default",
}: StoreStatePanelProps) {
  return (
    <div className={cn("state-panel", className)} data-tone={tone}>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.32em]",
          tone === "error" ? "text-red-700" : "text-[var(--color-primary)]",
        )}
      >
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-3xl font-semibold text-ink-950 md:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-700/76 md:text-base md:leading-7">
        {description}
      </p>
      {actions ? (
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
