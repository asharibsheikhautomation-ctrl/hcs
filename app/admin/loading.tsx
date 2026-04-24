export default function AdminLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-[1.75rem] border border-black/5 bg-white/70"
          />
        ))}
      </section>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[26rem] rounded-[2rem] border border-black/5 bg-white/70" />
        <div className="h-[26rem] rounded-[2rem] border border-black/5 bg-white/70" />
      </div>
    </div>
  );
}
