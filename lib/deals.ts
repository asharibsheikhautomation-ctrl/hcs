import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  dealItems as demoDealItems,
  deals as demoDeals,
  products as demoProducts,
} from "@/lib/demo-data";
import {
  buildDealSavingsLabel,
  calculateDealPrice,
  resolveDealStatus,
} from "@/lib/deal-utils";
import type {
  AccentTone,
  Deal,
  DealDiscountType,
  DealIncludedItem,
} from "@/types/commerce";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function mapAccentTone(value: string | null | undefined): AccentTone {
  if (value === "frost" || value === "ink") {
    return value;
  }

  return "gold";
}

function mapDiscountType(value: string | null | undefined): DealDiscountType {
  if (value === "fixed" || value === "bundle") {
    return value;
  }

  return "percentage";
}

function buildIncludedItems(
  dealId: string,
  linkedRows: Array<{
    id: string;
    product_id: string | null;
    quantity: number;
    custom_name?: string | null;
    custom_price?: number | null;
    custom_unit_label?: string | null;
    custom_image_url?: string | null;
  }>,
  productsById: Map<
    string,
    {
      slug: string;
      name: string;
      unitLabel: string;
      unitPrice: number;
      imageUrl: string | null;
    }
  >,
) {
  const includedItems: DealIncludedItem[] = [];

  for (const linkedRow of linkedRows) {
    const product =
      linkedRow.product_id ? productsById.get(linkedRow.product_id) : null;

    if (product && linkedRow.product_id) {
      includedItems.push({
        id: linkedRow.id,
        dealId,
        productId: linkedRow.product_id,
        productSlug: product.slug,
        productName: product.name,
        quantity: linkedRow.quantity,
        unitLabel: product.unitLabel,
        unitPrice: product.unitPrice,
        imageUrl: product.imageUrl,
        source: "product",
      });
      continue;
    }

    if (!linkedRow.custom_name || linkedRow.custom_price === null) {
      continue;
    }

    includedItems.push({
      id: linkedRow.id,
      dealId,
      productId: null,
      productSlug: null,
      productName: linkedRow.custom_name,
      quantity: linkedRow.quantity,
      unitLabel: linkedRow.custom_unit_label ?? null,
      unitPrice: Number(linkedRow.custom_price),
      imageUrl: linkedRow.custom_image_url ?? null,
      source: "custom",
    });
  }

  return includedItems;
}

function buildDeal(
  row: {
    id: string;
    slug: string;
    name: string;
    headline: string;
    description: string | null;
    savingsLabel?: string | null;
    bannerImageUrl?: string | null;
    accentTone?: string | null;
    discountType?: string | null;
    discountValue?: number | null;
    startsAt?: string | null;
    endsAt?: string | null;
    isActive: boolean;
    isFeatured: boolean;
  },
  includedItems: DealIncludedItem[],
): Deal {
  const discountType = mapDiscountType(row.discountType);
  const discountValue = Number(row.discountValue ?? 0);
  const originalTotal = includedItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const dealPrice = calculateDealPrice(
    originalTotal,
    discountType,
    discountValue,
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    headline: row.headline,
    description: row.description ?? "",
    savingsLabel: buildDealSavingsLabel(
      discountType,
      discountValue,
      row.savingsLabel ?? null,
    ),
    bannerImageUrl: row.bannerImageUrl ?? null,
    discountType,
    discountValue,
    startsAt: row.startsAt ?? null,
    endsAt: row.endsAt ?? null,
    status: resolveDealStatus({
      isActive: row.isActive,
      startsAt: row.startsAt ?? null,
      endsAt: row.endsAt ?? null,
    }),
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    accentTone: mapAccentTone(row.accentTone),
    includedItems,
    originalTotal,
    dealPrice,
  };
}

function mapDemoDeals() {
  const productsById = new Map(
    demoProducts.map((product) => [
      product.id,
      {
        slug: product.slug,
        name: product.name,
        unitLabel: product.unitLabel,
        unitPrice: product.price,
        imageUrl: product.imageUrl ?? null,
      },
    ]),
  );
  const dealItemsByDeal = new Map<string, typeof demoDealItems>();

  for (const item of demoDealItems) {
    const currentItems = dealItemsByDeal.get(item.dealId) ?? [];
    currentItems.push(item);
    dealItemsByDeal.set(item.dealId, currentItems);
  }

  return demoDeals.map((deal) => {
    const includedItems = buildIncludedItems(
      deal.id,
      (dealItemsByDeal.get(deal.id) ?? []).map((item) => ({
        id: item.id,
        product_id: item.productId,
        quantity: item.quantity,
        custom_name: item.customName ?? null,
        custom_price: item.customPrice ?? null,
        custom_unit_label: item.customUnitLabel ?? null,
        custom_image_url: item.customImageUrl ?? null,
      })),
      productsById,
    );

    return buildDeal(
      {
        id: deal.id,
        slug: deal.slug,
        name: deal.name,
        headline: deal.headline,
        description: deal.description,
        savingsLabel: deal.savingsLabel,
        bannerImageUrl: deal.bannerImageUrl ?? null,
        accentTone: deal.accentTone,
        discountType: deal.discountType,
        discountValue: deal.discountValue,
        startsAt: deal.startsAt ?? null,
        endsAt: deal.endsAt ?? null,
        isActive: deal.isActive,
        isFeatured: deal.isFeatured,
      },
      includedItems,
    );
  });
}

async function fetchLiveDeals() {
  const supabase = await createSupabaseServerClient();
  const [{ data: deals, error: dealsError }, { data: linkedItems, error: itemsError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase.from("deals").select("*").order("created_at", { ascending: false }),
      supabase.from("deal_items").select("*"),
      supabase
        .from("products")
        .select("id, slug, name, unit_label, image_url, sale_price, base_price, is_active")
        .eq("is_active", true),
    ]);

  if (dealsError) {
    throw dealsError;
  }

  if (itemsError) {
    throw itemsError;
  }

  if (productsError) {
    throw productsError;
  }

  const productsById = new Map(
    (products ?? []).map((product) => [
      product.id,
      {
        slug: product.slug,
        name: product.name,
        unitLabel: product.unit_label,
        unitPrice: Number(product.sale_price ?? product.base_price),
        imageUrl: product.image_url ?? null,
      },
    ]),
  );
  const dealItemsByDeal = new Map<string, typeof linkedItems>();

  for (const linkedItem of linkedItems ?? []) {
    const currentItems = dealItemsByDeal.get(linkedItem.deal_id) ?? [];
    currentItems.push(linkedItem);
    dealItemsByDeal.set(linkedItem.deal_id, currentItems);
  }

  return (deals ?? []).map((deal) => {
    const includedItems = buildIncludedItems(
      deal.id,
      (dealItemsByDeal.get(deal.id) ?? []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        custom_name: item.custom_name,
        custom_price:
          item.custom_price === null ? null : Number(item.custom_price),
        custom_unit_label: item.custom_unit_label,
        custom_image_url: item.custom_image_url,
      })),
      productsById,
    );

    return buildDeal(
      {
        id: deal.id,
        slug: deal.slug,
        name: deal.name,
        headline: deal.headline,
        description: deal.description,
        savingsLabel: deal.savings_label,
        bannerImageUrl: deal.banner_image_url,
        accentTone: deal.banner_tone,
        discountType: deal.discount_type,
        discountValue:
          deal.discount_value === null ? 0 : Number(deal.discount_value),
        startsAt: deal.starts_at,
        endsAt: deal.ends_at,
        isActive: deal.is_active,
        isFeatured: deal.is_featured,
      },
      includedItems,
    );
  });
}

export async function fetchStoreDeals(options?: { featuredOnly?: boolean }) {
  const allDeals = isSupabaseConfigured()
    ? await fetchLiveDeals().catch((error) => {
        console.error("Failed to load live deals from Supabase.", error);
        return mapDemoDeals();
      })
    : mapDemoDeals();

  return allDeals.filter((deal) => {
    if (deal.status !== "active") {
      return false;
    }

    if (options?.featuredOnly && !deal.isFeatured) {
      return false;
    }

    return true;
  });
}
