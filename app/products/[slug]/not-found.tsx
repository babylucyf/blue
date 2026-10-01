import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="display text-[40px]">Product not found</h1>
      <p className="mt-3 text-body">It may have been removed or the link is wrong.</p>
      <Link href="/products" className="btn btn-primary mt-8">Browse all products</Link>
    </div>
  );
}
