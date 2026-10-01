"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** The order emptied the cart in the database; refresh the header count. */
export function CartReset() {
  const { reload } = useCart();
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
