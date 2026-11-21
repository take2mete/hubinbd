"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Summary = {
  daily_sales: number;
  monthly_sales: number;
  total_orders: number;
  pending_orders: number;
  seller_commission: number;
  affiliate_commission: number;
  low_stock_count: number;
};

const money = (value: number) => "৳" + Number(value || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 });

export default function BusinessDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.replace("/admin/login"); return; }
    const { data: role, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (roleError || !role || !["owner_admin", "sub_admin", "admin"].includes(role.role)) {
      setError("এই রিপোর্ট দেখার অনুমতি নেই।");
      setLoading(false);
      return;
    }
    const { data, error: reportError } = await supabase.rpc("admin_business_summary");
    if (reportError) setError(reportError.message);
    else setSummary(data as Summary);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cards = summary ? [
    ["আজকের বিক্রি", money(summary.daily_sales)],
    ["এই মাসের বিক্রি", money(summary.monthly_sales)],
    ["মোট অর্ডার", Number(summary.total_orders || 0).toLocaleString("en-BD")],
    ["Pending Orders", Number(summary.pending_orders || 0).toLocaleString("en-BD")],
    ["Seller Commission", money(summary.seller_commission)],
    ["Affiliate Commission", money(summary.affiliate_commission)],
    ["Low Stock Products", Number(summary.low_stock_count || 0).toLocaleString("en-BD")],
  ] : [];

  return <main className="min-h-screen bg-[#f4f6fa] p-4 text-slate-900 sm:p-6">
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-3xl bg-[#172b4d] p-6 text-white">
        <Link href="/admin" className="text-sm text-slate-300">← Admin Dashboard</Link>
        <h1 className="mt-3 text-3xl font-black">Business Dashboard</h1>
        <p className="mt-1 text-sm text-slate-300">HubinBD-এর বিদ্যমান Order ও Commission ডেটার সারাংশ</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {loading ? <div className="rounded-2xl border bg-white p-6">হিসাব লোড হচ্ছে…</div> : summary && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => <section key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
        </section>)}
      </div>}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        বিক্রির অঙ্কে Cancelled, Rejected ও Refunded অর্ডার বাদ। Net Profit / Expense এখন দেখানো হচ্ছে না, কারণ বর্তমান ডাটাবেজে পূর্ণ Expense Ledger নেই। ভুল লাভের হিসাব দেখানোর বদলে এই তথ্য আলাদা রাখা হয়েছে।
      </section>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/sales-reports" className="rounded-xl bg-[#172b4d] px-4 py-2.5 text-sm font-bold text-white">Sales Reports</Link>
        <button onClick={() => void load()} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-bold">↻ Refresh</button>
      </div>
    </div>
  </main>;
}
