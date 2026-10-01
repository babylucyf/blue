"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/mailgun";
import type { Order, OrderItem } from "@/lib/types";
import { FIELDS, validate, type FieldErrors, type Values } from "./validation";

export type CheckoutState = {
  error?: string;
  fieldErrors?: FieldErrors;
  values?: Values;
};

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "").trim()])) as Values;

  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values, error: "Please fix the highlighted fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  // Prices and totals are calculated inside the database (place_order), never from the browser.
  const { data, error } = await supabase.rpc("place_order", {
    p_full_name: values.full_name,
    p_phone: values.phone.replace(/[\s-]/g, ""),
    p_address: values.address,
    p_city: values.city,
  });

  if (error || !data) {
    console.error("place_order failed:", error);
    const msg = error?.message ?? "";
    if (msg.includes("Cart is empty")) return { values, error: "Your cart is empty. Add something before checking out." };
    if (msg.includes("out of stock"))
      return { values, error: "Some items in your cart are no longer in stock. Update your cart and try again." };
    return { values, error: "We couldn't place your order. Nothing was charged. Please try again." };
  }

  const order = data as Order;

  // Email failure must never fail the order (PRD section 13).
  try {
    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    if (user.email) {
      await sendOrderConfirmation(user.email, order, (items ?? []) as OrderItem[]);
      await supabase.rpc("mark_order_email_sent", { p_order_id: order.id });
    }
  } catch (e) {
    console.error(`Confirmation email failed for ${order.order_number}:`, e);
  }

  redirect(`/orders/${order.id}/confirmation`);
}
