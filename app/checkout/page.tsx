import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  // Prefill delivery details from the most recent order, else the Google name.
  const { data: last } = await supabase
    .from("orders")
    .select("full_name, phone, address, city")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const defaults = {
    full_name: last?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "",
    phone: last?.phone ?? "",
    address: last?.address ?? "",
    city: last?.city ?? "Lagos",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <h1 className="display text-[clamp(40px,6vw,64px)]">Checkout</h1>
      <p className="mt-3 text-[17px] text-body">Signed in as {user.email}</p>
      <CheckoutForm defaults={defaults} />
    </div>
  );
}
