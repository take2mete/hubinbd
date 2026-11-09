export type CartItem = { id: string; name: string; image: string | null; price: number; quantity: number };
const KEY = "hubinbd_cart_v1";
export const CART_EVENT = "hubinbd-cart-updated";
export function readCart(): CartItem[] { if (typeof window === "undefined") return []; try { const value = JSON.parse(window.localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value.filter((x) => x && typeof x.id === "string") : []; } catch { return []; } }
function writeCart(items: CartItem[]) { window.localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new Event(CART_EVENT)); }
export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) { const items = readCart(); const found = items.find((x) => x.id === item.id); if (found) found.quantity = Math.min(20, found.quantity + quantity); else items.push({ ...item, quantity: Math.max(1, Math.min(20, quantity)) }); writeCart(items); }
export function updateCartQuantity(id: string, quantity: number) { writeCart(readCart().map((x) => x.id === id ? { ...x, quantity: Math.max(1, Math.min(20, quantity)) } : x)); }
export function removeFromCart(id: string) { writeCart(readCart().filter((x) => x.id !== id)); }
export function clearCart() { writeCart([]); }
export function cartCount(items = readCart()) { return items.reduce((sum, item) => sum + item.quantity, 0); }
