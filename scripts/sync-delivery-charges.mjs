import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DELIVERY_WINDOW = "3:30pm - 11:30pm";

const deliveryZones = [
  {
    slug: "hyderabad-city",
    name: "Hyderabad City",
    aliases: ["hyderabad-city", "hyderabad"],
    description: "Home delivery charges for Hyderabad city.",
    deliveryCharge: 50,
    freeDeliveryMinimum: 0,
    estimatedDeliveryTime: DELIVERY_WINDOW,
    sortOrder: 0,
    areas: [
      ["Latifabad Units 8, 7, 6, 11, 12", 50, "Latifabad"],
      ["Latifabad Units 5, 10, 3, 2", 70, "Latifabad"],
      ["Latifabad Unit 4", 100, "Latifabad"],
      ["Kohsar Phase 1, 2", 150, "Kohsar"],
      ["Daman e Kohsar", 150, "Kohsar"],
      ["Mir Hussainabad", 100, "Hyderabad"],
      ["G.O.R Colony", 100, "Hyderabad"],
      ["Auto Bhan Road", 70, "Hyderabad"],
      ["Labour Colony", 150, "Site Area"],
      ["Zeel Pak Society", 150, "Site Area"],
      ["Hali Road", 150, "Site Area"],
      ["Pakola Factory", 150, "Site Area"],
      ["Gul Center", 100, "City"],
      ["Garikhata", 120, "City"],
      ["Tilaq Chari", 120, "City"],
      ["Pakka Qila", 120, "City"],
      ["Saddar", 120, "City"],
      ["Tower / Liaqat Colony", 170, "City"],
      ["Phuleli", 170, "City"],
      ["Heerabad", 150, "City"],
      ["Qasimabad Phase 1", 120, "Qasimabad"],
      ["Qasimabad Phase 2", 150, "Qasimabad"],
      ["London Town", 150, "Qasimabad"],
      ["Alamdar Chowk", 150, "Qasimabad"],
      ["Wadhu Wah", 120, "Qasimabad"],
      ["Near Roopa Mari", 150, "Qasimabad"],
      ["Naqash Villas", 150, "Qasimabad"],
      ["Mother Village", 250, "Qasimabad"],
      ["Honda Place", 200, "Qasimabad"],
      ["Jamshoro", 300, "Outstation"],
      ["Kotri City", 150, "Outstation"],
      ["Kotri Site Area", 250, "Outstation"],
    ],
  },
  {
    slug: "karachi-city",
    name: "Karachi City",
    aliases: ["karachi-city", "karachi"],
    description: "Home delivery charges for Karachi city.",
    deliveryCharge: 200,
    freeDeliveryMinimum: 0,
    estimatedDeliveryTime: DELIVERY_WINDOW,
    sortOrder: 1,
    areas: [
      ["F.B Area", 200, "Karachi"],
      ["Gulshan e Iqbal", 200, "Karachi"],
      ["Gulistan e Johar", 200, "Karachi"],
      ["Gulshan e Maymar", 300, "Karachi"],
      ["Scheme 33", 300, "Karachi"],
      ["Bahadurabad", 300, "Karachi"],
      ["Tariq Road", 300, "Karachi"],
      ["Liaqatabad", 200, "Karachi"],
      ["Azizabad", 200, "Karachi"],
      ["New Karachi", 250, "Karachi"],
      ["North Karachi", 250, "Karachi"],
      ["Nazimabad", 300, "Karachi"],
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

    const areaPayload = zone.areas.map(([areaName, deliveryCharge, description], index) => ({
      zone_id: zoneId,
      area_name: areaName,
      delivery_charge: deliveryCharge,
      description,
      is_active: true,
      sort_order: index,
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
    .update({
      business_hours: `Daily ${DELIVERY_WINDOW}`,
    })
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
        skippedVariableArea:
          "Karachi other area charge as per distance was not inserted because checkout currently needs a fixed numeric charge.",
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
