import type { CartLine, Deal, Product } from "@/types/commerce";

export const CART_STORAGE_KEY = "hcs-cart";
const EMPTY_CART: CartLine[] = [];

let cachedCartRaw: string | null = null;
let cachedCartSnapshot: CartLine[] = EMPTY_CART;

export function createCartLineFromProduct(
  product: Product,
  quantity = 1,
): CartLine {
  return {
    id: `cart-${product.id}`,
    itemType: "product",
    productId: product.id,
    slug: product.slug,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    unitLabel: product.unitLabel,
    categoryName: product.categoryName,
    categorySlug: product.categorySlug,
    imageUrl: product.imageUrl ?? null,
    badge: product.badge ?? null,
  };
}

export function createCartLineFromDeal(deal: Deal, quantity = 1): CartLine {
  return {
    id: `deal-${deal.id}`,
    itemType: "deal",
    productId: null,
    slug: deal.slug,
    productName: deal.name,
    quantity,
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
}

export function getCartItemCount(items: CartLine[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function readStoredCart() {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedValue) {
      cachedCartRaw = null;
      cachedCartSnapshot = EMPTY_CART;
      return cachedCartSnapshot;
    }

    if (storedValue === cachedCartRaw) {
      return cachedCartSnapshot;
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      cachedCartRaw = storedValue;
      cachedCartSnapshot = EMPTY_CART;
      return cachedCartSnapshot;
    }

    cachedCartRaw = storedValue;
    cachedCartSnapshot = parsedValue.filter(
      (item): item is CartLine =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.productName === "string" &&
            typeof item.quantity === "number" &&
            typeof item.unitPrice === "number",
        ),
    );
    return cachedCartSnapshot;
  } catch {
    cachedCartRaw = null;
    cachedCartSnapshot = EMPTY_CART;
    return cachedCartSnapshot;
  }
}
