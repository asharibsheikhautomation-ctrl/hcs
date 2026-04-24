import { cn } from "@/lib/utils";
import { StaggerGroup, StaggerItem } from "@/components/motion";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <StaggerGroup
      className={cn(
        "space-y-3",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl",
        className,
      )}
      amount={0.14}
    >
      <StaggerItem>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cheese-500 sm:text-xs sm:tracking-[0.34em]">
          {eyebrow}
        </p>
      </StaggerItem>
      <StaggerItem>
        <h2 className="text-balance text-[2.35rem] font-semibold leading-[0.94] text-ink-950 sm:text-3xl md:text-4xl xl:text-5xl">
          {title}
        </h2>
      </StaggerItem>
      <StaggerItem>
        <p className="line-clamp-2 max-w-lg text-balance text-[0.9rem] leading-6 text-ink-700/70 md:text-[0.96rem] md:leading-6">
          {description}
        </p>
      </StaggerItem>
    </StaggerGroup>
  );
}
