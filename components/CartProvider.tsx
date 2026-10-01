"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

/*
  Cart rules (architecture.md 6.3):
  - Signed out: cart lives in this browser (localStorage).
  - On sign-in: browser items are merged into cart_items in Supabase, then the browser copy is cleared.
  - Signed in: every change is written to Supabase, so the cart follows the user across devices.
*/

const LOCAL_KEY = "blue-cart-v1";

export type CartLine = { product: Product; quantity: number };
type LocalLine = { product_id: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  userId: string | null;
  count: number;
  subtotalKobo: number;
  error: string | null;
  add: (product: Product, quantity?: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  reload: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function readLocal(): LocalLine[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((l) => typeof l?.product_id === "string" && Number.isInteger(l?.quantity) && l.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

function writeLocal(lines: CartLine[]) {
  try {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify(lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })))
    );
  } catch {
    /* storage unavailable: cart stays in memory for this visit */
  }
}

function clearLocal() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {}
}

export function CartProvider({
  initialUserId,
  children,
}: {
  initialUserId: string | null;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const loadFromDb = useCallback(
    async (uid: string) => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity, product:products(*)")
        .eq("user_id", uid)
        .order("id");
      if (error) throw error;
      return (data ?? [])
        .filter((r) => r.product)
        .map((r) => ({ product: r.product as unknown as Product, quantity: r.quantity as number }));
    },
    [supabase]
  );

  const loadFromLocal = useCallback(async () => {
    const local = readLocal();
    if (local.length === 0) return [];
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", local.map((l) => l.product_id));
    if (error) throw error;
    const byId = new Map((data as Product[]).map((p) => [p.id, p]));
    return local
      .filter((l) => byId.has(l.product_id))
      .map((l) => ({ product: byId.get(l.product_id)!, quantity: l.quantity }));
  }, [supabase]);

  // Move browser cart into the database after sign-in.
  const mergeLocalIntoDb = useCallback(
    async (uid: string) => {
      const local = readLocal();
      if (local.length === 0) return;
      const { data: existing } = await supabase
        .from("cart_items")
        .select("product_id, quantity")
        .eq("user_id", uid);
      const current = new Map((existing ?? []).map((r) => [r.product_id as string, r.quantity as number]));
      const rows = local.map((l) => ({
        user_id: uid,
        product_id: l.product_id,
        quantity: (current.get(l.product_id) ?? 0) + l.quantity,
      }));
      const { error } = await supabase.from("cart_items").upsert(rows, { onConflict: "user_id,product_id" });
      if (!error) clearLocal();
    },
    [supabase]
  );

  const load = useCallback(
    async (uid: string | null) => {
      setError(null);
      try {
        if (uid) {
          await mergeLocalIntoDb(uid);
          setLines(await loadFromDb(uid));
        } else {
          setLines(await loadFromLocal());
        }
      } catch {
        setError("We couldn't load your cart. Check your connection and refresh.");
      } finally {
        setReady(true);
      }
    },
    [loadFromDb, loadFromLocal, mergeLocalIntoDb]
  );

  const userIdRef = useRef(initialUserId);

  useEffect(() => {
    load(initialUserId);
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      if ((event === "SIGNED_IN" || event === "SIGNED_OUT") && uid !== userIdRef.current) {
        userIdRef.current = uid;
        setUserId(uid);
        // Defer: Supabase advises not to call its API inside this callback directly.
        setTimeout(() => load(uid), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    async (next: CartLine[], changed: { productId: string; quantity: number }) => {
      setLines(next);
      if (!userId) {
        writeLocal(next);
        return;
      }
      const q =
        changed.quantity > 0
          ? supabase
              .from("cart_items")
              .upsert(
                { user_id: userId, product_id: changed.productId, quantity: changed.quantity },
                { onConflict: "user_id,product_id" }
              )
          : supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", changed.productId);
      const { error } = await q;
      if (error) {
        setError("That change didn't save. Please try again.");
        setLines(await loadFromDb(userId).catch(() => linesRef.current));
      } else {
        setError(null);
      }
    },
    [supabase, userId, loadFromDb]
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const line = linesRef.current.find((l) => l.product.id === productId);
      if (!line) return;
      const q = Math.max(0, Math.min(quantity, line.product.stock));
      const next =
        q === 0
          ? linesRef.current.filter((l) => l.product.id !== productId)
          : linesRef.current.map((l) => (l.product.id === productId ? { ...l, quantity: q } : l));
      await persist(next, { productId, quantity: q });
    },
    [persist]
  );

  const add = useCallback(
    async (product: Product, quantity = 1) => {
      const existing = linesRef.current.find((l) => l.product.id === product.id);
      const q = Math.min((existing?.quantity ?? 0) + quantity, product.stock);
      if (q <= 0) return;
      const next = existing
        ? linesRef.current.map((l) => (l.product.id === product.id ? { product, quantity: q } : l))
        : [...linesRef.current, { product, quantity: q }];
      await persist(next, { productId: product.id, quantity: q });
    },
    [persist]
  );

  const remove = useCallback((productId: string) => setQuantity(productId, 0), [setQuantity]);
  const reload = useCallback(() => load(userId), [load, userId]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      userId,
      error,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalKobo: lines.reduce((n, l) => n + l.quantity * l.product.price_kobo, 0),
      add,
      setQuantity,
      remove,
      reload,
    }),
    [lines, ready, userId, error, add, setQuantity, remove, reload]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
