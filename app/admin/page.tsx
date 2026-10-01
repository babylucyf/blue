import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatNaira } from "@/lib/format";
import { nextStatus, statusLabel } from "@/lib/status";
import type { Order } from "@/lib/types";
import { StatusBadge } from "@/components/StatusTimeline";
import { advanceStatus, cancelOrder } from "./actions";
import { SubmitButton } from "./SubmitButton";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) notFound();

  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
  const orders = (data ?? []) as Order[];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
      <h1 className="display text-[clamp(40px,6vw,64px)]">Orders</h1>
      <p className="mt-3 text-[17px] text-body">
        Move each order forward as it happens. Customers see the update on their tracking page.
      </p>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-[var(--radius-card)] bg-cloud p-8 text-body">No orders yet.</p>
      ) : (
        <ul className="mt-10 space-y-3">
          {orders.map((o) => {
            const next = nextStatus(o.status);
            const canCancel = o.status !== "delivered" && o.status !== "cancelled";
            return (
              <li key={o.id} className="rounded-[var(--radius-card)] bg-cloud p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/orders/${o.id}`} className="text-[18px] font-semibold hover:underline">
                        {o.order_number}
                      </Link>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-1 text-[15px] text-body">
                      {o.full_name} · {o.phone} · {o.city}
                    </p>
                    <p className="text-[15px] text-body">
                      {formatNaira(o.total_kobo)} · {formatDateTime(o.created_at)}
                      {!o.email_sent_at && <span className="text-danger"> · Email not sent</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {next && (
                      <form action={advanceStatus}>
                        <input type="hidden" name="order_id" value={o.id} />
                        <SubmitButton className="btn btn-primary" pendingText="Updating...">
                          Move to {statusLabel(next)}
                        </SubmitButton>
                      </form>
                    )}
                    {canCancel && (
                      <form action={cancelOrder}>
                        <input type="hidden" name="order_id" value={o.id} />
                        <SubmitButton className="btn btn-light" pendingText="Cancelling...">
                          Cancel
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
