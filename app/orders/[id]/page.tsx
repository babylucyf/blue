import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { formatDate, formatNaira } from "@/lib/format";
import { statusMessage } from "@/lib/status";
import { StatusBadge, StatusTimeline } from "@/components/StatusTimeline";
import { SummaryRows } from "@/components/SummaryRows";

export const metadata: Metadata = { title: "Track order" };
export const dynamic = "force-dynamic";

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const data = await getOrder((await params).id);
  if (!data) notFound();
  const { order, items, events } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
      <Link href="/orders" className="text-[15px] text-body hover:text-ink">← My orders</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="display text-[clamp(36px,5vw,56px)]">{order.order_number}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-3 text-[17px] text-body">
        Placed {formatDate(order.created_at)} · {statusMessage(order.status)}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_360px] md:items-start">
        <section className="rounded-[var(--radius-card)] bg-cloud p-6 sm:p-8" aria-labelledby="track-title">
          <h2 id="track-title" className="mb-6 text-[20px] font-semibold">Tracking</h2>
          <StatusTimeline status={order.status} events={events} />
          <p className="mt-8 text-[14px] text-body">Refresh this page to see the latest update.</p>
        </section>

        <div className="space-y-4">
          <section className="rounded-[var(--radius-card)] bg-cloud p-6" aria-labelledby="sum-title">
            <h2 id="sum-title" className="text-[18px] font-semibold">Items</h2>
            <ul className="mt-4 space-y-3 border-b border-line pb-4 text-[15px]">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4">
                  <span>{i.product_name} <span className="text-body">× {i.quantity}</span></span>
                  <span className="tabular-nums">{formatNaira(i.unit_price_kobo * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <SummaryRows subtotal={order.subtotal_kobo} fee={order.delivery_fee_kobo} />
            </div>
            <p className="mt-3 text-[14px] text-body">Pay on delivery</p>
          </section>
          <section className="rounded-[var(--radius-card)] bg-cloud p-6" aria-labelledby="addr-title">
            <h2 id="addr-title" className="text-[18px] font-semibold">Delivering to</h2>
            <address className="mt-3 text-[15px] not-italic leading-relaxed text-body">
              <span className="text-ink">{order.full_name}</span>
              <br />
              {order.address}
              <br />
              {order.city}
              <br />
              {order.phone}
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
