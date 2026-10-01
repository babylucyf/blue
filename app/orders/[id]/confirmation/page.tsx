import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { formatNaira } from "@/lib/format";
import { CartReset } from "@/components/CartReset";
import { SummaryRows } from "@/components/SummaryRows";

export const metadata: Metadata = { title: "Order placed" };

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const data = await getOrder((await params).id);
  if (!data) notFound();
  const { order, items } = data;

  return (
    <div className="px-4 pt-6 sm:px-6">
      <CartReset />
      <section className="on-blue mx-auto max-w-3xl rounded-[var(--radius-field)] bg-blue px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="m5 12 5 5 9-10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="display mt-6 text-[clamp(36px,6vw,56px)]">Order placed. It&apos;s moving.</h1>
        <p className="mt-4 text-[18px] text-white/85">
          Order number <strong className="font-semibold text-white">{order.order_number}</strong>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/orders/${order.id}`} className="btn btn-white min-w-40">Track order</Link>
          <Link href="/products" className="btn text-white underline-offset-4 hover:underline">Keep shopping</Link>
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-3xl gap-4 md:grid-cols-2">
        <section className="rounded-[var(--radius-card)] bg-cloud p-6 sm:p-8" aria-labelledby="items-title">
          <h2 id="items-title" className="text-[18px] font-semibold">Items</h2>
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
        </section>
        <section className="rounded-[var(--radius-card)] bg-cloud p-6 sm:p-8" aria-labelledby="next-title">
          <h2 id="next-title" className="text-[18px] font-semibold">What happens next</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-body">
            <li>
              {order.email_sent_at
                ? "We've emailed your confirmation and order summary."
                : "Save your order number. You can always find this order under My orders."}
            </li>
            <li>We confirm and pack your items. Each step shows on your tracking page.</li>
            <li>Your rider calls {order.phone} on the way to {order.city}.</li>
            <li>Pay {formatNaira(order.total_kobo)} on delivery.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
