import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, MessageSquareText, Sparkles } from "lucide-react";
import { SectionTransition, StaggerGroup, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/common/section-heading";
import { DealCard } from "@/components/store/deal-card";
import { PageHero } from "@/components/store/page-hero";
import { fetchStoreDeals } from "@/lib/deals";
import { buildPageMetadata, defaultKeywords } from "@/lib/seo";
import { fetchResolvedSiteSettings } from "@/lib/site-settings";
import { createWhatsAppOrderUrl } from "@/lib/whatsapp";
import { StoreStatePanel } from "@/components/store/store-state-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Deals",
  description:
    "Explore active percentage discounts, fixed discounts, and bundle deals with included items, cart actions, and WhatsApp ordering.",
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
      title: "WhatsApp order",
      description: "Send any deal on WhatsApp.",
      icon: MessageSquareText,
    },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow="Deals"
        title={settings.dealsSectionTitle || "Live deals"}
        description="Clear savings, easy bundles, and fast WhatsApp ordering."
        actions={
          <>
            <Link
              href="/products"
              className="btn-base btn-primary"
            >
              Explore Products
            </Link>
            <Link
              href="/checkout"
              className="btn-base btn-secondary"
            >
              Go to Checkout
            </Link>
          </>
        }
      />

      <section className="container-main pb-8">
        <StaggerGroup className="grid gap-6 md:grid-cols-3" amount={0.18}>
          {dealFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <StaggerItem key={feature.title}>
                <article className="luxe-panel rounded-[1.8rem] p-5">
                  <Icon className="h-5 w-5 text-cheese-500" />
                  <h2 className="mt-4 text-2xl font-semibold text-ink-950">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-700/76">
                    {feature.description}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      <section className="section-space pt-6">
        <div className="container-main">
          <SectionHeading
            eyebrow="Live Offers"
            title="Active offers."
            description="Only current deals are shown here."
          />

          {deals.length === 0 ? (
            <SectionTransition className="mt-10">
              <StoreStatePanel
                eyebrow="No Active Deals"
                title="No live deals right now."
                description="Browse products or ask the store on WhatsApp."
                actions={
                  <>
                    <Link href="/products" className="btn-base btn-primary">
                      Browse products
                    </Link>
                    <a
                      href={createWhatsAppOrderUrl(
                        settings.whatsappNumber,
                        "Hello Hyderabad Cheese Store, please share current active deals and bundle recommendations.",
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-base btn-secondary"
                    >
                      Ask on WhatsApp
                    </a>
                  </>
                }
              />
            </SectionTransition>
          ) : (
            <div className="mt-10 grid gap-6 xl:grid-cols-2">
              {deals.map((deal, index) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  index={index}
                  whatsappNumber={settings.whatsappNumber}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
