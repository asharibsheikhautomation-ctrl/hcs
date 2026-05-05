import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, ShoppingBag, Sparkles } from "lucide-react";
import { PageHero } from "@/components/store/page-hero";
import { DealCard } from "@/components/store/deal-card";
import { StoreCartSummary } from "@/components/store/store-cart-summary";
import { StoreStatePanel } from "@/components/store/store-state-panel";
import { buildPageMetadata, defaultKeywords } from "@/lib/seo";
import { fetchStoreDeals } from "@/lib/deals";
import { fetchResolvedSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Deals",
  description:
    "Explore active bundle deals and discounts in a clean menu-style order layout.",
  path: "/deals",
  keywords: [...defaultKeywords, "bundle deals", "discount offers", "featured deals"],
});

export default async function DealsPage() {
  const [deals, settings] = await Promise.all([
    fetchStoreDeals().catch((error) => {
      console.error("Failed to load store deals.", error);
      return [];
    }),
    fetchResolvedSiteSettings(),
  ]);

  const dealFeatures = [
    {
      title: `${deals.length} live deals`,
      description: "Active offers only.",
      icon: Boxes,
    },
    {
      title: "Easy bundles",
      description: "Add full deals in one tap.",
      icon: Sparkles,
    },
    {
      title: "Checkout ready",
      description: "Save the order, then continue on WhatsApp.",
      icon: ShoppingBag,
    },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow="Deals"
        title={settings.dealsSectionTitle || "Live deals"}
        description="Clear savings, simple bundles, and fast cart-first ordering."
        actions={
          <>
            <Link href="/products" className="btn-base btn-primary">
              View Menu
            </Link>
            <Link href="/checkout" className="btn-base btn-dark">
              Go to Checkout
            </Link>
          </>
        }
      />

      <section className="section-space bg-[var(--color-bg-light)] pt-8">
        <div className="container-main">
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {dealFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.08)]"
                >
                  <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                  <h2 className="mt-4 text-2xl font-extrabold text-black">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[rgba(17,17,17,0.72)]">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
            <div>
              {deals.length === 0 ? (
                <StoreStatePanel
                  eyebrow="No Active Deals"
                  title="No live deals right now."
                  description="Browse products or return later for fresh offers."
                  actions={
                    <Link href="/products" className="btn-base btn-primary">
                      Browse products
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-4">
                  {deals.map((deal, index) => (
                    <DealCard key={deal.id} deal={deal} index={index} />
                  ))}
                </div>
              )}
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-28">
                <StoreCartSummary />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
