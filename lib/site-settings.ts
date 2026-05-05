import { cache, type CSSProperties } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteSettings as demoSiteSettings } from "@/lib/demo-data";
import type { SiteSettings } from "@/types/commerce";
import type { Database, Tables } from "@/types/supabase";

export const brandPalette = {
  primary: "#F5A800",
  primaryDark: "#111111",
  accent: "#C62828",
  accentDark: "#A61D1D",
  bgLight: "#FFF8E7",
  bgWhite: "#FFFFFF",
  textDark: "#111111",
  textWhite: "#FFFFFF",
} as const;

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
  void settings;

  return {
    "--color-primary": brandPalette.primary,
    "--color-primary-dark": brandPalette.primaryDark,
    "--color-accent": brandPalette.accent,
    "--color-accent-dark": brandPalette.accentDark,
    "--color-bg-light": brandPalette.bgLight,
    "--color-bg-white": brandPalette.bgWhite,
    "--color-text-dark": brandPalette.textDark,
    "--color-text-white": brandPalette.textWhite,
    "--background": brandPalette.bgLight,
    "--foreground": brandPalette.textDark,
    "--surface": brandPalette.bgWhite,
    "--surface-muted": "#FFF0C2",
    "--line-soft": "rgba(245, 168, 0, 0.35)",
    "--cheese-50": brandPalette.bgLight,
    "--cheese-100": "#FFF0B6",
    "--cheese-200": brandPalette.primary,
    "--cheese-300": "#FFF3C7",
    "--cheese-400": "#D89100",
    "--cheese-500": brandPalette.accent,
    "--ink-700": "#4B3B16",
    "--ink-950": brandPalette.textDark,
    "--shadow-lift":
      "0 12px 28px rgba(17, 17, 17, 0.1)",
    "--shadow-glass":
      "0 10px 24px rgba(17, 17, 17, 0.08)",
  } as CSSProperties;
}
