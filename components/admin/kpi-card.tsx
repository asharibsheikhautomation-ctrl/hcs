import type { DashboardMetric } from "@/types/commerce";

interface KpiCardProps {
  metric: DashboardMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  return (
    <article className="luxe-panel rounded-[1.75rem] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-700/50">
        {metric.label}
      </p>
      <p className="mt-4 text-4xl font-semibold text-ink-950">{metric.value}</p>
      <p className="mt-3 text-sm leading-7 text-ink-700/75">{metric.hint}</p>
    </article>
  );
}
