import type {
  OrderStatus,
  CartLine,
  Deal,
  Product,
  WhatsAppOrderPayload,
} from "@/types/commerce";
import { formatCurrency } from "@/lib/utils";

function formatIncludedItems(items?: CartLine["includedItems"] | null) {
  if (!items?.length) {
    return null;
  }

  return items
    .map(
      (item) =>
        `  - ${item.productName} x${item.quantity}${item.unitLabel ? ` (${item.unitLabel})` : ""}`,
    )
    .join("\n");
}

function formatCartLine(item: CartLine) {
  const lineTotal = item.unitPrice * item.quantity;
  const includedItems = formatIncludedItems(item.includedItems);

  return [
    `- ${item.productName} x${item.quantity} = ${formatCurrency(lineTotal)}`,
    includedItems ? "  Includes:" : null,
    includedItems,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatWhatsAppOrderMessage(order: WhatsAppOrderPayload) {
  const itemLines = order.items.map(formatCartLine).join("\n");

  return [
    "Hello Hyderabad Cheese Store, I'd like to place this order:",
    "",
    order.orderNumber ? `Order No: ${order.orderNumber}` : null,
    itemLines,
    "",
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Delivery: ${formatCurrency(order.deliveryCharge)}`,
    `Total: ${formatCurrency(order.total)}`,
    "",
    `Customer: ${order.customerName || "Pending name"}`,
    `Phone: ${order.phone || "Pending phone"}`,
    `Zone: ${order.deliveryZoneName}`,
    `Area: ${order.deliveryZoneAreaName}`,
    `Address: ${order.address || "Pending address"}`,
    `Note: ${order.note || "No additional note"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function createWhatsAppOrderUrl(phone: string, message: string) {
  const cleanedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}

export function formatQuickProductOrderMessage(
  product: Product,
  quantity = 1,
) {
  const safeQuantity = Math.max(1, quantity);
  const cartLine: CartLine = {
    id: `quick-${product.id}`,
    itemType: "product",
    productId: product.id,
    slug: product.slug,
    productName: product.name,
    quantity: safeQuantity,
    unitPrice: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    unitLabel: product.unitLabel,
    categoryName: product.categoryName,
    categorySlug: product.categorySlug,
    imageUrl: product.imageUrl ?? null,
    badge: product.badge ?? null,
  };
  const total = cartLine.unitPrice * cartLine.quantity;

  return [
    "Hello Hyderabad Cheese Store, I'd like to order this item:",
    "",
    formatCartLine(cartLine),
    cartLine.unitLabel ? `Pack size: ${cartLine.unitLabel}` : null,
    "",
    `Subtotal: ${formatCurrency(total)}`,
    `Total: ${formatCurrency(total)}`,
    "",
    "Customer: Pending name",
    "Phone: Pending phone",
    "Address: Pending address",
  ]
    .filter(Boolean)
    .join("\n");
}

export function createQuickProductOrderUrl(
  phone: string,
  product: Product,
  quantity = 1,
) {
  return createWhatsAppOrderUrl(
    phone,
    formatQuickProductOrderMessage(product, quantity),
  );
}

export function formatQuickDealOrderMessage(deal: Deal, quantity = 1) {
  const safeQuantity = Math.max(1, quantity);
  const cartLine: CartLine = {
    id: `quick-deal-${deal.id}`,
    itemType: "deal",
    productId: null,
    slug: deal.slug,
    productName: deal.name,
    quantity: safeQuantity,
    unitPrice: deal.dealPrice,
    compareAtPrice:
      deal.originalTotal > deal.dealPrice ? deal.originalTotal : null,
    unitLabel: "bundle",
    categoryName: "Deal Bundle",
    categorySlug: null,
    imageUrl: deal.bannerImageUrl ?? null,
    badge: deal.savingsLabel,
    includedItems: deal.includedItems,
  };
  const total = cartLine.unitPrice * cartLine.quantity;

  return [
    "Hello Hyderabad Cheese Store, I'd like to order this deal:",
    "",
    formatCartLine(cartLine),
    "",
    `Deal total: ${formatCurrency(total)}`,
    deal.originalTotal > deal.dealPrice
      ? `Original value: ${formatCurrency(deal.originalTotal * safeQuantity)}`
      : null,
    "",
    "Customer: Pending name",
    "Phone: Pending phone",
    "Address: Pending address",
  ]
    .filter(Boolean)
    .join("\n");
}

export function createQuickDealOrderUrl(
  phone: string,
  deal: Deal,
  quantity = 1,
) {
  return createWhatsAppOrderUrl(phone, formatQuickDealOrderMessage(deal, quantity));
}

interface AdminCustomerWhatsAppItem {
  productName: string;
  quantity: number;
  lineTotal: number;
  productSnapshot: {
    unitLabel?: string | null;
    includedItems?: CartLine["includedItems"] | null;
  };
}

interface AdminCustomerWhatsAppPayload {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  deliveryLabel: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  note?: string | null;
  items: AdminCustomerWhatsAppItem[];
}

function formatAdminCustomerLineItem(item: AdminCustomerWhatsAppItem) {
  const unitLabel = item.productSnapshot.unitLabel
    ? ` (${item.productSnapshot.unitLabel})`
    : "";
  const includedItems = formatIncludedItems(item.productSnapshot.includedItems);

  return [
    `- ${item.productName} x${item.quantity}${unitLabel} = ${formatCurrency(item.lineTotal)}`,
    includedItems ? "  Includes:" : null,
    includedItems,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatAdminCustomerOrderMessage(
  order: AdminCustomerWhatsAppPayload,
) {
  return [
    `Hello ${order.customerName || "Customer"},`,
    "",
    "Here are your Hyderabad Cheese Store order details:",
    `Order No: ${order.orderNumber}`,
    `Status: ${order.status}`,
    "",
    order.items.map(formatAdminCustomerLineItem).join("\n"),
    "",
    `Delivery area: ${order.deliveryLabel}`,
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Delivery: ${formatCurrency(order.deliveryCharge)}`,
    `Total: ${formatCurrency(order.total)}`,
    `Note: ${order.note || "No extra note"}`,
    "",
    "Thank you for shopping with Hyderabad Cheese Store.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function createAdminCustomerOrderWhatsAppUrl(
  phone: string,
  order: AdminCustomerWhatsAppPayload,
) {
  const cleanedPhone = phone.replace(/\D/g, "");

  if (cleanedPhone.length < 10) {
    return null;
  }

  return createWhatsAppOrderUrl(
    cleanedPhone,
    formatAdminCustomerOrderMessage(order),
  );
}

export const createWhatsAppOrderMessage = formatWhatsAppOrderMessage;
