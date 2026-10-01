// Keep in sync with v_fee in supabase/schema.sql (place_order).
export const DELIVERY_FEE_KOBO = 150000;
export const DELIVERY_ESTIMATE = "1 to 3 days in Lagos";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 850000 kobo -> "₦8,500" */
export function formatNaira(kobo: number) {
  return naira.format(kobo / 100).replace("NGN", "₦").replace(/\s/g, "");
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(iso));
}

export function siteUrl() {
  // On Vercel, the live address is filled in automatically, so NEXT_PUBLIC_SITE_URL is optional.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

/** Only allow internal redirects like "/checkout" (blocks "//evil.com"). */
export function safeNext(next: string | null | undefined, fallback = "/") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
