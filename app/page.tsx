import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { ProductGrid } from "@/components/ProductCard";
import { GoogleG } from "@/components/GoogleG";
import { DELIVERY_FEE_KOBO, formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .order("created_at")
    .limit(4);
  const featured = (data ?? []) as Product[];

  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-6 sm:px-6" aria-labelledby="hero-title">
        <div className="on-blue relative mx-auto max-w-6xl overflow-hidden rounded-[var(--radius-field)] bg-blue text-white">
          <SpeedLines />
          <div className="relative grid items-center gap-8 px-6 pb-10 pt-14 sm:px-12 md:grid-cols-[1.15fr_1fr] md:py-20">
            <div>
              <h1 id="hero-title" className="display text-[clamp(44px,8vw,80px)]">
                Gadgets at the speed of Blue.
              </h1>
              <p className="mt-6 max-w-md text-[18px] leading-[1.45] text-white/85 sm:text-[20px]">
                Chargers, earbuds, cases and more. Check out in seconds and track your order every step of the way.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/products" className="btn btn-white min-w-36">
                  Shop now
                </Link>
                <Link href="/orders" className="btn min-w-36 text-white underline-offset-4 hover:underline">
                  Track an order
                </Link>
              </div>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              <div className="absolute inset-[8%] rounded-full bg-white/10" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/products/wireless-earbuds.svg"
                alt="Wireless earbuds in an open charging case"
                className="relative h-full w-full object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
        </div>

        {/* TRUST STRIP: only claims the product can actually back up */}
        <ul className="mx-auto mt-4 grid max-w-6xl gap-2 sm:grid-cols-3" aria-label="Why shop with Blue">
          <TrustItem icon="lock">Sign in securely with Google</TrustItem>
          <TrustItem icon="tag">Delivery fee shown upfront: {formatNaira(DELIVERY_FEE_KOBO)}</TrustItem>
          <TrustItem icon="route">Live order tracking</TrustItem>
        </ul>
      </section>

      {/* STAFF PICKS */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" aria-labelledby="picks-title">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="picks-title" className="display text-[clamp(32px,5vw,48px)]">Staff picks</h2>
            <p className="mt-2 text-[17px] text-body">The everyday essentials we reach for first.</p>
          </div>
          <Link href="/products" className="hidden shrink-0 text-[16px] font-medium text-blue hover:underline sm:block">
            View all products
          </Link>
        </div>
        {error ? (
          <ErrorNote />
        ) : featured.length === 0 ? (
          <p className="rounded-[var(--radius-card)] bg-cloud p-8 text-body">No products yet. Check back soon.</p>
        ) : (
          <ProductGrid products={featured} />
        )}
        <Link href="/products" className="btn btn-light mt-8 w-full sm:hidden">
          View all products
        </Link>
      </section>

      {/* THREE PROMISES */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6" aria-labelledby="promise-title">
        <h2 id="promise-title" className="display mx-auto max-w-2xl text-center text-[clamp(32px,5vw,56px)]">
          Order fast. Track every step.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <PromiseCard title="Fast checkout" body="One tap to sign in with Google. One page to check out. Pay when it arrives.">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-3 text-[14px] font-medium text-ink">
              <GoogleG /> Continue with Google
            </div>
          </PromiseCard>
          <PromiseCard title="See every step" body="From Placed to Delivered, each update shows up on your order page with the time.">
            <MiniTimeline />
          </PromiseCard>
          <PromiseCard title="No surprises" body="Price, delivery fee and delivery estimate are on the page before you pay.">
            <div className="space-y-1.5 rounded-2xl bg-white p-3 text-[14px]">
              <Row a="Subtotal" b="₦8,500" />
              <Row a="Delivery" b={formatNaira(DELIVERY_FEE_KOBO)} />
              <Row a="Total" b="₦10,000" strong />
            </div>
          </PromiseCard>
        </div>
      </section>
    </>
  );
}

function PromiseCard({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <article className="flex flex-col rounded-[var(--radius-card)] bg-cloud p-6 sm:p-8">
      <div aria-hidden="true">{children}</div>
      <h3 className="display mt-8 text-[28px] sm:text-[32px]">{title}</h3>
      <p className="mt-3 text-[17px] leading-[1.45] text-body">{body}</p>
    </article>
  );
}

function Row({ a, b, strong }: { a: string; b: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-line pt-1.5 font-semibold text-ink" : "text-body"}`}>
      <span>{a}</span>
      <span>{b}</span>
    </div>
  );
}

function MiniTimeline() {
  const steps = ["Placed", "Confirmed", "Packed", "Shipped"];
  return (
    <ol className="space-y-2 rounded-2xl bg-white p-3 text-[14px]">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={`size-3 rounded-full ${i < 3 ? "bg-blue" : "border-2 border-cloud-strong bg-white"} ${i === 2 ? "ring-4 ring-blue-soft" : ""}`}
          />
          <span className={i <= 2 ? "text-ink" : "text-body"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function TrustItem({ icon, children }: { icon: "lock" | "tag" | "route"; children: React.ReactNode }) {
  const paths = {
    lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z",
    tag: "M3 12V4h8l10 10-8 8L3 12Zm5-4h.01",
    route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a4 4 0 0 1 4-4h4M18 9v6a4 4 0 0 1-4 4h-4",
  };
  return (
    <li className="flex min-h-14 items-center gap-3 rounded-full bg-cloud px-5 py-3 text-[15px] font-medium text-ink">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-blue">
        <path d={paths[icon]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}

function SpeedLines() {
  return (
    <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" preserveAspectRatio="none" viewBox="0 0 1200 600" aria-hidden="true">
      <g stroke="#fff" strokeLinecap="round" opacity="0.12">
        <path d="M640 120h420" strokeWidth="10" />
        <path d="M720 170h300" strokeWidth="6" />
        <path d="M600 470h480" strokeWidth="10" />
        <path d="M760 520h260" strokeWidth="6" />
      </g>
    </svg>
  );
}

function ErrorNote() {
  return (
    <p role="alert" className="rounded-[var(--radius-card)] bg-danger-soft p-6 text-danger">
      We couldn&apos;t load products right now. Please refresh the page.
    </p>
  );
}

