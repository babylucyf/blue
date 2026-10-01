import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { ProductGrid } from "@/components/ProductCard";
import { DELIVERY_FEE_KOBO, formatNaira } from "@/lib/format";

export const metadata: Metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("created_at");
  const products = (data ?? []) as Product[];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="display text-[clamp(40px,6vw,64px)]">All products</h1>
      <p className="mt-3 text-[17px] text-body">
        Pay on delivery. Flat {formatNaira(DELIVERY_FEE_KOBO)} delivery fee on every order.
      </p>
      <div className="mt-10">
        {error ? (
          <p role="alert" className="rounded-[var(--radius-card)] bg-danger-soft p-6 text-danger">
            We couldn&apos;t load products right now. Please refresh the page.
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-[var(--radius-card)] bg-cloud p-8 text-body">No products yet. Check back soon.</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
