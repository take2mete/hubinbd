"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const items = [
  { title: "পণ্য পরিচালনা", desc: "পণ্য সম্পাদনা, ছবি, মূল্য ও প্রকাশের অবস্থা", href: "/admin/products", icon: "🛍️", tone: "bg-orange-50 text-orange-700" },
  { title: "ব্যানার পরিচালনা", desc: "হোমপেজের ব্যানার, ছবি ও লিংক আপডেট", href: "/admin/banners", icon: "🖼️", tone: "bg-violet-50 text-violet-700" },
  { title: "হোমপেজ কনটেন্ট", desc: "সংরক্ষিত হোমপেজ কনটেন্ট পরিচালনা", href: "/admin/content", icon: "✍️", tone: "bg-blue-50 text-blue-700" },
  { title: "Seller আবেদন", desc: "নতুন বিক্রেতার আবেদন যাচাই ও অনুমোদন", href: "/admin/vendors", icon: "🏪", tone: "bg-emerald-50 text-emerald-700" },
  { title: "সার্ভিস অর্ডার", desc: "Computer Work অর্ডার ও কাজের অগ্রগতি", href: "/admin/orders", icon: "📋", tone: "bg-amber-50 text-amber-700" },
];

export default function AdminDashboard() {
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/admin/login"; return; }
      const { data: role, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      if (roleError || !role || !["owner_admin", "sub_admin", "admin"].includes(role.role)) { setError("এই অ্যাকাউন্টের Admin অনুমতি নেই।"); return; }
      setEmail(user.email ?? "");
      setAllowed(true);
    })();
    return () => { active = false; };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  if (error) return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl"><span className="text-4xl">🔒</span><h1 className="mt-4 text-xl font-black text-slate-900">প্রবেশের অনুমতি নেই</h1><p className="mt-2 text-sm text-slate-600">{error}</p><Link href="/admin/login" className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Admin Login</Link></section></main>;
  if (!allowed) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Admin Dashboard লোড হচ্ছে…</main>;

  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-7 text-slate-900 sm:px-7 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#111d35] to-[#244c73] p-6 text-white shadow-lg sm:p-8">
          <div><p className="text-[10px] font-extrabold tracking-[.22em] text-orange-300">HUBINBD CONTROL CENTER</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Admin Dashboard</h1><p className="mt-1 text-sm text-slate-300">ওয়েবসাইট পরিচালনার সব প্রয়োজনীয় টুল এক জায়গায়</p><p className="mt-3 text-xs text-slate-300">{email}</p></div>
          <div className="flex gap-2"><Link href="/" className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10">সাইট দেখুন ↗</Link><button onClick={() => void logout()} className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-orange-400">Logout</button></div>
        </header>
        <div className="mb-5 mt-8 flex items-end justify-between gap-3"><div><h2 className="text-lg font-black">ম্যানেজমেন্ট</h2><p className="mt-1 text-xs text-slate-500">যে বিভাগটি পরিচালনা করতে চান সেটি নির্বাচন করুন</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">Secure Admin Area</span></div>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,.04)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"><div className="flex items-start justify-between"><span className={`grid h-12 w-12 place-items-center rounded-xl text-2xl ${item.tone}`}>{item.icon}</span><span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-600">↗</span></div><h3 className="mt-5 text-base font-extrabold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p><span className="mt-5 inline-flex text-xs font-extrabold text-blue-700">পরিচালনা করুন →</span></Link>)}
        </section>
        <footer className="mt-8 text-center text-[11px] text-slate-400">HubinBD Admin · Access is limited to authorized roles</footer>
      </div>
    </main>
  );
}
