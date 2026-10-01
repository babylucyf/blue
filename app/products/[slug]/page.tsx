import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { DELIVERY_ESTIMATE, DELIVERY_FEE_KOBO, formatNaira } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  return data as Product | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "Product not found" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const out = product.stock <= 0;
  const low = !out && product.stock <= 5;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-[15px] text-body">
        <Link href="/products" className="hover:text-ink">All products</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductImage product={product} className="aspect-square" />

        <div className="md:pt-6">
          <h1 className="display text-[clamp(36px,5vw,56px)]">{product.name}</h1>
          <p className="mt-4 text-[28px] font-semibold tracking-tight text-ink">{formatNaira(product.price_kobo)}</p>

          <p className={`mt-2 text-[15px] font-medium ${out ? "text-danger" : "text-body"}`}>
            {out ? "Out of stock" : low ? `Only ${product.stock} left in stock` : "In stock"}
          </p>

          {product.description && (
            <p className="mt-6 max-w-prose text-[18px] leading-[1.5] text-body">{product.description}</p>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <dl className="mt-8 space-y-3 rounded-[var(--radius-card)] bg-cloud p-6 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-body">Delivery fee</dt>
              <dd className="font-medium text-ink">{formatNaira(DELIVERY_FEE_KOBO)} per order</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-body">Estimated delivery</dt>
              <dd className="font-medium text-ink">{DELIVERY_ESTIMATE}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-body">Payment</dt>
              <dd className="font-medium text-ink">Pay on delivery</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
