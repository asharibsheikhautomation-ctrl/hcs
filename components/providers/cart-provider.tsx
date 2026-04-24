"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  createCartLineFromDeal,
  createCartLineFromProduct,
  getCartItemCount,
  CART_STORAGE_KEY,
  readStoredCart,
} from "@/lib/cart";
import type { CartLine, Deal, Product } from "@/types/commerce";

interface CartContextValue {
  isHydrated: boolean;
  items: CartLine[];
  itemCount: number;
  addProduct: (product: Product, quantity?: number) => void;
  addDeal: (deal: Deal, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const cartListeners = new Set<() => void>();
const EMPTY_CART: CartLine[] = [];

function emitCartChange() {
  for (const listener of cartListeners) {
    listener();
  }
}

function subscribeToCart(listener: () => void) {
  cartListeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      cartListeners.delete(listener);
    };
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === CART_STORAGE_KEY) {
      listener();
    }
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    cartListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getCartSnapshot() {
  return readStoredCart();
}

function getCartServerSnapshot() {
  return EMPTY_CART;
}

function subscribeToHydration() {
  return () => {};
}

function getHydrationSnapshot() {
  return true;
}

function getHydrationServerSnapshot() {
  return false;
}

function writeStoredCart(items: CartLine[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  emitCartChange();
}

function mergeCartItem(
  currentItems: CartLine[],
  incomingItem: CartLine,
  quantity: number,
) {
  const existingItemIndex = currentItems.findIndex(
    (item) => item.id === incomingItem.id,
  );

  if (existingItemIndex === -1) {
    return [...currentItems, { ...incomingItem, quantity }];
  }

  return currentItems.map((item, index) =>
    index === existingItemIndex
      ? {
          ...item,
          ...incomingItem,
          quantity: item.quantity + quantity,
        }
      : item,
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getHydrationServerSnapshot,
  );

  function addProduct(product: Product, quantity = 1) {
    const safeQuantity = Math.max(1, quantity);
    const nextItem = createCartLineFromProduct(product, safeQuantity);
    const nextItems = mergeCartItem(items, nextItem, safeQuantity);

    writeStoredCart(nextItems);
  }

  function addDeal(deal: Deal, quantity = 1) {
    const safeQuantity = Math.max(1, quantity);
    const nextItem = createCartLineFromDeal(deal, safeQuantity);
    const nextItems = mergeCartItem(items, nextItem, safeQuantity);

    writeStoredCart(nextItems);
  }

  function removeItem(lineId: string) {
    writeStoredCart(items.filter((item) => item.id !== lineId));
  }

  function updateQuantity(lineId: string, quantity: number) {
    const safeQuantity = Math.max(0, quantity);

    if (safeQuantity === 0) {
      writeStoredCart(items.filter((item) => item.id !== lineId));
      return;
    }

    writeStoredCart(
      items.map((item) =>
        item.id === lineId ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  }

  function clear() {
    writeStoredCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        isHydrated,
        items,
        itemCount: getCartItemCount(items),
        addProduct,
        addDeal,
        removeItem,
        updateQuantity,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
