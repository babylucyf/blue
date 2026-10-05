"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export function EmailAuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();

    setError(null);
    setNotice(null);
    if (mode === "signup" && fullName.length < 2) return setError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setBusy(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setBusy(false);
        return setError(friendly(error.message));
      }
      if (!data.session) {
        setBusy(false);
        return setNotice("Account created. Check your email to confirm it, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setBusy(false);
        return setError(friendly(error.message));
      }
    }

    // Full reload so every page sees the new session cookie.
    window.location.assign(next);
  }

  return (
    <div className="text-left">
      <div className="mb-5 grid grid-cols-2 rounded-full bg-white p-1" role="tablist" aria-label="Sign in or create account">
        {(["signin", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
              setNotice(null);
            }}
            className={`min-h-11 rounded-full text-[15px] font-medium ${mode === m ? "bg-ink text-white" : "text-body"}`}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="full_name" className="mb-1.5 block text-[15px] font-medium">Full name</label>
            <input id="full_name" name="full_name" autoComplete="name" className="field" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[15px] font-medium">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" className="field" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-[15px] font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="field"
          />
          {mode === "signup" && <p className="mt-1.5 text-[13px] text-body">At least 6 characters.</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-2xl bg-danger-soft p-3 text-[15px] text-danger">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-2xl bg-success-soft p-3 text-[15px] text-success">
            {notice}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}

function friendly(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email or password is incorrect.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Sign in instead.";
  if (m.includes("email not confirmed")) return "Confirm your email first, then sign in.";
  if (m.includes("signups not allowed") || m.includes("disabled")) return "Email sign-up is turned off for this shop.";
  return "Something went wrong. Please try again.";
}
