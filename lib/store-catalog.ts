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
  if (value === "frozen-food" || value === "dairy-items") {
    return value;
  }

  return "extra-items";
}

function normalizeCategorySlugFromRow(row: Tables<"categories">): CategorySlug {
  const slug = row.slug.trim().toLowerCase();

  if (slug === "frozen-food" || slug === "dairy-items" || slug === "extra-items") {
    return slug;
  }

  const name = row.name.trim().toLowerCase();

  if (name.includes("frozen")) {
    return "frozen-food";
  }

  if (name.includes("dairy")) {
    return "dairy-items";
  }

  return "extra-items";
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
    categorySlug: category?.slug ?? "extra-items",
    categoryName: category?.name ?? "Extra Items",
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
        return left.price - right.price;
      case "price-high-to-low":
        return right.price - left.price;
      case "newest":
        return new Date(right.createdAt ?? 0).valueOf() - new Date(left.createdAt ?? 0).valueOf();
      case "featured":
      default:
        return (
          Number(right.isFeatured) - Number(left.isFeatured) ||
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
        new Date(right.createdAt ?? 0).valueOf() -
        new Date(left.createdAt ?? 0).valueOf(),
    )
    .slice(0, limit);
}

export function buildProductsHref(filters: Partial<StoreProductFilters>) {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set("query", filters.query.trim());
  }

  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (filters.sort && filters.sort !== "featured") {
    params.set("sort", filters.sort);
  }

  const search = params.toString();

  return search ? `/products?${search}` : "/products";
}
