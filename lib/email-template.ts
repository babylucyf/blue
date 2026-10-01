import type { Order, OrderItem } from "./types";
import { formatNaira, siteUrl } from "./format";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderOrderEmail(order: Order, items: OrderItem[]) {
  const trackUrl = `${siteUrl()}/orders/${order.id}`;

  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e3e8f0;color:#222326;font-size:15px;">
          ${esc(i.product_name)} <span style="color:#6b6d70;">× ${i.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e3e8f0;color:#222326;font-size:15px;text-align:right;white-space:nowrap;">
          ${formatNaira(i.unit_price_kobo * i.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#ebf0f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebf0f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;">
        <tr><td style="background:#1446ff;padding:28px 32px;">
          <div style="color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.4px;">Blue</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;color:#222326;font-size:28px;line-height:1.1;font-weight:600;letter-spacing:-0.8px;">Order placed. It's moving.</h1>
          <p style="margin:0 0 24px;color:#6b6d70;font-size:16px;line-height:1.5;">
            Thanks, ${esc(order.full_name)}. Your order <strong style="color:#222326;">${order.order_number}</strong> is confirmed.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows}
            <tr><td style="padding:10px 0 0;color:#6b6d70;font-size:15px;">Subtotal</td><td style="padding:10px 0 0;text-align:right;color:#222326;font-size:15px;">${formatNaira(order.subtotal_kobo)}</td></tr>
            <tr><td style="padding:6px 0 0;color:#6b6d70;font-size:15px;">Delivery</td><td style="padding:6px 0 0;text-align:right;color:#222326;font-size:15px;">${formatNaira(order.delivery_fee_kobo)}</td></tr>
            <tr><td style="padding:12px 0 0;color:#222326;font-size:17px;font-weight:600;">Total</td><td style="padding:12px 0 0;text-align:right;color:#222326;font-size:17px;font-weight:600;">${formatNaira(order.total_kobo)}</td></tr>
          </table>
          <p style="margin:24px 0 0;color:#6b6d70;font-size:15px;line-height:1.5;">
            <strong style="color:#222326;">Payment:</strong> Pay on delivery<br>
            <strong style="color:#222326;">Delivering to:</strong> ${esc(order.address)}, ${esc(order.city)}
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td style="background:#1446ff;border-radius:999px;">
            <a href="${trackUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Track your order</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e3e8f0;color:#6b6d70;font-size:13px;line-height:1.5;">
          Blue. Order fast. Track every step.<br>You received this because you placed an order on Blue.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Order placed. It's moving.`,
    `Order ${order.order_number}`,
    ``,
    ...items.map((i) => `${i.product_name} x ${i.quantity}: ${formatNaira(i.unit_price_kobo * i.quantity)}`),
    ``,
    `Subtotal: ${formatNaira(order.subtotal_kobo)}`,
    `Delivery: ${formatNaira(order.delivery_fee_kobo)}`,
    `Total: ${formatNaira(order.total_kobo)} (pay on delivery)`,
    `Delivering to: ${order.address}, ${order.city}`,
    ``,
    `Track your order: ${trackUrl}`,
  ].join("\n");

  return { html, text };
}
