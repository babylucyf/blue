"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { UUID_RE } from "@/lib/format";

// The database functions re-check is_admin(), so these can't be abused by non-admins.
export async function advanceStatus(formData: FormData) {
  const id = String(formData.get("order_id") ?? "");
  if (!UUID_RE.test(id)) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("advance_order_status", { p_order_id: id });
  if (error) console.error("advance_order_status failed:", error);
  revalidatePath("/admin");
  revalidatePath(`/orders/${id}`);
}

export async function cancelOrder(formData: FormData) {
  const id = String(formData.get("order_id") ?? "");
  if (!UUID_RE.test(id)) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_order", { p_order_id: id });
  if (error) console.error("cancel_order failed:", error);
  revalidatePath("/admin");
  revalidatePath(`/orders/${id}`);
}
