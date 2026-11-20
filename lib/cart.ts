import { supabase } from "@/lib/supabase/client";

export type CartItem = { id: string; name: string; image: string | null; price: number; quantity: number };
const LEGACY_KEY = "hubinbd_cart_v1";
const KEY_PREFIX = "hubinbd_cart_v1:";
export const CART_EVENT = "hubinbd-cart-updated";

export async function getCustomerCartUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, reason: "login" as const };
  const [{ data: roleRow, error: roleError }, { data: vendor, error: vendorError }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
    supabase.from("vendors").select("status").eq("user_id", user.id).maybeSingle(),
  ]);
  if (roleError || vendorError) return { user: null, reason: "error" as const };
  const role = roleRow?.role;
  if (role === "admin" || role === "owner_admin" || role === "sub_admin" || role === "vendor" || vendor) {
    return { user: null, reason: "not-customer" as const };
  }
  if (role && role !== "customer") return { user: null, reason: "not-customer" as const };
  return { user, reason: null };
}

function key(userId: string) { return KEY_PREFIX + userId; }
export function readCart(userId: string): CartItem[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key(userId)) || "[]");
    return Array.isArray(value) ? value.filter((x) => x && typeof x.id === "string" && Number.isFinite(Number(x.price)) && Number.isFinite(Number(x.quantity))) : [];
  } catch { return []; }
}
function writeCart(userId: string, items: CartItem[]) {
  if (!userId) return;
  window.localStorage.setItem(key(userId), JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}
export function addToCart(userId: string, item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = readCart(userId);
  const found = items.find((x) => x.id === item.id);
  if (found) found.quantity = Math.min(20, found.quantity + quantity);
  else items.push({ ...item, quantity: Math.max(1, Math.min(20, quantity)) });
  writeCart(userId, items);
}
export function updateCartQuantity(userId: string, id: string, quantity: number) {
  writeCart(userId, readCart(userId).map((x) => x.id === id ? { ...x, quantity: Math.max(1, Math.min(20, quantity)) } : x));
}
export function removeFromCart(userId: string, id: string) { writeCart(userId, readCart(userId).filter((x) => x.id !== id)); }
export function clearCart(userId: string) { writeCart(userId, []); }
export function cartCount(items: CartItem[] = []) { return items.reduce((sum, item) => sum + item.quantity, 0); }
