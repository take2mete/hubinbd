"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { convertToWebP } from "@/lib/image-utils";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { router.replace("/login?next=/profile"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");
      setName(String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""));
      setAvatar(String(user.user_metadata?.avatar_url ?? ""));
    })();
    return () => { active = false; };
  }, [router]);

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !userId) return;
    setBusy(true);
    setMessage("");
    try {
      const optimized = await convertToWebP(file);
      const extension = optimized.name.split(".").pop()?.toLowerCase() || "webp";
      const path = `profile-avatars/${userId}.${extension}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, optimized, {
        upsert: true,
        contentType: optimized.type,
        cacheControl: "3600",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: url } });
      if (updateError) throw updateError;
      setAvatar(url);
      setMessage("প্রোফাইল ছবি আপডেট হয়েছে।");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ছবি আপলোড করা যায়নি।");
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim(), name: name.trim() } });
    setBusy(false);
    setMessage(error ? "প্রোফাইল আপডেট হয়নি: " + error.message : "প্রোফাইল তথ্য সংরক্ষণ হয়েছে।");
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-slate-50 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-orange-700">← হোমে ফিরুন</Link>
          <h1 className="mt-5 text-2xl font-black">আমার প্রোফাইল</h1>
          <div className="mt-6 flex items-center gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-3xl font-bold text-slate-500">
              {avatar ? <img src={avatar} alt="প্রোফাইল ছবি" className="h-full w-full object-cover" /> : name.slice(0, 1) || "👤"}
            </div>
            <div>
              <p className="font-bold">প্রোফাইল ছবি</p>
              <label className="mt-2 inline-flex cursor-pointer rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
                {busy ? "অপেক্ষা করুন…" : "ছবি আপলোড করুন"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(event) => void uploadAvatar(event)} />
              </label>
            </div>
          </div>
          <form onSubmit={saveProfile} className="mt-7 grid gap-4">
            <label className="text-sm font-semibold">নাম<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" required /></label>
            <label className="text-sm font-semibold">ইমেইল<input value={email} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-500" /></label>
            <button disabled={busy} className="rounded-xl bg-[#1246a0] px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "সংরক্ষণ হচ্ছে…" : "তথ্য সংরক্ষণ করুন"}</button>
          </form>
          {message && <p role="status" className="mt-4 text-sm text-blue-700">{message}</p>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
