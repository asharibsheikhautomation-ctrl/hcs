"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  MapPin,
  ShoppingBag,
  Snowflake,
  Sparkles,
} from "lucide-react";
import {
  FadeUp,
  ParallaxLayer,
  SectionTransition,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion";
import { useCart } from "@/components/providers/cart-provider";
import { ProductFeatureStrip } from "@/components/store/product-feature-strip";
import { CinematicScrollCard } from "@/components/store/cinematic-scroll-card";
import { DealVisual } from "@/components/store/deal-visual";
import { HeroProductStack } from "@/components/store/hero-product-stack";
import { ProductVisual } from "@/components/store/product-visual";
import {
  formatDealDiscount,
  formatDealValidity,
} from "@/lib/deal-utils";
import {
  createQuickDealOrderUrl,
  createQuickProductOrderUrl,
  createWhatsAppOrderUrl,
} from "@/lib/whatsapp";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  Category,
  Deal,
  DeliveryZone,
  Product,
  SiteSettings,
} from "@/types/commerce";

const toneSurfaceClassNames = {
  gold:
    "border-cheese-200/70 bg-[linear-gradient(145deg,rgba(255,249,223,0.95),rgba(255,255,255,0.94),rgba(246,221,125,0.9))]",
  frost:
    "border-frost-200/80 bg-[linear-gradient(145deg,rgba(245,251,255,0.98),rgba(255,255,255,0.94),rgba(189,223,255,0.72))]",
  ink: "border-black/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,247,247,0.92),rgba(229,229,229,0.75))]",
} as const;

const toneChipClassNames = {
  gold: "bg-cheese-100/85 text-cheese-500",
  frost: "bg-frost-100/85 text-mist-500",
  ink: "bg-black/5 text-ink-700",
} as const;

interface CinematicHomepageProps {
  categories: Category[];
  products: Product[];
  deals: Deal[];
  deliveryZones: DeliveryZone[];
  settings: SiteSettings;
}

export function CinematicHomepage({
  categories,
  products,
  deals,
  deliveryZones,
  settings,
}: CinematicHomepageProps) {
  const { addDeal, addProduct } = useCart();
  const [didAddFeaturedDeal, setDidAddFeaturedDeal] = useState(false);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.isFeatured).slice(0, 4),
    [products],
  );
  const featuredDeals = useMemo(() => deals.slice(0, 3), [deals]);
  const frozenProducts = useMemo(
    () => products.filter((product) => product.isFrozen).slice(0, 3),
    [products],
  );
  const dairyProducts = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.categorySlug === "dairy-items" ||
            product.accentTone === "gold",
        )
        .slice(0, 3),
    [products],
  );
  const featureDeal = featuredDeals[0] ?? null;
  const secondaryDeals = featuredDeals.slice(1);
  const leadProduct = featuredProducts[0] ?? products[0] ?? null;
  const supportProducts = featuredProducts.slice(1, 4);
  const warmCategories = categories.slice(0, 3);
  const deliveryHighlights = deliveryZones.slice(0, 3);
  const whatsappShowroomHref = createWhatsAppOrderUrl(
    settings.whatsappNumber,
    "Hello Hyderabad Cheese Store, please recommend a few best sellers.",
  );
  const heroShortcuts = [
    {
      href: "/products?category=frozen-food",
      icon: <Snowflake className="h-4 w-4" />,
      label: "Frozen",
    },
    {
      href: "/products?category=dairy-items",
      icon: <Sparkles className="h-4 w-4" />,
      label: "Dairy",
    },
    {
      href: "/deals",
      icon: <ShoppingBag className="h-4 w-4" />,
      label: "Deals",
    },
  ] as const;

  function handleAddFeaturedDeal() {
    if (!featureDeal) {
      return;
    }

    addDeal(featureDeal, 1);
    setDidAddFeaturedDeal(true);

    window.setTimeout(() => {
      setDidAddFeaturedDeal(false);
    }, 1600);
  }

  return (
    <div className="cheese-storefront overflow-x-clip">
      <section className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden md:min-h-[calc(100vh-5rem)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/vid1bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,221,125,0.32),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(189,223,255,0.26),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.6),rgba(251,248,242,0.6))]" />
        <div className="cinematic-vignette absolute inset-0 opacity-80" />
        <div className="cinematic-grid absolute inset-0 opacity-50" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(17,17,17,0.08))]" />

        <div className="container-main relative z-10 flex min-h-[calc(100svh-4.5rem)] items-center py-10 sm:py-12 md:min-h-[calc(100vh-5rem)] md:py-16 lg:py-20">
          <div className="grid w-full gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <FadeUp className="relative max-w-2xl" distance={24}>
              <p className="inline-flex items-center gap-2 rounded-full border border-cheese-200/80 bg-white/80 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cheese-500 shadow-[0_18px_35px_rgba(216,170,24,0.12)] backdrop-blur-xl sm:text-[0.72rem] sm:tracking-[0.32em]">
                <Sparkles className="h-3.5 w-3.5" />
                {settings.heroKicker}
              </p>
              <h1 className="mt-5 max-w-3xl text-balance text-[2.7rem] font-semibold leading-[0.92] text-ink-950 sm:text-[4rem] md:mt-6 md:text-7xl xl:text-[6.1rem]">
                {settings.heroTitle}
              </h1>
              <p className="mt-5 max-w-md text-[0.92rem] leading-6 text-ink-700/70 md:mt-6 md:line-clamp-2 md:text-[0.98rem]">
                {settings.heroSubtitle}
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-row">
                <Link
                  href="/products"
                  className="btn-base btn-dark cheese-cta cheese-cta-dark px-7 py-4 uppercase tracking-[0.22em] sm:w-auto"
                >
                  Shop Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappShowroomHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-secondary cheese-cta px-7 py-4 uppercase tracking-[0.22em] sm:w-auto"
                >
                  Order on WhatsApp
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              <StaggerGroup className="mt-6 flex flex-wrap gap-3 md:mt-8" amount={0.16}>
                <StaggerItem>
                  <Link href={heroShortcuts[0].href} className="chip-link">
                    {heroShortcuts[0].icon}
                    {heroShortcuts[0].label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link href={heroShortcuts[1].href} className="chip-link">
                    {heroShortcuts[1].icon}
                    {heroShortcuts[1].label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </StaggerItem>
                <StaggerItem>
                  <Link href={heroShortcuts[2].href} className="chip-link">
                    {heroShortcuts[2].icon}
                    {heroShortcuts[2].label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </StaggerItem>
              </StaggerGroup>
            </FadeUp>

            <HeroProductStack
              leadProduct={leadProduct}
              supportProducts={supportProducts}
            />
          </div>
        </div>
      </section>

      <section className="relative section-space">
        <div className="container-main">
          <SectionTransition className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <CinematicScrollCard
              className="luxe-panel page-sheen cheese-melt-card rounded-[2.2rem] p-6 sm:p-8 lg:rounded-[2.6rem] lg:p-10"
              tone="gold"
              direction="left"
              intensity={1.15}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-500">
                Our Story
              </p>
              <h2 className="mt-4 text-[2.4rem] font-semibold leading-[0.94] text-ink-950 md:text-5xl">
                {settings.homepageStoryTitle}
              </h2>
              <p className="mt-5 line-clamp-2 max-w-md text-[0.92rem] leading-6 text-ink-700/70 md:text-[0.98rem]">
                {settings.homepageStoryBody}
              </p>
            </CinematicScrollCard>

            <div className="grid gap-6 md:grid-cols-2">
              <StoryPanel
                title="Visual depth"
                body="Warm gold, cool frost, clear shelves."
                kicker="Visual language"
                tone="gold"
              />
              <StoryPanel
                title="Fast ordering"
                body="Clear pricing. Quick checkout. Easy WhatsApp."
                kicker="Operational polish"
                tone="frost"
              />
            </div>
          </SectionTransition>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-main">
          <SectionHeading
            kicker="Featured Categories"
            title="Frozen, dairy, extras."
            body="Three shelves. Tap and shop."
          />

          <StaggerGroup className="mt-10 grid gap-5 lg:grid-cols-3" amount={0.18}>
            {warmCategories.map((category, index) => (
              <StaggerItem key={category.id} distance={24}>
                <CinematicScrollCard
                  as="article"
                  className={cn(
                    "card-hover cheese-melt-card group relative overflow-hidden rounded-[2rem] border p-5 shadow-lift sm:rounded-[2.3rem] sm:p-7",
                    toneSurfaceClassNames[category.accentTone],
                  )}
                  tone={
                    category.accentTone === "ink"
                      ? "neutral"
                      : category.accentTone
                  }
                  direction={
                    index % 3 === 0 ? "left" : index % 3 === 1 ? "center" : "right"
                  }
                  intensity={0.92}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_32%)] opacity-80" />
                  <div className="relative flex h-full flex-col">
                    <span
                      className={cn(
                        "inline-flex w-fit rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em]",
                        toneChipClassNames[category.accentTone],
                      )}
                    >
                      {category.slug.replaceAll("-", " ")}
                    </span>
                    <h3 className="mt-5 text-[2.1rem] font-semibold leading-[0.96] text-ink-950 md:text-4xl">
                      {category.name}
                    </h3>
                    <CategoryGlyph
                      slug={category.slug}
                      accentTone={category.accentTone}
                    />
                    <p className="mt-4 line-clamp-1 flex-1 text-[0.92rem] leading-6 text-ink-700/68">
                      {category.description}
                    </p>
                    <div className="mt-10 flex items-center justify-between border-t border-black/6 pt-5">
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-700/45">
                        Explore
                      </span>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="card-hover-link inline-flex items-center gap-2 text-sm font-semibold text-ink-950"
                      >
                        View selection
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </CinematicScrollCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="relative section-space overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(17,17,17,0.03),rgba(255,255,255,0))]" />
        <div className="container-main relative">
          <SectionHeading
            kicker="Featured Products"
            title={
              settings.productsSectionTitle || "Best sellers"
            }
            body="Big visuals. Quick actions."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            {leadProduct ? (
              <SectionTransition>
                <article className="luxe-panel glass-ring cheese-melt-card relative overflow-hidden rounded-[2.2rem] p-5 sm:p-6 lg:rounded-[2.6rem] lg:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,221,125,0.22),transparent_34%)]" />
                  <div className="relative">
                    <ParallaxLayer speed={10}>
                      <ProductVisual
                        product={leadProduct}
                        priority
                        sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 48vw, 100vw"
                        quality={75}
                        className="card-hover-image min-h-[16rem] rounded-[2.2rem] lg:min-h-[27rem]"
                      />
                    </ParallaxLayer>
                  </div>
                  <div className="relative mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-500">
                        Signature pick
                      </p>
                      <h3 className="mt-3 text-[2.1rem] font-semibold leading-[0.96] text-ink-950 md:text-4xl">
                        {leadProduct.name}
                      </h3>
                      <p className="mt-4 line-clamp-1 text-[0.92rem] leading-6 text-ink-700/68">
                        {leadProduct.description}
                      </p>
                      <ProductFeatureStrip
                        product={leadProduct}
                        compact
                        className="mt-4"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => addProduct(leadProduct, 1)}
                        className="btn-base btn-primary w-auto"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Add to cart
                      </button>
                      <a
                        href={createQuickProductOrderUrl(
                          settings.whatsappNumber,
                          leadProduct,
                          1,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-base btn-secondary w-auto"
                      >
                        WhatsApp order
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              </SectionTransition>
            ) : null}

            <StaggerGroup className="grid gap-5" amount={0.18}>
              {supportProducts.map((product, index) => (
                <StaggerItem key={product.id} distance={24}>
                  <article className="luxe-panel group rounded-[1.75rem] p-4 sm:rounded-[2rem] sm:p-5">
                    <div className="grid gap-5 md:grid-cols-[0.92fr_1.08fr] md:items-center">
                      <ProductVisual
                        product={product}
                        sizes="(min-width: 1280px) 18vw, (min-width: 768px) 36vw, 100vw"
                        className="card-hover-image min-h-[12rem] rounded-[1.75rem]"
                        variant={index + 1}
                      />
                      <div>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em]",
                            toneChipClassNames[product.accentTone],
                          )}
                        >
                          {product.categoryName}
                        </span>
                        <h3 className="mt-4 text-[2rem] font-semibold leading-[0.96] text-ink-950">
                          {product.name}
                        </h3>
                        <ProductFeatureStrip
                          product={product}
                          compact
                          className="mt-4"
                        />
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-semibold text-ink-950">
                              {formatCurrency(product.price)}
                            </span>
                            {product.compareAtPrice ? (
                              <span className="text-sm text-ink-700/48 line-through">
                                {formatCurrency(product.compareAtPrice)}
                              </span>
                            ) : null}
                          </div>
                          <Link
                            href={`/products/${product.slug}`}
                            className="card-hover-link inline-flex items-center gap-2 text-sm font-semibold text-ink-950"
                          >
                            View detail
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-main">
          <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
            <SpotlightPanel
              kicker="Frozen Spotlight"
              title="Frozen picks."
              body="Cold favourites. Fast checkout."
              tone="frost"
              icon={<Snowflake className="h-4 w-4" />}
              products={frozenProducts}
              actionHref="/products?category=frozen-food"
              actionLabel="Browse frozen food"
            />

            <SectionTransition>
              <div className="frozen-panel cheese-melt-card rounded-[2.2rem] p-5 sm:p-7 lg:rounded-[2.6rem] lg:p-8">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-mist-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  Delivery
                </p>
                <h3 className="mt-5 text-4xl font-semibold text-ink-950">
                  Fast delivery areas.
                </h3>
                <p className="mt-4 max-w-sm text-[0.92rem] leading-6 text-ink-700/68">
                  Clear rates. Fast zones.
                </p>

                <StaggerGroup className="mt-8 grid gap-4" amount={0.16}>
                  {deliveryHighlights.map((zone) => (
                    <StaggerItem key={zone.id}>
                      <div className="rounded-[1.8rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_40px_rgba(93,127,152,0.12)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-mist-500">
                              {zone.name}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-700/72">
                              {zone.description}
                            </p>
                          </div>
                          <div className="rounded-full bg-frost-100 px-4 py-2 text-sm font-semibold text-mist-500">
                            From {formatCurrency(zone.deliveryCharge)}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-ink-700/55">
                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5" />
                            {zone.estimatedDeliveryTime}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            {zone.areas.length} areas
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            </SectionTransition>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-main">
          <SpotlightPanel
            kicker="Dairy Spotlight"
            title="Dairy picks."
            body="Creamy staples with clean pricing."
            tone="gold"
            icon={<Sparkles className="h-4 w-4" />}
            products={dairyProducts}
            actionHref="/products?category=dairy-items"
            actionLabel="Browse dairy items"
            reverse
          />
        </div>
      </section>

      {featureDeal ? (
        <section className="section-space pt-0">
          <div className="container-main">
            <SectionTransition>
              <div className="relative overflow-hidden rounded-[2.2rem] border border-black/8 bg-ink-950 px-5 py-8 text-white shadow-[0_35px_120px_rgba(17,17,17,0.22)] sm:px-7 md:rounded-[2.8rem] md:px-10 lg:px-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,221,125,0.24),transparent_32%),radial-gradient(circle_at_86%_24%,rgba(189,223,255,0.18),transparent_24%)]" />
                <div aria-hidden="true" className="cheese-dark-drip" />
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

                <div className="relative space-y-8">
                  <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-200">
                        {settings.dealsSectionTitle || "Featured Deals"}
                      </p>
                      <h2 className="mt-4 text-4xl font-semibold leading-none text-white md:text-5xl">
                        Featured deals.
                      </h2>
                      <p className="mt-5 max-w-md text-[0.92rem] leading-6 text-white/68 md:text-[0.98rem]">
                        Clear bundles. Quick add.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:flex sm:flex-wrap lg:justify-end">
                      <button
                        type="button"
                        onClick={handleAddFeaturedDeal}
                        className="btn-base btn-primary cheese-cta px-6 py-4 uppercase tracking-[0.22em] sm:w-auto"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {didAddFeaturedDeal ? "Deal Added" : "Add Deal"}
                      </button>
                      <a
                        href={createQuickDealOrderUrl(
                          settings.whatsappNumber,
                          featureDeal,
                          1,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-base btn-ghost border-white/14 bg-white/8 px-6 py-4 uppercase tracking-[0.22em] text-white backdrop-blur-xl sm:w-auto"
                      >
                        WhatsApp Deal
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                      <Link
                        href="/deals"
                        className="btn-base btn-ghost border-white/14 px-6 py-4 uppercase tracking-[0.22em] text-white sm:w-auto"
                      >
                        All Deals
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="rounded-[2.2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
                      <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-cheese-200/18 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cheese-100">
                              {formatDealDiscount(featureDeal)}
                            </span>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/72">
                              {formatDealValidity(featureDeal)}
                            </span>
                            {featureDeal.isFeatured ? (
                              <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/72">
                                Homepage hero
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-5">
                            <h3 className="text-4xl font-semibold text-white">
                              {featureDeal.name}
                            </h3>
                            <p className="mt-4 line-clamp-2 max-w-2xl text-[0.92rem] leading-6 text-white/72">
                              {featureDeal.headline}
                            </p>
                          </div>

                          <div className="mt-5 inline-flex rounded-[1.6rem] bg-white px-5 py-4 text-ink-950">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-700/55">
                                Featured price
                              </p>
                              <p className="mt-2 text-3xl font-semibold">
                                {formatCurrency(featureDeal.dealPrice)}
                              </p>
                              {featureDeal.originalTotal > featureDeal.dealPrice ? (
                                <p className="mt-1 text-sm text-ink-700/52 line-through">
                                  {formatCurrency(featureDeal.originalTotal)}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-6 grid gap-3 md:grid-cols-2">
                            {featureDeal.includedItems.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                className="rounded-[1.5rem] border border-white/10 bg-white/6 px-4 py-4"
                              >
                                <p className="text-sm font-semibold text-white">
                                  {item.productName}
                                </p>
                                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/58">
                                  {item.quantity} x {item.unitLabel ?? "item"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <DealVisual
                          deal={featureDeal}
                          className="min-h-[18rem] bg-white/8"
                          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 44vw, 100vw"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {secondaryDeals.length > 0 ? (
                        secondaryDeals.map((deal) => (
                          <div
                            key={deal.id}
                            className="rounded-[1.9rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
                          >
                            <DealVisual
                              deal={deal}
                              compact
                              className="mb-4 h-36 bg-white/8"
                              sizes="(min-width: 1280px) 16vw, 100vw"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cheese-100">
                                {formatDealDiscount(deal)}
                              </span>
                              <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/68">
                                {formatDealValidity(deal)}
                              </span>
                            </div>
                            <h3 className="mt-4 text-2xl font-semibold text-white">
                              {deal.name}
                            </h3>
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/68">
                              {deal.headline}
                            </p>
                            <div className="mt-5 flex items-end justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                                  Deal price
                                </p>
                                <p className="mt-2 text-xl font-semibold text-white">
                                  {formatCurrency(deal.dealPrice)}
                                </p>
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cheese-100">
                                {deal.includedItems.length} items
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1.9rem] border border-dashed border-white/12 bg-white/4 p-5 text-sm leading-6 text-white/64">
                          More featured deals appear here.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SectionTransition>
          </div>
        </section>
      ) : null}

      <section className="section-space pt-0">
        <div className="container-main">
          <SectionTransition>
            <div className="relative overflow-hidden rounded-[2.2rem] border border-cheese-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,249,223,0.94),rgba(246,221,125,0.92))] p-6 shadow-[0_32px_110px_rgba(216,170,24,0.16)] sm:p-8 lg:rounded-[2.8rem] lg:p-12">
            <div aria-hidden="true" className="cheese-light-drip" />
            <div className="absolute right-[-4rem] top-[-4rem] h-48 w-48 rounded-full bg-cheese-200/55 blur-3xl" />
            <div className="absolute bottom-[-4rem] left-[-4rem] h-52 w-52 rounded-full bg-frost-200/35 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-500">
                  {settings.contactSectionTitle || "WhatsApp Concierge"}
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-none text-ink-950 md:text-5xl">
                  Order on WhatsApp.
                </h2>
                <p className="mt-5 max-w-sm text-[0.92rem] leading-6 text-ink-700/68 md:text-[0.98rem]">
                  Send your list. We handle the rest.
                </p>
              </div>

              <a
                href={whatsappShowroomHref}
                target="_blank"
                rel="noreferrer"
                className="btn-base btn-dark cheese-cta cheese-cta-dark px-7 py-4 uppercase tracking-[0.22em] sm:w-auto"
              >
                Start WhatsApp
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            </div>
          </SectionTransition>
        </div>
      </section>
    </div>
  );
}

function CategoryGlyph({
  slug,
  accentTone,
}: {
  slug: string;
  accentTone: "gold" | "frost" | "ink";
}) {
  const Icon =
    slug === "frozen-food"
      ? Snowflake
      : slug === "dairy-items"
        ? Sparkles
        : ShoppingBag;

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-4 top-4 inline-flex h-16 w-16 items-center justify-center rounded-[1.7rem] border border-white/70 shadow-[0_18px_45px_rgba(17,17,17,0.08)] sm:h-20 sm:w-20",
        accentTone === "frost"
          ? "bg-white/76 text-mist-500"
          : accentTone === "gold"
            ? "bg-white/76 text-cheese-500"
            : "bg-white/76 text-ink-700",
      )}
    >
      <Icon className="h-7 w-7 sm:h-9 sm:w-9" />
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <StaggerGroup className="max-w-3xl" amount={0.18}>
      <StaggerItem>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cheese-500 sm:text-xs sm:tracking-[0.32em]">
          {kicker}
        </p>
      </StaggerItem>
      <StaggerItem>
        <h2 className="mt-4 text-balance text-[2.35rem] font-semibold leading-[0.94] text-ink-950 md:text-5xl">
          {title}
        </h2>
      </StaggerItem>
      <StaggerItem>
        <p className="mt-4 line-clamp-2 max-w-lg text-[0.92rem] leading-6 text-ink-700/68 md:text-[0.98rem]">{body}</p>
      </StaggerItem>
    </StaggerGroup>
  );
}

function StoryPanel({
  kicker,
  title,
  body,
  tone,
}: {
  kicker: string;
  title: string;
  body: string;
  tone: "gold" | "frost";
}) {
  return (
    <CinematicScrollCard
      as="article"
      className={cn(
        "card-hover rounded-[2.2rem] border p-7 shadow-lift",
        tone === "gold"
          ? "border-cheese-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,249,223,0.88))]"
          : "border-frost-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,251,255,0.94),rgba(225,242,255,0.82))]",
      )}
      tone={tone === "gold" ? "gold" : "frost"}
      direction={tone === "gold" ? "left" : "right"}
      intensity={0.88}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.32em]",
          tone === "gold" ? "text-cheese-500" : "text-mist-500",
        )}
      >
        {kicker}
      </p>
      <h3 className="mt-4 text-[2rem] font-semibold leading-[0.96] text-ink-950">{title}</h3>
      <p className="mt-3 line-clamp-2 text-[0.92rem] leading-6 text-ink-700/68">{body}</p>
    </CinematicScrollCard>
  );
}

function SpotlightPanel({
  kicker,
  title,
  body,
  tone,
  icon,
  products,
  actionHref,
  actionLabel,
  reverse = false,
}: {
  kicker: string;
  title: string;
  body: string;
  tone: "gold" | "frost";
  icon: ReactNode;
  products: Product[];
  actionHref: string;
  actionLabel: string;
  reverse?: boolean;
}) {
  return (
    <SectionTransition
      className={cn(
        "grid gap-6 rounded-[2.2rem] p-5 sm:p-7 lg:grid-cols-[0.98fr_1.02fr] lg:rounded-[2.8rem] lg:p-8",
        reverse && "lg:grid-cols-[1.02fr_0.98fr]",
        tone === "gold"
          ? "luxe-panel"
          : "frozen-panel border border-frost-200/70",
      )}
    >
      <div className={cn("flex flex-col", reverse && "lg:order-2")}>
        <p
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em]",
            tone === "gold"
              ? "bg-cheese-100/90 text-cheese-500"
              : "bg-white/80 text-mist-500",
          )}
        >
          {icon}
          {kicker}
        </p>
        <h2 className="mt-5 text-[2.35rem] font-semibold leading-[0.94] text-ink-950 md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-[0.92rem] leading-6 text-ink-700/68 md:text-[0.98rem]">
          {body}
        </p>
        <div className="mt-8">
          <Link
            href={actionHref}
            className="btn-base btn-dark px-6 py-4 uppercase tracking-[0.22em] sm:w-auto"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <StaggerGroup className={cn("grid gap-4", reverse && "lg:order-1")} amount={0.16}>
        {products.map((product, index) => (
          <StaggerItem key={product.id}>
            <div
              className={cn(
                "card-hover group grid gap-4 rounded-[1.9rem] border p-4 md:grid-cols-[0.8fr_1.2fr] md:items-center",
                tone === "gold"
                  ? "border-cheese-200/70 bg-white/82"
                  : "border-white/70 bg-white/78",
              )}
            >
              <ProductVisual
                product={product}
                sizes="(min-width: 1280px) 16vw, (min-width: 768px) 28vw, 100vw"
                className="card-hover-image min-h-[10rem] rounded-[1.5rem]"
                variant={index}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-700/55">
                  {product.categoryName}
                </p>
                <h3 className="mt-3 text-[2rem] font-semibold leading-[0.96] text-ink-950">
                  {product.name}
                </h3>
                <p className="mt-3 line-clamp-1 text-[0.92rem] leading-6 text-ink-700/68">
                  {product.shortDescription}
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xl font-semibold text-ink-950">
                    {formatCurrency(product.price)}
                  </span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="card-hover-link inline-flex items-center gap-2 text-sm font-semibold text-ink-950"
                  >
                    Detail
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </SectionTransition>
  );
}
