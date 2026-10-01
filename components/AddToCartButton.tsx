"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function AddToCartButton({ product }: { product: Product }) {
  const { add, lines, ready } = useCart();
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const inCart = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;
  const out = product.stock <= 0;
  const atLimit = inCart >= product.stock;

  async function onAdd() {
    setBusy(true);
    await add(product, 1);
    setBusy(false);
    setAdded(true);
  }

  if (out) {
    return (
      <button className="btn btn-light w-full sm:w-auto" disabled>
        Out of stock
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        className="btn btn-primary w-full sm:w-auto sm:min-w-48"
        onClick={onAdd}
        disabled={busy || !ready || atLimit}
      >
        {busy ? "Adding..." : atLimit ? "All available stock in cart" : "Add to cart"}
      </button>
      {added && (
        <Link href="/cart" className="btn btn-light w-full sm:w-auto">
          View cart ({inCart})
        </Link>
      )}
      <p className="sr-only" aria-live="polite">
        {added ? `${product.name} added to cart. ${inCart} in cart.` : ""}
      </p>
    </div>
  );
}
