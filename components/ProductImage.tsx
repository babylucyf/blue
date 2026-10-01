/* eslint-disable @next/next/no-img-element */
import type { Product } from "@/lib/types";

export function ProductImage({ product, className = "", alt }: { product: Product; className?: string; alt?: string }) {
  return (
    <div className={`overflow-hidden rounded-[var(--radius-card)] bg-cloud ${className}`}>
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={alt ?? product.name}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-body" role="img" aria-label={product.name}>
          No image
        </div>
      )}
    </div>
  );
}
