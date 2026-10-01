import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-12 sm:px-6">
      <h1 className="display text-[clamp(40px,6vw,56px)]">Privacy</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-[1.6] text-body">
        <p>
          Blue is a demo shop built for the HNG15 internship. No real payments are taken and no real products are
          delivered.
        </p>
        <p>
          When you sign in with Google, we receive your name and email address. We use them only to save your cart,
          record your orders, and send your order confirmation email.
        </p>
        <p>
          When you place an order, we store the delivery details you enter (name, phone, address and city) so you can
          track it. Your orders are visible only to you and the shop admin.
        </p>
        <p>We do not sell or share your information, and we do not use it for advertising.</p>
        <p>To have your data deleted, contact the shop owner and we will remove it.</p>
      </div>
    </div>
  );
}
