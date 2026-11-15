"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

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

  useEffect(() => {
    let active = true;
    async function load() {
      const [sellerResult, productResult] = await Promise.all([
        supabase.from("vendors").select("user_id,business_name,status").eq("user_id", sellerId).eq("status", "approved").maybeSingle(),
        supabase.from("products").select("id,name,name_bn,image_urls,price,old_price,category,stock,sold").eq("vendor_id", sellerId).eq("is_active", true).eq("status", "Approved").order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (sellerResult.error || productResult.error) setError("স্টোরের তথ্য লোড করা যাচ্ছে না।");
      else if (!sellerResult.data) setError("এই সেলার স্টোরটি পাওয়া যায়নি অথবা বর্তমানে অনুমোদিত নয়।");
      else { setSeller(sellerResult.data as Seller); setProducts((productResult.data || []) as Product[]); }
      setLoading(false);
    }
    if (sellerId) void load();
    return () => { active = false; };
  }, [sellerId]);

  return <main className="min-h-screen bg-slate-50 text-slate-800">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"><Link href="/" className="text-xl font-black text-cyan-800">HubinBD</Link><Link href="/" className="text-sm font-semibold text-orange-600">সব পণ্য দেখুন</Link></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      {loading ? <div className="rounded-2xl bg-white p-10 text-center">স্টোর লোড হচ্ছে…</div> : error ? <div role="alert" className="rounded-2xl bg-white p-10 text-center text-rose-700">{error}</div> : <>
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-800 p-7 text-white sm:p-10"><p className="text-sm text-cyan-100">HubinBD Seller Store</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{seller?.business_name}</h1><p className="mt-2 text-sm text-white/80">এই স্টোরের সব প্রকাশিত পণ্য এক জায়গায়</p><p className="mt-4 text-sm font-semibold">{new Intl.NumberFormat("bn-BD").format(products.length)}টি পণ্য</p></section>
        <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-extrabold">আমাদের পণ্য</h2><p className="mt-1 text-sm text-slate-500">শুধু এই সেলারের অনুমোদিত ও প্রকাশিত পণ্য</p></div></div>
          {products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{products.map(p => <article key={p.id} className="overflow-hidden rounded-xl border bg-white shadow-sm"><Link href={"/product/"+p.id}><div className="relative aspect-square bg-slate-100">{p.image_urls?.[0] ? <Image src={p.image_urls[0]} alt={p.name_bn || p.name} fill unoptimized className="object-contain p-2"/> : <div className="grid h-full place-items-center text-4xl">🛍️</div>}</div><div className="p-3"><h3 className="line-clamp-2 min-h-10 text-sm">{p.name_bn || p.name}</h3><p className="mt-2 font-bold text-orange-600">৳ {money(p.price)}</p>{p.old_price && Number(p.old_price)>Number(p.price) ? <p className="text-xs text-slate-400 line-through">৳ {money(p.old_price)}</p> : null}</div></Link></article>)}</div> : <div className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-500">এই স্টোরে বর্তমানে কোনো প্রকাশিত পণ্য নেই।</div>}
        </section>
      </>}
    </div>
    <footer className="mt-12 border-t bg-white py-6 text-center text-xs text-slate-500">Powered by HubinBD</footer>
  </main>;
}
