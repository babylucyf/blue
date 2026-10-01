import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatNaira } from "@/lib/format";
import type { Order } from "@/lib/types";
import { StatusBadge } from "@/components/StatusTimeline";

export const metadata: Metadata = { title: "My orders" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orders");

  // Explicit user filter: RLS also lets admins read every order, but this page is "my" orders.
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[clamp(40px,6vw,64px)]">My orders</h1>
          <p className="mt-3 text-[17px] text-body">{user.email}</p>
        </div>
        <form action="/auth/signout" method="post" className="sm:hidden">
          <button className="btn btn-light">Sign out</button>
        </form>
      </div>

      {error ? (
        <p role="alert" className="mt-10 rounded-[var(--radius-card)] bg-danger-soft p-6 text-danger">
          We couldn&apos;t load your orders. Please refresh the page.
        </p>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-card)] bg-cloud px-6 py-16 text-center">
          <p className="text-[22px] font-semibold">No orders yet.</p>
          <Link href="/products" className="btn btn-primary mt-8">Start shopping</Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] bg-cloud p-5 hover:bg-cloud-strong sm:p-6"
              >
                <div>
                  <p className="text-[18px] font-semibold">{o.order_number}</p>
                  <p className="mt-1 text-[15px] text-body">
                    {formatDate(o.created_at)} · {formatNaira(o.total_kobo)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="text-[15px] font-medium text-blue">Track order →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
