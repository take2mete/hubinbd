"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { supabase } from "@/lib/supabase/client";
type Product = { id: number; name: string; name_bn: string | null; price: number; image_urls: string[] | null; category: string };
export default function SearchPage() {
 const params=useSearchParams(), query=(params.get("q")||"").trim(), category=params.get("category")||"all";
 const [items,setItems]=useState<Product[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;async function run(){setLoading(true);setError("");let request=supabase.from("products").select("id,name,name_bn,price,image_urls,category").eq("is_active",true).eq("status","Approved").order("created_at",{ascending:false}).limit(60);if(query)request=request.or("name.ilike.%"+query+"%,name_bn.ilike.%"+query+"%");if(category==="clothing")request=request.ilike("category","%জামা%");const {data,error:e}=await request;if(active){if(e)setError("সার্চ ফলাফল আনা যায়নি। আবার চেষ্টা করুন।");else setItems((data||[]) as Product[]);setLoading(false);}}void run();return()=>{active=false}},[query,category]);
 return <><SiteHeader/><main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900"><div className="mx-auto max-w-7xl"><Link href="/" className="text-sm text-slate-500">← হোমে ফিরুন</Link><h1 className="my-5 text-2xl font-black">সার্চ ফলাফল: {query||"সব পণ্য"}</h1>{loading?<p className="rounded-xl bg-white p-6">খোঁজা হচ্ছে…</p>:error?<p role="alert" className="rounded-xl bg-amber-50 p-6 text-amber-800">{error}</p>:items.length?<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{items.map(p=><article key={p.id} className="overflow-hidden rounded-xl border bg-white p-3"><Link href={"/checkout?product="+p.id}>{p.image_urls?.[0]?<img src={p.image_urls[0]} alt={p.name_bn||p.name} className="aspect-square w-full rounded-lg object-cover"/>:<div className="grid aspect-square place-items-center bg-slate-100 text-3xl">🛍️</div>}<h2 className="mt-2 line-clamp-2 text-sm font-bold">{p.name_bn||p.name}</h2><p className="mt-1 font-black text-orange-700">৳{Number(p.price).toLocaleString("bn-BD")}</p></Link></article>)}</div>:<p className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-600">কোনো পণ্য পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।</p>}</div></main><SiteFooter/></>;
}