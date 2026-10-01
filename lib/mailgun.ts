import "server-only";
import type { Order, OrderItem } from "./types";
import { renderOrderEmail } from "./email-template";

// Server only. Never import this file from a "use client" component.
export async function sendOrderConfirmation(to: string, order: Order, items: OrderItem[]) {
  const domain = process.env.MAILGUN_DOMAIN;
  const key = process.env.MAILGUN_API_KEY;
  if (!domain || !key) throw new Error("Mailgun is not configured (MAILGUN_DOMAIN / MAILGUN_API_KEY)");

  const base = process.env.MAILGUN_API_BASE ?? "https://api.mailgun.net";
  const { html, text } = renderOrderEmail(order, items);

  const body = new URLSearchParams({
    from: `Blue <orders@${domain}>`,
    to,
    subject: `Your Blue order ${order.order_number} is confirmed`,
    html,
    text,
  });

  const res = await fetch(`${base}/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`api:${key}`).toString("base64"),
    },
    body,
  });

  if (!res.ok) throw new Error(`Mailgun error ${res.status}: ${await res.text()}`);
}
