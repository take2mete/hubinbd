"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { convertToWebP } from "@/lib/image-utils";

type Service = { title: string; bn: string; icon: string; tag: string; desc: string; color: string; slug: string };

export default function ComputerWorkServiceGrid({ services }: { services: Service[] }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) return;
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
      if (active && role && ["owner_admin", "sub_admin", "admin"].includes(role.role)) setIsAdmin(true);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: files, error } = await supabase.storage.from("site-assets").list("computer-work");
      if (!active || error || !files) return;
      const next: Record<string, string> = {};
      for (const service of services) {
        const matching = files.find((file) => file.name === service.slug + ".webp")
          || files.find((file) => file.name === service.slug + ".png");
        if (!matching) continue;
        const { data } = supabase.storage.from("site-assets").getPublicUrl("computer-work/" + matching.name);
        next[service.slug] = data.publicUrl;
      }
      if (active) setImages(next);
    })();
    return () => { active = false; };
  }, [services]);

  async function uploadImage(service: Service, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(service.slug);
    setMessage("");
    try {
      const optimized = await convertToWebP(file);
      const extension = optimized.name.split(".").pop()?.toLowerCase() || "webp";
      const path = `computer-work/${service.slug}.${extension}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, optimized, {
        upsert: true,
        contentType: optimized.type,
        cacheControl: "3600",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setImages((current) => ({ ...current, [service.slug]: `${data.publicUrl}?v=${Date.now()}` }));
      setMessage(`${service.bn} ছবিটি আপলোড হয়েছে।`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ছবি আপলোড করা যায়নি।");
    } finally {
      setUploading(null);
    }
  }

  return (
    <>
      {message && <p role="status" className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}
      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <article key={service.slug} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className={`relative grid h-40 place-items-center bg-gradient-to-br ${service.color}`}>
              {images[service.slug] ? (
                <img src={images[service.slug]} alt={service.bn} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              ) : (
                <span className="text-6xl transition duration-300 group-hover:scale-110">{service.icon}</span>
              )}
              <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-700">{service.tag}</span>
              {isAdmin && (
                <label className="absolute right-3 top-3 cursor-pointer rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow">
                  {uploading === service.slug ? "আপলোড হচ্ছে…" : "ছবি পরিবর্তন"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading !== null} onChange={(event) => void uploadImage(service, event)} />
                </label>
              )}
            </div>
            <div className="p-5">
              <p className="text-[10px] font-extrabold tracking-[.16em] text-orange-700">{service.title}</p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-900">{service.bn}</h2>
              <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-600">{service.desc}</p>
              <a href="#order" className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700">এই সার্ভিসটি অর্ডার করুন ↗</a>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
