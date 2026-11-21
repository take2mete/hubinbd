"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type BucketUsage = { bucket_name: string; object_count: number; bytes_used: number };
const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index > 1 ? 2 : 1)} ${units[index]}`;
};

export default function StorageUsage() {
  const [rows, setRows] = useState<BucketUsage[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/login"); return; }
      const { data: role, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      if (roleError || role?.role !== "owner_admin") {
        setError("Storage usage শুধু Owner Admin দেখতে পারবেন।");
        setLoading(false);
        return;
      }
      const { data, error: rpcError } = await supabase.rpc("admin_storage_usage");
      if (!active) return;
      if (rpcError) setError(rpcError.message);
      else setRows((data || []) as BucketUsage[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const totalBytes = rows.reduce((sum, row) => sum + Number(row.bytes_used || 0), 0);
  const totalObjects = rows.reduce((sum, row) => sum + Number(row.object_count || 0), 0);

  return <section className="rounded-2xl border bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h2 className="text-lg font-black">Storage Usage — Live Database Snapshot</h2><p className="mt-1 text-sm text-slate-600">Bucket অনুযায়ী ফাইল সংখ্যা ও ব্যবহৃত জায়গা। কোনো ফাইল Delete করা হয় না।</p></div>
      <a href="https://supabase.com/dashboard/project/rgplfsmxkarqnlwwaowd/storage" target="_blank" rel="noreferrer" className="rounded-xl border px-3 py-2 text-sm font-bold">Storage খুলুন ↗</a>
    </div>
    {loading ? <p className="mt-4 text-sm text-slate-500">Storage হিসাব হচ্ছে…</p> : error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">মোট ব্যবহৃত জায়গা</p><p className="mt-1 text-2xl font-black">{formatBytes(totalBytes)}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">মোট ফাইল</p><p className="mt-1 text-2xl font-black">{totalObjects.toLocaleString("en-BD")}</p></div></div>
      <div className="mt-4 divide-y">{rows.map(row => <div key={row.bucket_name} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="font-semibold">{row.bucket_name}</span><span className="text-slate-600">{Number(row.object_count).toLocaleString("en-BD")} files · {formatBytes(Number(row.bytes_used))}</span></div>)}</div>
      <p className="mt-3 text-xs text-slate-500">Free Plan-এর নির্দিষ্ট quota ও 70/85/95% alert threshold এখানে অনুমান করে দেখানো হয়নি। Alert চালুর আগে প্রকৃত quota এবং notification destination যুক্ত করতে হবে।</p>
    </>}
  </section>;
}
