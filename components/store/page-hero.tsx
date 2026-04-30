import type { ReactNode } from "react";
import { SectionTransition, StaggerGroup, StaggerItem } from "@/components/motion";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: PageHeroProps) {
  return (
    <section className="section-space pb-6 pt-10 sm:pt-12">
      <div className="container-main">
        <SectionTransition>
          <div className="cheese-surface rounded-[2rem] border border-black/10 bg-cheese-300 p-6 shadow-[0_20px_54px_rgba(141,97,8,0.18)] md:rounded-[2.25rem] md:p-10 lg:p-12">
            <StaggerGroup className="max-w-3xl space-y-4" amount={0.12}>
              <StaggerItem>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cheese-500 sm:text-xs sm:tracking-[0.34em]">
                  {eyebrow}
                </p>
              </StaggerItem>
              <StaggerItem>
                <h1 className="text-balance text-[2.35rem] font-semibold leading-[0.94] text-ink-950 sm:text-[2.7rem] md:text-5xl xl:text-[3.9rem]">
                  {title}
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="line-clamp-3 max-w-xl text-balance text-[0.95rem] leading-6 text-ink-700/78 md:text-base md:leading-7">
                  {description}
                </p>
              </StaggerItem>
              {actions ? (
                <StaggerItem>
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">{actions}</div>
                </StaggerItem>
              ) : null}
            </StaggerGroup>
          </div>
        </SectionTransition>
      </div>
    </section>
  );
}
