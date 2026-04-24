export default function AdminOrderDetailLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 w-40 rounded-full border border-black/5 bg-white/70" />
      <div className="grid gap-4 xl:grid-cols-[1.22fr_0.78fr]">
        <div className="h-[32rem] rounded-[2rem] border border-black/5 bg-white/70" />
        <div className="h-[32rem] rounded-[2rem] border border-black/5 bg-white/70" />
      </div>
      <div className="h-[26rem] rounded-[2rem] border border-black/5 bg-white/70" />
    </div>
  );
}
