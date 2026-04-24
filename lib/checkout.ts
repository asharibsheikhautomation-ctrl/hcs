import type {
  CartLine,
  CheckoutPricing,
  DeliveryZone,
  DeliveryZoneArea,
  OrderItemProductSnapshot,
} from "@/types/commerce";
import type { Json, TablesInsert } from "@/types/supabase";

function toNullableUuid(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidPattern.test(normalizedValue) ? normalizedValue : null;
}

export function calculateSubtotal(items: CartLine[]) {
  return items.reduce(
    (runningTotal, item) => runningTotal + item.unitPrice * item.quantity,
    0,
  );
}

export function applyFreeDeliveryRule(
  subtotal: number,
  zone?: DeliveryZone | null,
) {
  if (!zone) {
    return false;
  }

  return subtotal >= zone.freeDeliveryMinimum;
}

export function calculateDeliveryCharge(
  subtotal: number,
  zone?: DeliveryZone | null,
  area?: DeliveryZoneArea | null,
) {
  if (!zone) {
    return 0;
  }

  if (applyFreeDeliveryRule(subtotal, zone)) {
    return 0;
  }

  return area?.deliveryCharge ?? zone.deliveryCharge;
}

export function generateTotal(subtotal: number, deliveryCharge: number) {
  return subtotal + deliveryCharge;
}

export function buildCheckoutPricing(
  items: CartLine[],
  zone?: DeliveryZone | null,
  area?: DeliveryZoneArea | null,
): CheckoutPricing {
  const subtotal = calculateSubtotal(items);
  const qualifiesForFreeDelivery = applyFreeDeliveryRule(subtotal, zone);
  const deliveryCharge = calculateDeliveryCharge(subtotal, zone, area);
  const total = generateTotal(subtotal, deliveryCharge);
  const freeDeliveryMinimum = zone?.freeDeliveryMinimum ?? 0;
  const remainingForFreeDelivery = Math.max(
    freeDeliveryMinimum - subtotal,
    0,
  );

  return {
    subtotal,
    deliveryCharge,
    total,
    qualifiesForFreeDelivery,
    freeDeliveryMinimum,
    remainingForFreeDelivery,
  };
}

export function createOrderItemProductSnapshot(
  item: CartLine,
): OrderItemProductSnapshot {
  return {
    productId: item.productId,
    slug: item.slug ?? null,
    name: item.productName,
    itemType: item.itemType,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    compareAtPrice: item.compareAtPrice ?? null,
    unitLabel: item.unitLabel ?? null,
    categoryName: item.categoryName ?? null,
    categorySlug: item.categorySlug ?? null,
    imageUrl: item.imageUrl ?? null,
    badge: item.badge ?? null,
    includedItems: item.includedItems ?? null,
  };
}

export function createOrderItemInsertRecord(
  orderId: string,
  item: CartLine,
): TablesInsert<"order_items"> {
  const productSnapshot = createOrderItemProductSnapshot(item) as unknown as Json;

  return {
    order_id: orderId,
    product_id: toNullableUuid(item.productId),
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.unitPrice * item.quantity,
    item_type: item.itemType,
    product_snapshot: productSnapshot,
  };
}
