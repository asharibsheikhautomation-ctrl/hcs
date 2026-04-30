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
    <section className="luxe-panel rounded-[2rem] p-6 md:p-8">
      <div
        className={cn(
          "mb-6 max-w-2xl",
          compactHeaderOnMobile && "hidden md:block",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cheese-500">
          Admin Section
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-ink-950 md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base leading-8 text-ink-700/80">{description}</p>
      </div>
      {children}
    </section>
  );
}
