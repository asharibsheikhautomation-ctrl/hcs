interface AdminEmptyStateProps {
  title: string;
  description: string;
}

export function AdminEmptyState({
  title,
  description,
}: AdminEmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white/70 px-6 py-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cheese-500">
        Empty State
      </p>
      <h3 className="mt-4 text-2xl font-semibold text-ink-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-700/75">
        {description}
      </p>
    </div>
  );
}
