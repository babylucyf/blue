import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const out = product.stock <= 0;
  return (
    <li className="group">
      <Link href={`/products/${product.slug}`} className="block rounded-[var(--radius-card)]">
        <div className="relative">
          <ProductImage product={product} alt="" className="aspect-square transition-colors group-hover:bg-cloud-strong" />
          {out && (
            <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[13px] font-medium text-ink">
              Out of stock
            </span>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3 px-1">
          <h3 className="text-[16px] font-medium leading-snug text-ink">{product.name}</h3>
          <p className="shrink-0 text-[16px] font-semibold text-ink">{formatNaira(product.price_kobo)}</p>
        </div>
      </Link>
    </li>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className="skeleton aspect-square rounded-[var(--radius-card)]" />
          <div className="skeleton mt-3 h-4 w-3/4 rounded-full" />
          <div className="skeleton mt-2 h-4 w-1/3 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
