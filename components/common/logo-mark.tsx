import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  compact?: boolean;
}

export function LogoMark({ className, compact = false }: LogoMarkProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 sm:gap-3", className)}>
      <div className="relative shrink-0">
        <div className="melt-logo-mark glass-ring relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-cheese-200/70 bg-white shadow-glass sm:h-12 sm:w-12">
          <Image
            src="/logo.png"
            alt="Hyderabad Cheese Store logo"
            width={96}
            height={96}
            className="h-full w-full object-cover"
            sizes="48px"
          />
        </div>
        <div aria-hidden="true" className="logo-melt-drips">
          <span className="logo-melt-drop logo-melt-drop-1" />
          <span className="logo-melt-drop logo-melt-drop-2" />
          <span className="logo-melt-drop logo-melt-drop-3" />
        </div>
      </div>

      {!compact ? (
        <div className="min-w-0 leading-none">
          <p className="truncate font-display text-lg font-semibold tracking-tight text-ink-950 sm:text-2xl">
            Hyderabad Cheese Store
          </p>
          <p className="mt-1 hidden text-[0.7rem] uppercase tracking-[0.32em] text-ink-700/75 sm:block">
            Premium Cheese & Fast Food Supplies
          </p>
        </div>
      ) : null}
    </div>
  );
}
