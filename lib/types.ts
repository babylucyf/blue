export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_kobo: number;
  image_url: string | null;
  stock: number;
  is_featured: boolean;
};

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  subtotal_kobo: number;
  delivery_fee_kobo: number;
  total_kobo: number;
  payment_method: string;
  email_sent_at: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price_kobo: number;
  quantity: number;
};

export type StatusEvent = {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
};
