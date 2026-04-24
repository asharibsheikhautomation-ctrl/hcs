export default function AdminOrdersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 rounded-[2rem] border border-black/5 bg-white/70" />
      <div className="h-24 rounded-[2rem] border border-black/5 bg-white/70" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-52 rounded-[2rem] border border-black/5 bg-white/70"
          />
        ))}
      </div>
    </div>
  );
}
