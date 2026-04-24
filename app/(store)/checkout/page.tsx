import type { Metadata } from "next";
import { CheckoutScaffold } from "@/components/store/checkout-scaffold";
import { PageHero } from "@/components/store/page-hero";
import { deliveryZones, siteSettings } from "@/lib/demo-data";
import { fetchActiveDeliveryZones } from "@/lib/delivery-zones";
import { buildPageMetadata, defaultKeywords } from "@/lib/seo";
import { fetchResolvedSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout",
  description:
    "Submit a Hyderabad Cheese Store order with dynamic delivery pricing, area-based charges, Supabase order saving, and WhatsApp handoff.",
  path: "/checkout",
  keywords: [...defaultKeywords, "checkout", "delivery charges", "WhatsApp checkout"],
});

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getCheckoutData() {
  if (!isSupabaseConfigured()) {
    return {
      zones: deliveryZones,
      settings: siteSettings,
    };
  }

  try {
    const [zones, settings] = await Promise.all([
      fetchActiveDeliveryZones(),
      fetchResolvedSiteSettings(),
    ]);

    return {
      zones: zones.length > 0 ? zones : deliveryZones,
      settings,
    };
  } catch (error) {
    console.error("Failed to load live checkout data from Supabase.", error);

    return {
      zones: deliveryZones,
      settings: siteSettings,
    };
  }
}

export default async function CheckoutPage() {
  const { zones, settings } = await getCheckoutData();
  const callNumber = (settings.contactPhone || settings.whatsappNumber).replace(
    /[^\d+]/g,
    "",
  );

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Fast checkout."
        description="Choose your zone and area. Total updates instantly."
        actions={
          <>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-primary"
            >
              WhatsApp Help
            </a>
            <a
              href={`tel:${callNumber}`}
              className="btn-base btn-secondary"
            >
              Call the Store
            </a>
          </>
        }
      />
      <CheckoutScaffold zones={zones} settings={settings} />
    </>
  );
}
