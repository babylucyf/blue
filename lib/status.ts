import type { OrderStatus } from "./types";

export const STEPS: { key: OrderStatus; label: string; message: string }[] = [
  { key: "placed", label: "Placed", message: "We've received your order." },
  { key: "confirmed", label: "Confirmed", message: "Your order is confirmed." },
  { key: "packed", label: "Packed", message: "Your items are packed and ready." },
  { key: "shipped", label: "Shipped", message: "Your order is on its way." },
  { key: "out_for_delivery", label: "Out for delivery", message: "Your rider is heading to you." },
  { key: "delivered", label: "Delivered", message: "Delivered. Enjoy your new gear." },
];

export function statusLabel(s: OrderStatus) {
  if (s === "cancelled") return "Cancelled";
  return STEPS.find((x) => x.key === s)?.label ?? s;
}

export function statusMessage(s: OrderStatus) {
  if (s === "cancelled") return "This order was cancelled.";
  return STEPS.find((x) => x.key === s)?.message ?? "";
}

export function nextStatus(s: OrderStatus): OrderStatus | null {
  const i = STEPS.findIndex((x) => x.key === s);
  if (i === -1 || i === STEPS.length - 1) return null;
  return STEPS[i + 1].key;
}
