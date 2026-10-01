"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { SummaryRows } from "@/components/SummaryRows";
import { DELIVERY_ESTIMATE, DELIVERY_FEE_KOBO, formatNaira } from "@/lib/format";

export default function CartPage() {
  const { lines, ready, subtotalKobo, setQuantity, remove, error, userId } = useCart();
  const overStock = lines.some((l) => l.quantity > l.product.stock);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="display text-[clamp(40px,6vw,64px)]">Your cart</h1>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl bg-danger-soft p-4 text-danger">
          {error}
        </p>
      )}

      {!ready ? (
        <div className="mt-10 space-y-4" aria-busy="true" aria-label="Loading cart">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-28 rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : lines.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-card)] bg-cloud px-6 py-16 text-center">
          <p className="text-[22px] font-semibold text-ink">Your cart is empty.</p>
          <p className="mt-2 text-body">Chargers, cables, earbuds and more are waiting.</p>
          <Link href="/products" className="btn btn-primary mt-8">Shop now</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <ul className="divide-y divide-line" aria-label="Items in your cart">
            {lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-4 py-5 first:pt-0">
                <Link href={`/products/${product.slug}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
                  <ProductImage product={product} alt="" className="size-24 sm:size-28 !rounded-2xl" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/products/${product.slug}`} className="text-[17px] font-medium text-ink hover:underline">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-[15px] text-body">{formatNaira(product.price_kobo)} each</p>
                      {quantity > product.stock && (
                        <p className="mt-1 text-[14px] text-danger">
                          {product.stock === 0 ? "Now out of stock. Remove to continue." : `Only ${product.stock} available.`}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full text-body hover:bg-cloud hover:text-danger"
                      aria-label={`Remove ${product.name}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <QuantityStepper
                      value={quantity}
                      max={product.stock}
                      name={product.name}
                      onChange={(q) => setQuantity(product.id, q)}
                    />
                    <p className="text-right text-[16px] font-semibold tabular-nums">
                      {formatNaira(product.price_kobo * quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="rounded-[var(--radius-card)] bg-cloud p-6 sm:p-8" aria-label="Order summary">
            <h2 className="text-[20px] font-semibold">Summary</h2>
            <div className="mt-5">
              <SummaryRows subtotal={subtotalKobo} fee={DELIVERY_FEE_KOBO} />
            </div>
            <p className="mt-4 text-[14px] text-body">Pay on delivery · Arrives in {DELIVERY_ESTIMATE}</p>
            {overStock ? (
              <button className="btn btn-primary mt-6 w-full" disabled>Checkout</button>
            ) : (
              <Link href="/checkout" className="btn btn-primary mt-6 w-full">Checkout</Link>
            )}
            {!userId && (
              <p className="mt-3 text-center text-[14px] text-body">You&apos;ll sign in with Google at the next step.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
