"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { CartItem, CART_EVENT, clearCart, getCustomerCartUser, readCart, removeFromCart, updateCartQuantity } from "@/lib/cart";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [userId, setUserId] = useState("");
  useEffect(() => {
    let active = true;
    const sync = () => { if (userId) setItems(readCart(userId)); };
    void (async () => {
      const result = await getCustomerCartUser();
      if (!active) return;
      if (result.reason === "login") { router.replace("/login?next=%2Fcart"); return; }
      if (result.reason === "not-customer") { setBlocked(true); setChecking(false); return; }
      if (result.reason === "error" || !result.user) { setBlocked(true); setChecking(false); return; }
      setUserId(result.user.id);
      setItems(readCart(result.user.id));
      setChecking(false);
    })();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { active = false; window.removeEventListener(CART_EVENT, sync); window.removeEventListener("storage", sync); };
  }, [router, userId]);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <><SiteHeader /><main className="min-h-[60vh] bg-[#f5f6f8] px-4 py-10 text-[#172033]"><section className="mx-auto max-w-4xl">
    <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-black">আপনার শপিং কার্ট</h1>{items.length > 0 && !checking && !blocked && <button onClick={() => clearCart(userId)} className="text-sm font-bold text-rose-600">সব সরান</button>}</div>
    {checking ? <div role="status" className="mt-6 rounded-2xl border bg-white px-6 py-12 text-center text-slate-600">আপনার কার্ট যাচাই করা হচ্ছে…</div> :
    blocked ? <div role="alert" className="mt-6 rounded-2xl border bg-white px-6 py-12 text-center"><p className="font-bold text-slate-800">শপিং কার্ট শুধু কাস্টমার অ্যাকাউন্টের জন্য।</p><Link href="/" className="mt-5 inline-flex rounded-xl bg-[#1246a0] px-5 py-3 font-bold text-white">হোমে ফিরুন</Link></div> :
    !items.length ? <div className="mt-6 rounded-2xl border bg-white px-6 py-12 text-center"><div className="text-5xl">🛒</div><p className="mt-4 text-slate-600">আপনার কার্টে এখনো কোনো পণ্য যোগ করা হয়নি।</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-[#ff6b00] px-5 py-3 font-bold text-white">শপিং শুরু করুন</Link></div> :
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]"><div className="space-y-3">{items.map(item => <article key={item.id} className="flex gap-3 rounded-2xl border bg-white p-3">{item.image ? <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" /> : <div className="grid h-24 w-24 place-items-center rounded-xl bg-slate-100 text-3xl">🛍️</div>}<div className="min-w-0 flex-1"><h2 className="font-bold">{item.name}</h2><p className="mt-1 font-extrabold text-orange-700">৳{item.price.toLocaleString("bn-BD")}</p><div className="mt-2 flex items-center gap-2"><button aria-label="পরিমাণ কমান" onClick={() => item.quantity === 1 ? removeFromCart(userId,item.id) : updateCartQuantity(userId,item.id,item.quantity-1)} className="h-8 w-8 rounded-lg border">−</button><span className="min-w-5 text-center">{item.quantity}</span><button aria-label="পরিমাণ বাড়ান" onClick={() => updateCartQuantity(userId,item.id,item.quantity+1)} className="h-8 w-8 rounded-lg border">+</button><button onClick={() => removeFromCart(userId,item.id)} className="ml-2 text-xs font-bold text-rose-600">সরান</button></div></div></article>)}</div><aside className="h-fit rounded-2xl border bg-white p-5"><h2 className="font-extrabold">অর্ডার সারাংশ</h2><div className="mt-4 flex justify-between text-sm"><span>পণ্যের মোট</span><b>৳{total.toLocaleString("bn-BD")}</b></div><p className="mt-2 text-xs text-slate-500">ডেলিভারি চার্জ চেকআউটে যোগ হবে।</p><Link href={`/checkout?product=${items[0].id}`} className="mt-5 block rounded-xl bg-orange-600 px-4 py-3 text-center font-bold text-white">চেকআউট করুন</Link></aside></div>}
  </section></main><SiteFooter /></>;
}
