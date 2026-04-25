"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { ProductFeatureStrip } from "@/components/store/product-feature-strip";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/commerce";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({
  product,
}: ProductPurchasePanelProps) {
  const { addProduct } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [didAdd, setDidAdd] = useState(false);
  const total = product.price * quantity;

  function changeQuantity(nextQuantity: number) {
    setQuantity(Math.max(1, nextQuantity));
    setDidAdd(false);
  }

  function handleAddToCart() {
    addProduct(product, quantity);
    setDidAdd(true);
  }

  return (
    <div className="luxe-panel rounded-[2rem] p-6 md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-500">
        Purchase
      </p>
      <h2 className="mt-4 text-[2rem] font-semibold leading-[0.96] text-ink-950 sm:text-3xl md:text-4xl">
        Add to cart.
      </h2>
      <p className="mt-3 text-[0.95rem] leading-6 text-ink-700/76">
        Choose quantity, then continue to checkout.
      </p>
      <ProductFeatureStrip product={product} className="mt-5" />

      <div className="mt-6 rounded-[1.6rem] bg-surface-muted p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-700/50">
          Quantity
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 sm:justify-start">
          <button
            type="button"
            onClick={() => changeQuantity(quantity - 1)}
            className="btn-base btn-inline btn-secondary h-11 w-11 shrink-0 p-0"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="inline-flex min-w-14 items-center justify-center rounded-full bg-white px-4 py-3 text-base font-semibold text-ink-950 sm:min-w-16 sm:px-5 sm:text-lg">
            {quantity}
          </div>
          <button
            type="button"
            onClick={() => changeQuantity(quantity + 1)}
            className="btn-base btn-inline btn-secondary h-11 w-11 shrink-0 p-0"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.45rem] bg-surface-muted px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-700/50">
            Unit price
          </p>
          <p className="mt-2 text-lg font-semibold text-ink-950">
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className="rounded-[1.45rem] bg-ink-950 px-4 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
            Selected total
          </p>
          <p className="mt-2 text-lg font-semibold">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn-base btn-primary w-full"
        >
          <ShoppingBag className="h-4 w-4" />
          {didAdd ? "Added to cart" : "Add to cart"}
        </button>

        <Link
          href="/checkout"
          className="btn-base btn-secondary w-full"
        >
          Go to checkout
        </Link>
      </div>
    </div>
  );
}
