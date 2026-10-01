import type { OrderStatus, StatusEvent } from "@/lib/types";
import { STEPS } from "@/lib/status";
import { formatDateTime } from "@/lib/format";

/*
  Six steps. A step with an event is "done" (shows its time), the latest is "current",
  the rest are "upcoming". State is always written in text, never colour alone.
*/
export function StatusTimeline({ status, events }: { status: OrderStatus; events: StatusEvent[] }) {
  const timeFor = new Map<string, string>();
  for (const e of events) timeFor.set(e.status, e.created_at);

  const cancelled = status === "cancelled";
  const currentIndex = cancelled
    ? Math.max(-1, ...STEPS.map((s, i) => (timeFor.has(s.key) ? i : -1)))
    : STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="relative" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i < currentIndex || (i === currentIndex && step.key === "delivered");
        const current = i === currentIndex && !cancelled && step.key !== "delivered";
        const reached = i <= currentIndex;
        const time = timeFor.get(step.key);
        const isLast = i === STEPS.length - 1 && !cancelled;
        const delivered = step.key === "delivered" && reached;

        return (
          <li key={step.key} className="relative flex gap-4 pb-7 last:pb-0" aria-current={current ? "step" : undefined}>
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 ${i < currentIndex ? "bg-blue" : "bg-cloud-strong"}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ${
                delivered
                  ? "bg-success text-white"
                  : reached
                    ? "bg-blue text-white"
                    : "border-2 border-cloud-strong bg-white"
              } ${current ? "ring-[6px] ring-blue-soft" : ""}`}
            >
              {(done || delivered) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {current && <span className="size-2.5 rounded-full bg-white" />}
            </span>
            <div className="pt-0.5">
              <p className={`text-[17px] font-semibold ${reached ? "text-ink" : "text-body"}`}>
                {step.label}
                <span className="sr-only">
                  {current ? ", current step" : done || delivered ? ", completed" : ", upcoming"}
                </span>
              </p>
              {reached && <p className="mt-0.5 text-[15px] text-body">{step.message}</p>}
              {time && (
                <p className="mt-0.5 text-[14px] text-body">
                  <time dateTime={time}>{formatDateTime(time)}</time>
                </p>
              )}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="relative flex gap-4" aria-current="step">
          <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-danger text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          <div className="pt-0.5">
            <p className="text-[17px] font-semibold text-danger">Cancelled</p>
            <p className="mt-0.5 text-[15px] text-body">This order was cancelled.</p>
            {timeFor.get("cancelled") && (
              <p className="mt-0.5 text-[14px] text-body">{formatDateTime(timeFor.get("cancelled")!)}</p>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const label = STEPS.find((s) => s.key === status)?.label ?? (status === "cancelled" ? "Cancelled" : status);
  const tone =
    status === "delivered"
      ? "bg-success-soft text-success"
      : status === "cancelled"
        ? "bg-danger-soft text-danger"
        : "bg-blue-soft text-blue-deep";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[13px] font-semibold ${tone}`}>{label}</span>;
}
