import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AccentTone,
  DeliveryZone,
  DeliveryZoneArea,
} from "@/types/commerce";
import type { Database, Tables } from "@/types/supabase";

function mapAccentTone(value: string): AccentTone {
  if (value === "frost" || value === "ink") {
    return value;
  }

  return "gold";
}

export function mapDeliveryZoneAreaRow(
  area: Tables<"delivery_zone_areas">,
): DeliveryZoneArea {
  return {
    id: area.id,
    deliveryZoneId: area.zone_id ?? "",
    slug: (area.area_name ?? area.id)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    name: area.area_name?.trim() || "Unnamed area",
    deliveryCharge: Number(area.delivery_charge ?? 0),
    description: area.description ?? null,
    isActive: true,
  };
}

export function getActiveDeliveryZoneAreas(zone?: DeliveryZone | null) {
  return (zone?.areas ?? []).filter((area) => area.isActive);
}

export function getDefaultDeliveryZoneArea(zone?: DeliveryZone | null) {
  return getActiveDeliveryZoneAreas(zone)[0] ?? null;
}

export function mapDeliveryZoneRow(
  zone: Tables<"delivery_zones">,
  areas: Tables<"delivery_zone_areas">[] = [],
): DeliveryZone {
  const mappedAreas = areas
    .filter((area) => area.zone_id === zone.id)
    .map(mapDeliveryZoneAreaRow);
  const areaCharges = areas
    .filter(
      (area) =>
        area.zone_id === zone.id && area.delivery_charge !== null,
    )
    .map((area) => Number(area.delivery_charge));
  const startingDeliveryCharge =
    areaCharges.length > 0
      ? Math.min(...areaCharges)
      : Number(zone.delivery_charge);

  return {
    id: zone.id,
    slug: zone.slug,
    name: zone.name,
    description: zone.description ?? "",
    deliveryCharge: startingDeliveryCharge,
    freeDeliveryMinimum: Number(zone.free_delivery_minimum),
    estimatedDeliveryTime: zone.estimated_delivery_time ?? "",
    accentTone: mapAccentTone(zone.accent_tone),
    isActive: zone.is_active,
    sortOrder: zone.sort_order,
    areas: mappedAreas,
  };
}

export async function fetchActiveDeliveryZones(
  client?: SupabaseClient<Database>,
) {
  const supabase = client ?? (await createSupabaseServerClient());

  const [{ data: zones, error: zonesError }, { data: areas, error: areasError }] =
    await Promise.all([
      supabase
        .from("delivery_zones")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("delivery_zone_areas")
        .select("*")
        .order("area_name", { ascending: true }),
    ]);

  if (zonesError) {
    throw zonesError;
  }

  if (areasError) {
    throw areasError;
  }

  const areasByZone = new Map<string, Tables<"delivery_zone_areas">[]>();

  for (const area of areas ?? []) {
    if (!area.zone_id) {
      continue;
    }

    const zoneAreas = areasByZone.get(area.zone_id) ?? [];
    zoneAreas.push(area);
    areasByZone.set(area.zone_id, zoneAreas);
  }

  return (zones ?? []).map((zone) =>
    mapDeliveryZoneRow(zone, areasByZone.get(zone.id) ?? []),
  );
}
