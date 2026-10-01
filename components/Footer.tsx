import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo className="text-[18px] text-ink" />
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-body">
            Everyday tech accessories, delivered fast, with tracking from the moment you order.
          </p>
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-ink">Shop</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li><Link className="text-body hover:text-ink" href="/products">All products</Link></li>
            <li><Link className="text-body hover:text-ink" href="/cart">Cart</Link></li>
            <li><Link className="text-body hover:text-ink" href="/orders">Track an order</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-ink">Good to know</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-body">
            <li>Pay on delivery</li>
            <li>Flat ₦1,500 delivery fee</li>
            <li>Unused items can be returned within 7 days</li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-10 text-[13px] text-body sm:px-6">
        Blue is a demo shop built for HNG15. Products and prices are placeholders.
      </p>
    </footer>
  );
}
