import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DELIVERY_WINDOW = "3:30pm - 11:30pm";
const SITE_SETTINGS_PAYLOAD = {
  tagline: "Premium Cheese & Fast Food Supplies",
  whatsapp_number: "923357750066",
  business_hours: "Daily, 3:30 PM to 11:30 PM",
  hero_kicker: "Hyderabad Cheese Store",
  hero_title: "Premium Cheese & Fast Food Supplies",
  hero_subtitle:
    "High-quality dairy & frozen products for restaurants and home use.",
  homepage_story_title: "Trusted supply for daily kitchens.",
  homepage_story_body:
    "Fresh cheese, dairy, frozen items, and simple ordering in one place.",
  products_section_title: "Best Sellers",
  deals_section_title: "Live Deals",
  contact_section_title: "Contact Us",
  announcement_bar:
    "Fresh quality, best prices, and fast delivery across major delivery zones.",
  contact_phone: "0335-7750066",
  address: "Latifabad, Hyderabad, Sindh",
};

const deliveryZones = [
  {
    slug: "hyderabad",
    name: "Hyderabad",
    aliases: ["hyderabad-city", "hyderabad", "latifabad", "qasimabad"],
    description: "Fast delivery for central Hyderabad routes.",
    deliveryCharge: 80,
    freeDeliveryMinimum: 0,
    estimatedDeliveryTime: DELIVERY_WINDOW,
    sortOrder: 0,
    areas: [
      ["City", 80, "Central Hyderabad"],
      ["Latifabad", 100, "Latifabad routes"],
      ["Qasimabad", 120, "Qasimabad routes"],
      ["Hirabad", 100, "Hirabad routes"],
    ],
  },
  {
    slug: "karachi",
    name: "Karachi",
    aliases: ["karachi-city", "karachi"],
    description: "Longer-distance delivery for Karachi routes.",
    deliveryCharge: 200,
    freeDeliveryMinimum: 0,
    estimatedDeliveryTime: DELIVERY_WINDOW,
    sortOrder: 1,
    areas: [
      ["DHA", 220, "Karachi DHA"],
      ["Gulshan", 200, "Gulshan area"],
      ["Saddar", 180, "Karachi Saddar"],
      ["North Nazimabad", 220, "North Nazimabad"],
    ],
  },
  {
    slug: "jamshoro",
    name: "Jamshoro",
    aliases: ["jamshoro"],
    description: "Simple coverage for Jamshoro routes.",
    deliveryCharge: 150,
    freeDeliveryMinimum: 0,
    estimatedDeliveryTime: DELIVERY_WINDOW,
    sortOrder: 2,
    areas: [
      ["Jamshoro City", 150, "Jamshoro city routes"],
      ["University Area", 170, "University area"],
      ["Railway Phatak", 190, "Railway Phatak"],
    ],
  },
  {
    slug: "kotri",
    name: "Kotri",
    aliases: ["kotri", "kotri-city"],
    description: "Quick coverage for Kotri and nearby industrial routes.",
    deliveryCharge: 120,
    freeDeliveryMinimum: 0,
    estimatedDeliveryTime: DELIVERY_WINDOW,
    sortOrder: 3,
    areas: [
      ["Kotri City", 120, "Kotri city routes"],
      ["SITE Area", 150, "Kotri site area"],
      ["Railway Station Area", 130, "Railway station area"],
    ],
  },
];

function loadEnvFile(filename) {
  const fullPath = path.resolve(process.cwd(), filename);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function toLegacyDescription(description) {
  return description.includes("Legacy zone")
    ? description
    : `${description}${description ? " " : ""}Legacy zone kept for old order history.`;
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function syncDeliveryCharges() {
  const [{ data: existingZones, error: zonesError }, { data: orders, error: ordersError }] =
    await Promise.all([
      supabase.from("delivery_zones").select("*"),
      supabase.from("orders").select("delivery_zone_id"),
    ]);

  if (zonesError) {
    throw zonesError;
  }

  if (ordersError) {
    throw ordersError;
  }

  const referencedZoneIds = new Set(
    (orders ?? [])
      .map((order) => order.delivery_zone_id)
      .filter((value) => typeof value === "string" && value.length > 0),
  );

  const managedZoneIds = new Set();
  const zoneIdsBySlug = new Map();

  for (const zone of deliveryZones) {
    const existingZone =
      existingZones?.find(
        (candidate) =>
          candidate.slug === zone.slug ||
          zone.aliases.includes(candidate.slug) ||
          candidate.name.toLowerCase() === zone.name.toLowerCase(),
      ) ?? null;

    const payload = {
      name: zone.name,
      slug: zone.slug,
      description: `${zone.description} Delivery timings ${DELIVERY_WINDOW}.`,
      delivery_charge: zone.deliveryCharge,
      free_delivery_minimum: zone.freeDeliveryMinimum,
      estimated_delivery_time: zone.estimatedDeliveryTime,
      sort_order: zone.sortOrder,
      is_active: true,
      accent_tone: "gold",
    };

    if (existingZone) {
      const { error } = await supabase
        .from("delivery_zones")
        .update(payload)
        .eq("id", existingZone.id);

      if (error) {
        throw error;
      }

      managedZoneIds.add(existingZone.id);
      zoneIdsBySlug.set(zone.slug, existingZone.id);
    } else {
      const { data, error } = await supabase
        .from("delivery_zones")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      managedZoneIds.add(data.id);
      zoneIdsBySlug.set(zone.slug, data.id);
    }
  }

  for (const existingZone of existingZones ?? []) {
    if (managedZoneIds.has(existingZone.id)) {
      continue;
    }

    if (referencedZoneIds.has(existingZone.id)) {
      const { error } = await supabase
        .from("delivery_zones")
        .update({
          is_active: false,
          description: toLegacyDescription(existingZone.description ?? ""),
        })
        .eq("id", existingZone.id);

      if (error) {
        throw error;
      }

      continue;
    }

    const { error: deleteAreasError } = await supabase
      .from("delivery_zone_areas")
      .delete()
      .eq("zone_id", existingZone.id);

    if (deleteAreasError) {
      throw deleteAreasError;
    }

    const { error: deleteZoneError } = await supabase
      .from("delivery_zones")
      .delete()
      .eq("id", existingZone.id);

    if (deleteZoneError) {
      throw deleteZoneError;
    }
  }

  for (const zone of deliveryZones) {
    const zoneId = zoneIdsBySlug.get(zone.slug);

    if (!zoneId) {
      throw new Error(`Zone id not found for ${zone.name}.`);
    }

    const { error: deleteAreasError } = await supabase
      .from("delivery_zone_areas")
      .delete()
      .eq("zone_id", zoneId);

    if (deleteAreasError) {
      throw deleteAreasError;
    }

    const areaPayload = zone.areas.map(([areaName, deliveryCharge, description]) => ({
      zone_id: zoneId,
      area_name: areaName,
      delivery_charge: deliveryCharge,
      description,
    }));

    const { error: insertAreasError } = await supabase
      .from("delivery_zone_areas")
      .insert(areaPayload);

    if (insertAreasError) {
      throw insertAreasError;
    }
  }

  const { error: settingsError } = await supabase
    .from("site_settings")
    .update(SITE_SETTINGS_PAYLOAD)
    .eq("id", 1);

  if (settingsError) {
    throw settingsError;
  }

  console.log(
    JSON.stringify(
      {
        syncedZones: deliveryZones.length,
        syncedAreas: deliveryZones.reduce(
          (total, zone) => total + zone.areas.length,
          0,
        ),
        deliveryWindow: DELIVERY_WINDOW,
      },
      null,
      2,
    ),
  );
}

syncDeliveryCharges().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
