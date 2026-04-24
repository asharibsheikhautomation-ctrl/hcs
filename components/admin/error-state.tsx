interface AdminErrorStateProps {
  title: string;
  description: string;
}

export function AdminErrorState({
  title,
  description,
}: AdminErrorStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-600">
        Unable To Load
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-ink-950">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/80">
        {description}
      </p>
    </div>
  );
}
