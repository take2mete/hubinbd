"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import SiteHeader from "@/components/site-header";
import SevenBanners from "@/components/SevenBanners";
import SiteFooter from "@/components/site-footer";

type Seller = { user_id: string; business_name: string; status: string };
type Product = { id: number; name: string; name_bn: string | null; image_urls: string[] | null; price: number | string; old_price: number | string | null; category: string; stock: number | null; sold: number | string | null };

const money = (value: number | string | null) => new Intl.NumberFormat("bn-BD").format(Number(value || 0));

export default function SellerPublicStore() {
  const params = useParams<{ sellerId: string }>();
  const sellerId = params.sellerId;
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const storeUrl = typeof window !== "undefined" ? window.location.href : "";

  async function shareStore() {
    const url = window.location.href;
    const title = (seller?.business_name || "HubinBD Seller Store") + " | HubinBD";
    const shareText = "এই সেলারের অনুমোদিত পণ্যগুলো দেখুন";
    if (navigator.share) {
      try { await navigator.share({ title, text: shareText, url }); return; } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error: storeError } = await supabase.rpc("get_public_seller_store", { p_seller_id: sellerId });
      if (!active) return;
      if (storeError) setError("স্টোরের তথ্য লোড করা যাচ্ছে না।");
      else if (!data?.seller) setError("এই সেলার স্টোরটি পাওয়া যায়নি অথবা বর্তমানে অনুমোদিত নয়।");
      else {
        setSeller(data.seller as Seller);
        setProducts((data.products || []) as Product[]);
      }
      setLoading(false);
    }
    if (sellerId) void load();
    return () => { active = false; };
  }, [sellerId]);

  return <>
    <SiteHeader />
    <main className="min-h-screen bg-[#f4f6fa] text-[#172033]">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-5">
        <SevenBanners compactBottom />
        <div className="pt-0 pb-5 sm:pt-0 sm:pb-8">
      {loading ? <div className="rounded-2xl bg-white p-10 text-center">স্টোর লোড হচ্ছে…</div> : error ? <div role="alert" className="rounded-2xl bg-white p-10 text-center text-rose-700">{error}</div> : <>
        <section className="mt-0"><div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm sm:px-6"><div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1"><p className="shrink-0 text-base font-bold text-cyan-800">HubinBD Seller Store</p><h1 className="truncate text-base font-bold text-[#172033]">{seller?.business_name}</h1></div><button type="button" onClick={()=>void shareStore()} aria-label="সেলার স্টোর শেয়ার করুন" title={copied?"লিংক কপি হয়েছে":"স্টোর শেয়ার করুন"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[#1246a0] shadow-sm transition hover:border-blue-300 hover:bg-blue-50"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/></svg></button></div>
          {products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{products.map(p => <article key={p.id} className="overflow-hidden rounded-xl border bg-white shadow-sm"><Link href={"/product/"+p.id}><div className="relative aspect-square bg-slate-100">{p.image_urls?.[0] ? <Image src={p.image_urls[0]} alt={p.name_bn || p.name} fill unoptimized className="object-contain p-2"/> : <div className="grid h-full place-items-center text-4xl">🛍️</div>}</div><div className="p-3"><h3 className="line-clamp-2 min-h-10 text-sm">{p.name_bn || p.name}</h3><p className="mt-2 font-bold text-orange-600">৳ {money(p.price)}</p>{p.old_price && Number(p.old_price)>Number(p.price) ? <p className="text-xs text-slate-400 line-through">৳ {money(p.old_price)}</p> : null}</div></Link></article>)}</div> : <div className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-500">এই স্টোরে বর্তমানে কোনো প্রকাশিত পণ্য নেই।</div>}
        </section>
      </>}
        </div>
      </div>
    </main>
    <SiteFooter />
  </>;
}
