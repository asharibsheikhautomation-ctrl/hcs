import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/store/page-hero";
import { ProductCard } from "@/components/store/product-card";
import { StoreCartSummary } from "@/components/store/store-cart-summary";
import { StoreStatePanel } from "@/components/store/store-state-panel";
import { buildPageMetadata, defaultKeywords } from "@/lib/seo";
import {
  buildProductsHref,
  fetchStoreCatalog,
  filterAndSortProducts,
  getPreferredProductsCategorySlug,
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
  title: "Menu",
  description:
    "Browse cheese, dairy, frozen food, and extras in a clean menu layout with cart-first ordering.",
  path: "/products",
  keywords: [...defaultKeywords, "menu", "dairy items", "frozen food"],
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
          <StoreStatePanel
            tone="error"
            eyebrow="Catalogue Error"
            title="Products could not be loaded."
            description={
              catalogResult.error ??
              "The catalogue is temporarily unavailable. Please retry shortly."
            }
          />
        </div>
      </section>
    );
  }

  const filters = parseStoreProductFilters(resolvedSearchParams);
  const { categories, products } = catalogResult.catalog;
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
        eyebrow="Menu"
        title="Order from the menu"
        description="Cheese and dairy come first, then frozen food and extras. Add items to cart and continue to checkout."
        actions={
          <>
            <Link href="/checkout" className="btn-base btn-primary">
              Go to Checkout
            </Link>
            <Link href="/deals" className="btn-base btn-dark">
              View Deals
            </Link>
          </>
        }
      />

      <section className="section-space bg-[var(--color-bg-light)] pt-8">
        <div className="container-main">
          <div className="grid gap-6 xl:grid-cols-[15rem_minmax(0,1fr)_21rem] xl:items-start">
            <aside className="hidden xl:block">
              <div className="sticky top-28 rounded-[1.6rem] border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Categories
                </p>
                <div className="mt-4 grid gap-2">
                  <Link
                    href={buildProductsHref({
                      query: effectiveFilters.query,
                      sort: effectiveFilters.sort,
                      category: "all",
                    })}
                    className={cn(
                      "rounded-[1rem] px-4 py-3 text-sm font-bold transition-colors",
                      effectiveFilters.category === "all"
                        ? "bg-[var(--color-primary)] text-black"
                        : "bg-[var(--color-bg-light)] text-black hover:bg-[var(--color-primary)]",
                    )}
                  >
                    All Products
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
                        "rounded-[1rem] px-4 py-3 text-sm font-bold transition-colors",
                        effectiveFilters.category === category.slug
                          ? "bg-[var(--color-primary)] text-black"
                          : "bg-[var(--color-bg-light)] text-black hover:bg-[var(--color-primary)]",
                      )}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <form
                method="get"
                className="rounded-[1.6rem] border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.08)] sm:p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
                  <label className="grid gap-2 text-sm font-medium text-black">
                    <span>Search products</span>
                    <input
                      type="search"
                      name="query"
                      defaultValue={effectiveFilters.query}
                      placeholder="Search products"
                      className="field-input"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-black">
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
                      <input
                        type="hidden"
                        name="category"
                        value={effectiveFilters.category}
                      />
                    ) : null}
                    <button type="submit" className="btn-base btn-primary">
                      Apply
                    </button>
                    <Link href="/products" className="btn-base btn-secondary">
                      Reset
                    </Link>
                  </div>
                </div>
              </form>

              <div className="-mx-4 mt-4 overflow-x-auto px-4 xl:hidden">
                <div className="flex min-w-max gap-2 pb-2">
                  <Link
                    href={buildProductsHref({
                      query: effectiveFilters.query,
                      sort: effectiveFilters.sort,
                      category: "all",
                    })}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors",
                      effectiveFilters.category === "all"
                        ? "bg-[var(--color-primary)] text-black"
                        : "bg-white text-black",
                    )}
                  >
                    All
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
                        "rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors",
                        effectiveFilters.category === category.slug
                          ? "bg-[var(--color-primary)] text-black"
                          : "bg-white text-black",
                      )}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                    {activeCategory ? activeCategory.name : "Full Menu"}
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold text-black sm:text-4xl">
                    {filteredProducts.length} items
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[rgba(17,17,17,0.72)]">
                    {activeCategory?.description ||
                      "Browse, add to cart, and continue to checkout."}
                  </p>
                </div>

                {hasActiveFilters ? (
                  <Link
                    href="/products"
                    className="text-sm font-bold text-[var(--color-accent)]"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="mt-6">
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
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
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
