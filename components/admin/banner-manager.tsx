"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { bannerDefaults } from "@/lib/banners";
import { supabase } from "@/lib/supabase/client";
import { convertToWebP } from "@/lib/image-utils";

export default function BannerManager() {
  const [items, setItems] = useState(bannerDefaults);
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (live) setReady(true);
        return;
      }

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!role || !["owner_admin", "sub_admin", "admin"].includes(role.role)) {
        await supabase.auth.signOut();
        if (live) {
          setMessage("এই পেজ ব্যবহারের অনুমতি নেই।");
          setReady(true);
        }
        return;
      }

      const { data } = await supabase
        .from("banners")
        .select("slot,image_url,link_url,title")
        .in("slot", bannerDefaults.map((item) => item.slot))
        .order("slot");

      if (live) {
        setEmail(session.user.email || "");
        if (data) {
          setItems(bannerDefaults.map((item) => data.find((row) => row.slot === item.slot) ?? item));
        }
        setReady(true);
      }
    })();

    return () => {
      live = false;
    };
  }, []);

  async function login(form: FormData) {
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
      setMessage("JPG, PNG বা WebP ছবি দিন (সর্বোচ্চ ৫ MB)।");
      return;
    }

    setUploadingSlot(slot);
    setMessage("");
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width < 200 || bitmap.height < 80) {
        bitmap.close();
        throw new Error("ছবির মাপ কমপক্ষে ২০০ × ৮০ px হতে হবে।");
      }
      bitmap.close();

      const optimized = await convertToWebP(file);
      const extension = optimized.name.split(".").pop()?.toLowerCase() || "webp";
      const path = `home-banners/slot-${slot}-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("banner-images").upload(path, optimized, {
        contentType: optimized.type,
        cacheControl: "3600",
      });
      if (error) throw error;

      const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
      setItems((current) => current.map((item) =>
        item.slot === slot ? { ...item, image_url: data.publicUrl } : item,
      ));
      setMessage("ছবি আপলোড হয়েছে। হোমপেজে প্রকাশ করতে নিচের Save Changes চাপুন।");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ছবি আপলোড করা যায়নি।");
    } finally {
      setUploadingSlot(null);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("banners").upsert(
      items.map(({ slot, image_url, link_url, title }) => ({ slot, image_url, link_url, title })),
      { onConflict: "slot" },
    );
    setSaving(false);
    setMessage(error ? error.message : "হেডারের নিচের ৩টি ব্যানার সংরক্ষণ হয়েছে।");
  }

  if (!ready) return <main className="p-8">লোড হচ্ছে…</main>;

  if (!email) {
    return (
      <main className="mx-auto max-w-md p-6 pt-16">
        <h1 className="text-2xl font-bold">Banner Admin Login</h1>
        <form action={login} className="mt-6 grid gap-3">
          <input name="email" type="email" required placeholder="Admin email" className="rounded-xl border border-zinc-700 bg-zinc-900 p-3" />
          <input name="password" type="password" required placeholder="Password" className="rounded-xl border border-zinc-700 bg-zinc-900 p-3" />
          <button className="rounded-xl bg-[#ff6b00] p-3 font-bold">Login</button>
        </form>
        {message && <p role="status" className="mt-4 text-sm text-orange-300">{message}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-5 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-orange-400">HUBINBD / ADMIN</p>
          <h1 className="text-3xl font-black">Home Banner Manager</h1>
          <p className="text-sm text-zinc-400">{email}</p>
          <p className="mt-2 text-sm text-zinc-400">হোমপেজে হেডারের নিচে যে ৩টি ব্যানার দেখা যায়, এখান থেকে ঠিক সেই ৩টিই পরিবর্তন করুন।</p>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="rounded-xl border border-zinc-700 px-4 py-2">Logout</button>
      </header>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <section key={item.slot} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="font-bold">{index + 1}. {item.title}</h2>
            <p className="text-xs text-zinc-400">{index === 0 ? "Main banner · 58% width" : "Side banner · right column"}</p>
            <div className={"relative mt-3 w-full overflow-hidden rounded-xl bg-zinc-800 " + (index === 0 ? "aspect-[3.4/1]" : "aspect-[4.34/1]")}>
              {item.image_url && <Image src={item.image_url} alt={item.title} fill unoptimized className="object-contain" />}
            </div>
            <label className="mt-3 block text-xs text-zinc-400">
              নতুন ছবি নির্বাচন করুন (JPG / PNG / WebP, সর্বোচ্চ ৫ MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingSlot !== null}
                onChange={(event) => {
                  void upload(item.slot, event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
                className="mt-2 w-full text-xs"
              />
            </label>
            <label className="mt-3 block text-xs text-zinc-400">
              Link URL
              <input
                value={item.link_url}
                onChange={(event) => setItems((current) => current.map((banner) =>
                  banner.slot === item.slot ? { ...banner, link_url: event.target.value } : banner,
                ))}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-sm"
              />
            </label>
          </section>
        ))}
      </div>

      <button disabled={saving || uploadingSlot !== null} onClick={() => void save()} className="mt-6 rounded-xl bg-[#ff6b00] px-7 py-3 font-bold disabled:opacity-50">
        {saving ? "Saving…" : "Save Changes"}
      </button>
      {message && <p role="status" className="mt-3 text-sm text-orange-300">{message}</p>}
    </main>
  );
}
