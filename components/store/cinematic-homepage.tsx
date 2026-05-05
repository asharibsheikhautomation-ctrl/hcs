"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { FadeUp, SectionTransition, StaggerGroup, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/common/section-heading";
import { HeroProductStack } from "@/components/store/hero-product-stack";
import { ProductCard } from "@/components/store/product-card";
import { DealCard } from "@/components/store/deal-card";
import {
  getHomepageFeaturedProducts,
  sortStoreCategoriesForDisplay,
} from "@/lib/store-catalog-utils";
import { createWhatsAppOrderUrl } from "@/lib/whatsapp";
import type {
  Category,
  Deal,
  DeliveryZone,
  Product,
  SiteSettings,
} from "@/types/commerce";

interface CinematicHomepageProps {
  categories: Category[];
  products: Product[];
  deals: Deal[];
  deliveryZones: DeliveryZone[];
  settings: SiteSettings;
}

const infoCards = [
  {
    title: "WHY CHOOSE US",
    body: [
      "Premium Quality Products",
      "Wholesale & Retail Available",
      "Affordable Prices",
      "Fast & Reliable Delivery",
      "Trusted by Restaurants",
    ],
  },
  {
    title: "DELIVERY AREAS",
    body: [
      "We provide fast delivery in:",
      "Hyderabad",
      "Kotri",
      "Jamshoro",
      "Karachi",
    ],
  },
  {
    title: "CONTACT US",
    body: [
      "WhatsApp: 0335-7750066",
      "Location: Hyderabad",
      "For bulk orders & daily supply, contact us now!",
    ],
  },
  {
    title: "ABOUT US",
    body: [
      "Hyderabad Cheese Store is a trusted supplier of cheese, dairy, and fast food ingredients.",
      "We provide high-quality products to restaurants, cafes, and home customers at competitive prices.",
      "Our goal is to deliver freshness, quality, and convenience to your kitchen.",
    ],
  },
] as const;

export function CinematicHomepage({
  categories,
  products,
  deals,
  deliveryZones,
  settings,
}: CinematicHomepageProps) {
  const featuredProducts = getHomepageFeaturedProducts(products, 6);
  const featuredDeals = deals.slice(0, 4);
  const displayCategories = sortStoreCategoriesForDisplay(categories);
  const whatsappHref = createWhatsAppOrderUrl(
    settings.whatsappNumber,
    "Hello Hyderabad Cheese Store, I would like to place an order.",
  );
  const deliveryAreaNames =
    deliveryZones.length > 0
      ? deliveryZones.slice(0, 4).map((zone) => zone.name)
      : ["Hyderabad", "Kotri", "Jamshoro", "Karachi"];

  const menuCards = infoCards.map((card) => {
    if (card.title !== "DELIVERY AREAS" && card.title !== "CONTACT US") {
      return card;
    }

    if (card.title === "DELIVERY AREAS") {
      return {
        ...card,
        body: ["We provide fast delivery in:", ...deliveryAreaNames],
      };
    }

    return {
      ...card,
      body: [
        `WhatsApp: ${settings.contactPhone || "0335-7750066"}`,
        `Location: ${settings.address || "Hyderabad"}`,
        "For bulk orders & daily supply, contact us now!",
      ],
    };
  });

  return (
    <div className="overflow-x-hidden bg-[var(--color-bg-light)]">
      <section className="border-b-4 border-[var(--color-accent)] bg-[var(--color-primary)]">
        <div className="container-main py-10 sm:py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <FadeUp className="max-w-2xl" distance={18}>
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-accent)] bg-white px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-[var(--color-text-dark)]">
                <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                Cold chain, curated beautifully.
              </span>

              <h1 className="mt-5 text-balance text-[2.65rem] font-extrabold leading-[0.92] text-black sm:text-[3.6rem] lg:text-[4.7rem]">
                Premium Cheese & Fast Food Supplies
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-[rgba(17,17,17,0.84)]">
                High-quality dairy & frozen products for restaurants and home use.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[rgba(17,17,17,0.72)]">
                Luxury provisions for a sharper, colder, richer Hyderabad pantry.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {["Fresh Quality", "Best Prices", "Fast Delivery"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/products" className="btn-base btn-primary sm:w-auto">
                  View Menu
                </Link>
                <Link href="/checkout" className="btn-base btn-dark sm:w-auto">
                  Order Now
                </Link>
              </div>
            </FadeUp>

            <SectionTransition delay={0.05}>
              <HeroProductStack
                leadProduct={featuredProducts[0] ?? null}
                supportProducts={featuredProducts.slice(1, 4)}
              />
            </SectionTransition>
          </div>
        </div>
      </section>

      <section className="section-space pt-10">
        <div className="container-main">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Best Sellers"
              title={settings.productsSectionTitle || "Popular picks"}
              description="Cheese and dairy stay first, followed by frozen items and extras."
            />
            <Link href="/products" className="hidden text-sm font-bold text-[var(--color-accent)] md:block">
              View full menu
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-main">
          <SectionHeading
            eyebrow="Categories"
            title="Browse by shelf"
            description="Use categories to jump straight to cheese, frozen food, or everyday extras."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {displayCategories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-[1.5rem] border-2 border-[var(--color-accent-dark)] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  {category.slug.replaceAll("-", " ")}
                </p>
                <h3 className="mt-3 text-2xl font-extrabold text-black">
                  {category.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[rgba(17,17,17,0.74)]">
                  {category.description || "Fresh stock for restaurants and home kitchens."}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space border-y border-black/10 bg-white pt-10">
        <div className="container-main">
          <SectionHeading
            eyebrow="Deals"
            title={settings.dealsSectionTitle || "Live deals"}
            description="Add deal bundles to cart and continue to checkout without changing your current order flow."
          />

          {featuredDeals.length > 0 ? (
            <div className="mt-8 grid gap-4 xl:grid-cols-2">
              {featuredDeals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border-2 border-dashed border-[var(--color-accent-dark)] bg-[var(--color-bg-light)] p-6 text-sm leading-6 text-[rgba(17,17,17,0.72)]">
              No active deals right now. Browse the menu or contact us on WhatsApp for bulk order pricing.
            </div>
          )}
        </div>
      </section>

      <section className="section-space pt-10">
        <div className="container-main">
          <SectionHeading
            eyebrow="Store Info"
            title="Order fast, buy smart"
            description="Simple information cards for delivery, contact, and business support."
          />

          <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4" amount={0.12}>
            {menuCards.map((card) => (
              <StaggerItem key={card.title}>
                <article className="flex h-full flex-col rounded-[1.5rem] border-2 border-[var(--color-accent-dark)] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                    {card.title}
                  </p>
                  <div className="mt-4 space-y-2 text-sm leading-6 text-[rgba(17,17,17,0.8)]">
                    {card.body.map((line) => (
                      <p key={`${card.title}-${line}`}>{line}</p>
                    ))}
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="pb-16 pt-4">
        <div className="container-main">
          <div className="rounded-[1.75rem] border-2 border-[var(--color-accent-dark)] bg-black px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  Quick Order Help
                </p>
                <h2 className="mt-3 text-[2rem] font-extrabold leading-[0.95] text-white sm:text-4xl">
                  Need bulk supply or daily kitchen stock?
                </h2>
                <p className="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.78)]">
                  Use WhatsApp for bulk orders, stock checks, and delivery questions. Checkout and order saving stay unchanged.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-primary sm:w-auto"
                >
                  WhatsApp Help
                </a>
                <Link href="/contact" className="btn-base btn-secondary sm:w-auto">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
