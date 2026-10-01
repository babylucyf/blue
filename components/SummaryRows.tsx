import { formatNaira } from "@/lib/format";

export function SummaryRows({ subtotal, fee }: { subtotal: number; fee: number }) {
  return (
    <dl className="space-y-3 text-[16px]">
      <div className="flex justify-between">
        <dt className="text-body">Subtotal</dt>
        <dd className="text-ink">{formatNaira(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-body">Delivery</dt>
        <dd className="text-ink">{formatNaira(fee)}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-[18px] font-semibold">
        <dt>Total</dt>
        <dd>{formatNaira(subtotal + fee)}</dd>
      </div>
    </dl>
  );
}
