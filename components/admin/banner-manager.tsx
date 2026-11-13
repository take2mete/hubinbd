"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { bannerDefaults } from "@/lib/banners";
import { supabase } from "@/lib/supabase/client";
import { convertToWebP } from "@/lib/image-utils";

type AdPlacement = {
  id: string;
  page_path: string;
  position: "after-header" | "middle" | "before-footer";
  title: string;
  ad_code: string;
  enabled: boolean;
  content_type: "adsterra" | "image";
  image_url: string | null;
  link_url: string;
  width_px: number;
  height_px: number;
  max_width_px: number;
  mobile_width_px: number;
  mobile_height_px: number;
  object_fit: "contain" | "cover" | "fill";
};

type AdDraft = Omit<AdPlacement, "id">;

const emptyAd: AdDraft = {
  page_path: "*",
  position: "after-header" as AdPlacement["position"],
  title: "Adsterra Ad",
  ad_code: "",
  enabled: false,
  content_type: "adsterra",
  image_url: null as string | null,
  link_url: "",
  width_px: 100,
  height_px: 120,
  max_width_px: 1200,
  mobile_width_px: 100,
  mobile_height_px: 100,
  object_fit: "contain",
};

export default function BannerManager() {
  const [items, setItems] = useState(bannerDefaults);
  const [ads, setAds] = useState<AdPlacement[]>([]);
  const [draft, setDraft] = useState<AdDraft>(emptyAd);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customPath, setCustomPath] = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (live) setReady(true); return; }
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      if (!role || !["owner_admin", "sub_admin", "admin"].includes(role.role)) {
        await supabase.auth.signOut();
        if (live) { setMessage("এই পেজ ব্যবহারের অনুমতি নেই।"); setReady(true); }
        return;
      }
      const [bannerResult, adResult] = await Promise.all([
        supabase.from("banners").select("slot,image_url,link_url,title").in("slot", bannerDefaults.map((item) => item.slot)).order("slot"),
        supabase.from("ad_placements").select("id,page_path,position,title,ad_code,enabled,content_type,image_url,link_url,width_px,height_px,max_width_px,mobile_width_px,mobile_height_px,object_fit").order("created_at", { ascending: false }),
      ]);
      if (live) {
        setEmail(session.user.email || "");
        if (bannerResult.data) setItems(bannerDefaults.map((item) => bannerResult.data.find((row) => row.slot === item.slot) ?? item));
        if (adResult.data) setAds(adResult.data as AdPlacement[]);
        if (adResult.error) setMessage("Ad settings table load হয়নি: " + adResult.error.message);
        setReady(true);
      }
    })();
    return () => { live = false; };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) setMessage(error.message);
    else window.location.reload();
  }

  async function upload(slot: number, file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("JPG, PNG বা WebP ছবি দিন (সর্বোচ্চ ৫ MB)।"); return;
    }
    setUploadingSlot(slot); setMessage("");
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width < 200 || bitmap.height < 80) { bitmap.close(); throw new Error("ছবির মাপ কমপক্ষে ২০০ × ৮০ px হতে হবে।"); }
      bitmap.close();
      const optimized = await convertToWebP(file);
      const extension = optimized.name.split(".").pop()?.toLowerCase() || "webp";
      const path = `home-banners/slot-${slot}-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("banner-images").upload(path, optimized, { contentType: optimized.type, cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
      setItems((current) => current.map((item) => item.slot === slot ? { ...item, image_url: data.publicUrl } : item));
      setMessage("ছবি আপলোড হয়েছে। হোমপেজে প্রকাশ করতে Save Changes চাপুন।");
    } catch (error) { setMessage(error instanceof Error ? error.message : "ছবি আপলোড করা যায়নি।"); }
    finally { setUploadingSlot(null); }
  }

  async function saveBanners() {
    setSaving(true); setMessage("");
    const { error } = await supabase.from("banners").upsert(items.map(({ slot, image_url, link_url, title }) => ({ slot, image_url, link_url, title })), { onConflict: "slot" });
    setSaving(false);
    setMessage(error ? error.message : "হেডারের নিচের ৩টি ব্যানার সংরক্ষণ হয়েছে।");
  }

  async function saveAd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.content_type === "adsterra" && !draft.ad_code.trim()) { setMessage("Adsterra Ad Code পেস্ট করুন।"); return; }
    if (draft.content_type === "image" && !draft.image_url) { setMessage("ব্যানার ছবি আপলোড করুন।"); return; }
    const pagePath = customPath.trim() || draft.page_path;
    if (pagePath !== "*" && !pagePath.startsWith("/")) { setMessage("Page path অবশ্যই / দিয়ে শুরু হবে।"); return; }
    setSaving(true); setMessage("");
    const payload = { ...draft, page_path: pagePath, ad_code: draft.content_type === "adsterra" ? draft.ad_code.trim() : "", updated_at: new Date().toISOString() };
    const result = editingId
      ? await supabase.from("ad_placements").update(payload).eq("id", editingId).select("id,page_path,position,title,ad_code,enabled,content_type,image_url,link_url,width_px,height_px,max_width_px,mobile_width_px,mobile_height_px,object_fit").single()
      : await supabase.from("ad_placements").insert(payload).select("id,page_path,position,title,ad_code,enabled,content_type,image_url,link_url,width_px,height_px,max_width_px,mobile_width_px,mobile_height_px,object_fit").single();
    setSaving(false);
    if (result.error) { setMessage("সংরক্ষণ হয়নি: " + result.error.message); return; }
    const row = result.data as AdPlacement;
    setAds((current) => editingId ? current.map((item) => item.id === editingId ? row : item) : [row, ...current]);
    setDraft(emptyAd); setCustomPath(""); setEditingId(null);
    setMessage("Adsterra placement সংরক্ষণ হয়েছে।");
  }

  function editAd(ad: AdPlacement) {
    setEditingId(ad.id);
    const knownPaths = ["*", "/", "/tools", "/computer-work", "/clothing"];
    setDraft({ ...emptyAd, page_path: knownPaths.includes(ad.page_path) ? ad.page_path : "custom", position: ad.position, title: ad.title, ad_code: ad.ad_code, enabled: ad.enabled, content_type: ad.content_type || "adsterra", image_url: ad.image_url, link_url: ad.link_url || "", width_px: ad.width_px ?? 100, height_px: ad.height_px ?? 120, max_width_px: ad.max_width_px ?? 1200, mobile_width_px: ad.mobile_width_px ?? 100, mobile_height_px: ad.mobile_height_px ?? 100, object_fit: ad.object_fit || "contain" });
    setCustomPath(knownPaths.includes(ad.page_path) ? "" : ad.page_path);
    document.getElementById("adsterra-editor")?.scrollIntoView({ behavior: "smooth" });
  }

  async function uploadPlacementImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("JPG, PNG বা WebP ছবি দিন (সর্বোচ্চ ৫ MB)।"); return;
    }
    setSaving(true); setMessage("");
    try {
      const optimized = await convertToWebP(file);
      const path = `ad-banners/banner-${Date.now()}-${Math.random().toString(36).slice(2,8)}.webp`;
      const { error } = await supabase.storage.from("banner-images").upload(path, optimized, { contentType: "image/webp", cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
      setDraft((current) => ({ ...current, image_url: data.publicUrl }));
      setMessage("ব্যানার ছবি আপলোড হয়েছে। এখন Save/Update করুন।");
    } catch (error) { setMessage(error instanceof Error ? error.message : "ছবি আপলোড হয়নি।"); }
    finally { setSaving(false); }
  }

  async function toggleAd(ad: AdPlacement) {
    const { error } = await supabase.from("ad_placements").update({ enabled: !ad.enabled, updated_at: new Date().toISOString() }).eq("id", ad.id);
    if (error) { setMessage(error.message); return; }
    setAds((current) => current.map((item) => item.id === ad.id ? { ...item, enabled: !item.enabled } : item));
  }

  async function deleteAd(id: string) {
    if (!window.confirm("এই বিজ্ঞাপনটি মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("ad_placements").delete().eq("id", id);
    if (error) { setMessage(error.message); return; }
    setAds((current) => current.filter((item) => item.id !== id));
    setMessage("বিজ্ঞাপন মুছে ফেলা হয়েছে।");
  }

  if (!ready) return <main className="p-8">লোড হচ্ছে…</main>;
  if (!email) return (
    <main className="mx-auto max-w-md p-6 pt-16">
      <h1 className="text-2xl font-bold">Banner & Ads Admin Login</h1>
      <form onSubmit={login} className="mt-6 grid gap-3">
        <input name="email" type="email" required placeholder="Admin email" className="rounded-xl border border-zinc-700 bg-zinc-900 p-3" />
        <input name="password" type="password" required placeholder="Password" className="rounded-xl border border-zinc-700 bg-zinc-900 p-3" />
        <button className="rounded-xl bg-[#ff6b00] p-3 font-bold">Login</button>
      </form>
      {message && <p role="status" className="mt-4 text-sm text-orange-300">{message}</p>}
    </main>
  );

  return (
    <main className="mx-auto max-w-6xl p-5 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm text-orange-400">HUBINBD / ADMIN</p><h1 className="text-3xl font-black">Banner & Ad Manager</h1><p className="text-sm text-zinc-400">{email}</p></div>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="rounded-xl border border-zinc-700 px-4 py-2">Logout</button>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-bold">হোমপেজ ব্যানার (৩টি)</h2>
        <p className="mt-1 text-sm text-zinc-400">হোমপেজের হেডারের নিচে দেখানো তিনটি ব্যানার এখান থেকে পরিবর্তন করুন।</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <section key={item.slot} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-100">
              <h3 className="font-bold">{index + 1}. {item.title}</h3>
              <div className={"relative mt-3 w-full overflow-hidden rounded-xl bg-zinc-800 " + (index === 0 ? "aspect-[3.4/1]" : "aspect-[4.34/1]")}>
                {item.image_url && <Image src={item.image_url} alt={item.title} fill unoptimized className="object-contain" />}
              </div>
              <label className="mt-3 block text-xs text-zinc-400">ছবি (JPG / PNG / WebP, সর্বোচ্চ ৫ MB)
                <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingSlot !== null} onChange={(event) => { void upload(item.slot, event.target.files?.[0]); event.currentTarget.value = ""; }} className="mt-2 w-full text-xs" />
              </label>
              <label className="mt-3 block text-xs text-zinc-400">Link URL
                <input value={item.link_url} onChange={(event) => setItems((current) => current.map((banner) => banner.slot === item.slot ? { ...banner, link_url: event.target.value } : banner))} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-sm" />
              </label>
            </section>
          ))}
        </div>
        <button disabled={saving || uploadingSlot !== null} onClick={() => void saveBanners()} className="mt-4 rounded-xl bg-[#ff6b00] px-6 py-3 font-bold disabled:opacity-50">{saving ? "Saving…" : "Save Banner Changes"}</button>
      </section>

      <section className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-2xl font-black">Adsterra Advertisement Manager</h2>
        <p className="mt-2 text-sm text-zinc-400">Adsterra Publisher Dashboard থেকে পাওয়া সম্পূর্ণ Ad Code পেস্ট করুন। কোডটি পরিবর্তন করা হবে না।</p>
        <form id="adsterra-editor" onSubmit={saveAd} className="mt-5 grid gap-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-100 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">কনটেন্টের ধরন
              <select value={draft.content_type} onChange={(e) => setDraft({ ...draft, content_type: e.target.value as "adsterra" | "image" })} className="rounded-lg border border-zinc-700 bg-zinc-950 p-3"><option value="adsterra">Adsterra Code</option><option value="image">ছবি ব্যানার</option></select>
            </label>
            <label className="grid gap-1 text-sm">বিজ্ঞাপনের নাম
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required className="rounded-lg border border-zinc-700 bg-zinc-950 p-3" />
            </label>
            <label className="grid gap-1 text-sm">কোন পেজে দেখাবেন?
              <select value={draft.page_path} onChange={(e) => { setDraft({ ...draft, page_path: e.target.value }); setCustomPath(""); }} className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
                <option value="*">সব পেজে</option><option value="/">হোমপেজ</option><option value="/tools">Tools</option><option value="/computer-work">Computer Work</option><option value="/clothing">Clothing</option><option value="custom">নিজস্ব Page Path</option>
              </select>
            </label>
            {draft.page_path === "custom" && <label className="grid gap-1 text-sm sm:col-span-2">Page Path (যেমন /product/123)
              <input value={customPath} onChange={(e) => setCustomPath(e.target.value)} placeholder="/your-page" required className="rounded-lg border border-zinc-700 bg-zinc-950 p-3" />
            </label>}
            <label className="grid gap-1 text-sm">বিজ্ঞাপনের অবস্থান
              <select value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value as AdPlacement["position"] })} className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
                <option value="after-header">Header-এর ঠিক নিচে</option><option value="middle">পেজের মাঝখানে</option><option value="before-footer">Footer-এর ঠিক আগে</option>
              </select>
            </label>
            <label className="flex items-center gap-3 self-end rounded-lg border border-zinc-700 p-3 text-sm"><input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} /> সংরক্ষণের পর বিজ্ঞাপন চালু রাখুন</label>
          </div>
          {draft.content_type === "adsterra" ? <label className="grid gap-1 text-sm">Adsterra Ad Code
            <textarea value={draft.ad_code} onChange={(e) => setDraft({ ...draft, ad_code: e.target.value })} required rows={7} spellCheck={false} placeholder={'<script type="text/javascript"> ... </script>'} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs" />
          </label> : <div className="grid gap-3 rounded-xl border border-zinc-700 p-3 sm:col-span-2">
            <label className="grid gap-2 text-sm">ব্যানার ছবি আপলোড (JPG/PNG/WebP, সর্বোচ্চ ৮ MB)
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { void uploadPlacementImage(e.target.files?.[0]); e.currentTarget.value = ""; }} className="text-xs" />
            </label>
            {draft.image_url && <div className="relative h-40 w-full overflow-hidden rounded-lg bg-zinc-800"><Image src={draft.image_url} alt={draft.title} fill unoptimized className="object-contain" /></div>}
            <label className="grid gap-1 text-sm">ক্লিক করলে কোথায় যাবে? (ঐচ্ছিক)
              <input value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} placeholder="https://example.com অথবা /page" className="rounded-lg border border-zinc-700 bg-zinc-950 p-3" />
            </label>
          </div>}
          <div className="grid gap-3 rounded-xl border border-zinc-700 p-3 sm:col-span-2">
            <h3 className="font-semibold">ব্যানার সাইজ (Responsive)</h3>
            <p className="text-xs text-zinc-400">Width শতাংশে, Height ও Max Width পিক্সেলে নির্ধারণ করুন। মোবাইলের জন্য আলাদা মাপ দিন।</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <label className="grid gap-1 text-xs">Desktop width %
                <input type="number" min="10" max="100" value={draft.width_px} onChange={(e) => setDraft({ ...draft, width_px: Number(e.target.value) })} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2" />
              </label>
              <label className="grid gap-1 text-xs">Desktop height px
                <input type="number" min="50" max="2000" value={draft.height_px} onChange={(e) => setDraft({ ...draft, height_px: Number(e.target.value) })} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2" />
              </label>
              <label className="grid gap-1 text-xs">Max width px
                <input type="number" min="100" max="2400" value={draft.max_width_px} onChange={(e) => setDraft({ ...draft, max_width_px: Number(e.target.value) })} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2" />
              </label>
              <label className="grid gap-1 text-xs">Mobile width %
                <input type="number" min="10" max="100" value={draft.mobile_width_px} onChange={(e) => setDraft({ ...draft, mobile_width_px: Number(e.target.value) })} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2" />
              </label>
              <label className="grid gap-1 text-xs">Mobile height px
                <input type="number" min="50" max="2000" value={draft.mobile_height_px} onChange={(e) => setDraft({ ...draft, mobile_height_px: Number(e.target.value) })} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2" />
              </label>
            </div>
            {draft.content_type === "image" && <label className="flex items-center gap-2 text-sm">Image fit
              <select value={draft.object_fit} onChange={(e) => setDraft({ ...draft, object_fit: e.target.value as "contain" | "cover" | "fill" })} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2"><option value="contain">Contain</option><option value="cover">Cover</option><option value="fill">Fill</option></select>
            </label>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button disabled={saving} className="rounded-xl bg-[#ff6b00] px-6 py-3 font-bold disabled:opacity-50">{saving ? "Saving…" : editingId ? "Update Ad" : "Add Ad Placement"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyAd); setCustomPath(""); }} className="rounded-xl border border-zinc-600 px-5 py-3">Cancel Edit</button>}
          </div>
        </form>

        <div className="mt-6 grid gap-3">
          <h3 className="font-bold">সংরক্ষিত বিজ্ঞাপন ({ads.length})</h3>
          {ads.length === 0 && <p className="rounded-xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">এখনো কোনো Adsterra Code যোগ করা হয়নি।</p>}
          {ads.map((ad) => <article key={ad.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-100">
            <div className="min-w-0"><p className="font-semibold">{ad.title}</p><p className="text-xs text-zinc-400">{ad.content_type === "image" ? "ছবি ব্যানার" : "Adsterra"} · {ad.page_path === "*" ? "সব পেজ" : ad.page_path} · {ad.position === "after-header" ? "Header-এর নিচে" : ad.position === "middle" ? "মাঝখানে" : "Footer-এর আগে"}</p><p className="mt-1 text-xs text-zinc-500">{ad.width_px}% × {ad.height_px}px · মোবাইল {ad.mobile_width_px}% × {ad.mobile_height_px}px</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => void toggleAd(ad)} className="rounded-lg border border-zinc-600 px-3 py-2 text-xs">{ad.enabled ? "চালু · বন্ধ করুন" : "বন্ধ · চালু করুন"}</button>
              <button onClick={() => editAd(ad)} className="rounded-lg border border-zinc-600 px-3 py-2 text-xs">Edit</button>
              <button onClick={() => void deleteAd(ad.id)} className="rounded-lg border border-red-900 px-3 py-2 text-xs text-red-300">Delete</button>
            </div>
          </article>)}
        </div>
      </section>
      {message && <p role="status" className="mt-5 rounded-lg bg-zinc-900 p-3 text-sm text-orange-300">{message}</p>}
    </main>
  );
}
