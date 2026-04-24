import type { ReactNode } from "react";

interface PanelCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function PanelCard({
  title,
  description,
  children,
}: PanelCardProps) {
  return (
    <section className="luxe-panel rounded-[2rem] p-6 md:p-8">
      <div className="mb-6 max-w-2xl">
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
