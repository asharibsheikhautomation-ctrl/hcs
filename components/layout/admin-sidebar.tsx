"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  MapPinned,
  Package2,
  Settings2,
  Tags,
} from "lucide-react";
import { logoutAdminAction } from "@/app/admin/actions";
import { LogoMark } from "@/components/common/logo-mark";
import { adminNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const iconByHref: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/categories": Boxes,
  "/admin/products": Package2,
  "/admin/deals": Tags,
  "/admin/orders": ClipboardList,
  "/admin/delivery-zones": MapPinned,
  "/admin/settings": Settings2,
};

export function AdminSidebar({ adminUsername }: { adminUsername: string }) {
  const pathname = usePathname();

  return (
    <aside className="luxe-panel rounded-[2rem] border-2 border-[var(--color-accent-dark)] p-5 lg:sticky lg:top-4 lg:min-h-[calc(100vh-2rem)]">
      <div className="border-b border-[rgba(224,123,0,0.26)] pb-5">
        <Link href="/admin" className="inline-flex">
          <LogoMark compact />
        </Link>
        <div className="mt-4 rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))] px-4 py-3 text-sm text-[rgba(255,248,231,0.84)]">
          Control room for products, deals, orders, delivery charges, and site
          messaging.
        </div>
        <div className="mt-4 rounded-2xl border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] px-4 py-3 text-sm text-ink-700">
          Signed in as <span className="font-semibold text-ink-950">{adminUsername}</span>
        </div>
      </div>

      <nav className="mt-5 space-y-1">
        {adminNavigation.map((item) => {
          const Icon = iconByHref[item.href] ?? LayoutDashboard;
          const isActive =
            item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-[var(--color-accent)] text-[var(--color-text-dark)] shadow-[0_12px_22px_rgba(224,123,0,0.20)]"
                  : "text-[var(--color-primary)] hover:bg-[var(--color-bg-light)] hover:text-[var(--color-primary-dark)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAdminAction} className="mt-6">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-text-dark)]"
        >
          Logout
        </button>
      </form>
    </aside>
  );
}
