import type { Metadata } from "next";
import Link from "next/link";
import { SectionTransition } from "@/components/motion";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/store/product-card";
import { PageHero } from "@/components/store/page-hero";
import { StoreStatePanel } from "@/components/store/store-state-panel";
import { buildPageMetadata, defaultKeywords } from "@/lib/seo";
import {
  buildProductsHref,
  fetchStoreCatalog,
  filterAndSortProducts,
  getPreferredProductsCategorySlug,
  getFeaturedProducts,
  parseStoreProductFilters,
  sortStoreCategoriesForDisplay,
} from "@/lib/store-catalog";
import { cn } from "@/lib/utils";

interface ProductsPageProps {
  searchParams: Promise<{
    query?: string | string[];
    category?: string | string[];
    sort?: string | string[];
  }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Products",
  description:
    "Browse cheese, dairy, frozen food, and extras with search, category filters, and simple cart-first ordering.",
  path: "/products",
  keywords: [...defaultKeywords, "premium products", "dairy items", "frozen food"],
});

const sortOptions = [
  { value: "featured", label: "Featured first" },
  { value: "price-low-to-high", label: "Price low to high" },
  { value: "price-high-to-low", label: "Price high to low" },
  { value: "newest", label: "Newest first" },
] as const;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [resolvedSearchParams, catalogResult] = await Promise.all([
    searchParams,
    fetchStoreCatalog()
      .then((catalog) => ({ catalog, error: null as string | null }))
      .catch((error) => ({
        catalog: null,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading the product catalogue.",
      })),
  ]);

  if (!catalogResult.catalog) {
    return (
      <section className="section-space">
        <div className="container-main">
          <SectionTransition>
            <StoreStatePanel
              tone="error"
              eyebrow="Catalogue Error"
              title="Products could not be loaded."
              description={
                catalogResult.error ??
                "The catalogue is temporarily unavailable. Please retry shortly."
              }
            />
          </SectionTransition>
        </div>
      </section>
    );
  }

  const filters = parseStoreProductFilters(resolvedSearchParams);
  const { categories, products, settings } = catalogResult.catalog;
  const displayCategories = sortStoreCategoriesForDisplay(categories);
  const preferredCategorySlug = getPreferredProductsCategorySlug(displayCategories);
  const hasExplicitCategoryParam =
    typeof resolvedSearchParams.category !== "undefined";
  const effectiveFilters = {
    ...filters,
    category:
      hasExplicitCategoryParam || !preferredCategorySlug
        ? filters.category
        : preferredCategorySlug,
  };
  const featuredProducts = getFeaturedProducts(products, 3);
  const filteredProducts = filterAndSortProducts(products, effectiveFilters);
  const activeCategory =
    effectiveFilters.category === "all"
      ? null
      : displayCategories.find((category) => category.slug === effectiveFilters.category) ??
        null;
  const hasActiveFilters =
    Boolean(filters.query) ||
    (hasExplicitCategoryParam &&
      effectiveFilters.category !== (preferredCategorySlug ?? "all")) ||
    filters.sort !== "featured";

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Fresh products."
        description="Browse cheese, dairy, frozen food, and extras in one clean catalogue."
        actions={
          <>
            <Link
              href="/checkout"
              className="btn-base btn-primary"
            >
              Open Checkout
            </Link>
            <Link
              href="/deals"
              className="btn-base btn-secondary"
            >
              Explore Deals
            </Link>
          </>
        }
      />

      {featuredProducts.length > 0 ? (
        <section className="section-space pt-4">
          <div className="container-main">
            <SectionHeading
              eyebrow="Featured Selection"
              title={settings.productsSectionTitle || "Best sellers"}
              description="Top picks, ready to add."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-space border-y border-black/10 bg-cheese-300">
        <div className="container-main">
          <div className="grid gap-8 xl:grid-cols-[0.7fr_1.3fr] xl:items-end">
            <SectionHeading
              eyebrow="Catalogue Controls"
              title={
                activeCategory
                  ? activeCategory.name
                  : "Find what you need."
              }
              description={
                activeCategory
                  ? activeCategory.description
                  : "Search, filter, and sort in seconds."
              }
            />

            <form
              method="get"
              className="cheese-surface luxe-panel rounded-[2rem] p-5 md:p-6"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
                <label className="grid gap-2 text-sm font-medium text-ink-800">
                  <span>Search products</span>
                  <input
                    type="search"
                    name="query"
                    defaultValue={effectiveFilters.query}
                    placeholder="Search by name, category, or keyword"
                    className="field-input"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-ink-800">
                  <span>Sort by</span>
                  <select
                    name="sort"
                    defaultValue={effectiveFilters.sort}
                    className="field-select"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 lg:self-end">
                  {effectiveFilters.category !== "all" ? (
                    <input type="hidden" name="category" value={effectiveFilters.category} />
                  ) : null}
                  <button
                    type="submit"
                    className="btn-base btn-dark"
                  >
                    Apply
                  </button>
                  <Link
                    href="/products"
                    className="btn-base btn-secondary"
                  >
                    Reset
                  </Link>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href={buildProductsHref({ query: filters.query, sort: filters.sort, category: "all" })}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition-colors",
                effectiveFilters.category === "all"
                  ? "border-[var(--color-accent-dark)] bg-[var(--color-accent)] text-[var(--color-text-dark)]"
                  : "border-[rgba(224,123,0,0.26)] bg-[var(--color-bg-white)] text-[var(--color-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-primary-dark)]",
              )}
            >
              All products
            </Link>
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                href={buildProductsHref({
                  query: effectiveFilters.query,
                  sort: effectiveFilters.sort,
                  category: category.slug,
                })}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition-colors",
                  effectiveFilters.category === category.slug
                    ? "border-[var(--color-accent-dark)] bg-[var(--color-accent)] text-[var(--color-text-dark)]"
                    : "border-[rgba(224,123,0,0.26)] bg-[var(--color-bg-white)] text-[var(--color-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-primary-dark)]",
                )}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-500">
                Results
              </p>
              <h2 className="mt-2 text-4xl font-semibold text-ink-950">
                {filteredProducts.length} products
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-700/72">
                {hasActiveFilters
                  ? "Updated to your filters."
                  : "All live products."}
              </p>
            </div>

            {hasActiveFilters ? (
              <Link
                href="/products"
                className="text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-accent-dark)]"
              >
                Clear filters
              </Link>
            ) : null}
          </div>

          {filteredProducts.length === 0 ? (
            <SectionTransition className="mt-10">
              <StoreStatePanel
                eyebrow="No Matches"
                title="No products found."
                description="Try a new search or clear the filters."
                actions={
                  <Link href="/products" className="btn-base btn-primary">
                    Reset filters
                  </Link>
                }
              />
            </SectionTransition>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
