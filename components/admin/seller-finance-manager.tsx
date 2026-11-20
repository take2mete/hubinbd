"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Row = {
  id: string;
  status: string;
  sale_amount?: number | string;
  commission_amount?: number | string;
  seller_amount?: number | string;
  commission_rate?: number | string;
  order_no?: string | null;
  order_id?: string;
  product_name?: string;
  seller_id?: string;
  rule_name?: string;
  category_id?: number | null;
  is_active?: boolean;
  name?: string;
  method?: string;
  amount?: number | string;
  account_number?: string;
};
type Tab = "commissions" | "rules" | "payouts";
const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm";

export default function SellerFinanceManager() {
  const [tab, setTab] = useState<Tab>("commissions");
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [commissions, setCommissions] = useState<Row[]>([]);
  const [rules, setRules] = useState<Row[]>([]);
  const [payouts, setPayouts] = useState<Row[]>([]);
  const [categories, setCategories] = useState<Row[]>([]);
  const [ruleName, setRuleName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rate, setRate] = useState("10");

  const load = useCallback(async () => {
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login?next=%2Fadmin%2Ffinance"; return; }
    const { data: role, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (roleError || !role || !["owner_admin", "sub_admin", "admin"].includes(role.role)) {
      setError("এই পেজ ব্যবহারের জন্য Admin অনুমতি প্রয়োজন।"); return;
    }
    const results = await Promise.all([
      supabase.from("seller_commissions").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("seller_commission_rules").select("*").order("created_at", { ascending: false }),
      supabase.from("payouts").select("*").order("created_at", { ascending: false }).limit(250),
      supabase.from("sub_categories").select("id,name").eq("is_active", true).order("sort_order")
    ]);
    const failed = results.find(x => x.error);
    if (failed?.error) { setError(failed.error.message); return; }
    setCommissions(results[0].data || []);
    setRules(results[1].data || []);
    setPayouts(results[2].data || []);
    setCategories(results[3].data || []);
    setAllowed(true);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => ({
    sales: commissions.filter(x => x.status !== "reversed").reduce((s, x) => s + Number(x.sale_amount || 0), 0),
    commission: commissions.filter(x => x.status !== "reversed").reduce((s, x) => s + Number(x.commission_amount || 0), 0),
    pending: commissions.filter(x => x.status === "pending").reduce((s, x) => s + Number(x.commission_amount || 0), 0),
    paid: commissions.filter(x => x.status === "paid").reduce((s, x) => s + Number(x.commission_amount || 0), 0),
  }), [commissions]);

  async function addRule() {
    const parsed = Number(rate);
    if (!ruleName.trim() || !Number.isFinite(parsed) || parsed < 0 || parsed > 100) { setError("নিয়মের নাম ও ০–১০০ এর মধ্যে কমিশন হার দিন।"); return; }
    setBusy(true); setError("");
    const { error: insertError } = await supabase.from("seller_commission_rules").insert({
      rule_name: ruleName.trim(), category_id: categoryId ? Number(categoryId) : null, commission_rate: parsed, is_active: true
    });
    if (insertError) setError(insertError.message);
    else { setRuleName(""); setCategoryId(""); setRate("10"); await load(); }
    setBusy(false);
  }

  async function updateRule(id: string, patch: Row) {
    setBusy(true); setError("");
    const { error: updateError } = await supabase.from("seller_commission_rules").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (updateError) setError(updateError.message); else await load();
    setBusy(false);
  }

  async function updateCommission(id: string, status: string) {
    setBusy(true); setError("");
    const { error: updateError } = await supabase.from("seller_commissions").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (updateError) setError(updateError.message); else await load();
    setBusy(false);
  }

  async function updatePayout(id: string, status: string) {
    setBusy(true); setError("");
    const { error: updateError } = await supabase.from("payouts").update({ status }).eq("id", id);
    if (updateError) setError(updateError.message); else await load();
    setBusy(false);
  }

  if (!allowed) return <main className="grid min-h-screen place-items-center bg-slate-50 p-5 text-slate-700">{error || "Admin যাচাই হচ্ছে…"}</main>;

  return <main className="min-h-screen bg-[#f4f6fa] p-4 text-slate-900 sm:p-6">
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-3xl bg-[#172b4d] p-6 text-white">
        <Link href="/admin" className="text-sm text-slate-300">← Admin Dashboard</Link>
        <h1 className="mt-3 text-3xl font-black">Finance & Commission</h1>
        <p className="mt-1 text-sm text-slate-300">Seller Payouts · Product Sales Commission · Category Rates</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["মোট বিক্রি", totals.sales], ["HubinBD কমিশন", totals.commission],
          ["কমিশন বাকি", totals.pending], ["পরিশোধিত কমিশন", totals.paid]
        ].map(([label, value]) => <section key={String(label)} className={panel}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">৳{Number(value).toLocaleString("en-BD", { maximumFractionDigits: 2 })}</p></section>)}
      </div>
      <nav className="flex flex-wrap gap-2">
        {([["commissions","বিক্রির কমিশন"],["rules","কমিশন সেটিংস"],["payouts","Seller Payouts"]] as [Tab,string][]).map(([key,label]) =>
          <button key={key} onClick={() => setTab(key)} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${tab === key ? "bg-[#172b4d] text-white" : "border bg-white text-slate-700"}`}>{label}</button>
        )}
        <button onClick={() => void load()} className="ml-auto rounded-xl border bg-white px-4 py-2.5 text-sm font-bold">↻ Refresh</button>
      </nav>

      {tab === "commissions" && <section className={panel}>
        <h2 className="mb-3 font-bold">Product Sales Commission · {commissions.length}</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
          <thead><tr className="bg-slate-50">{["Order","Product","Seller ID","Sale","Rate","Commission","Seller Gets","Status"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead>
          <tbody>{commissions.map(x=><tr key={x.id} className="border-t">
            <td className="p-3 font-mono">{x.order_no || String(x.order_id).slice(0,8)}</td><td className="p-3">{x.product_name}</td><td className="p-3 font-mono">{String(x.seller_id).slice(0,8)}</td>
            <td className="p-3">৳{Number(x.sale_amount).toFixed(2)}</td><td className="p-3">{Number(x.commission_rate)}%</td><td className="p-3 font-bold">৳{Number(x.commission_amount).toFixed(2)}</td><td className="p-3">৳{Number(x.seller_amount).toFixed(2)}</td>
            <td className="p-3"><select disabled={busy || x.status === "reversed"} value={x.status} onChange={e=>void updateCommission(x.id,e.target.value)} className="rounded-lg border p-2"><option value="pending">Pending</option><option value="approved">Approved</option><option value="paid">Paid</option><option value="reversed">Reversed</option></select></td>
          </tr>)}{!commissions.length && <tr><td colSpan={8} className="p-6 text-center text-slate-500">এখনো কোনো কমিশন রেকর্ড নেই। Delivered অর্ডার হলে কমিশন তৈরি হবে।</td></tr>}</tbody>
        </table></div>
      </section>}

      {tab === "rules" && <div className="space-y-4">
        <section className={panel}>
          <h2 className="mb-3 font-bold">নতুন কমিশন নিয়ম</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input className={input} placeholder="নিয়মের নাম" value={ruleName} onChange={e=>setRuleName(e.target.value)} />
            <select className={input} value={categoryId} onChange={e=>setCategoryId(e.target.value)}><option value="">সব ক্যাটাগরির Default</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <input className={input} type="number" min="0" max="100" step="0.01" placeholder="কমিশন %" value={rate} onChange={e=>setRate(e.target.value)} />
            <button disabled={busy || !ruleName.trim()} onClick={()=>void addRule()} className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">নিয়ম যোগ করুন</button>
          </div>
          <p className="mt-2 text-xs text-slate-500">ক্যাটাগরির নির্দিষ্ট নিয়ম Default নিয়মের চেয়ে অগ্রাধিকার পাবে। নতুন নিয়ম যোগ করার আগে একই ক্যাটাগরির পুরোনো নিয়ম বন্ধ করুন।</p>
        </section>
        <section className={panel}>
          <h2 className="mb-3 font-bold">Commission Rules · {rules.length}</h2>
          <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="bg-slate-50"><th className="p-3">নিয়ম</th><th className="p-3">ক্যাটাগরি</th><th className="p-3">হার</th><th className="p-3">অবস্থা</th><th className="p-3">Action</th></tr></thead><tbody>
            {rules.map(x=><tr key={x.id} className="border-t"><td className="p-3 font-semibold">{x.rule_name}</td><td className="p-3">{categories.find(c=>c.id===x.category_id)?.name || (x.category_id ? "Unknown category" : "সব ক্যাটাগরি (Default)")}</td><td className="p-3"><input aria-label="Commission rate" type="number" min="0" max="100" step="0.01" defaultValue={x.commission_rate} onBlur={e=>{if(Number(e.target.value)!==Number(x.commission_rate))void updateRule(x.id,{commission_rate:Number(e.target.value)})}} className="w-24 rounded-lg border p-2" /> %</td><td className="p-3">{x.is_active ? "Active" : "Inactive"}</td><td className="p-3"><button disabled={busy} onClick={()=>void updateRule(x.id,{is_active:!x.is_active})} className="rounded-lg border px-3 py-2 text-xs">{x.is_active ? "বন্ধ করুন" : "চালু করুন"}</button></td></tr>)}
            {!rules.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">কোনো কমিশন নিয়ম নেই। Default কমিশন হার ১০% দিয়ে একটি নিয়ম যোগ করুন।</td></tr>}
          </tbody></table></div>
        </section>
      </div>}

      {tab === "payouts" && <section className={panel}>
        <h2 className="mb-3 font-bold">Seller Payout Requests · {payouts.length}</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="bg-slate-50">{["Seller ID","Method","Amount","Account","Status"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>
          {payouts.map(x=><tr key={x.id} className="border-t"><td className="p-3 font-mono">{String(x.seller_id).slice(0,8)}</td><td className="p-3">{x.method}</td><td className="p-3 font-bold">৳{x.amount}</td><td className="p-3">{x.account_number}</td><td className="p-3"><select disabled={busy} value={x.status} onChange={e=>void updatePayout(x.id,e.target.value)} className="rounded-lg border p-2"><option>Pending</option><option>Processing</option><option>Paid</option><option>Rejected</option></select></td></tr>)}
          {!payouts.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">কোনো payout request নেই।</td></tr>}
        </tbody></table></div>
      </section>}
      <p className="text-xs text-slate-500">কমিশন শুধু Delivered/Completed পণ্যের অর্ডারে তৈরি হয়। Cancelled/Refunded অর্ডার Reversed হয়। ডেলিভারি চার্জ কমিশনের ভিত্তিমূল্য থেকে বাদ।</p>
    </div>
  </main>;
}
