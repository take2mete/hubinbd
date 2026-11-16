 "use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ImageItem = { bucket: string; path: string; mime: string; bytes: number };
type Result = { bucket: string; sourcePath: string; outputPath?: string; sourceBytes?: number; outputBytes?: number; error?: string; databaseErrors?: string[]; databaseUpdated?: boolean };
type CleanupItem = { bucket: string; path: string; state: "unchecked" | "safe" | "blocked" | "deleted" | "error"; detail?: string };
const LEGACY_IMAGES: Array<{bucket:string;path:string}> = [
{bucket:"banner-images",path:"ad-banners/banner-1794586215830-ohhko3.webp"},
{bucket:"banner-images",path:"ad-banners/banner-1794588885729-smuyi5.webp"},
{bucket:"banner-images",path:"ad-banners/banner-1794589034726-ml9m3f.webp"},
{bucket:"banner-images",path:"ad-banners/banner-1794589560076-mdswqs.webp"},
{bucket:"product-images",path:"admin/1794073416760-Copilot_20260718_211849.png"},
{bucket:"product-images",path:"admin/1794413381862-________.png"},
{bucket:"product-images",path:"eef89e5d-a875-4cf1-a0cb-8186672123a4/1794072284588-f5n66p03vzk.png"},
{bucket:"product-images",path:"eef89e5d-a875-4cf1-a0cb-8186672123a4/1794072285799-a01ei1albp.png"},
{bucket:"product-images",path:"eef89e5d-a875-4cf1-a0cb-8186672123a4/1794072286817-wj5b5tx4h9k.png"},
{bucket:"product-images",path:"eef89e5d-a875-4cf1-a0cb-8186672123a4/1794410515773-nu6iohsdvhc.png"},
{bucket:"product-images",path:"eef89e5d-a875-4cf1-a0cb-8186672123a4/1794410531532-bvnkxs8utum.png"},
{bucket:"site-assets",path:"logo.png"},
{bucket:"site-assets",path:"online-rental-car-bangladesh-cars-hubinbd.jpg"},
];

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
  const [cleanup, setCleanup] = useState<CleanupItem[]>(LEGACY_IMAGES.map(x => ({ ...x, state: "unchecked" })));
  const [checkingCleanup, setCheckingCleanup] = useState(false);

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

  const checkCleanup = async () => {
    setCheckingCleanup(true);
    const next: CleanupItem[] = [];
    for (const item of LEGACY_IMAGES) {
      try {
        const result = await request({ action: "delete_check", bucket: item.bucket, path: item.path });
        next.push({ ...item, state: result.mode === "safe_to_delete" ? "safe" : "blocked", detail: result.mode === "safe_to_delete" ? `WebP verified · ${size(result.webpBytes ?? 0)}` : JSON.stringify(result.references ?? result) });
      } catch (e) { next.push({ ...item, state: "error", detail: e instanceof Error ? e.message : "যাচাই ব্যর্থ" }); }
      setCleanup([...next, ...LEGACY_IMAGES.slice(next.length).map(x => ({ ...x, state: "unchecked" as const }))]);
    }
    setCheckingCleanup(false);
    setMessage(`যাচাই শেষ: ${next.filter(x => x.state === "safe").length}টি নিরাপদ; ${next.filter(x => x.state !== "safe").length}টি আটকে গেছে।`);
  };
  const deleteOriginal = async (item: CleanupItem) => {
    if (item.state !== "safe" || !window.confirm(`নিশ্চিত করুন: ${item.path} স্থায়ীভাবে মুছে ফেলবেন? WebP কপি রাখা হবে।`)) return;
    try {
      const result = await request({ action: "delete_original", bucket: item.bucket, path: item.path, confirm: true });
      setCleanup(current => current.map(x => x.bucket === item.bucket && x.path === item.path ? { ...x, state: result.deleted ? "deleted" : "error", detail: result.deleted ? "মুছে ফেলা ও যাচাই সম্পন্ন" : "Delete যাচাই হয়নি" } : x));
      setMessage(result.deleted ? "Original মুছে ফেলা হয়েছে; WebP অক্ষত আছে।" : "Delete যাচাই করা যায়নি।");
      await load();
    } catch (e) { setCleanup(current => current.map(x => x.bucket === item.bucket && x.path === item.path ? { ...x, state: "error", detail: e instanceof Error ? e.message : "Delete ব্যর্থ" } : x)); }
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
      <section className="rounded-xl border border-red-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold">পুরোনো ১৩টি Original Image Cleanup</h2><p className="mt-1 text-sm text-gray-500">প্রতিটি ফাইলের WebP কপি ও Database Reference পুনরায় যাচাই করে তারপর আলাদাভাবে Delete করুন।</p></div>
          <button onClick={checkCleanup} disabled={checkingCleanup || running} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">{checkingCleanup ? "যাচাই চলছে…" : "১৩টি ফাইল পুনরায় যাচাই"}</button>
        </div>
        <div className="mt-3 space-y-2">{cleanup.map(item=><div key={item.bucket+item.path} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 text-sm">
          <div className="min-w-0 flex-1"><div className="break-all font-medium">{item.path}</div><div className="mt-1 text-xs text-gray-500">{item.bucket} · {item.detail ?? "এখনো যাচাই হয়নি"}</div></div>
          <div className="flex items-center gap-2"><span className={item.state==="safe"?"text-green-700":item.state==="deleted"?"text-gray-500":item.state==="blocked"||item.state==="error"?"text-red-700":"text-gray-500"}>{item.state==="safe"?"নিরাপদ":item.state==="deleted"?"মুছে ফেলা হয়েছে":item.state==="blocked"?"Reference পাওয়া গেছে":item.state==="error"?"ত্রুটি":"অপেক্ষমাণ"}</span>
          {item.state==="safe" && <button onClick={()=>deleteOriginal(item)} className="rounded bg-red-600 px-3 py-1.5 font-semibold text-white">Delete Original</button>}</div>
        </div>)}</div>
        <p className="mt-3 text-xs text-gray-500">Delete করার আগে Edge Function WebP ফাইলটি ডাউনলোড করে যাচাই করে এবং পরিচিত Database টেবিলে Original URL খোঁজে। কোনো স্ক্যান ব্যর্থ হলে Delete বন্ধ থাকবে।</p>
      </section>
      {results.length > 0 && <section className="rounded-xl border p-4"><h2 className="mb-3 font-semibold">ফলাফল ({results.length})</h2><div className="space-y-2">{results.map((r) => <div key={r.bucket + r.sourcePath} className="rounded-lg bg-gray-50 p-3 text-sm"><div className="font-medium break-all">{r.sourcePath}</div>{r.error ? <p className="mt-1 text-red-700">ব্যর্থ: {r.error}</p> : <><p className="mt-1 text-green-700">WebP: {r.outputPath} · {size(r.sourceBytes ?? 0)} → {size(r.outputBytes ?? 0)}</p>{r.databaseErrors?.length ? <p className="text-amber-700">DB আপডেট অসম্পূর্ণ: {r.databaseErrors.join(" | ")}</p> : <p className="text-green-700">মিল থাকা ডাটাবেস URL আপডেট হয়েছে।</p>}</>}</div>)}</div></section>}
    </main>
  );
}
