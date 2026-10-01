# Blue

Gadgets at the speed of Blue. A small shop for HNG15 (Lesson 2): browse, cart, Google sign-in, checkout, Mailgun confirmation email, and order tracking. Built with Next.js 15, Supabase and Mailgun, hosted on Vercel.

## Run it on your computer

1. Install Node.js 20 or newer.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the values (steps below).
4. Run `npm run dev` and open http://localhost:3000.

## One-time setup (about 30 minutes)

### 1. Supabase
1. Create a project at supabase.com.
2. **SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**. This creates the tables, security rules, order functions and 8 placeholder products.
3. **Project Settings → API**: copy the Project URL and the `anon` key into `.env.local`.

### 2. Google sign-in
1. console.cloud.google.com → new project → **APIs & Services → OAuth consent screen**: External, app name "Blue", add your email as a test user.
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. **Authorised redirect URI**: copy it from Supabase **Authentication → Providers → Google** (looks like `https://xxxx.supabase.co/auth/v1/callback`). Paste, don't type.
4. Paste the Client ID and Secret into that Supabase Google provider screen and turn it on.
5. Supabase **Authentication → URL Configuration**: Site URL = your Vercel URL. Redirect URLs: add `http://localhost:3000/**` and `https://YOUR-APP.vercel.app/**`.

### 3. Make yourself admin
Sign in once on the site, then run in the SQL Editor:
```sql
update profiles set is_admin = true where email = 'your-email@gmail.com';
```
An **Admin** link appears in the header. Use it to move orders through Placed → Confirmed → Packed → Shipped → Out for delivery → Delivered.

### 4. Mailgun
1. Create an account and open the sandbox domain.
2. Add your email (and any reviewer's) under **Authorized Recipients** and confirm from the inbox. Sandbox domains only send to these addresses.
3. Put the API key and sandbox domain in `.env.local`. EU accounts also set `MAILGUN_API_BASE=https://api.eu.mailgun.net`.

### 5. Deploy to Vercel
1. Push to GitHub. Check `.env.local` is **not** in the commit (it's in `.gitignore`).
2. Import the repo in Vercel, add the same environment variables (set `NEXT_PUBLIC_SITE_URL` to the live URL), deploy.
3. Update the Supabase Site URL and Redirect URLs with the live address, then test sign-in on the live site and on your phone.

## Where things live

| Path | What it does |
|---|---|
| `app/page.tsx` | Homepage: hero, trust strip, staff picks, three promises |
| `app/products` | Product list and product detail |
| `app/cart/page.tsx` | Cart (browser storage when signed out, Supabase when signed in) |
| `app/checkout` | Delivery form, order summary, `placeOrder` server action |
| `app/orders` | My orders, tracking timeline, confirmation screen |
| `app/admin` | Admin order list and status buttons |
| `components/CartProvider.tsx` | Cart logic, including merging the browser cart after sign-in |
| `lib/mailgun.ts`, `lib/email-template.ts` | Confirmation email (server only) |
| `supabase/schema.sql` | Database, security rules, `place_order`, seed products |

## Things to know
- Totals are calculated in the database (`place_order`), never in the browser.
- If Mailgun fails, the order still goes through; the error is logged and the admin page shows "Email not sent".
- The ₦1,500 delivery fee lives in two places: `lib/format.ts` and `place_order` in `schema.sql`. Change both together.
- Product names, prices and illustrations are placeholders.
