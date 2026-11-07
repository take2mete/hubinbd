"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Seller = { user_id: string; business_name: string; phone: string; status: string };
type Order = { id: string; order_no: string; customer_name: string; phone: string; address: string; product_name: string; amount: number; status: string; hub: string; created_at: string };
type Product = { id: number; name: string; category: string; price: number; stock: number; sku: string | null; status: string; sold: string | number | null };
type Payout = { id: string; method: string; amount: number; account_number: string; status: string; created_at: string };
type Voucher = { id: string; code: string; discount: string; active: boolean };

const tabs = ["ড্যাশবোর্ড", "প্রোডাক্ট", "অর্ডার", "প্রমোশন", "ফাইন্যান্স"];
const money = (n: number) => new Intl.NumberFormat("bn-BD").format(Number(n || 0));

export default function SellerDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [seller, setSeller] = useState<Seller | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [tab, setTab] = useState("ড্যাশবোর্ড");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [showProduct, setShowProduct] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", category: "Clothing", price: "", stock: "", sku: "" });
  const [withdrawForm, setWithdrawForm] = useState({ method: "বিকাশ", amount: "", account_number: "" });
  const [voucherForm, setVoucherForm] = useState({ code: "", discount: "" });
  const [countdown, setCountdown] = useState("");

  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3500); };

  const loadDashboard = useCallback(async (uid: string) => {
    const [sellerRes, orderRes, productRes, payoutRes, voucherRes] = await Promise.all([
      supabase.from("vendors").select("user_id,business_name,phone,status").eq("user_id", uid).maybeSingle(),
      supabase.from("orders").select("*").eq("seller_id", uid).order("created_at", { ascending: false }),
      supabase.from("products").select("id,name,category,price,stock,sku,status,sold").eq("vendor_id", uid).order("created_at", { ascending: false }),
      supabase.from("payouts").select("*").eq("seller_id", uid).order("created_at", { ascending: false }),
      supabase.from("vouchers").select("id,code,discount,active").eq("seller_id", uid).order("created_at", { ascending: false }),
    ]);
    if (sellerRes.error) throw sellerRes.error;
    if (!sellerRes.data || sellerRes.data.status !== "approved") {
      router.replace("/seller/login?notice=approval_required");
      return false;
    }
    if (orderRes.error) throw orderRes.error;
    if (productRes.error) throw productRes.error;
    if (payoutRes.error) throw payoutRes.error;
    if (voucherRes.error) throw voucherRes.error;
    setSeller(sellerRes.data as Seller);
    setOrders((orderRes.data || []) as Order[]);
    setProducts((productRes.data || []) as Product[]);
    setPayouts((payoutRes.data || []) as Payout[]);
    setVouchers((voucherRes.data || []) as Voucher[]);
    return true;
  }, [router]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !user) { router.replace("/seller/login"); return; }
      setUserId(user.id);
      try { await loadDashboard(user.id); }
      catch (e) { console.error("Seller dashboard load failed:", e); if (active) notify("ড্যাশবোর্ডের তথ্য লোড করা যায়নি। অনুমতি ও ডেটাবেস সংযোগ পরীক্ষা করুন।"); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [loadDashboard, router]);

  useEffect(() => {
    const target = new Date("2026-11-11T00:00:00+06:00").getTime();
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(diff ? `${days} দিন : ${hours} ঘণ্টা : ${minutes} মিনিট : ${seconds} সেকেন্ড` : "11.11 Sale শুরু হয়েছে");
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSales = useMemo(() => orders.filter(o => ["Shipped", "Delivered"].includes(o.status)).reduce((sum, o) => sum + Number(o.amount || 0), 0), [orders]);
  const pendingOrders = orders.filter(o => ["Pending", "RTS"].includes(o.status)).length;

  async function updateOrder(orderId: string) {
    setBusy(true);
    const { error } = await supabase.from("orders").update({ status: "Shipped" }).eq("id", orderId).eq("seller_id", userId);
    if (error) notify("অর্ডার আপডেট হয়নি: " + error.message);
    else { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Shipped" } : o)); notify("অর্ডার Shipped হয়েছে"); }
    setBusy(false);
  }

  async function addProduct() {
    if (!productForm.name.trim() || !productForm.price || Number(productForm.price) <= 0) { notify("পণ্যের নাম ও সঠিক দাম দিন"); return; }
    setBusy(true);
    const { data, error } = await supabase.from("products").insert({
      name: productForm.name.trim(), category: productForm.category, price: Number(productForm.price),
      stock: Math.max(0, Number(productForm.stock || 0)), sku: productForm.sku.trim() || null,
      status: "Under Review", sold: "0", vendor_id: userId, is_active: false,
    }).select("id,name,category,price,stock,sku,status,sold").single();
    if (error) notify("পণ্য যোগ হয়নি: " + error.message);
    else { setProducts(prev => [data as Product, ...prev]); setProductForm({ name: "", category: "Clothing", price: "", stock: "", sku: "" }); setShowProduct(false); notify("পণ্য জমা হয়েছে — Under Review"); }
    setBusy(false);
  }

  async function deleteProduct(id: number) {
    if (!window.confirm("এই পণ্যটি মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id).eq("vendor_id", userId);
    if (error) notify("পণ্য ডিলিট হয়নি: " + error.message);
    else { setProducts(prev => prev.filter(p => p.id !== id)); notify("পণ্য মুছে ফেলা হয়েছে"); }
  }

  async function requestPayout() {
    const amount = Number(withdrawForm.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !withdrawForm.account_number.trim()) { notify("সঠিক পরিমাণ ও অ্যাকাউন্ট নম্বর দিন"); return; }
    setBusy(true);
    const { data, error } = await supabase.from("payouts").insert({
      seller_id: userId, method: withdrawForm.method, amount, account_number: withdrawForm.account_number.trim(), status: "Pending",
    }).select("*").single();
    if (error) notify("উত্তোলন অনুরোধ জমা হয়নি: " + error.message);
    else { setPayouts(prev => [data as Payout, ...prev]); setShowWithdraw(false); setWithdrawForm({ method: "বিকাশ", amount: "", account_number: "" }); notify("উত্তোলন অনুরোধ Pending হয়েছে"); }
    setBusy(false);
  }

  async function createVoucher() {
    if (!voucherForm.code.trim() || !voucherForm.discount.trim()) { notify("ভাউচার কোড ও ছাড় লিখুন"); return; }
    setBusy(true);
    const { data, error } = await supabase.from("vouchers").insert({
      seller_id: userId, code: voucherForm.code.trim().toUpperCase(), discount: voucherForm.discount.trim(), active: true,
    }).select("id,code,discount,active").single();
    if (error) notify("ভাউচার তৈরি হয়নি: " + error.message);
    else { setVouchers(prev => [data as Voucher, ...prev]); setVoucherForm({ code: "", discount: "" }); notify("ভাউচার তৈরি হয়েছে"); }
    setBusy(false);
  }

  async function signOut() { await supabase.auth.signOut(); router.replace("/seller/login"); }

  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-600">সেলার ড্যাশবোর্ড লোড হচ্ছে…</div>;
  if (!seller) return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-600">সেলার অ্যাকাউন্ট যাচাই করা হচ্ছে…</div>;

  return <div className="min-h-screen bg-[#F2F4F7] text-slate-900">
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 bg-[#0F172A] px-4 py-3 text-white shadow">
      <div><div className="font-black">HubinBD <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs">Seller Center</span></div><div className="text-xs text-slate-300">{seller.business_name} · {seller.phone || "ফোন যোগ করা নেই"}</div></div>
      <div className="flex items-center gap-2"><span className="hidden text-xs text-slate-300 sm:inline">Seller ID: {seller.user_id.slice(0, 8).toUpperCase()}</span><button onClick={signOut} className="rounded-full bg-white/10 px-4 py-2 text-sm">লগআউট</button></div>
    </header>
    <div className="mx-auto max-w-7xl p-3 md:p-6">
      <nav className="mb-4 flex gap-2 overflow-x-auto">{tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${tab === t ? "bg-[#0E7490] text-white" : "bg-white text-slate-700"}`}>{t}</button>)}</nav>

      {tab === "ড্যাশবোর্ড" && <><div className="rounded-2xl bg-gradient-to-r from-[#0E7490] to-[#0F172A] p-5 text-white"><h1 className="text-2xl font-black">স্বাগতম, {seller.business_name} 👋</h1><p className="mt-2 text-sm">11.11 Mega Sale শুরু হতে: {countdown}</p></div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{[{label:"মোট বিক্রি",value:"৳"+money(totalSales)},{label:"মোট অর্ডার",value:orders.length+"টি"},{label:"পণ্য",value:products.length+"টি"},{label:"পেন্ডিং অর্ডার",value:pendingOrders+"টি"}].map(x=><div key={x.label} className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-xs text-slate-500">{x.label}</div><div className="mt-1 text-2xl font-black">{x.value}</div></div>)}</div>
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm"><h2 className="font-black">সাম্প্রতিক অর্ডার</h2>{orders.slice(0,5).map(o=><div key={o.id} className="flex flex-wrap justify-between gap-2 border-b py-3 text-sm last:border-0"><span>{o.order_no} · {o.product_name} · {o.customer_name}</span><b>{o.status} · ৳{money(o.amount)}</b></div>)}{!orders.length&&<p className="py-5 text-sm text-slate-500">এখনো কোনো অর্ডার নেই।</p>}</div>
      </>}

      {tab === "অর্ডার" && <section className="rounded-2xl bg-white p-4 shadow-sm"><h2 className="mb-3 text-xl font-black">অর্ডার ম্যানেজমেন্ট</h2>{orders.map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-4 last:border-0"><div><b>{o.order_no} · {o.product_name}</b><p className="text-sm text-slate-500">{o.customer_name} · {o.phone} · {o.address}</p><p className="text-sm">৳{money(o.amount)} · {o.hub} · {new Date(o.created_at).toLocaleDateString("bn-BD")}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{o.status}</span>{["RTS","Ready To Ship"].includes(o.status)&&<button disabled={busy} onClick={()=>updateOrder(o.id)} className="rounded-full bg-[#0E7490] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">RTS → Shipped</button>}</div></div>)}{!orders.length&&<p className="py-5 text-sm text-slate-500">কোনো অর্ডার পাওয়া যায়নি।</p>}</section>}

      {tab === "প্রোডাক্ট" && <section className="rounded-2xl bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-black">আমার পণ্য</h2><button onClick={()=>setShowProduct(true)} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">+ Add Product</button></div>{products.map(p=><div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0"><div><b>{p.name}</b><p className="text-sm text-slate-500">{p.category} · SKU: {p.sku||"—"} · বিক্রি: {p.sold||0}</p></div><div className="flex items-center gap-3 text-sm"><span>৳{money(p.price)} · স্টক {p.stock} · {p.status||"—"}</span><button onClick={()=>deleteProduct(p.id)} className="font-bold text-red-600">Delete</button></div></div>)}{!products.length&&<p className="py-5 text-sm text-slate-500">এখনো কোনো পণ্য নেই।</p>}</section>}

      {tab === "প্রমোশন" && <section className="rounded-2xl bg-white p-4 shadow-sm"><h2 className="mb-3 text-xl font-black">ভাউচার</h2><div className="flex flex-wrap gap-2"><input value={voucherForm.code} onChange={e=>setVoucherForm({...voucherForm,code:e.target.value})} placeholder="Voucher code" className="rounded-xl border px-3 py-2"/><input value={voucherForm.discount} onChange={e=>setVoucherForm({...voucherForm,discount:e.target.value})} placeholder="Discount (e.g. 10%)" className="rounded-xl border px-3 py-2"/><button disabled={busy} onClick={createVoucher} className="rounded-xl bg-[#0E7490] px-4 py-2 font-bold text-white">তৈরি করুন</button></div>{vouchers.map(v=><div key={v.id} className="border-b py-3 text-sm">{v.code} · {v.discount} · {v.active?"Active":"Inactive"}</div>)}</section>}

      {tab === "ফাইন্যান্স" && <section className="rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-xl font-black">পেআউট / ফাইন্যান্স</h2><button onClick={()=>setShowWithdraw(true)} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">Withdraw</button></div>{payouts.map(p=><div key={p.id} className="flex flex-wrap justify-between gap-2 border-b py-3 text-sm"><span>{p.method} · {p.account_number} · {new Date(p.created_at).toLocaleDateString("bn-BD")}</span><b>৳{money(p.amount)} · {p.status}</b></div>)}{!payouts.length&&<p className="py-5 text-sm text-slate-500">এখনো কোনো উত্তোলন অনুরোধ নেই।</p>}</section>}
    </div>

    {showProduct&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-5"><h3 className="mb-3 text-lg font-black">নতুন পণ্য যোগ করুন</h3><input value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})} placeholder="পণ্যের নাম" className="mb-2 w-full rounded-xl border p-3"/><select value={productForm.category} onChange={e=>setProductForm({...productForm,category:e.target.value})} className="mb-2 w-full rounded-xl border p-3"><option>Clothing</option><option>Tools</option><option>Computer Work</option></select><input type="number" min="1" value={productForm.price} onChange={e=>setProductForm({...productForm,price:e.target.value})} placeholder="দাম" className="mb-2 w-full rounded-xl border p-3"/><input type="number" min="0" value={productForm.stock} onChange={e=>setProductForm({...productForm,stock:e.target.value})} placeholder="স্টক" className="mb-2 w-full rounded-xl border p-3"/><input value={productForm.sku} onChange={e=>setProductForm({...productForm,sku:e.target.value})} placeholder="SKU (ঐচ্ছিক)" className="mb-3 w-full rounded-xl border p-3"/><div className="flex gap-2"><button disabled={busy} onClick={addProduct} className="flex-1 rounded-xl bg-[#0E7490] p-3 font-bold text-white">সাবমিট · Under Review</button><button onClick={()=>setShowProduct(false)} className="rounded-xl bg-slate-200 px-4">বন্ধ</button></div></div></div>}

    {showWithdraw&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-5"><h3 className="mb-3 text-lg font-black">Withdraw Request</h3><select value={withdrawForm.method} onChange={e=>setWithdrawForm({...withdrawForm,method:e.target.value})} className="mb-2 w-full rounded-xl border p-3"><option>বিকাশ</option><option>নগদ</option><option>ব্যাংক</option></select><input type="number" min="1" value={withdrawForm.amount} onChange={e=>setWithdrawForm({...withdrawForm,amount:e.target.value})} placeholder="পরিমাণ" className="mb-2 w-full rounded-xl border p-3"/><input value={withdrawForm.account_number} onChange={e=>setWithdrawForm({...withdrawForm,account_number:e.target.value})} placeholder="অ্যাকাউন্ট নম্বর" className="mb-3 w-full rounded-xl border p-3"/><div className="flex gap-2"><button disabled={busy} onClick={requestPayout} className="flex-1 rounded-xl bg-orange-500 p-3 font-bold text-white">রিকোয়েস্ট পাঠান</button><button onClick={()=>setShowWithdraw(false)} className="rounded-xl bg-slate-200 px-4">বন্ধ</button></div></div></div>}

    {notice&&<div role="status" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">{notice}</div>}
    <footer className="py-5 text-center text-xs text-slate-400">HubinBD Seller Center · Live Supabase Data</footer>
  </div>;
}
