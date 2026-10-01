"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleG } from "@/components/GoogleG";

export function GoogleButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError("We couldn't reach Google. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={signIn} disabled={busy} className="btn w-full bg-white text-ink shadow-[var(--shadow-lift)] hover:bg-paper">
        <GoogleG />
        {busy ? "Opening Google..." : "Continue with Google"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-[15px] text-danger">
          {error}
        </p>
      )}
    </>
  );
}
