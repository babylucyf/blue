import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/format";
import { GoogleButton } from "./GoogleButton";
import { EmailAuthForm } from "./EmailAuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeNext(next, "/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(target);

  const fromCheckout = target.startsWith("/checkout");

  return (
    <div className="px-4 pt-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-[var(--radius-field)] bg-cloud px-6 py-12 text-center sm:px-10">
        <h1 className="display text-[40px]">{fromCheckout ? "Sign in to check out" : "Sign in to Blue"}</h1>
        <p className="mx-auto mt-4 max-w-xs text-[17px] leading-[1.45] text-body">
          {fromCheckout
            ? "Your cart is saved. Sign in so we can save your order and send you tracking updates."
            : "See your orders and track every delivery."}
        </p>
        {error && (
          <p role="alert" className="mt-6 rounded-2xl bg-danger-soft p-3 text-[15px] text-danger">
            Sign-in didn&apos;t complete. Please try again.
          </p>
        )}
        <div className="mt-8">
          <GoogleButton next={target} />
        </div>
        <div className="my-6 flex items-center gap-3 text-[13px] text-body" aria-hidden="true">
          <span className="h-px flex-1 bg-cloud-strong" />
          or use email
          <span className="h-px flex-1 bg-cloud-strong" />
        </div>
        <EmailAuthForm next={target} />
        <p className="mt-6 text-[13px] text-body">The same account works on the Blue website and the Blue Android app. We only use your name and email to manage your orders.</p>
      </div>
    </div>
  );
}
