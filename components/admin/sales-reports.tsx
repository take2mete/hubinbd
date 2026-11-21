"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type ReportRow = {
  report_date: string;
  seller_name: string;
  category_name: string;
  order_count: number;
  sales_amount: number | string;
};

function dhakaDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return '"' + text.replace(/"/g, '""') + '"';
}

export default function SalesReports() {
  const today = dhakaDate(new Date());
  const [from, setFrom] = useState(today.slice(0, 8) + "01");
  const [to, setTo] = useState(today);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const { data, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      if (roleError || !data || !["owner_admin", "sub_admin", "admin"].includes(data.role)) {
        setError("এই রিপোর্ট দেখার অনুমতি নেই।");
        return;
      }
      setRole(data.role);
    })();
    return () => { active = false; };
  }, []);

  async function load() {
    if (!from || !to || from > to) { setError("সঠিক তারিখ নির্বাচন করুন।"); return; }
    setLoading(true);
    setError("");
    const { data, error: reportError } = await supabase.rpc("admin_sales_report", { p_from: from, p_to: to });
    if (reportError) setError(reportError.message);
    else setRows((data || []) as ReportRow[]);
    setLoading(false);
  }

  function exportCsv() {
    if (role !== "owner_admin") return;
    const header = ["Date", "Seller", "Category", "Orders", "Sales Amount"];
    const body = rows.map(row => [row.report_date, row.seller_name, row.category_name, row.order_count, row.sales_amount]);
    const csv = "\uFEFF" + [header, ...body].map(line => line.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `hubinbd-sales-${from}-to-${to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const totalOrders = rows.reduce((sum, row) => sum + Number(row.order_count || 0), 0);
  const totalSales = rows.reduce((sum, row) => sum + Number(row.sales_amount || 0), 0);

  return <main className="min-h-screen bg-[#f4f6fa] p-4 text-slate-900 sm:p-6">
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-3xl bg-[#172b4d] p-6 text-white">
        <Link href="/admin" className="text-sm text-slate-300">← Admin Dashboard</Link>
        <h1 className="mt-3 text-3xl font-black">Sales Reports</h1>
        <p className="mt-1 text-sm text-slate-300">তারিখ, Seller ও Category অনুযায়ী বিক্রির সমন্বিত রিপোর্ট</p>
      </header>
      <section className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        <label className="text-sm font-semibold">শুরুর তারিখ<input type="date" value={from} max={to || today} onChange={e => setFrom(e.target.value)} className="mt-1 block w-full rounded-lg border p-2.5"/></label>
        <label className="text-sm font-semibold">শেষ তারিখ<input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)} className="mt-1 block w-full rounded-lg border p-2.5"/></label>
        <button onClick={() => void load()} disabled={loading || !role} className="rounded-xl bg-[#172b4d] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{loading ? "লোড হচ্ছে…" : "রিপোর্ট দেখুন"}</button>
        {role === "owner_admin" && <button onClick={exportCsv} disabled={!rows.length} className="rounded-xl border px-5 py-2.5 text-sm font-bold disabled:opacity-50">CSV Export</button>}
      </section>
      {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {rows.length > 0 && <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4"><p className="text-sm text-slate-500">মোট অর্ডার</p><p className="mt-1 text-2xl font-black">{totalOrders.toLocaleString("en-BD")}</p></div>
        <div className="rounded-2xl border bg-white p-4"><p className="text-sm text-slate-500">মোট বিক্রি</p><p className="mt-1 text-2xl font-black">৳{totalSales.toLocaleString("en-BD", { maximumFractionDigits: 2 })}</p></div>
      </section>}
      <section className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b p-4 font-bold">Report Rows · {rows.length}</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50"><tr>{["তারিখ", "Seller", "Category", "অর্ডার", "বিক্রি"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, index) => <tr key={`${row.report_date}-${row.seller_name}-${row.category_name}-${index}`} className="border-t">
                <td className="p-3">{row.report_date}</td><td className="p-3">{row.seller_name}</td><td className="p-3">{row.category_name}</td><td className="p-3">{Number(row.order_count).toLocaleString("en-BD")}</td><td className="p-3 font-bold">৳{Number(row.sales_amount).toLocaleString("en-BD", { maximumFractionDigits: 2 })}</td>
              </tr>)}
              {!rows.length && <tr><td colSpan={5} className="p-7 text-center text-slate-500">তারিখ নির্বাচন করে রিপোর্ট দেখুন।</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {role === "sub_admin" && <p className="text-xs text-slate-500">Sub-admin শুধু রিপোর্ট দেখতে পারবেন। CSV Export ও Print সুবিধা Owner Admin-এর জন্য সংরক্ষিত।</p>}
    </div>
  </main>;
}
