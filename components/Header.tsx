import Link from "next/link";
import { Logo } from "./Logo";
import { CartLink } from "./CartLink";

export function Header({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  return (
    <header className="sticky top-3 z-40 px-4 sm:px-6">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center gap-1 rounded-[32px] bg-white/85 py-2 pl-5 pr-2 shadow-[var(--shadow-float)] backdrop-blur-xl sm:gap-2"
      >
        <Link href="/" className="mr-auto flex min-h-11 items-center text-[18px] text-ink" aria-label="Blue home">
          <Logo />
        </Link>
        <Link href="/products" className="flex min-h-11 items-center rounded-full px-3 text-[16px] font-medium text-body hover:text-ink">
          Shop
        </Link>
        {signedIn && (
          <Link href="/orders" className="flex min-h-11 items-center rounded-full px-3 text-[16px] font-medium text-body hover:text-ink">
            Orders
          </Link>
        )}
        {isAdmin && (
          <Link href="/admin" className="hidden min-h-11 items-center rounded-full px-3 text-[16px] font-medium text-body hover:text-ink sm:flex">
            Admin
          </Link>
        )}
        <CartLink />
        {signedIn ? (
          <form action="/auth/signout" method="post" className="hidden sm:block">
            <button className="btn btn-light !min-h-11 !px-4 !py-2">Sign out</button>
          </form>
        ) : (
          <Link href="/login" className="btn btn-dark !min-h-11 !px-4 !py-2">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
