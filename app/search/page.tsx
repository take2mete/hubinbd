"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

type Product = { id: number; name: string; name_bn: string | null; price: number; image_urls: string[] | null; category: string };

function SearchResults() {
 const searchParams = useSearchParams();
 const searchKey = searchParams.toString();
 const [query,setQuery]=useState(""),[category,setCategory]=useState("all"),[mainCategoryId,setMainCategoryId]=useState(""),[subCategoryId,setSubCategoryId]=useState("");
 const [items,setItems]=useState<Product[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");

 useEffect(()=>{
  const params=new URLSearchParams(searchKey);
  setQuery((params.get("q")||"").trim());
  setCategory(params.get("category")||"all");
  setMainCategoryId(params.get("main_category_id")||"");
  setSubCategoryId(params.get("sub_category_id")||"");
 },[searchKey]);

 useEffect(()=>{
  let active=true;
  async function run(){
   setLoading(true);setError("");
   const params=new URLSearchParams({mode:"search",limit:"60"});
   if(query)params.set("q",query);
   if(category!=="all")params.set("category",category);
   if(mainCategoryId)params.set("main_category_id",mainCategoryId);
   if(subCategoryId)params.set("sub_category_id",subCategoryId);
   try{
    const response=await fetch("/api/public/products?"+params.toString());
    if(!response.ok)throw new Error("Search request failed");
    const result=await response.json() as {data:Product[]};
    if(active)setItems(result.data||[]);
   }catch{if(active)setError("সার্চ ফলাফল আনা যায়নি। আবার চেষ্টা করুন।")}
   finally{if(active)setLoading(false)}
  }
  void run();
  return ()=>{active=false};
 },[query,category,mainCategoryId,subCategoryId]);

 return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900"><div className="mx-auto max-w-7xl"><Link href="/" className="text-sm text-slate-500">← হোমে ফিরুন</Link><h1 className="my-5 text-2xl font-black">সার্চ ফলাফল: {query||"সব পণ্য"}</h1>{loading?<p className="rounded-xl bg-white p-6">খোঁজা হচ্ছে…</p>:error?<p role="alert" className="rounded-xl bg-amber-50 p-6 text-amber-800">{error}</p>:items.length?<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{items.map(p=><article key={p.id} className="overflow-hidden rounded-xl border bg-white p-3"><Link href={"/checkout?product="+p.id}>{p.image_urls?.[0]?<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50"><Image src={p.image_urls[0]} alt={p.name_bn||p.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" quality={75} className="object-cover"/></div>:<div className="grid aspect-square place-items-center bg-slate-100 text-3xl">🛍️</div>}<h2 className="mt-2 line-clamp-2 text-sm font-bold">{p.name_bn||p.name}</h2><p className="mt-1 font-black text-orange-700">৳{Number(p.price).toLocaleString("bn-BD")}</p></Link></article>)}</div>:<p className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-600">কোনো পণ্য পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।</p>}</div></main>;
}

export default function SearchPage() {
 return <><SiteHeader/><Suspense fallback={<main className="min-h-screen bg-slate-50 p-8">লোড হচ্ছে…</main>}><SearchResults/></Suspense><SiteFooter/></>;
}
