import type { Metadata } from "next";
import {
  deliveryZones as fallbackDeliveryZones,
} from "@/lib/demo-data";
import { fetchStoreDeals } from "@/lib/deals";
import { fetchActiveDeliveryZones } from "@/lib/delivery-zones";
import { buildPageMetadata, defaultKeywords } from "@/lib/seo";
import { fetchResolvedSiteSettings } from "@/lib/site-settings";
import { fetchStoreCatalog } from "@/lib/store-catalog";
import { CinematicHomepage } from "@/components/store/cinematic-homepage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchResolvedSiteSettings();

  return buildPageMetadata({
    title: settings.siteName,
    description: settings.heroSubtitle,
    path: "/",
    siteName: settings.siteName,
    keywords: [...defaultKeywords, "luxury cheese store", "frozen food Hyderabad"],
  });
}

export default async function HomePage() {
  const [catalogResult, deliveryResult, dealsResult] = await Promise.all([
    fetchStoreCatalog()
      .then((catalog) => ({ catalog, error: null as string | null }))
      .catch((error) => ({
        catalog: null,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading catalogue data.",
      })),
    fetchActiveDeliveryZones()
      .then((zones) => ({ zones, error: null as string | null }))
      .catch((error) => ({
        zones: fallbackDeliveryZones,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading delivery data.",
      })),
    fetchStoreDeals({ featuredOnly: true })
      .then((deals) => ({ deals, error: null as string | null }))
      .catch((error) => ({
        deals: [],
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading deals data.",
      })),
  ]);

  const catalog = catalogResult.catalog;

  if (!catalog) {
    throw new Error(
      catalogResult.error ?? "Homepage data could not be loaded.",
    );
  }

  return (
    <CinematicHomepage
      categories={catalog.categories}
      products={catalog.products}
      deals={dealsResult.deals}
      deliveryZones={deliveryResult.zones}
      settings={catalog.settings}
    />
  );
}
