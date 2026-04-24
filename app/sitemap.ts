import type { MetadataRoute } from "next";
import { deals as demoDeals, products as demoProducts } from "@/lib/demo-data";
import { getAbsoluteUrl } from "@/lib/seo";
import { createSupabaseStaticClient } from "@/lib/supabase/static";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const liveContent = isSupabaseConfigured()
    ? await (async () => {
        try {
          const supabase = createSupabaseStaticClient();
          const [{ data: products, error: productsError }, { data: deals, error: dealsError }] =
            await Promise.all([
              supabase
                .from("products")
                .select("slug, created_at, is_featured, is_active")
                .eq("is_active", true),
              supabase
                .from("deals")
                .select("starts_at, ends_at, is_active")
                .eq("is_active", true),
            ]);

          if (productsError) {
            throw productsError;
          }

          if (dealsError) {
            throw dealsError;
          }

          return {
            products:
              products?.map((product) => ({
                slug: product.slug,
                createdAt: product.created_at,
                isFeatured: product.is_featured,
              })) ?? [],
            deals:
              deals?.map((deal) => ({
                startsAt: deal.starts_at,
                endsAt: deal.ends_at,
              })) ?? [],
          };
        } catch (error) {
          console.error("Failed to load live sitemap data from Supabase.", error);
          return null;
        }
      })()
    : null;

  const products = liveContent?.products.length
    ? liveContent.products
    : demoProducts.map((product) => ({
        slug: product.slug,
        createdAt: product.createdAt ?? null,
        isFeatured: product.isFeatured,
      }));
  const deals = liveContent?.deals.length
    ? liveContent.deals
    : demoDeals.map((deal) => ({
        startsAt: deal.startsAt ?? null,
        endsAt: deal.endsAt ?? null,
      }));

  const latestDealTimestamp = deals
    .map((deal) => deal.endsAt ?? deal.startsAt ?? null)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).valueOf() - new Date(left).valueOf())[0];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getAbsoluteUrl("/products"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: getAbsoluteUrl("/deals"),
      lastModified: latestDealTimestamp ? new Date(latestDealTimestamp) : new Date(),
      changeFrequency: "daily",
      priority: 0.88,
    },
    {
      url: getAbsoluteUrl("/contact"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: getAbsoluteUrl("/checkout"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.66,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: getAbsoluteUrl(`/products/${product.slug}`),
    lastModified: product.createdAt ? new Date(product.createdAt) : new Date(),
    changeFrequency: "weekly",
    priority: product.isFeatured ? 0.86 : 0.78,
  }));

  return [...staticRoutes, ...productRoutes];
}
