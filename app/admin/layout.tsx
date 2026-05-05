import type { ReactNode } from "react";
import { logoutAdminAction } from "@/app/admin/actions";
import { LogoMark } from "@/components/common/logo-mark";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession("/admin");

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <div className="container-main space-y-4 py-4 md:py-6">
        <header className="rounded-[2rem] border border-black/10 bg-black p-6 text-white shadow-[0_10px_24px_rgba(17,17,17,0.14)] md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <LogoMark className="[&_p]:!text-white [&_p:last-child]:!text-[rgba(255,255,255,0.76)]" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary)]">
                Hyderabad Cheese Store Admin
              </p>
              <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">
                Simple store control screen
              </h1>
              <p className="mt-3 text-base leading-8 text-white/78">
                Everything important lives on one page: quick overview,
                products, deals, orders, and core settings.
              </p>
              <p className="mt-4 text-sm font-semibold text-white/86">
                Signed in as {session.username}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap xl:max-w-[32rem] xl:justify-end">
              <div className="grid gap-3 md:hidden">
                <form action={logoutAdminAction}>
                  <button type="submit" className="btn-base btn-primary w-full">
                    Logout
                  </button>
                </form>
              </div>
              <div className="hidden md:flex md:flex-row md:flex-wrap md:gap-3 xl:justify-end">
              <a href="#overview" className="btn-base btn-secondary w-auto">
                Overview
              </a>
              <a href="#products" className="btn-base btn-secondary w-auto">
                Products
              </a>
              <a href="#deals" className="btn-base btn-secondary w-auto">
                Deals
              </a>
              <a href="#orders" className="btn-base btn-secondary w-auto">
                Orders
              </a>
              <a href="#settings" className="btn-base btn-secondary w-auto">
                Settings
              </a>
              <form action={logoutAdminAction}>
                <button type="submit" className="btn-base btn-primary w-auto">
                  Logout
                </button>
              </form>
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
