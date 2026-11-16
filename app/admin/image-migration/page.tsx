 "use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ImageItem = { bucket: string; path: string; mime: string; bytes: number };
type Result = { bucket: string; sourcePath: string; outputPath?: string; sourceBytes?: number; outputBytes?: number; error?: string; databaseErrors?: string[]; databaseUpdated?: boolean };

function size(value: number) {
  if (!value) return "—";
  return value < 1024 * 1024 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageMigrationPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(0);

  const request = useCallback(async (body: Record<string, unknown>) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("অ্যাডমিন হিসেবে লগইন করুন।");
    const response = await fetch("https://rgplfsmxkarqnlwwaowd.supabase.co/functions/v1/hubinbd-image-migration", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok && response.status !== 207) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload;
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setMessage("");
    try {
      const data = await request({ action: "list" });
      setItems(data.inventory ?? []);
      setMessage(`মোট ${data.count ?? 0}টি পুরোনো/ভিন্ন MIME-এর ছবি পাওয়া গেছে।`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "ছবির তালিকা আনা যায়নি।"); }
    finally { setLoading(false); }
  }, [request]);

  useEffect(() => { void load(); }, [load]);

  const migrate = async () => {
    if (!items.length || running) return;
    if (!window.confirm(`মোট ${items.length}টি ছবি WebP-তে কপি করে সফল হলে ডাটাবেসের মিল থাকা URL আপডেট করবেন? মূল ফাইল ডিলিট হবে না।`)) return;
    setRunning(true); setResults([]); setDone(0);
    const next: Result[] = [];
    for (const item of items) {
      try {
        const result = await request({ bucket: item.bucket, path: item.path, confirm: true });
        next.push({ bucket: item.bucket, sourcePath: item.path, outputPath: result.outputPath, sourceBytes: result.sourceBytes, outputBytes: result.outputBytes, databaseUpdated: result.databaseUpdated, databaseErrors: result.databaseErrors });
      } catch (e) {
        next.push({ bucket: item.bucket, sourcePath: item.path, error: e instanceof Error ? e.message : "Unknown error" });
      }
      setResults([...next]); setDone(next.length);
    }
    setRunning(false);
    setMessage(`প্রসেস শেষ: ${next.filter(x => !x.error && x.outputPath).length}টি WebP কপি তৈরি হয়েছে; ${next.filter(x => x.error).length}টিতে সমস্যা। মূল ফাইল রাখা হয়েছে।`);
    await load();
  };

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Global WebP Migration</h1><p className="mt-1 text-sm text-gray-500">পুরোনো PNG/JPEG ও ভুল MIME-এর ছবি শনাক্ত, WebP কপি তৈরি এবং ব্যবহৃত URL আপডেট।</p></div>
        <button onClick={load} disabled={loading || running} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">{loading ? "লোড হচ্ছে…" : "তালিকা রিফ্রেশ"}</button>
      </div>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">নিরাপত্তা: মূল ছবি ডিলিট/ওভাররাইট করা হবে না। নতুন .migrated.webp ফাইল তৈরি হবে। ডাটাবেস URL কেবল সফল আপলোডের পর পরিবর্তন হবে।</div>
      {message && <p role="status" className="rounded-lg bg-gray-100 p-3 text-sm">{message}</p>}
      <section className="rounded-xl border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">মাইগ্রেশন তালিকা ({items.length})</h2><button onClick={migrate} disabled={!items.length || running || loading} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{running ? `চলছে… ${done}/${items.length}` : "সব ছবি WebP করুন"}</button></div>
        {running && <div className="mb-4 h-2 overflow-hidden rounded bg-gray-200"><div className="h-full bg-blue-600 transition-all" style={{ width: `${items.length ? done / items.length * 100 : 0}%` }} /></div>}
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="p-2">Bucket</th><th className="p-2">ফাইল</th><th className="p-2">বর্তমান MIME</th><th className="p-2 text-right">সাইজ</th></tr></thead><tbody>{items.map((item) => <tr key={item.bucket + item.path} className="border-b last:border-0"><td className="p-2">{item.bucket}</td><td className="max-w-[360px] break-all p-2">{item.path}</td><td className="p-2">{item.mime || "অজানা"}</td><td className="p-2 text-right tabular-nums">{size(item.bytes)}</td></tr>)}</tbody></table></div>
        {!items.length && !loading && <p className="p-6 text-center text-sm text-gray-500">কোনো পুরোনো ফাইল পাওয়া যায়নি।</p>}
      </section>
      {results.length > 0 && <section className="rounded-xl border p-4"><h2 className="mb-3 font-semibold">ফলাফল ({results.length})</h2><div className="space-y-2">{results.map((r) => <div key={r.bucket + r.sourcePath} className="rounded-lg bg-gray-50 p-3 text-sm"><div className="font-medium break-all">{r.sourcePath}</div>{r.error ? <p className="mt-1 text-red-700">ব্যর্থ: {r.error}</p> : <><p className="mt-1 text-green-700">WebP: {r.outputPath} · {size(r.sourceBytes ?? 0)} → {size(r.outputBytes ?? 0)}</p>{r.databaseErrors?.length ? <p className="text-amber-700">DB আপডেট অসম্পূর্ণ: {r.databaseErrors.join(" | ")}</p> : <p className="text-green-700">মিল থাকা ডাটাবেস URL আপডেট হয়েছে।</p>}</>}</div>)}</div></section>}
    </main>
  );
}
