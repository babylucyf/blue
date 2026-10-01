import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="display text-[40px]">Page not found</h1>
      <p className="mt-3 text-body">The link may be wrong or the page has moved.</p>
      <Link href="/" className="btn btn-primary mt-8">Go to the homepage</Link>
    </div>
  );
}
