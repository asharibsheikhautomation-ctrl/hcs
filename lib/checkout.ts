import type {
  CartLine,
  CheckoutPricing,
  DeliveryZone,
  DeliveryZoneArea,
  OrderItemProductSnapshot,
  Voucher,
} from "@/types/commerce";
import type { Json, TablesInsert } from "@/types/supabase";
import {
  calculateVoucherDiscount,
  validateVoucherForSubtotal,
} from "@/lib/vouchers";

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

  return zone.freeDeliveryMinimum > 0 && subtotal >= zone.freeDeliveryMinimum;
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

export function generateTotal(
  subtotal: number,
  deliveryCharge: number,
  discountAmount = 0,
) {
  return Math.max(subtotal - discountAmount, 0) + deliveryCharge;
}

export function buildCheckoutPricing(
  items: CartLine[],
  zone?: DeliveryZone | null,
  area?: DeliveryZoneArea | null,
  voucher?: Voucher | null,
): CheckoutPricing {
  const subtotal = calculateSubtotal(items);
  const voucherValidation = voucher
    ? validateVoucherForSubtotal(voucher, subtotal)
    : null;
  const discountAmount =
    voucherValidation?.isValid && voucher
      ? calculateVoucherDiscount(subtotal, voucher)
      : 0;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const qualifiesForFreeDelivery = applyFreeDeliveryRule(subtotal, zone);
  const deliveryCharge = calculateDeliveryCharge(subtotal, zone, area);
  const total = generateTotal(subtotal, deliveryCharge, discountAmount);
  const freeDeliveryMinimum = zone?.freeDeliveryMinimum ?? 0;
  const remainingForFreeDelivery = Math.max(
    freeDeliveryMinimum - subtotal,
    0,
  );

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
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
