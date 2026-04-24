import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, MessageCircle, Package2, ShieldCheck, Snowflake, Sparkles } from "lucide-react";
import { FadeUp, SectionTransition } from "@/components/motion";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductFeatureStrip } from "@/components/store/product-feature-strip";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { buildPageMetadata, defaultKeywords } from "@/lib/seo";
import { fetchStoreProductBySlug } from "@/lib/store-catalog";
import { formatCurrency } from "@/lib/utils";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await fetchStoreProductBySlug(slug);

  if (!product) {
    return buildPageMetadata({
      title: "Product Not Found",
      description:
        "This product is no longer available in the Hyderabad Cheese Store catalogue.",
      path: `/products/${slug}`,
      keywords: [...defaultKeywords, "product not found"],
    });
  }

  return buildPageMetadata({
    title: product.name,
    description: product.shortDescription || product.description,
    path: `/products/${product.slug}`,
    keywords: [
      ...defaultKeywords,
      product.name,
      product.categoryName,
      product.isFrozen ? "frozen food" : "dairy products",
    ],
  });
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const { product, products, settings } = await fetchStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter(
      (entry) =>
        entry.id !== product.id &&
        (entry.categorySlug === product.categorySlug || entry.isFeatured),
    )
    .slice(0, 3);
  const detailHighlights = [
    {
      icon: product.isFrozen ? Snowflake : Sparkles,
      label: product.isFrozen ? "Cold kept" : "Fresh shelf",
      value: product.isFrozen ? "Frozen handled with care" : "Ready for everyday use",
    },
    {
      icon: Package2,
      label: "Pack size",
      value: product.unitLabel,
    },
    {
      icon: Clock3,
      label: "Delivery",
      value: "Area-based delivery rates",
    },
    {
      icon: product.compareAtPrice ? ShieldCheck : MessageCircle,
      label: product.compareAtPrice ? "Value" : "Order",
      value: product.compareAtPrice ? "Great everyday value" : "WhatsApp ordering ready",
    },
  ] as const;

  return (
    <>
      <section className="section-space pb-6 pt-12">
        <div className="container-main">
          <FadeUp>
            <Link
              href="/products"
              className="btn-base btn-secondary w-auto"
            >
              Back to products
            </Link>
          </FadeUp>

          <div className="mt-6 grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
            <SectionTransition>
              <ProductGallery product={product} />
            </SectionTransition>

            <SectionTransition className="space-y-6" delay={0.06}>
              <div className="page-sheen luxe-panel glass-ring rounded-[2rem] p-7 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cheese-500">
                    {product.categoryName}
                  </p>
                  {product.badge ? (
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-ink-700">
                      {product.badge}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 text-balance text-[2.8rem] font-semibold leading-[0.94] text-ink-950 sm:text-5xl xl:text-6xl">
                  {product.name}
                </h1>
                <p className="mt-4 line-clamp-2 max-w-2xl text-[0.98rem] leading-6 text-ink-700/78 sm:text-base sm:leading-7">
                  {product.shortDescription}
                </p>
                <ProductFeatureStrip product={product} className="mt-5" />

                <div className="mt-6 flex flex-wrap items-end gap-4">
                  <p className="text-4xl font-semibold text-ink-950">
                    {formatCurrency(product.price)}
                  </p>
                  {product.compareAtPrice ? (
                    <p className="pb-1 text-lg text-ink-700/48 line-through">
                      {formatCurrency(product.compareAtPrice)}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {detailHighlights.map((highlight) => {
                    const Icon = highlight.icon;

                    return (
                      <div
                        key={highlight.label}
                        className="rounded-[1.4rem] bg-surface-muted px-4 py-4"
                      >
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cheese-500 shadow-[0_10px_26px_rgba(216,170,24,0.14)]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink-700/50">
                          {highlight.label}
                        </p>
                        <p className="mt-2 text-base font-semibold text-ink-950 sm:text-lg">
                          {highlight.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 rounded-[1.7rem] bg-surface-muted p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-500">
                    Quick note
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink-700/78">
                    {product.description || product.shortDescription}
                  </p>
                </div>
              </div>

              <ProductPurchasePanel
                product={product}
                whatsappNumber={settings.whatsappNumber}
              />
            </SectionTransition>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="section-space border-t border-black/5 bg-white/55 pt-12">
          <div className="container-main">
            <SectionHeading
              eyebrow="Related Picks"
              title="You may also like."
              description="More from the same shelf."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  index={index}
                  whatsappNumber={settings.whatsappNumber}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
