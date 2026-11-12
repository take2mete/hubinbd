"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { convertToWebP } from "@/lib/image-utils";

type Product = {
  id: number;
  name: string;
  name_bn: string;
  brand: string;
  description: string;
  image_urls: string[];
  sizes: string[];
  colors: string[];
  price: number;
  old_price: number;
  stock: number;
  category: string;
  is_active: boolean;
  status: string;
  vendor_id: string | null;
  sku: string | null;
  sold: string | number;
  created_at: string;
};
type Vendor = { user_id: string; business_name: string; contact_name: string; phone: string; status: string };
type Filter = "all" | "pending" | "approved" | "rejected";
const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-cyan-600";
const isPending = (p: Product) => !p.is_active && !["Rejected", "rejected"].includes(p.status);
const isRejected = (p: Product) => ["Rejected", "rejected"].includes(p.status);
const isApproved = (p: Product) => p.is_active || ["Approved", "approved", "Published", "published"].includes(p.status);

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Record<string, Vendor>>({});
  const [edit, setEdit] = useState<Product | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  async function load() {
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/admin/login"; return; }
    const { data: role, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (roleError || !role || !["owner_admin", "sub_admin", "admin"].includes(role.role)) {
      setError("এই পেজ ব্যবহারের জন্য Admin অনুমতি প্রয়োজন।");
      return;
    }
    const { data, error: loadError } = await supabase.from("products")
      .select("id,name,name_bn,brand,description,image_urls,sizes,colors,price,old_price,stock,category,is_active,status,vendor_id,sku,sold,created_at")
      .order("created_at", { ascending: false });
    if (loadError) { setError(loadError.message); return; }
    const rows = (data || []) as Product[];
    setItems(rows);
    const ids = [...new Set(rows.map(p => p.vendor_id).filter((id): id is string => Boolean(id)))];
    if (ids.length) {
      const { data: vendorRows } = await supabase.from("vendors").select("user_id,business_name,contact_name,phone,status").in("user_id", ids);
      const map: Record<string, Vendor> = {};
      (vendorRows || []).forEach(v => { map[v.user_id] = v as Vendor; });
      setVendors(map);
    } else setVendors({});
  }

  useEffect(() => { void load(); }, []);

  async function moderate(p: Product, action: "approve" | "reject") {
    const approved = action === "approve";
    const message = approved ? "এই পণ্যটি প্রকাশ করবেন?" : "এই পণ্যটি Reject করবেন?";
    if (!window.confirm(message)) return;
    setBusyId(p.id); setError("");
    const { error: updateError } = await supabase.from("products")
      .update({ status: approved ? "Approved" : "Rejected", is_active: approved })
      .eq("id", p.id);
    setBusyId(null);
    if (updateError) { setError(updateError.message); return; }
    await load();
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setBusy(true); setError("");
    const { error: updateError } = await supabase.from("products").update({
      name: edit.name, name_bn: edit.name_bn, brand: edit.brand, description: edit.description,
      image_urls: edit.image_urls, sizes: edit.sizes, colors: edit.colors, price: edit.price,
      old_price: edit.old_price, stock: edit.stock, category: edit.category
    }).eq("id", edit.id);
    setBusy(false);
    if (updateError) { setError(updateError.message); return; }
    setEdit(null); await load();
  }

  async function upload(file?: File) {
    if (!file || !edit) return;
    if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("JPG, PNG বা WebP ছবি দিন (সর্বোচ্চ ৫ MB)।"); return;
    }
    let optimized: File;
    try { optimized = await convertToWebP(file); }
    catch (e) { setError(e instanceof Error ? e.message : "ছবি কনভার্ট করা যায়নি"); return; }
    const ext = optimized.name.split(".").pop()?.toLowerCase() || "png";
    const path = "admin/" + Date.now() + "-" + optimized.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, optimized, { contentType: optimized.type || `image/${ext}` });
    if (uploadError) { setError(uploadError.message); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEdit({ ...edit, image_urls: [...(edit.image_urls || []), data.publicUrl] });
  }

  async function remove(id: number) {
    if (!window.confirm("পণ্যটি স্থায়ীভাবে মুছবেন?")) return;
    const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else setItems(old => old.filter(p => p.id !== id));
  }

  const counts = useMemo(() => ({
    all: items.length, pending: items.filter(isPending).length,
    approved: items.filter(isApproved).length, rejected: items.filter(isRejected).length
  }), [items]);
  const visible = useMemo(() => items.filter(p => {
    const matches = filter === "all" || (filter === "pending" && isPending(p)) || (filter === "approved" && isApproved(p)) || (filter === "rejected" && isRejected(p));
    const text = [p.name, p.name_bn, p.brand, p.category, p.sku || "", vendors[p.vendor_id || ""]?.business_name || ""].join(" ").toLowerCase();
    return matches && text.includes(query.toLowerCase());
  }), [items, filter, query, vendors]);

  return <main className="min-h-screen bg-[#f5f7fa] px-3 py-5 text-slate-900 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><a href="/admin" className="text-sm font-medium text-slate-500 hover:text-cyan-700">← Dashboard</a>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">পণ্য অনুমোদন ও পরিচালনা</h1>
          <p className="mt-1 text-sm text-slate-500">পণ্য যাচাই করুন, অনুমোদন দিন অথবা প্রয়োজনীয় সংশোধন করুন</p>
        </div>
        <button onClick={() => void load()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm">↻ রিফ্রেশ</button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          ["all", "সকল পণ্য", counts.all, "bg-slate-900"],
          ["pending", "অনুমোদনের অপেক্ষায়", counts.pending, "bg-amber-500"],
          ["approved", "প্রকাশিত", counts.approved, "bg-emerald-600"],
          ["rejected", "বাতিল", counts.rejected, "bg-rose-600"]
        ] as [Filter, string, number, string][]).map(([key, label, count, color]) =>
          <button key={key} onClick={() => setFilter(key)} className={`rounded-2xl border p-4 text-left transition ${filter === key ? "border-cyan-700 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white hover:border-slate-300"}`}>
            <span className={`mb-3 inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-extrabold text-white ${color}`}>{count}</span>
            <span className="block text-sm font-bold text-slate-700">{label}</span>
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="পণ্যের নাম, ব্র্যান্ড, SKU বা বিক্রেতা খুঁজুন..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-600" />
        <span className="self-center text-sm text-slate-500">{visible.length}টি পণ্য</span>
      </div>

      {edit && <form onSubmit={save} className="mb-5 grid gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="text-lg font-extrabold sm:col-span-2 lg:col-span-3">পণ্য সম্পাদনা · #{edit.id}</h2>
        {([["name","Product Name"],["name_bn","বাংলা নাম"],["brand","Brand"],["category","Category"],["description","বিবরণ"]] as [keyof Product,string][]).map(([key,label]) =>
          <label key={key} className={key === "description" ? "sm:col-span-2 lg:col-span-3 text-sm font-semibold" : "text-sm font-semibold"}>{label}
            {key === "description" ? <textarea rows={3} className={inputClass} value={String(edit[key] || "")} onChange={e => setEdit({...edit,[key]:e.target.value})} /> :
              <input className={inputClass} value={String(edit[key] || "")} onChange={e => setEdit({...edit,[key]:e.target.value})} />}
          </label>
        )}
        {([["price","দাম"],["old_price","আগের দাম"],["stock","স্টক"]] as [keyof Product,string][]).map(([key,label]) =>
          <label key={key} className="text-sm font-semibold">{label}<input type="number" min="0" className={inputClass} value={Number(edit[key] || 0)} onChange={e => setEdit({...edit,[key]:Number(e.target.value)})}/></label>
        )}
        <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">ছবি যোগ করুন<input type="file" accept="image/png,image/jpeg,image/webp" className={inputClass} onChange={e => void upload(e.target.files?.[0])}/></label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">{(edit.image_urls || []).map((url,i)=><div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border"><img src={url} alt={`Product ${i+1}`} className="h-full w-full object-cover"/><button type="button" onClick={()=>setEdit({...edit,image_urls:edit.image_urls.filter((_,n)=>n!==i)})} className="absolute right-1 top-1 rounded-full bg-white px-1.5 text-rose-600">×</button></div>)}</div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><button disabled={busy} className="rounded-xl bg-cyan-700 px-5 py-2.5 font-bold text-white disabled:opacity-50">{busy ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ"}</button><button type="button" onClick={()=>setEdit(null)} className="rounded-xl border px-5 py-2.5 font-bold">বাতিল</button></div>
      </form>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(240px,2fr)_1fr_1fr_1fr_1.4fr] gap-3 border-b bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 lg:grid">
          <span>পণ্য</span><span>দাম / স্টক</span><span>বিক্রেতা</span><span>স্ট্যাটাস</span><span className="text-right">অ্যাকশন</span>
        </div>
        {visible.length === 0 ? <div className="p-12 text-center text-slate-500">এই তালিকায় কোনো পণ্য পাওয়া যায়নি।</div> :
          visible.map(p => {
            const vendor = p.vendor_id ? vendors[p.vendor_id] : undefined;
            const pending = isPending(p);
            const approved = isApproved(p);
            const rejected = isRejected(p);
            return <article key={p.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-0 lg:grid-cols-[minmax(240px,2fr)_1fr_1fr_1fr_1.4fr] lg:items-center lg:gap-3 lg:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  {p.image_urls?.[0] ? <img src={p.image_urls[0]} alt={p.name_bn || p.name} className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-2xl text-slate-300">▧</div>}
                </div>
                <div className="min-w-0"><p className="font-bold text-slate-900">{p.name_bn || p.name}</p><p className="truncate text-xs text-slate-500">{p.brand || "Brand নেই"} · {p.category}</p><p className="mt-1 text-xs text-slate-400">SKU: {p.sku || "—"} · ID: {p.id}</p></div>
              </div>
              <div className="text-sm"><p className="font-extrabold">৳{Number(p.price || 0).toLocaleString("bn-BD")}</p><p className="text-xs text-slate-500">স্টক: {Number(p.stock || 0).toLocaleString("bn-BD")}</p></div>
              <div className="text-sm"><p className="font-semibold">{vendor?.business_name || "সরাসরি / অজানা"}</p><p className="text-xs text-slate-500">{vendor?.contact_name || vendor?.phone || ""}</p></div>
              <div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${approved ? "bg-emerald-100 text-emerald-700" : rejected ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}>{approved ? "প্রকাশিত" : rejected ? "প্রত্যাখ্যাত" : "অনুমোদনের অপেক্ষায়"}</span></div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {pending && <><button disabled={busyId === p.id} onClick={()=>void moderate(p,"approve")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{busyId === p.id ? "..." : "✓ Approve"}</button><button disabled={busyId === p.id} onClick={()=>void moderate(p,"reject")} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">Reject</button></>}
                <button onClick={()=>setEdit({...p,image_urls:p.image_urls||[],sizes:p.sizes||[],colors:p.colors||[]})} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Edit</button>
                <button onClick={()=>void remove(p.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50">Delete</button>
              </div>
            </article>;
          })}
      </div>
    </div>
  </main>;
}
