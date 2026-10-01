import Link from "next/link";

// Same message whether the order doesn't exist or belongs to someone else.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="display text-[40px]">Order not found</h1>
      <p className="mt-3 text-body">Check the link, or find it in your orders.</p>
      <Link href="/orders" className="btn btn-primary mt-8">My orders</Link>
    </div>
  );
}
