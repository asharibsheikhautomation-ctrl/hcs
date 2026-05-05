import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PanelCardProps {
  title: string;
  description: string;
  children: ReactNode;
  compactHeaderOnMobile?: boolean;
}

export function PanelCard({
  title,
  description,
  children,
  compactHeaderOnMobile = false,
}: PanelCardProps) {
  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_10px_24px_rgba(17,17,17,0.08)] md:p-8">
      <div
        className={cn(
          "mb-6 max-w-2xl",
          compactHeaderOnMobile && "hidden md:block",
        )}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">
          Admin Section
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-ink-950 md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base leading-8 text-ink-700/80">{description}</p>
      </div>
      {children}
    </section>
  );
}
