import { cache, type CSSProperties } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteSettings as demoSiteSettings } from "@/lib/demo-data";
import type { SiteSettings } from "@/types/commerce";
import type { Database, Tables } from "@/types/supabase";

export function mapSiteSettingsRow(row: Tables<"site_settings">): SiteSettings {
  return {
    id: row.id,
    siteName: row.site_name,
    tagline: row.tagline,
    whatsappNumber: row.whatsapp_number,
    logoUrl: row.logo_url ?? "",
    heroKicker: row.hero_kicker,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    homepageStoryTitle: row.homepage_story_title,
    homepageStoryBody: row.homepage_story_body,
    productsSectionTitle: row.products_section_title ?? demoSiteSettings.productsSectionTitle,
    dealsSectionTitle: row.deals_section_title ?? demoSiteSettings.dealsSectionTitle,
    contactSectionTitle: row.contact_section_title ?? demoSiteSettings.contactSectionTitle,
    announcementBar: row.announcement_bar ?? "",
    contactEmail: row.contact_email ?? "",
    contactPhone: row.contact_phone ?? "",
    address: row.address ?? "",
    businessHours: row.business_hours ?? demoSiteSettings.businessHours,
    primaryColor: row.primary_color ?? demoSiteSettings.primaryColor,
    secondaryColor: row.secondary_color ?? demoSiteSettings.secondaryColor,
    backgroundColor: row.background_color ?? demoSiteSettings.backgroundColor,
    surfaceColor: row.surface_color ?? demoSiteSettings.surfaceColor,
    currencyCode: "PKR",
  };
}

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function fetchSiteSettings(
  client?: SupabaseClient<Database>,
) {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapSiteSettingsRow(data) : null;
}

export const fetchResolvedSiteSettings = cache(async () => {
  if (!isSupabaseConfigured()) {
    return demoSiteSettings;
  }

  try {
    const liveSettings = await fetchSiteSettings();
    return liveSettings ?? demoSiteSettings;
  } catch (error) {
    console.error("Failed to load live site settings from Supabase.", error);
    return demoSiteSettings;
  }
});

export function buildSiteThemeStyle(settings: SiteSettings): CSSProperties {
  return {
    "--background": settings.backgroundColor,
    "--foreground": settings.secondaryColor,
    "--surface": settings.surfaceColor,
    "--surface-muted": `color-mix(in srgb, ${settings.surfaceColor} 72%, ${settings.backgroundColor})`,
    "--line-soft": `color-mix(in srgb, ${settings.secondaryColor} 10%, white)`,
    "--cheese-50": `color-mix(in srgb, ${settings.primaryColor} 12%, white)`,
    "--cheese-100": `color-mix(in srgb, ${settings.primaryColor} 22%, white)`,
    "--cheese-200": `color-mix(in srgb, ${settings.primaryColor} 42%, white)`,
    "--cheese-300": `color-mix(in srgb, ${settings.primaryColor} 68%, white)`,
    "--cheese-400": settings.primaryColor,
    "--cheese-500": `color-mix(in srgb, ${settings.primaryColor} 82%, black)`,
    "--ink-700": `color-mix(in srgb, ${settings.secondaryColor} 84%, white)`,
    "--ink-950": settings.secondaryColor,
  } as CSSProperties;
}
