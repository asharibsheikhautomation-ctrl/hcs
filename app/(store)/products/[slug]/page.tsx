import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeUp, SectionTransition } from "@/components/motion";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductFeatureStrip } from "@/components/store/product-feature-strip";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import {
  getProductDetailPoints,
  getProductDisplayTitle,
  getProductQuantityLabel,
  getProductQuickNote,
} from "@/lib/product-copy";
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
  const { product, products } = await fetchStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const displayTitle = getProductDisplayTitle(product);
  const quantityLabel = getProductQuantityLabel(product);
  const quickNote = getProductQuickNote(product);
  const detailPoints = getProductDetailPoints(product);
  const relatedProducts = products
    .filter(
      (entry) =>
        entry.id !== product.id &&
        (entry.categorySlug === product.categorySlug || entry.isFeatured),
    )
    .slice(0, 3);

  return (
    <>
      <section className="section-space pb-6 pt-8 sm:pt-10 md:pt-12">
        <div className="container-main">
          <FadeUp>
            <Link
              href="/products"
              className="btn-base btn-secondary w-auto"
            >
              Back to products
            </Link>
          </FadeUp>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start xl:gap-8">
            <SectionTransition>
              <ProductGallery product={product} />
            </SectionTransition>

            <SectionTransition className="space-y-6" delay={0.06}>
              <div className="cheese-surface luxe-panel glass-ring rounded-[2rem] p-5 sm:p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cheese-500">
                    {product.categoryName}
                  </p>
                  {quantityLabel ? (
                    <span className="rounded-full border border-cheese-300 bg-cheese-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-ink-950">
                      {quantityLabel}
                    </span>
                  ) : null}
                  {product.badge ? (
                    <span className="rounded-full border border-black/10 bg-cheese-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-ink-700">
                      {product.badge}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 text-balance font-sans text-[2.2rem] font-black leading-[0.92] tracking-[-0.05em] text-ink-950 sm:text-[3rem] xl:text-[4.5rem]">
                  {displayTitle}
                </h1>
                <p className="mt-4 max-w-2xl text-[1rem] font-medium leading-7 text-ink-700/82 sm:text-[1.02rem]">
                  {quickNote}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-700/72 sm:text-base">
                  {product.description || product.shortDescription}
                </p>
                <ProductFeatureStrip product={product} className="mt-5" />

                <div className="mt-6 flex flex-wrap items-end gap-3 sm:gap-4">
                  <p className="text-[2.15rem] font-black text-ink-950 sm:text-5xl">
                    {formatCurrency(product.price)}
                  </p>
                  {product.compareAtPrice ? (
                    <p className="pb-1 text-lg text-ink-700/48 line-through">
                      {formatCurrency(product.compareAtPrice)}
                    </p>
                  ) : null}
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {detailPoints.map((point) => (
                    <div
                      key={`${product.id}-${point.label}`}
                      className="rounded-[1.4rem] border border-cheese-200/70 bg-cheese-50 px-4 py-4"
                    >
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-ink-700/54">
                        {point.label}
                      </p>
                      <p className="mt-3 text-base font-bold leading-6 text-ink-950 sm:text-[1.02rem]">
                        {point.value}
                      </p>
                    </div>
                  ))}
                </div>

              </div>

              <ProductPurchasePanel
                product={product}
              />
            </SectionTransition>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="section-space border-t border-black/10 bg-cheese-300 pt-12">
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
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
