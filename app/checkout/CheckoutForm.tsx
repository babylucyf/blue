"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useCart } from "@/components/CartProvider";
import { SummaryRows } from "@/components/SummaryRows";
import { DELIVERY_ESTIMATE, DELIVERY_FEE_KOBO, formatNaira } from "@/lib/format";
import { placeOrder, type CheckoutState } from "./actions";
import { validate, type Field, type FieldErrors, type Values } from "./validation";

const LABELS: Record<Field, { label: string; autoComplete: string; type?: string; hint?: string }> = {
  full_name: { label: "Full name", autoComplete: "name" },
  phone: { label: "Phone number", autoComplete: "tel", type: "tel", hint: "Your rider will call this number." },
  address: { label: "Delivery address", autoComplete: "street-address" },
  city: { label: "City", autoComplete: "address-level2" },
};

export function CheckoutForm({ defaults }: { defaults: Values }) {
  const { lines, ready, subtotalKobo } = useCart();
  const [state, action] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const errors: FieldErrors = { ...state.fieldErrors, ...clientErrors };
  const values = state.values ?? defaults;
  const blocked = lines.some((l) => l.quantity > l.product.stock);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const v = Object.fromEntries(["full_name", "phone", "address", "city"].map((k) => [k, String(fd.get(k) ?? "")])) as Values;
    const errs = validate(v);
    setClientErrors(errs);
    if (Object.keys(errs).length > 0) {
      e.preventDefault();
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
    }
  }

  if (!ready) {
    return (
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]" aria-busy="true" aria-label="Loading checkout">
        <div className="skeleton h-96 rounded-[var(--radius-card)]" />
        <div className="skeleton h-72 rounded-[var(--radius-card)]" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-[var(--radius-card)] bg-cloud px-6 py-16 text-center">
        <p className="text-[22px] font-semibold">Your cart is empty.</p>
        <Link href="/products" className="btn btn-primary mt-8">Shop now</Link>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={onSubmit}
      noValidate
      className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start"
    >
      <fieldset className="space-y-5">
        <legend className="mb-5 text-[22px] font-semibold">Delivery details</legend>
        {(Object.keys(LABELS) as Field[]).map((name) => {
          const f = LABELS[name];
          const err = errors[name];
          return (
            <div key={name}>
              <label htmlFor={name} className="mb-2 block text-[15px] font-medium text-ink">
                {f.label}
              </label>
              {name === "address" ? (
                <textarea
                  id={name}
                  name={name}
                  rows={3}
                  defaultValue={values[name]}
                  autoComplete={f.autoComplete}
                  required
                  aria-invalid={err ? true : undefined}
                  aria-describedby={err ? `${name}-error` : undefined}
                  className="field resize-y"
                />
              ) : (
                <input
                  id={name}
                  name={name}
                  type={f.type ?? "text"}
                  defaultValue={values[name]}
                  autoComplete={f.autoComplete}
                  inputMode={name === "phone" ? "tel" : undefined}
                  required
                  aria-invalid={err ? true : undefined}
                  aria-describedby={[err ? `${name}-error` : "", f.hint ? `${name}-hint` : ""].join(" ").trim() || undefined}
                  className="field"
                />
              )}
              {f.hint && !err && (
                <p id={`${name}-hint`} className="mt-1.5 text-[14px] text-body">{f.hint}</p>
              )}
              {err && (
                <p id={`${name}-error`} className="mt-1.5 text-[14px] font-medium text-danger">{err}</p>
              )}
            </div>
          );
        })}

        <div className="rounded-[var(--radius-card)] bg-cloud p-5">
          <p className="text-[15px] font-medium">Payment</p>
          <p className="mt-1 text-[15px] text-body">
            Pay on delivery, by cash or transfer to the rider. You won&apos;t be charged now.
          </p>
        </div>
      </fieldset>

      <aside className="rounded-[var(--radius-card)] bg-cloud p-6 sm:p-8 lg:sticky lg:top-24" aria-label="Order summary">
        <h2 className="text-[20px] font-semibold">Order summary</h2>
        <ul className="mt-5 space-y-3 border-b border-line pb-5 text-[15px]">
          {lines.map((l) => (
            <li key={l.product.id} className="flex justify-between gap-4">
              <span className="text-ink">
                {l.product.name} <span className="text-body">× {l.quantity}</span>
              </span>
              <span className="shrink-0 tabular-nums">{formatNaira(l.product.price_kobo * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <SummaryRows subtotal={subtotalKobo} fee={DELIVERY_FEE_KOBO} />
        </div>
        <p className="mt-4 text-[14px] text-body">Pay on delivery · Arrives in {DELIVERY_ESTIMATE}</p>

        {state.error && (
          <p role="alert" className="mt-5 rounded-2xl bg-danger-soft p-4 text-[15px] text-danger">
            {state.error}
          </p>
        )}
        {blocked && (
          <p role="alert" className="mt-5 rounded-2xl bg-danger-soft p-4 text-[15px] text-danger">
            Some items exceed available stock. <Link href="/cart" className="underline">Update your cart</Link>.
          </p>
        )}

        <SubmitButton disabled={blocked} />
        <Link href="/cart" className="mt-3 block text-center text-[15px] text-body hover:text-ink">
          Back to cart
        </Link>
      </aside>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary mt-6 w-full" disabled={pending || disabled} aria-disabled={pending || disabled}>
      {pending ? "Placing order..." : "Place order"}
    </button>
  );
}
