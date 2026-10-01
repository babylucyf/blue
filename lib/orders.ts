import "server-only";
import { createClient } from "@/lib/supabase/server";
import { UUID_RE } from "@/lib/format";
import type { Order, OrderItem, StatusEvent } from "@/lib/types";

/** Loads an order the current user is allowed to see (RLS enforces it). Returns null otherwise. */
export async function getOrder(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;
  const [{ data: items }, { data: events }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("order_status_events").select("*").eq("order_id", id).order("created_at"),
  ]);
  return {
    order: order as Order,
    items: (items ?? []) as OrderItem[],
    events: (events ?? []) as StatusEvent[],
  };
}
