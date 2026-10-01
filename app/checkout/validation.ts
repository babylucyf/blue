export const FIELDS = ["full_name", "phone", "address", "city"] as const;
export type Field = (typeof FIELDS)[number];
export type Values = Record<Field, string>;
export type FieldErrors = Partial<Record<Field, string>>;

// Nigerian mobile numbers: 08012345678, +2348012345678, 2348012345678 (spaces/dashes allowed)
const PHONE_RE = /^(?:\+?234|0)[789][01]\d{8}$/;

export function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  if (v.full_name.trim().length < 2) e.full_name = "Enter your full name";
  if (!PHONE_RE.test(v.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid phone number, for example 0801 234 5678";
  if (v.address.trim().length < 8) e.address = "Enter your delivery address, including street and number";
  if (v.city.trim().length < 2) e.city = "Enter your city";
  return e;
}
