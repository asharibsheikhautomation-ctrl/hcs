import { Skeleton } from "@/components/common/skeleton";

interface StoreLoadingShellProps {
  variant?: "hero-grid" | "detail" | "checkout";
}

export function StoreLoadingShell({
  variant = "hero-grid",
}: StoreLoadingShellProps) {
  if (variant === "detail") {
    return (
      <section className="section-space">
        <div className="container-main space-y-6">
          <Skeleton className="h-11 w-44 rounded-full" />
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <Skeleton className="h-[26rem] rounded-[2rem] md:h-[34rem] xl:h-[42rem]" />
            <div className="space-y-6">
              <Skeleton className="h-[20rem] rounded-[2rem] md:h-[24rem]" />
              <Skeleton className="h-[16rem] rounded-[2rem] md:h-[18rem]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "checkout") {
    return (
      <section className="section-space">
        <div className="container-main space-y-6">
          <Skeleton className="h-52 rounded-[2.4rem] md:h-60" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Skeleton className="h-[32rem] rounded-[2rem]" />
            <div className="space-y-6">
              <Skeleton className="h-[28rem] rounded-[2rem]" />
              <Skeleton className="h-56 rounded-[2rem]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-space">
      <div className="container-main space-y-6">
        <Skeleton className="h-52 rounded-[2.4rem] md:h-60" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[22rem] rounded-[2rem]" />
          ))}
        </div>
      </div>
    </section>
  );
}
