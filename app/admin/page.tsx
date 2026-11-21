"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Role = "owner_admin" | "sub_admin" | "admin";
type MenuItem = [string, string, string, string];

const businessItems: MenuItem[] = [
  ["Business Dashboard", "দৈনিক ও মাসিক ব্যবসার সারাংশ", "/admin/business", "📊"],
  ["Sales Reports", "তারিখ, Seller ও Category অনুযায়ী বিক্রি", "/admin/sales-reports", "📈"],
  ["Website Analytics", "ভিজিটর ও ট্রাফিক — Google Analytics 4", "/admin/analytics", "🌐"],
];

const ownerItems: MenuItem[] = [
  ["External Monitoring", "Storage, Database, Backup ও Vercel", "/admin/monitoring", "🩺"],
  ["Security Center", "Admin কার্যক্রম ও Audit Logs", "/admin/security", "🔐"],
  ["Expense Ledger", "ব্যবসার খরচ যোগ ও হিসাব", "/admin/expenses", "🧮"],
];

const existingGroups: { name: string; items: MenuItem[] }[] = [
  { name: "Overview & Content", items: [["Homepage Content", "হোমপেজের লেখা ও সেকশন", "/admin/content", "✍️"], ["Banner Manager", "ব্যানার ও লিংক", "/admin/banners", "🖼️"]] },
  { name: "Marketplace", items: [["Products & Approval", "পণ্য যাচাই ও প্রকাশ", "/admin/products", "🛍️"], ["Seller Applications", "Vendor আবেদন", "/admin/vendors", "🏪"], ["Service Orders", "Computer Work সার্ভিস অর্ডার", "/admin/orders", "🧾"], ["Marketplace Orders", "গ্রাহকের পণ্য অর্ডার", "/admin/market-orders", "📦"]] },
  { name: "Growth & Marketing", items: [["Affiliate Center", "আবেদন, কমিশন ও পেআউট", "/admin/affiliates", "🤝"], ["Marketing & Vouchers", "ভাউচার ও ক্যাম্পেইন", "/admin/marketing", "🎯"]] },
  { name: "Finance & Operations", items: [["Finance & Commission", "সেলার পেআউট ও বিক্রির কমিশন", "/admin/finance", "💳"], ["Logistics & Delivery", "ডেলিভারি চার্জ ও হাব", "/admin/logistics", "🚚"], ["Categories", "ক্যাটাগরি পরিচালনা", "/admin/categories", "🗂️"]] },
  { name: "System & Security", items: [["Admin Users & Roles", "Admin ও Sub-admin", "/admin/users", "🔐"], ["Audit Logs", "Admin কার্যক্রম", "/admin/audit-logs", "🧾"]] },
];

function Cards({ items }: { items: MenuItem[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(([title, desc, href, icon]) => <Link key={href} href={href} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-3 font-extrabold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </Link>)}
  </div>;
}

export default function AdminDashboard() {
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const { data, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      if (roleError || !data || !["owner_admin", "sub_admin", "admin"].includes(data.role)) {
        setError("Admin অনুমতি নেই");
        return;
      }
      setRole(data.role as Role);
      setEmail(user.email || "");
    })();
    return () => { active = false; };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  if (error) return <main className="grid min-h-screen place-items-center">{error}</main>;
  if (!role) return <main className="grid min-h-screen place-items-center">Admin যাচাই হচ্ছে…</main>;

  const owner = role === "owner_admin";
  const legacyAdmin = role === "admin";

  return <main className="min-h-screen bg-[#f4f6fa] p-4 text-slate-900 sm:p-7">
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#111d35] to-[#244c73] p-7 text-white">
        <div>
          <p className="text-xs font-bold tracking-widest text-orange-300">HUBINBD CONTROL CENTER</p>
          <h1 className="mt-2 text-3xl font-black">Admin Control Panel</h1>
          <p className="mt-1 text-sm text-slate-300">Business · Marketplace · Monitoring · Security</p>
          <p className="mt-2 text-xs text-slate-300">{email} · {role}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="rounded-xl border border-white/20 px-4 py-2 text-sm">সাইট দেখুন ↗</Link>
          <button onClick={() => void logout()} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold">Logout</button>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-black">Business Management</h2>
        <Cards items={businessItems}/>
      </section>

      {owner && <section>
        <h2 className="mb-3 text-lg font-black">Owner Monitoring & Security</h2>
        <Cards items={ownerItems}/>
      </section>}

      {role !== "sub_admin" && existingGroups.map(group => {
        const items = !owner && group.name === "System & Security"
          ? group.items.filter(item => item[2] !== "/admin/users" && item[2] !== "/admin/audit-logs")
          : group.items;
        return items.length ? <section key={group.name}>
          <h2 className="mb-3 text-lg font-black">{group.name}</h2>
          <Cards items={items}/>
        </section> : null;
      })}

      {role === "sub_admin" && <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        Sub-admin শুধু Business Dashboard, Sales Reports এবং Website Analytics দেখতে পারবেন। Export, Delete, Backup, Security, Storage ও Permission পরিবর্তন Owner Admin-এর জন্য সংরক্ষিত।
      </p>}
      {legacyAdmin && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Legacy Admin role-এর বিদ্যমান Marketplace কাজ রাখা হয়েছে। Confidential Monitoring ও Security Center Owner Admin-এর জন্য সংরক্ষিত।</p>}
    </div>
  </main>;
}
