"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type AuditRow = {
  id: number;
  actor_id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export default function SecurityCenter() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const { data: role, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      if (roleError || role?.role !== "owner_admin") {
        setError("Security Center শুধু Owner Admin দেখতে পারবেন।");
        setLoading(false);
        return;
      }
      const { data, error: logError } = await supabase.from("admin_audit_logs")
        .select("id,actor_id,action,target_table,target_id,details,created_at")
        .order("created_at", { ascending: false }).limit(100);
      if (!active) return;
      if (logError) setError(logError.message);
      else setRows((data || []) as AuditRow[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return <main className="min-h-screen bg-[#f4f6fa] p-4 text-slate-900 sm:p-6">
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-3xl bg-[#172b4d] p-6 text-white">
        <Link href="/admin" className="text-sm text-slate-300">← Admin Dashboard</Link>
        <h1 className="mt-3 text-3xl font-black">Security Center</h1>
        <p className="mt-1 text-sm text-slate-300">Admin Audit Logs · Owner Admin Only</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold">Admin Login History</h2>
        <p className="mt-2 text-sm text-slate-600">বর্তমান ডাটাবেজে আলাদা Admin Login History (IP ও Device সহ) সংগ্রহ করা হচ্ছে না। তাই এখানে লগইন তথ্য দেখানো হচ্ছে না। Supabase Dashboard-এর Auth Logs থেকে উপলব্ধ Authentication Event পরীক্ষা করুন।</p>
        <a href="https://supabase.com/dashboard/project/rgplfsmxkarqnlwwaowd/logs/explorer" target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl border px-4 py-2 text-sm font-bold">Supabase Logs খুলুন ↗</a>
      </section>
      <section className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b p-4 font-bold">Admin Activity Audit Log · সর্বশেষ ১০০টি</div>
        {loading ? <p className="p-5 text-sm text-slate-500">লোড হচ্ছে…</p> : <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50"><tr>{["সময়", "Actor ID", "Action", "Table", "Target", "Details"].map(x => <th key={x} className="p-3">{x}</th>)}</tr></thead>
            <tbody>{rows.map(row => <tr key={row.id} className="border-t">
              <td className="p-3 whitespace-nowrap">{new Date(row.created_at).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}</td>
              <td className="p-3 font-mono text-xs">{row.actor_id.slice(0, 8)}…</td>
              <td className="p-3">{row.action}</td><td className="p-3">{row.target_table}</td><td className="p-3">{row.target_id || "—"}</td>
              <td className="p-3 max-w-xs truncate">{JSON.stringify(row.details || {})}</td>
            </tr>)}
              {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-slate-500">এখনো কোনো Audit Log নেই।</td></tr>}
            </tbody>
          </table>
        </div>}
      </section>
    </div>
  </main>;
}
