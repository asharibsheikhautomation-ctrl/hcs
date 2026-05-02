import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isOrderStatus,
  sanitizeAdminOrderSearchTerm,
} from "@/lib/admin-orders";
import { siteSettings as demoSiteSettings } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminCategory,
  AdminDashboardData,
  AdminDeal,
  AdminOrderDetail,
  AdminOrderFilters,
  AdminOrderLineItem,
  AdminDeliveryZone,
  AdminDeliveryZoneArea,
  AdminOption,
  AdminOrderSummary,
  AdminProduct,
  AdminSiteSettings,
} from "@/types/admin";
import type {
  DealIncludedItem,
  OrderItemProductSnapshot,
  OrderItemType,
  OrderStatus,
} from "@/types/commerce";
import type { Database, Json, Tables } from "@/types/supabase";

function parseStringArray(value: Json | null | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function isJsonRecord(
  value: Json | null | undefined,
): value is Record<string, Json | undefined> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getJsonString(value: Json | undefined) {
  return typeof value === "string" ? value : null;
}

function getJsonNumber(value: Json | undefined) {
  return typeof value === "number" ? value : null;
}

function parseIncludedItems(value: Json | undefined): DealIncludedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!isJsonRecord(entry)) {
      return [];
    }

    const id = getJsonString(entry.id);
    const dealId = getJsonString(entry.dealId);
    const productId = getJsonString(entry.productId);
    const productSlug = getJsonString(entry.productSlug);
    const productName = getJsonString(entry.productName);
    const quantity = getJsonNumber(entry.quantity);
    const unitPrice = getJsonNumber(entry.unitPrice);
    const sourceValue = getJsonString(entry.source);

    if (
      !id ||
      !dealId ||
      !productName ||
      quantity === null ||
      unitPrice === null
    ) {
      return [];
    }

    return [
      {
        id,
        dealId,
        productId,
        productSlug,
        productName,
        quantity,
        unitPrice,
        unitLabel: getJsonString(entry.unitLabel),
        imageUrl: getJsonString(entry.imageUrl),
        source:
          sourceValue === "custom"
            ? "custom"
            : productId
              ? "product"
              : "custom",
      },
    ];
  });
}

function resolveOrderStatus(value: string): OrderStatus {
  return isOrderStatus(value) ? value : "New";
}

function resolveOrderItemType(value: string): OrderItemType {
  return value === "deal" ? "deal" : "product";
}

function mapAdminCategoryRow(
  row: Tables<"categories">,
  productCount: number,
): AdminCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    sortOrder: row.sort_order,
    isActive: row.is_active,
    productCount,
  };
}

function mapAdminProductRow(
  row: Tables<"products">,
  categoryName: string,
): AdminProduct {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    regularPrice: Number(row.base_price),
    salePrice: row.sale_price === null ? null : Number(row.sale_price),
    sku: row.sku ?? "",
    imageUrl: row.image_url ?? "",
    galleryUrls: parseStringArray(row.gallery_urls),
    stockQuantity: row.stock_quantity,
    unitLabel: row.unit_label,
    isFeatured: row.is_featured,
    isActive: row.is_active,
  };
}

function mapAdminDealRow(
  row: Tables<"deals">,
  linkedProductIds: string[],
  linkedProductNames: string[],
  customItems: AdminDeal["customItems"],
): AdminDeal {
  return {
    id: row.id,
    title: row.name,
    slug: row.slug,
    description: row.description ?? "",
    bannerImageUrl: row.banner_image_url ?? "",
    discountType:
      row.discount_type === "fixed"
        ? "fixed"
        : row.discount_type === "bundle"
          ? "bundle"
          : "percentage",
    discountValue: Number(row.discount_value ?? 0),
    startsAt: row.starts_at ?? "",
    endsAt: row.ends_at ?? "",
    isActive: row.is_active,
    isFeatured: row.is_featured,
    linkedProductIds,
    linkedProductNames,
    customItems,
  };
}

function mapAdminZoneAreaRow(
  row: Tables<"delivery_zone_areas">,
): AdminDeliveryZoneArea {
  return {
    id: row.id,
    zoneId: row.zone_id ?? "",
    areaName: row.area_name ?? "",
    deliveryCharge: Number(row.delivery_charge ?? 0),
    description: row.description ?? "",
  };
}

function mapAdminZoneRow(
  row: Tables<"delivery_zones">,
  areas: AdminDeliveryZoneArea[],
): AdminDeliveryZone {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    deliveryCharge: Number(row.delivery_charge),
    freeDeliveryMinimum: Number(row.free_delivery_minimum),
    estimatedDeliveryTime: row.estimated_delivery_time ?? "",
    isActive: row.is_active,
    sortOrder: row.sort_order,
    areas,
  };
}

function mapAdminOrderRow(row: Tables<"orders">): AdminOrderSummary {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    note: row.note ?? "",
    deliveryLabel: row.delivery_zone_name,
    deliveryCharge: Number(row.delivery_charge),
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: resolveOrderStatus(row.status),
    whatsappSent: row.whatsapp_sent,
    createdAt: row.created_at,
  };
}

function mapOrderItemProductSnapshot(
  value: Json,
  row: Tables<"order_items">,
): OrderItemProductSnapshot {
  const snapshot = isJsonRecord(value) ? value : {};
  const itemType = resolveOrderItemType(
    getJsonString(snapshot.itemType) ?? row.item_type,
  );

  return {
    productId: row.product_id,
    slug: getJsonString(snapshot.slug),
    name: getJsonString(snapshot.name) ?? row.product_name,
    itemType,
    quantity: getJsonNumber(snapshot.quantity) ?? row.quantity,
    unitPrice: getJsonNumber(snapshot.unitPrice) ?? Number(row.unit_price),
    compareAtPrice: getJsonNumber(snapshot.compareAtPrice),
    unitLabel: getJsonString(snapshot.unitLabel),
    categoryName: getJsonString(snapshot.categoryName),
    categorySlug: getJsonString(snapshot.categorySlug),
    imageUrl: getJsonString(snapshot.imageUrl),
    badge: getJsonString(snapshot.badge),
    includedItems: parseIncludedItems(snapshot.includedItems),
  };
}

function mapAdminOrderItemRow(row: Tables<"order_items">): AdminOrderLineItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    lineTotal: Number(row.line_total),
    itemType: resolveOrderItemType(row.item_type),
    productSnapshot: mapOrderItemProductSnapshot(row.product_snapshot, row),
    createdAt: row.created_at,
  };
}

function mapAdminSiteSettingsRow(
  row: Tables<"site_settings">,
): AdminSiteSettings {
  return {
    id: row.id,
    siteName: row.site_name,
    tagline: row.tagline,
    logoUrl: row.logo_url ?? "",
    whatsappNumber: row.whatsapp_number,
    announcementBar: row.announcement_bar ?? "",
    contactPhone: row.contact_phone ?? "",
    contactEmail: row.contact_email ?? "",
    address: row.address ?? "",
    businessHours: row.business_hours ?? "",
    heroKicker: row.hero_kicker,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    homepageStoryTitle: row.homepage_story_title,
    homepageStoryBody: row.homepage_story_body,
    productsSectionTitle: row.products_section_title ?? "",
    dealsSectionTitle: row.deals_section_title ?? "",
    contactSectionTitle: row.contact_section_title ?? "",
    primaryColor: row.primary_color ?? "#7B1A1A",
    secondaryColor: row.secondary_color ?? "#1A0A00",
    backgroundColor: row.background_color ?? "#FFF8E7",
    surfaceColor: row.surface_color ?? "#FFFFFF",
  };
}

async function getSupabaseClient(client?: SupabaseClient<Database>) {
  return client ?? (await createSupabaseServerClient());
}

async function getTableCount(
  client: SupabaseClient<Database>,
  table: "products" | "categories" | "orders",
) {
  const { count, error } = await client.from(table).select("id", {
    count: "exact",
    head: true,
  });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function getActiveDealsCount(client: SupabaseClient<Database>) {
  const { count, error } = await client
    .from("deals")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function fetchAdminDashboardData(
  client?: SupabaseClient<Database>,
): Promise<AdminDashboardData> {
  const supabase = await getSupabaseClient(client);
  const [
    totalProducts,
    totalCategories,
    totalActiveDeals,
    totalOrders,
    recentOrders,
  ] = await Promise.all([
    getTableCount(supabase, "products"),
    getTableCount(supabase, "categories"),
    getActiveDealsCount(supabase),
    getTableCount(supabase, "orders"),
    fetchAdminOrders(6, supabase),
  ]);

  return {
    totalProducts,
    totalCategories,
    totalActiveDeals,
    totalOrders,
    recentOrders,
  };
}

export async function fetchAdminCategories(
  client?: SupabaseClient<Database>,
) {
  const supabase = await getSupabaseClient(client);
  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("products").select("id, category_id"),
    ]);

  if (categoriesError) {
    throw categoriesError;
  }

  if (productsError) {
    throw productsError;
  }

  const countByCategory = new Map<string, number>();

  for (const product of products ?? []) {
    countByCategory.set(
      product.category_id,
      (countByCategory.get(product.category_id) ?? 0) + 1,
    );
  }

  return (categories ?? []).map((category) =>
    mapAdminCategoryRow(category, countByCategory.get(category.id) ?? 0),
  );
}

export async function fetchAdminCategoryOptions(
  client?: SupabaseClient<Database>,
): Promise<AdminOption[]> {
  const categories = await fetchAdminCategories(client);

  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
}

export async function fetchAdminProducts(
  client?: SupabaseClient<Database>,
) {
  const supabase = await getSupabaseClient(client);
  const [categories, products] = await Promise.all([
    fetchAdminCategories(supabase),
    supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (products.error) {
    throw products.error;
  }

  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (products.data ?? []).map((product) =>
    mapAdminProductRow(
      product,
      categoryNameById.get(product.category_id) ?? "Unknown category",
    ),
  );
}

export async function fetchAdminProductOptions(
  client?: SupabaseClient<Database>,
): Promise<AdminOption[]> {
  const products = await fetchAdminProducts(client);

  return products.map((product) => ({
    value: product.id,
    label: product.name,
  }));
}

export async function fetchAdminDeals(
  client?: SupabaseClient<Database>,
) {
  const supabase = await getSupabaseClient(client);
  const [{ data: deals, error: dealsError }, { data: dealItems, error: dealItemsError }, products] =
    await Promise.all([
      supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("deal_items").select("*"),
      fetchAdminProducts(supabase),
    ]);

  if (dealsError) {
    throw dealsError;
  }

  if (dealItemsError) {
    throw dealItemsError;
  }

  const productNameById = new Map(
    products.map((product) => [product.id, product.name]),
  );
  const productIdsByDeal = new Map<string, string[]>();
  const customItemsByDeal = new Map<string, AdminDeal["customItems"]>();

  for (const item of dealItems ?? []) {
    if (item.product_id) {
      const linkedItems = productIdsByDeal.get(item.deal_id) ?? [];
      linkedItems.push(item.product_id);
      productIdsByDeal.set(item.deal_id, linkedItems);
      continue;
    }

    if (!item.custom_name || item.custom_price === null) {
      continue;
    }

    const customItems = customItemsByDeal.get(item.deal_id) ?? [];
    customItems.push({
      id: item.id,
      name: item.custom_name,
      quantity: item.quantity,
      price: Number(item.custom_price),
      unitLabel: item.custom_unit_label ?? "",
      imageUrl: item.custom_image_url ?? "",
    });
    customItemsByDeal.set(item.deal_id, customItems);
  }

  return (deals ?? []).map((deal) => {
    const linkedProductIds = productIdsByDeal.get(deal.id) ?? [];
    const linkedProductNames = linkedProductIds
      .map((productId) => productNameById.get(productId))
      .filter((name): name is string => Boolean(name));
    const customItems = customItemsByDeal.get(deal.id) ?? [];

    return mapAdminDealRow(
      deal,
      linkedProductIds,
      linkedProductNames,
      customItems,
    );
  });
}

export async function fetchAdminDeliveryZones(
  client?: SupabaseClient<Database>,
) {
  const supabase = await getSupabaseClient(client);
  const [{ data: zones, error: zonesError }, { data: areas, error: areasError }] =
    await Promise.all([
      supabase
        .from("delivery_zones")
        .select("*")
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

  const areasByZone = new Map<string, AdminDeliveryZoneArea[]>();

  for (const area of areas ?? []) {
    if (!area.zone_id) {
      continue;
    }

    const zoneAreas = areasByZone.get(area.zone_id) ?? [];
    zoneAreas.push(mapAdminZoneAreaRow(area));
    areasByZone.set(area.zone_id, zoneAreas);
  }

  return (zones ?? []).map((zone) =>
    mapAdminZoneRow(zone, areasByZone.get(zone.id) ?? []),
  );
}

export async function fetchAdminOrders(
  limit = 30,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getSupabaseClient(client);
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapAdminOrderRow);
}

export async function fetchAdminOrdersList(
  filters: AdminOrderFilters,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getSupabaseClient(client);
  let query = supabase.from("orders").select("*");
  const sanitizedQuery = sanitizeAdminOrderSearchTerm(filters.query);

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (sanitizedQuery) {
    const likePattern = `%${sanitizedQuery}%`;

    query = query.or(
      `order_number.ilike.${likePattern},customer_name.ilike.${likePattern},phone.ilike.${likePattern}`,
    );
  }

  const { data, error } = await query
    .order("created_at", { ascending: filters.sort === "oldest" })
    .limit(200);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapAdminOrderRow);
}

export async function fetchAdminOrderDetail(
  orderId: string,
  client?: SupabaseClient<Database>,
): Promise<AdminOrderDetail | null> {
  const supabase = await getSupabaseClient(client);
  const [{ data: order, error: orderError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
      supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true }),
    ]);

  if (orderError) {
    throw orderError;
  }

  if (itemsError) {
    throw itemsError;
  }

  if (!order) {
    return null;
  }

  return {
    ...mapAdminOrderRow(order),
    whatsappMessage: order.whatsapp_message ?? "",
    items: (items ?? []).map(mapAdminOrderItemRow),
  };
}

export async function fetchAdminOrdersWithItems(
  client?: SupabaseClient<Database>,
): Promise<AdminOrderDetail[]> {
  const supabase = await getSupabaseClient(client);
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError) {
    throw ordersError;
  }

  if (!orders?.length) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw itemsError;
  }

  const itemsByOrderId = new Map<string, AdminOrderLineItem[]>();

  for (const item of items ?? []) {
    const currentItems = itemsByOrderId.get(item.order_id) ?? [];
    currentItems.push(mapAdminOrderItemRow(item));
    itemsByOrderId.set(item.order_id, currentItems);
  }

  return orders.map((order) => ({
    ...mapAdminOrderRow(order),
    whatsappMessage: order.whatsapp_message ?? "",
    items: itemsByOrderId.get(order.id) ?? [],
  }));
}

export async function fetchAdminSiteSettings(
  client?: SupabaseClient<Database>,
) {
  const supabase = await getSupabaseClient(client);
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapAdminSiteSettingsRow(data);
}

export async function fetchSimpleAdminPageData(
  client?: SupabaseClient<Database>,
) {
  const supabase = await getSupabaseClient(client);
  const [categories, deliveryZones, products, orders, settings] = await Promise.all([
    fetchAdminCategories(supabase),
    fetchAdminDeliveryZones(supabase),
    fetchAdminProducts(supabase),
    fetchAdminOrdersWithItems(supabase),
    fetchAdminSiteSettings(supabase),
  ]);

  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((total, order) => total + order.total, 0),
    categories,
    deliveryZones,
    products,
    orders,
    settings: {
      whatsappNumber: settings?.whatsappNumber ?? demoSiteSettings.whatsappNumber,
      businessHours: settings?.businessHours ?? demoSiteSettings.businessHours,
    },
  };
}
