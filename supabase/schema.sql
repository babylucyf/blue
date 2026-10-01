-- =====================================================================
-- Blue: database setup
-- Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Run it ONCE on a fresh project. It creates tables, the place_order
-- function, security rules (RLS) and placeholder products.
-- =====================================================================

-- ---------- TABLES ----------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile the first time someone signs in with Google
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_kobo integer not null check (price_kobo >= 0),
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unique (user_id, product_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid not null references profiles(id),
  status text not null default 'placed'
    check (status in ('placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled')),
  full_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  subtotal_kobo integer not null,
  delivery_fee_kobo integer not null,
  total_kobo integer not null,
  payment_method text not null default 'pay_on_delivery',
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text not null,
  unit_price_kobo integer not null,
  quantity integer not null check (quantity > 0)
);

create table order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index on cart_items (user_id);
create index on orders (user_id, created_at desc);
create index on order_items (order_id);
create index on order_status_events (order_id, created_at);

-- ---------- SECURITY (Row Level Security) ----------------------------

alter table profiles enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_events enable row level security;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

create policy "products readable" on products for select using (true);

create policy "own profile" on profiles for select using (id = auth.uid());

create policy "own cart" on cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own orders" on orders for select
  using (user_id = auth.uid() or is_admin());

create policy "own order items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id
                 and (o.user_id = auth.uid() or is_admin())));

create policy "own order events" on order_status_events for select
  using (exists (select 1 from orders o where o.id = order_id
                 and (o.user_id = auth.uid() or is_admin())));

-- No insert/update policies on orders for normal users.
-- Orders are created only through place_order() and changed only
-- through advance_order_status() (admin) below.

-- ---------- PLACE ORDER (all-or-nothing) -----------------------------

create function public.place_order(
  p_full_name text, p_phone text, p_address text, p_city text
) returns orders
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_subtotal integer;
  v_fee integer := 150000; -- ₦1,500 delivery fee (placeholder). Keep in sync with lib/format.ts
  v_order orders;
begin
  if v_user is null then raise exception 'Not signed in'; end if;

  if not exists (select 1 from cart_items where user_id = v_user) then
    raise exception 'Cart is empty';
  end if;

  -- Lock the product rows so two orders can't oversell the same stock
  perform 1 from products p join cart_items c on c.product_id = p.id
  where c.user_id = v_user for update of p;

  if exists (
    select 1 from cart_items c join products p on p.id = c.product_id
    where c.user_id = v_user and c.quantity > p.stock
  ) then
    raise exception 'Some items are out of stock';
  end if;

  select sum(c.quantity * p.price_kobo) into v_subtotal
  from cart_items c join products p on p.id = c.product_id
  where c.user_id = v_user;

  insert into orders (order_number, user_id, full_name, phone, address, city,
                      subtotal_kobo, delivery_fee_kobo, total_kobo)
  values ('BLU-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)), v_user,
          trim(p_full_name), trim(p_phone), trim(p_address), trim(p_city),
          v_subtotal, v_fee, v_subtotal + v_fee)
  returning * into v_order;

  insert into order_items (order_id, product_id, product_name, unit_price_kobo, quantity)
  select v_order.id, p.id, p.name, p.price_kobo, c.quantity
  from cart_items c join products p on p.id = c.product_id
  where c.user_id = v_user;

  update products p set stock = p.stock - c.quantity
  from cart_items c where c.product_id = p.id and c.user_id = v_user;

  insert into order_status_events (order_id, status, note)
  values (v_order.id, 'placed', 'Order received');

  delete from cart_items where user_id = v_user;

  return v_order;
end; $$;

-- Lets the order owner record that the confirmation email was sent
create function public.mark_order_email_sent(p_order_id uuid) returns void
language sql security definer set search_path = public as $$
  update orders set email_sent_at = now()
  where id = p_order_id and user_id = auth.uid();
$$;

-- Admin only: move an order to the next tracking step
create function public.advance_order_status(p_order_id uuid) returns orders
language plpgsql security definer set search_path = public as $$
declare
  v_steps text[] := array['placed','confirmed','packed','shipped','out_for_delivery','delivered'];
  v_order orders;
  v_pos int;
  v_next text;
begin
  if not is_admin() then raise exception 'Not allowed'; end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  v_pos := array_position(v_steps, v_order.status);
  if v_pos is null or v_pos >= array_length(v_steps, 1) then
    raise exception 'Order cannot move further';
  end if;

  v_next := v_steps[v_pos + 1];
  update orders set status = v_next where id = p_order_id returning * into v_order;
  insert into order_status_events (order_id, status) values (p_order_id, v_next);
  return v_order;
end; $$;

-- Admin only: cancel an order that hasn't been delivered
create function public.cancel_order(p_order_id uuid) returns orders
language plpgsql security definer set search_path = public as $$
declare v_order orders;
begin
  if not is_admin() then raise exception 'Not allowed'; end if;
  update orders set status = 'cancelled'
  where id = p_order_id and status not in ('delivered','cancelled')
  returning * into v_order;
  if not found then raise exception 'Order cannot be cancelled'; end if;
  insert into order_status_events (order_id, status, note) values (p_order_id, 'cancelled', 'Cancelled by Blue');
  return v_order;
end; $$;

revoke execute on function public.place_order(text,text,text,text) from anon;
revoke execute on function public.mark_order_email_sent(uuid) from anon;
revoke execute on function public.advance_order_status(uuid) from anon;
revoke execute on function public.cancel_order(uuid) from anon;

-- ---------- PLACEHOLDER PRODUCTS --------------------------------------
-- Names, prices and stock are demo content, not real prices.
-- Images are the illustrations in /public/products.

insert into products (slug, name, description, price_kobo, image_url, stock, is_featured) values
('fast-charger-20w', '20W USB-C Fast Charger', 'Compact wall charger with one USB-C port. Charges most phones from 0 to 50% in about 30 minutes.', 850000, '/products/fast-charger-20w.svg', 40, true),
('usb-c-cable-1m', 'USB-C to USB-C Cable, 1m', 'Braided cable for charging and data. Supports up to 60W.', 450000, '/products/usb-c-cable-1m.svg', 60, true),
('wireless-earbuds', 'Wireless Earbuds', 'Bluetooth earbuds with a pocket charging case and touch controls.', 2450000, '/products/wireless-earbuds.svg', 25, true),
('power-bank-10000', '10,000mAh Power Bank', 'Slim power bank with USB-C in/out. About two full phone charges.', 1800000, '/products/power-bank-10000.svg', 30, true),
('clear-phone-case', 'Clear Shockproof Case', 'Slim clear case with reinforced corners. Choose your phone model at delivery.', 350000, '/products/clear-phone-case.svg', 80, false),
('screen-protector', 'Tempered Glass Screen Protector', '9H tempered glass with an easy-align frame. Pack of 2.', 250000, '/products/screen-protector.svg', 100, false),
('wireless-charging-pad', '15W Wireless Charging Pad', 'Place-and-charge pad for Qi-compatible phones and earbuds.', 1200000, '/products/wireless-charging-pad.svg', 20, false),
('car-charger-dual', 'Dual-Port Car Charger', 'USB-C and USB-A car charger. Charge two devices on the move.', 650000, '/products/car-charger-dual.svg', 0, false);

-- ---------- AFTER YOUR FIRST GOOGLE SIGN-IN ---------------------------
-- Make yourself admin (replace with your Google email), then run:
-- update profiles set is_admin = true where email = 'your-email@gmail.com';
