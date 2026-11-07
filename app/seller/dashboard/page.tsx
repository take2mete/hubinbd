"use client";

import { useState, useMemo } from "react";

// HubinBD Seller Dashboard — hubinbd.com/seller/dashboard
// Paste this file as: app/seller/dashboard/page.tsx
// Demo data - pore apnar API diye replace korben: /api/seller/orders, /api/seller/products

type OrderStatus = "Pending" | "RTS" | "Shipped" | "Delivered" | "Returns";
type ProductStatus = "Live" | "Under Review" | "Rejected" | "Out of Stock";

type Order = { id: string; customer: string; phone: string; address: string; product: string; amount: number; status: OrderStatus; hub: string; date: string };
type Product = { id: number; name: string; category: string; price: number; stock: number; sku: string; status: ProductStatus; sold: number };

const initialOrders: Order[] = [
  { id: "HUB-1024", customer: "রাহিম উদ্দিন", phone: "01711-234567", address: "মিরপুর-১০, ঢাকা", product: "প্রিমিয়াম কটন টি-শার্ট", amount: 850, status: "Pending", hub: "ঢাকা হাব", date: "আজ" },
  { id: "HUB-1023", customer: "নুসরাত জাহান", phone: "01812-345678", address: "চকবাজার, চট্টগ্রাম", product: "ওয়্যারলেস ইয়ারবাডস", amount: 1450, status: "RTS", hub: "চট্টগ্রাম হাব", date: "আজ" },
  { id: "HUB-1022", customer: "করিম শেখ", phone: "01913-456789", address: "জিন্দাবাজার, সিলেট", product: "স্মার্ট ওয়াচ", amount: 2850, status: "Shipped", hub: "সিলেট হাব", date: "গতকাল" },
  { id: "HUB-1021", customer: "মিম আক্তার", phone: "01614-567890", address: "উত্তরা, ঢাকা", product: "গ্রাফিক্স ডিজাইন সার্ভিস", amount: 1200, status: "Delivered", hub: "ঢাকা হাব", date: "গতকাল" },
  { id: "HUB-1020", customer: "তানভীর আহমেদ", phone: "01515-678901", address: "বনানী, ঢাকা", product: "ডাটা এন্ট্রি সার্ভিস", amount: 950, status: "Returns", hub: "ঢাকা হাব", date: "২ দিন আগে" },
];

const initialProducts: Product[] = [
  { id: 1, name: "প্রিমিয়াম কটন টি-শার্ট", category: "Clothing", price: 850, stock: 42, sku: "HUB-TS-001", status: "Live", sold: 124 },
  { id: 2, name: "ওয়্যারলেস ইয়ারবাডস", category: "Tools", price: 1450, stock: 8, sku: "HUB-EB-002", status: "Live", sold: 86 },
  { id: 3, name: "স্মার্ট ওয়াচ", category: "Tools", price: 2850, stock: 0, sku: "HUB-SW-003", status: "Out of Stock", sold: 64 },
  { id: 4, name: "লোগো ডিজাইন প্যাকেজ", category: "Computer Work", price: 2500, stock: 99, sku: "HUB-LG-004", status: "Under Review", sold: 32 },
  { id: 5, name: "হুডি - ব্ল্যাক", category: "Clothing", price: 1250, stock: 15, sku: "HUB-HD-005", status: "Rejected", sold: 0 },
];

const orderTabs: ("সব" | OrderStatus)[] = ["সব", "Pending", "RTS", "Shipped", "Delivered", "Returns"];
const statusBn: Record<OrderStatus, string> = { Pending: "পেন্ডিং", RTS: "Ready To Ship", Shipped: "শিপড", Delivered: "ডেলিভার্ড", Returns: "রিটার্ন" };

export default function SellerDashboard() {
  const [page, setPage] = useState("ড্যাশবোর্ড");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orderTab, setOrderTab] = useState<"সব" | OrderStatus>("সব");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showLabel, setShowLabel] = useState<Order | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [dark, setDark] = useState(false);
  const [chartTab, setChartTab] = useState("৩০ দিন");
  const [newP, setNewP] = useState({ name: "", category: "Clothing", price: "", stock: "" });
  const [withdraw, setWithdraw] = useState({ method: "বিকাশ", amount: "", number: "" });
  const [voucher, setVoucher] = useState({ code: "", discount: "" });
  const [vouchers, setVouchers] = useState([{ code: "HUBIN20", discount: "২০%", active: true }]);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };
  const moveRTS = (id: string) => { setOrders(orders.map(o => o.id === id ? { ...o, status: "Shipped" } : o)); showToast("অর্ডার Shipped-এ চলে গেছে ✅"); };
  const filteredOrders = useMemo(() => orders.filter(o => (orderTab === "সব" || o.status === orderTab) && (o.customer.includes(search) || o.id.includes(search) || o.product.includes(search))), [orders, orderTab, search]);
  const totalSales = orders.reduce((s, o) => s + o.amount, 0);
  const chartData = chartTab === "৭ দিন" ? [8200, 9500, 7200, 12450, 10800, 15300, 13400] : chartTab === "৩০ দিন" ? [8200, 9500, 7200, 12450, 10800, 15300, 13400, 16800, 14200, 18900, 17500, 20100] : [12000, 15000, 11000, 18000, 22000, 19000, 25000, 28000, 24000];

  const addProduct = () => {
    if (!newP.name || !newP.price) { showToast("নাম ও দাম দিন"); return; }
    setProducts([...products, { id: Date.now(), name: newP.name, category: newP.category, price: Number(newP.price), stock: Number(newP.stock || 0), sku: "HUB-NEW-" + Math.floor(Math.random() * 900 + 100), status: "Under Review", sold: 0 }]);
    setNewP({ name: "", category: "Clothing", price: "", stock: "" }); setShowAdd(false); showToast("প্রোডাক্ট যোগ হয়েছে, রিভিউতে আছে ✅");
  };

  const menu = ["ড্যাশবোর্ড", "প্রোডাক্ট", "অর্ডার", "প্রমোশন", "ফাইন্যান্স", "রিভিউ", "স্টোর ডেকোরেশন", "সেটিংস"];

  return (
    <div className={dark ? "min-h-screen bg-slate-950 text-white" : "min-h-screen bg-[#F2F4F7] text-slate-900"} style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white px-4 py-3 flex items-center gap-3 shadow">
        <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-[#0E7490] flex items-center justify-center font-black text-xl">H</div><div><div className="font-black leading-none">HubinBD <span className="text-[11px] bg-orange-500 px-2 py-0.5 rounded-full">Seller Center</span></div><div className="text-[11px] text-slate-400">hubinbd.com/seller/dashboard</div></div></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="অর্ডার / প্রোডাক্ট / কাস্টমার খুঁজুন..." className="hidden md:block flex-1 max-w-md bg-white/10 rounded-full px-4 py-2 text-sm outline-none placeholder:text-slate-400" />
        <button onClick={() => setDark(!dark)} className="bg-white/10 px-3 py-2 rounded-full text-sm">{dark ? "☀️ লাইট" : "🌙 ডার্ক"}</button>
        <button onClick={() => showToast("৩টি নতুন নোটিফিকেশন")} className="relative bg-white/10 w-10 h-10 rounded-full">🔔<span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center">3</span></button>
        <div className="flex items-center gap-2 bg-white/10 rounded-full pl-1 pr-3 py-1"><span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center font-bold">হা</span><span className="text-sm font-bold hidden sm:block">হাসান স্টোর<br /><span className="text-[11px] font-normal text-slate-300">HUB-88241</span></span></div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 p-4">
          <div className={dark ? "bg-slate-900 rounded-2xl p-3" : "bg-white rounded-2xl p-3 shadow-sm"}>
            {menu.map(m => <button key={m} onClick={() => setPage(m)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold mb-1 ${page === m ? "bg-[#0E7490] text-white" : "hover:bg-slate-100 " + (dark ? "hover:bg-slate-800" : "")}`}>{m === "ড্যাশবোর্ড" ? "📊 " : m === "প্রোডাক্ট" ? "📦 " : m === "অর্ডার" ? "🧾 " : m === "প্রমোশন" ? "🎁 " : m === "ফাইন্যান্স" ? "💰 " : m === "রিভিউ" ? "⭐ " : m === "স্টোর ডেকোরেশন" ? "🎨 " : "⚙️ "}{m}</button>)}
            <a href="https://www.hubinbd.com" className="block text-center text-sm text-teal-600 font-bold mt-3">← HubinBD হোমে যান</a>
          </div>
          <div className="bg-gradient-to-br from-teal-600 to-slate-900 text-white rounded-2xl p-4 mt-4"><div className="font-black">11.11 Mega Sale</div><div className="text-xs opacity-80 mt-1">রেজিস্ট্রেশন চলছে — এখনই জয়েন করুন</div><button onClick={() => showToast("ক্যাম্পেইনে রেজিস্ট্রেশন সফল 🎉")} className="bg-orange-500 w-full py-2 rounded-xl font-bold mt-3 text-sm">Join Now</button></div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-3 md:p-5 max-w-[1100px] mx-auto w-full">
          {/* Mobile nav */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-3">{menu.map(m => <button key={m} onClick={() => setPage(m)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold ${page === m ? "bg-[#0E7490] text-white" : "bg-white shadow-sm"}`}>{m}</button>)}</div>

          {page === "ড্যাশবোর্ড" && (
            <div>
              <div className="bg-gradient-to-r from-[#0E7490] to-[#0F172A] text-white rounded-2xl p-5 flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-black">স্বাগতম, হাসান! 👋</h1><p className="text-sm opacity-80 mt-1">আজ ৭টি অর্ডার Ready To Ship করতে হবে</p></div><div className="bg-white/15 rounded-xl px-4 py-2 text-center"><div className="text-[11px]">11.11 Sale শুরু হতে</div><div className="font-black">03 দিন : 14 ঘণ্টা : 22 মিনিট</div></div></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[{ l: "আজকের বিক্রি", v: "৳" + totalSales.toLocaleString("en-IN"), s: "↑ ১২%" }, { l: "মোট অর্ডার", v: orders.length + "টি", s: "↑ ৮%" }, { l: "উত্তোলনযোগ্য", v: "৳৪৮,২০০", s: "পেআউট রেডি" }, { l: "পেন্ডিং অর্ডার", v: orders.filter(o => o.status === "Pending").length + "টি", s: "এখনই RTS করুন" }].map(c => <div key={c.l} className={dark ? "bg-slate-900 rounded-2xl p-4" : "bg-white rounded-2xl p-4 shadow-sm"}><div className="text-xs text-slate-500">{c.l}</div><div className="text-2xl font-black mt-1">{c.v}</div><div className="text-xs text-emerald-600 font-bold mt-1">{c.s}</div></div>)}
              </div>

              <div className={dark ? "bg-slate-900 rounded-2xl p-4 mt-4" : "bg-white rounded-2xl p-4 mt-4 shadow-sm"}>
                <div className="flex justify-between items-center"><h3 className="font-black">📈 Sales Overview</h3><div className="flex gap-1">{["৭ দিন", "৩০ দিন", "৯০ দিন"].map(t => <button key={t} onClick={() => setChartTab(t)} className={`px-3 py-1 rounded-full text-xs font-bold ${chartTab === t ? "bg-[#0E7490] text-white" : "bg-slate-100"}`}>{t}</button>)}</div></div>
                <div className="flex items-end gap-2 h-36 mt-4">{chartData.map((v, i) => <div key={i} title={"৳" + v.toLocaleString()} className="flex-1 bg-gradient-to-t from-teal-600 to-teal-300 rounded-t-lg hover:opacity-80 cursor-pointer" style={{ height: (v / 28000 * 100) + "%" }}></div>)}</div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2"><span>Performance Score: 92/100</span><span>Chat Response: 98%</span><span>Store Rating: 4.8 ★</span></div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div className={dark ? "bg-slate-900 rounded-2xl p-4" : "bg-white rounded-2xl p-4 shadow-sm"}><h3 className="font-black">⚠️ Product Advisor</h3>{[{ t: "ছবি নেই — ২টি প্রোডাক্ট" }, { t: "স্টক শেষ — ১টি প্রোডাক্ট" }, { t: "দাম বেশি — ১টি প্রোডাক্ট" }].map((x, i) => <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 text-sm"><span>{x.t}</span><button onClick={() => showToast("Fix করা হয়েছে ✅")} className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">Fix</button></div>)}</div>
                <div className={dark ? "bg-slate-900 rounded-2xl p-4" : "bg-white rounded-2xl p-4 shadow-sm"}><h3 className="font-black">💚 Account Health — 100% Healthy</h3><div className="h-3 bg-slate-200 rounded-full mt-3 overflow-hidden"><div className="h-full bg-emerald-500 w-full"></div></div><p className="text-sm mt-2 text-slate-500">Violation: 0 • Cancellation: 1.2% • Late Shipment: 0.8%</p></div>
              </div>
            </div>
          )}

          {page === "অর্ডার" && (
            <div>
              <h2 className="text-2xl font-black mb-3">🧾 অর্ডার ম্যানেজমেন্ট</h2>
              <div className="flex gap-2 flex-wrap mb-3">{orderTabs.map(t => <button key={t} onClick={() => setOrderTab(t)} className={`px-4 py-2 rounded-full text-sm font-bold ${orderTab === t ? "bg-[#0E7490] text-white" : "bg-white shadow-sm"}`}>{t === "সব" ? "সব" : statusBn[t as OrderStatus]}</button>)}</div>
              <div className={dark ? "bg-slate-900 rounded-2xl overflow-hidden" : "bg-white rounded-2xl shadow-sm overflow-hidden"}>
                {filteredOrders.map(o => <div key={o.id} className="p-4 border-b last:border-0 flex flex-wrap justify-between gap-3"><div><div className="font-black">{o.id} • {o.product}</div><div className="text-sm text-slate-500">{o.customer} • {o.phone} • {o.address} • {o.hub}</div><div className="text-sm font-bold mt-1">৳{o.amount} • {o.date}</div></div><div className="flex gap-2 items-start"><span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">{statusBn[o.status]}</span>{o.status === "RTS" && <button onClick={() => moveRTS(o.id)} className="bg-[#0E7490] text-white px-3 py-1.5 rounded-full text-xs font-bold">RTS → Shipped</button>}<button onClick={() => setShowLabel(o)} className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-bold">শিপিং লেবেল</button></div></div>)}
                {filteredOrders.length === 0 && <div className="p-6 text-center text-slate-500">কোনো অর্ডার পাওয়া যায়নি</div>}
              </div>
            </div>
          )}

          {page === "প্রোডাক্ট" && (
            <div>
              <div className="flex justify-between items-center mb-3"><h2 className="text-2xl font-black">📦 প্রোডাক্ট</h2><button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm">+ নতুন প্রোডাক্ট</button></div>
              <div className={dark ? "bg-slate-900 rounded-2xl overflow-hidden" : "bg-white rounded-2xl shadow-sm overflow-hidden"}>{products.map(p => <div key={p.id} className="p-4 border-b last:border-0 flex flex-wrap justify-between gap-3"><div><div className="font-black">{p.name}</div><div className="text-sm text-slate-500">{p.category} • SKU: {p.sku} • বিক্রি: {p.sold}টি</div></div><div className="text-right"><div className="font-black">৳{p.price} • স্টক: {p.stock}</div><div className="text-xs font-bold mt-1">{p.status}</div><button onClick={() => { setProducts(products.filter(x => x.id !== p.id)); showToast("প্রোডাক্ট ডিলিট হয়েছে"); }} className="text-red-500 text-xs font-bold mt-1">ডিলিট</button></div></div>)}</div>
            </div>
          )}

          {page === "প্রমোশন" && (
            <div><h2 className="text-2xl font-black mb-3">🎁 প্রমোশন / ভাউচার</h2><div className={dark ? "bg-slate-900 rounded-2xl p-4" : "bg-white rounded-2xl p-4 shadow-sm"}><div className="flex gap-2 flex-wrap"><input value={voucher.code} onChange={e => setVoucher({ ...voucher, code: e.target.value })} placeholder="কুপন কোড (যেমন HUBIN30)" className="border rounded-xl px-3 py-2 text-sm flex-1" /><input value={voucher.discount} onChange={e => setVoucher({ ...voucher, discount: e.target.value })} placeholder="ছাড় % (যেমন ৩০)" className="border rounded-xl px-3 py-2 text-sm w-32" /><button onClick={() => { if (!voucher.code) return; setVouchers([...vouchers, { code: voucher.code, discount: voucher.discount + "%", active: true }]); setVoucher({ code: "", discount: "" }); showToast("ভাউচার তৈরি হয়েছে 🎉"); }} className="bg-[#0E7490] text-white px-4 py-2 rounded-xl font-bold text-sm">তৈরি করুন</button></div><div className="mt-4 space-y-2">{vouchers.map((v, i) => <div key={i} className="flex justify-between bg-slate-50 rounded-xl p-3 text-sm font-bold"><span>{v.code} — {v.discount} ছাড়</span><button onClick={() => { navigator.clipboard?.writeText(v.code); showToast("কোড কপি হয়েছে"); }} className="text-teal-600">কপি করুন</button></div>)}</div></div></div>
          )}

          {page === "ফাইন্যান্স" && (
            <div><h2 className="text-2xl font-black mb-3">💰 ফাইন্যান্স</h2><div className="grid md:grid-cols-3 gap-3"><div className="bg-gradient-to-br from-teal-600 to-slate-900 text-white rounded-2xl p-5"><div className="text-sm opacity-80">উত্তোলনযোগ্য ব্যালেন্স</div><div className="text-3xl font-black mt-1">৳৪৮,২০০</div><button onClick={() => setShowWithdraw(true)} className="bg-orange-500 w-full py-2.5 rounded-xl font-bold mt-4 text-sm">টাকা উত্তোলন করুন</button></div><div className={dark ? "bg-slate-900 rounded-2xl p-5" : "bg-white rounded-2xl p-5 shadow-sm"}><div className="text-sm text-slate-500">মোট আয় (এই মাস)</div><div className="text-2xl font-black mt-1">৳১,২৪,৫০০</div><div className="text-xs text-slate-500 mt-2">কমিশন: ৳৬,২০০ • শিপিং ফি: ৳১,৮০০ • HubinBD ফি: ৳৯০০</div></div><div className={dark ? "bg-slate-900 rounded-2xl p-5" : "bg-white rounded-2xl p-5 shadow-sm"}><div className="text-sm text-slate-500">পরবর্তী পেআউট</div><div className="text-2xl font-black mt-1">১৫ নভেম্বর</div><div className="text-xs text-slate-500 mt-2">প্রতি সপ্তাহে সোমবার পেআউট হয়</div></div></div><div className={dark ? "bg-slate-900 rounded-2xl p-4 mt-4" : "bg-white rounded-2xl p-4 mt-4 shadow-sm"}><h3 className="font-black mb-2">Transaction History</h3>{[{ t: "অর্ডার HUB-1024 — বিক্রি", a: "+৳৮৫০" }, { t: "কমিশন কাটা", a: "-৳৪২" }, { t: "পেআউট — বিকাশ", a: "-৳১০,০০০" }].map((x, i) => <div key={i} className="flex justify-between py-2 border-b last:border-0 text-sm"><span>{x.t}</span><b>{x.a}</b></div>)}</div></div>
          )}

          {page === "রিভিউ" && <div><h2 className="text-2xl font-black mb-3">⭐ রিভিউ</h2><div className={dark ? "bg-slate-900 rounded-2xl p-4" : "bg-white rounded-2xl p-4 shadow-sm"}><div className="font-bold">নুসরাত জাহান — ★★★★★</div><p className="text-sm text-slate-500 mt-1">প্রোডাক্টটা খুব ভালো, দ্রুত ডেলিভারি পেয়েছি।</p><button onClick={() => showToast("রিপ্লাই পাঠানো হয়েছে")} className="bg-[#0E7490] text-white px-3 py-1.5 rounded-full text-xs font-bold mt-2">রিপ্লাই দিন</button></div></div>}
          {page === "স্টোর ডেকোরেশন" && <div><h2 className="text-2xl font-black mb-3">🎨 স্টোর ডেকোরেশন</h2><div className="bg-gradient-to-r from-teal-600 to-slate-900 text-white rounded-2xl p-6"><div className="text-2xl font-black">হাসান স্টোর</div><p className="text-sm opacity-80">HubinBD-এ আপনার নিজের দোকান</p><button onClick={() => showToast("ব্যানার সেভ হয়েছে")} className="bg-orange-500 px-4 py-2 rounded-full font-bold text-sm mt-3">ব্যানার সেভ করুন</button></div><p className="text-sm text-slate-500 mt-3">এখানে আপনার দোকানের ব্যানার, লোগো ও ডেসক্রিপশন বসবে।</p></div>}
          {page === "সেটিংস" && <div><h2 className="text-2xl font-black mb-3">⚙️ সেটিংস</h2><div className={dark ? "bg-slate-900 rounded-2xl p-4" : "bg-white rounded-2xl p-4 shadow-sm"}><div className="font-bold">দোকানের নাম</div><input defaultValue="হাসান স্টোর" className="border rounded-xl px-3 py-2 w-full mt-2 text-sm" /><div className="font-bold mt-4">পিকআপ ঠিকানা</div><input defaultValue="মিরপুর-১০, ঢাকা" className="border rounded-xl px-3 py-2 w-full mt-2 text-sm" /><button onClick={() => showToast("সেটিংস সেভ হয়েছে ✅")} className="bg-[#0E7490] text-white px-4 py-2 rounded-xl font-bold text-sm mt-4">সেভ করুন</button></div></div>}
        </main>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAdd && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white text-slate-900 rounded-2xl p-5 w-full max-w-md"><h3 className="font-black text-lg">+ নতুন প্রোডাক্ট</h3><input value={newP.name} onChange={e => setNewP({ ...newP, name: e.target.value })} placeholder="প্রোডাক্টের নাম" className="border rounded-xl px-3 py-2 w-full mt-3 text-sm" /><select value={newP.category} onChange={e => setNewP({ ...newP, category: e.target.value })} className="border rounded-xl px-3 py-2 w-full mt-2 text-sm"><option>Clothing</option><option>Tools</option><option>Computer Work</option></select><input value={newP.price} onChange={e => setNewP({ ...newP, price: e.target.value })} placeholder="দাম (৳)" type="number" className="border rounded-xl px-3 py-2 w-full mt-2 text-sm" /><input value={newP.stock} onChange={e => setNewP({ ...newP, stock: e.target.value })} placeholder="স্টক" type="number" className="border rounded-xl px-3 py-2 w-full mt-2 text-sm" /><div className="flex gap-2 mt-4"><button onClick={addProduct} className="flex-1 bg-[#0E7490] text-white py-2.5 rounded-xl font-bold text-sm">সেভ করুন</button><button onClick={() => setShowAdd(false)} className="flex-1 bg-slate-200 py-2.5 rounded-xl font-bold text-sm">বাতিল</button></div></div></div>}

      {/* LABEL MODAL */}
      {showLabel && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white text-slate-900 rounded-2xl p-5 w-full max-w-md"><div className="flex justify-between"><b>HubinBD — Shipping Label</b><button onClick={() => setShowLabel(null)}>✕</button></div><div className="border-2 border-dashed rounded-xl p-4 mt-3 text-center"><div className="text-2xl tracking-widest font-mono">|||| |||| ||||</div><div className="font-black">{showLabel.id}</div><div className="text-sm mt-2 text-left">ক্রেতা: {showLabel.customer}<br />ফোন: {showLabel.phone}<br />ঠিকানা: {showLabel.address}<br />প্রোডাক্ট: {showLabel.product}<br />হাব: {showLabel.hub} • COD: ৳{showLabel.amount}</div></div><p className="text-xs text-slate-500 mt-2">এই লেবেলটি প্রিন্ট করে প্যাকেটে লাগিয়ে HubinBD হাবে Drop-off করুন।</p></div></div>}

      {/* WITHDRAW MODAL */}
      {showWithdraw && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white text-slate-900 rounded-2xl p-5 w-full max-w-md"><h3 className="font-black">টাকা উত্তোলন</h3><select value={withdraw.method} onChange={e => setWithdraw({ ...withdraw, method: e.target.value })} className="border rounded-xl px-3 py-2 w-full mt-3 text-sm"><option>বিকাশ</option><option>নগদ</option><option>ব্যাংক</option></select><input value={withdraw.amount} onChange={e => setWithdraw({ ...withdraw, amount: e.target.value })} placeholder="পরিমাণ (৳)" type="number" className="border rounded-xl px-3 py-2 w-full mt-2 text-sm" /><input value={withdraw.number} onChange={e => setWithdraw({ ...withdraw, number: e.target.value })} placeholder="বিকাশ / অ্যাকাউন্ট নম্বর" className="border rounded-xl px-3 py-2 w-full mt-2 text-sm" /><div className="flex gap-2 mt-4"><button onClick={() => { setShowWithdraw(false); showToast("উত্তোলন রিকোয়েস্ট পাঠানো হয়েছে 💰"); }} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm">রিকোয়েস্ট পাঠান</button><button onClick={() => setShowWithdraw(false)} className="flex-1 bg-slate-200 py-2.5 rounded-xl font-bold text-sm">বাতিল</button></div></div></div>}

      {toast && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl text-sm font-bold z-[60]">{toast}</div>}
      <footer className="text-center text-xs text-slate-400 py-4">HubinBD Seller Center • Demo Data • hubinbd.com/seller/dashboard</footer>
    </div>
  );
}
