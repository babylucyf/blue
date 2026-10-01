import { ProductGridSkeleton } from "@/components/ProductCard";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <div className="skeleton h-14 w-72 rounded-full" />
      <div className="skeleton mt-4 h-5 w-96 max-w-full rounded-full" />
      <div className="mt-10">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
