import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  categories as demoCategories,
  products as demoProducts,
  siteSettings as demoSiteSettings,
} from "@/lib/demo-data";
import { fetchSiteSettings } from "@/lib/site-settings";
import type {
  AccentTone,
  Category,
  CategorySlug,
  Product,
  ProductStockStatus,
} from "@/types/commerce";
import type { Tables } from "@/types/supabase";

type SearchParamValue = string | string[] | undefined;

export type ProductSortOption =
  | "featured"
  | "price-low-to-high"
  | "price-high-to-low"
  | "newest";

export interface StoreProductFilters {
  query: string;
  category: "all" | CategorySlug;
  sort: ProductSortOption;
}

function normalizeSortValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function slugifyCategoryValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isCheeseCategoryValue(value: string | null | undefined) {
  return normalizeSortValue(value).includes("cheese");
}

export function isDairyCategoryValue(value: string | null | undefined) {
  return normalizeSortValue(value).includes("dairy");
}

function isFrozenCategoryValue(value: string | null | undefined) {
  return normalizeSortValue(value).includes("frozen");
}

function getCategoryDisplayPriority(category: Pick<Category, "slug" | "name" | "sortOrder">) {
  if (isCheeseCategoryValue(category.name) || isCheeseCategoryValue(category.slug)) {
    return 0;
  }

  if (
    isDairyCategoryValue(category.name) ||
    isDairyCategoryValue(category.slug)
  ) {
    return 1;
  }

  if (
    isFrozenCategoryValue(category.name) ||
    isFrozenCategoryValue(category.slug)
  ) {
    return 2;
  }

  return 3;
}

export function getProductCategoryPriority(
  product: Pick<Product, "categorySlug" | "categoryName">,
) {
  if (
    isCheeseCategoryValue(product.categoryName) ||
    isCheeseCategoryValue(product.categorySlug)
  ) {
    return 0;
  }

  if (
    isDairyCategoryValue(product.categoryName) ||
    isDairyCategoryValue(product.categorySlug)
  ) {
    return 1;
  }

  if (
    isFrozenCategoryValue(product.categoryName) ||
    isFrozenCategoryValue(product.categorySlug)
  ) {
    return 2;
  }

  return 3;
}

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function getSearchParamValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function mapAccentTone(value: string): AccentTone {
  if (value === "frost" || value === "ink") {
    return value;
  }

  return "gold";
}

function normalizeCategorySlug(value: string): CategorySlug {
  return slugifyCategoryValue(value);
}

function normalizeCategorySlugFromRow(row: Tables<"categories">): CategorySlug {
  return normalizeCategorySlug(row.slug || row.name) || row.id;
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function mapStockStatus(value: string): ProductStockStatus {
  if (value === "low_stock" || value === "out_of_stock") {
    return value;
  }

  return "in_stock";
}

function mapCategoryRow(row: Tables<"categories">): Category {
  return {
    id: row.id,
    slug: normalizeCategorySlugFromRow(row),
    name: row.name,
    description: row.description ?? "",
    imageUrl: row.image_url ?? null,
    accentTone: mapAccentTone(row.accent_tone),
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

function mapProductRow(
  row: Tables<"products">,
  category: Category | undefined,
): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    categorySlug: category?.slug ?? "uncategorized",
    categoryName: category?.name ?? "Uncategorized",
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    price: Number(row.sale_price ?? row.base_price),
    compareAtPrice:
      row.sale_price !== null
        ? Number(row.base_price)
        : row.compare_at_price === null
          ? null
          : Number(row.compare_at_price),
    unitLabel: row.unit_label,
    badge: row.badge ?? null,
    stockStatus: mapStockStatus(row.stock_status),
    isFeatured: row.is_featured,
    isFrozen: row.is_frozen,
    accentTone: mapAccentTone(row.accent_tone),
    imageUrl: row.image_url ?? null,
    galleryUrls: parseStringArray(row.gallery_urls),
    createdAt: row.created_at,
  };
}

async function fetchLiveStoreCatalog() {
  const supabase = await createSupabaseServerClient();
  const [{ data: categoryRows, error: categoriesError }, { data: productRows, error: productsError }, liveSettings] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      fetchSiteSettings(supabase).catch(() => null),
    ]);

  if (categoriesError) {
    throw categoriesError;
  }

  if (productsError) {
    throw productsError;
  }

  const categories = (categoryRows ?? []).map(mapCategoryRow);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const products = (productRows ?? []).map((product) =>
    mapProductRow(product, categoryById.get(product.category_id)),
  );

  return {
    categories,
    products,
    settings: liveSettings ?? demoSiteSettings,
  };
}

export async function fetchStoreCatalog() {
  if (!isSupabaseConfigured()) {
    return {
      categories: demoCategories,
      products: demoProducts,
      settings: demoSiteSettings,
    };
  }

  try {
    const liveCatalog = await fetchLiveStoreCatalog();

    return {
      categories:
        liveCatalog.categories.length > 0 ? liveCatalog.categories : demoCategories,
      products: liveCatalog.products.length > 0 ? liveCatalog.products : demoProducts,
      settings: liveCatalog.settings,
    };
  } catch (error) {
    console.error("Failed to load live store catalogue from Supabase.", error);

    return {
      categories: demoCategories,
      products: demoProducts,
      settings: demoSiteSettings,
    };
  }
}

export function sortStoreCategoriesForDisplay(categories: Category[]) {
  return [...categories].sort((left, right) => {
    return (
      getCategoryDisplayPriority(left) - getCategoryDisplayPriority(right) ||
      left.sortOrder - right.sortOrder ||
      left.name.localeCompare(right.name)
    );
  });
}

export function getPreferredProductsCategorySlug(categories: Category[]) {
  const sortedCategories = sortStoreCategoriesForDisplay(categories);
  return sortedCategories[0]?.slug ?? null;
}

export async function fetchStoreProductBySlug(slug: string) {
  const { categories, products, settings } = await fetchStoreCatalog();
  const product = products.find((entry) => entry.slug === slug) ?? null;

  return {
    product,
    categories,
    products,
    settings,
  };
}

export function parseStoreProductFilters(searchParams: {
  query?: SearchParamValue;
  category?: SearchParamValue;
  sort?: SearchParamValue;
}): StoreProductFilters {
  const query = getSearchParamValue(searchParams.query).trim();
  const categoryCandidate = getSearchParamValue(searchParams.category).trim();
  const sortCandidate = getSearchParamValue(searchParams.sort).trim();
  const sort: ProductSortOption =
    sortCandidate === "price-low-to-high" ||
    sortCandidate === "price-high-to-low" ||
    sortCandidate === "newest"
      ? sortCandidate
      : "featured";

  return {
    query,
    category:
      categoryCandidate === "all" || !categoryCandidate
        ? "all"
        : normalizeCategorySlug(categoryCandidate),
    sort,
  };
}

export function filterAndSortProducts(
  products: Product[],
  filters: StoreProductFilters,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    if (filters.category !== "all" && product.categorySlug !== filters.category) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      product.name,
      product.shortDescription,
      product.description,
      product.categoryName,
      product.badge ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  return filteredProducts.sort((left, right) => {
    switch (filters.sort) {
      case "price-low-to-high":
        return (
          left.price - right.price ||
          getProductCategoryPriority(left) - getProductCategoryPriority(right) ||
          left.name.localeCompare(right.name)
        );
      case "price-high-to-low":
        return (
          right.price - left.price ||
          getProductCategoryPriority(left) - getProductCategoryPriority(right) ||
          left.name.localeCompare(right.name)
        );
      case "newest":
        return (
          new Date(right.createdAt ?? 0).valueOf() -
            new Date(left.createdAt ?? 0).valueOf() ||
          getProductCategoryPriority(left) - getProductCategoryPriority(right) ||
          left.name.localeCompare(right.name)
        );
      case "featured":
      default:
        return (
          Number(right.isFeatured) - Number(left.isFeatured) ||
          getProductCategoryPriority(left) - getProductCategoryPriority(right) ||
          new Date(right.createdAt ?? 0).valueOf() - new Date(left.createdAt ?? 0).valueOf() ||
          left.name.localeCompare(right.name)
        );
    }
  });
}

export function getFeaturedProducts(products: Product[], limit = 3) {
  return [...products]
    .filter((product) => product.isFeatured)
    .sort(
      (left, right) =>
        getProductCategoryPriority(left) - getProductCategoryPriority(right) ||
        new Date(right.createdAt ?? 0).valueOf() -
          new Date(left.createdAt ?? 0).valueOf() ||
        left.name.localeCompare(right.name),
    )
    .slice(0, limit);
}

export function getHomepageFeaturedProducts(products: Product[], limit = 4) {
  const rankedProducts = [...products].sort(
    (left, right) =>
      getProductCategoryPriority(left) - getProductCategoryPriority(right) ||
      Number(right.isFeatured) - Number(left.isFeatured) ||
      new Date(right.createdAt ?? 0).valueOf() -
        new Date(left.createdAt ?? 0).valueOf() ||
      left.name.localeCompare(right.name),
  );
  const selectedProductIds = new Set<string>();
  const selectedProducts: Product[] = [];

  const addMatchingProducts = (predicate: (product: Product) => boolean) => {
    for (const product of rankedProducts) {
      if (!predicate(product) || selectedProductIds.has(product.id)) {
        continue;
      }

      selectedProducts.push(product);
      selectedProductIds.add(product.id);

      if (selectedProducts.length >= limit) {
        return;
      }
    }
  };

  addMatchingProducts(
    (product) =>
      product.isFeatured && getProductCategoryPriority(product) <= 1,
  );
  addMatchingProducts(
    (product) =>
      !product.isFeatured && getProductCategoryPriority(product) <= 1,
  );
  addMatchingProducts(
    (product) =>
      product.isFeatured && getProductCategoryPriority(product) > 1,
  );
  addMatchingProducts(
    (product) =>
      !product.isFeatured && getProductCategoryPriority(product) > 1,
  );

  return selectedProducts.slice(0, limit);
}

export function buildProductsHref(filters: Partial<StoreProductFilters>) {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set("query", filters.query.trim());
  }

  if (typeof filters.category !== "undefined") {
    params.set("category", filters.category);
  }

  if (filters.sort && filters.sort !== "featured") {
    params.set("sort", filters.sort);
  }

  const search = params.toString();

  return search ? `/products?${search}` : "/products";
}
