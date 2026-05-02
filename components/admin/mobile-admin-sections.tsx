"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileAdminLinkItem {
  id: string;
  label: string;
}

interface MobileAdminContextValue {
  openId: string;
  setOpenId: (id: string) => void;
}

const MobileAdminContext = createContext<MobileAdminContextValue | null>(null);

function useMobileAdminContext() {
  const value = useContext(MobileAdminContext);

  if (!value) {
    throw new Error("MobileAdminSection must be used inside MobileAdminSections.");
  }

  return value;
}

interface MobileAdminSectionsProps {
  links: MobileAdminLinkItem[];
  defaultOpenId: string;
  children: ReactNode;
}

export function MobileAdminSections({
  links,
  defaultOpenId,
  children,
}: MobileAdminSectionsProps) {
  const initialOpenId = useMemo(() => {
    if (links.some((link) => link.id === defaultOpenId)) {
      return defaultOpenId;
    }

    return links[0]?.id ?? "";
  }, [defaultOpenId, links]);
  const [openId, setOpenId] = useState(initialOpenId);

  return (
    <MobileAdminContext.Provider value={{ openId, setOpenId }}>
      <div className="space-y-4">
        <div className="md:hidden">
          <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2">
              {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  setOpenId(link.id);
                  document.getElementById(link.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className={cn(
                    "rounded-full border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors",
                    openId === link.id
                      ? "border-[var(--color-accent-dark)] bg-[var(--color-accent)] text-[var(--color-text-dark)]"
                      : "border-[rgba(224,123,0,0.22)] bg-[var(--color-bg-white)] text-[var(--color-primary)]",
                  )}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {children}
      </div>
    </MobileAdminContext.Provider>
  );
}

interface MobileAdminSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function MobileAdminSection({
  id,
  title,
  description,
  children,
}: MobileAdminSectionProps) {
  const { openId, setOpenId } = useMobileAdminContext();
  const isOpen = openId === id;

  return (
    <section id={id} className="space-y-3">
      <button
        type="button"
        onClick={() => setOpenId(id)}
        className="flex w-full items-center justify-between rounded-[1.6rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] px-5 py-4 text-left shadow-[0_12px_24px_rgba(92,16,16,0.12)] md:hidden"
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-primary)]">
            Admin
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink-950">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-700/78">
            {description}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-ink-700 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        id={`${id}-content`}
        className={cn(isOpen ? "block" : "hidden", "md:block")}
      >
        {children}
      </div>
    </section>
  );
}
