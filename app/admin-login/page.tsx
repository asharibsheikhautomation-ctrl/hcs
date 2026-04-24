import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/common/logo-mark";
import { getAdminSession, isAdminConfigured } from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [session, resolvedSearchParams] = await Promise.all([
    getAdminSession(),
    searchParams,
  ]);

  if (session) {
    redirect("/admin");
  }

  const nextPath = resolvedSearchParams.next || "/admin";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(215,161,40,0.15),_transparent_34%),_linear-gradient(180deg,_#f8f3ea_0%,_#efe8db_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full gap-8 rounded-[2.5rem] border border-black/5 bg-white/80 p-6 shadow-[0_24px_90px_rgba(17,17,17,0.08)] backdrop-blur md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <section className="rounded-[2rem] bg-ink-950 px-6 py-8 text-white md:px-8 md:py-10">
            <LogoMark compact />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.34em] text-cheese-300/80">
              Protected Admin
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Premium control room for Hyderabad Cheese Store.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Sign in to manage products, deals, delivery pricing, brand copy,
              and live order operations from one polished admin workspace.
            </p>
          </section>

          <section className="rounded-[2rem] bg-[#faf6ef] px-6 py-8 md:px-8 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cheese-500">
              Admin Access
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-ink-950">
              Unlock the dashboard
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-700/78">
              Use your protected admin credentials to continue.
            </p>

            {!isAdminConfigured() ? (
              <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-700">
                Add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to your env
                before using protected admin routes.
              </div>
            ) : (
              <div className="mt-6">
                <AdminLoginForm nextPath={nextPath} />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
