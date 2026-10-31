"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { bannerDefaults } from "@/lib/banners";
import { supabase } from "@/lib/supabase/client";
const icons = ["PDF", "QR", "G", "IMG", "৳", "DATA"];
export default function SevenBanners() {
 const [items, setItems] = useState(bannerDefaults);
 useEffect(() => { let live = true; supabase.from("banners").select("slot,image_url,link_url,title").order("slot").then(({data}) => { if (live && data) setItems(bannerDefaults.map((b) => data.find((x) => x.slot === b.slot) || b)); }); return () => { live = false; }; }, []);
 const hero = items[0];
 return <section aria-label="HubinBD featured services" className="mx-auto my-7 max-w-7xl rounded-3xl bg-[#111] p-1.5 sm:p-2"><div className="grid grid-cols-1 gap-2 lg:grid-cols-[58fr_42fr]">
 <Link href={hero.link_url} aria-label={hero.title} className="group relative block h-[178px] overflow-hidden rounded-2xl bg-[#0e2247]">
 {hero.image_url && <Image src={hero.image_url} alt="HubinBD অনলাইন রেন্ট এ কার" fill priority unoptimized className="object-cover"/>}
 <div className="absolute inset-0 bg-gradient-to-r from-[#07152e]/90 via-[#0e2247]/55 to-transparent"/>
 <div className="absolute inset-0 flex flex-col items-start justify-center p-5"><span className="text-xs font-semibold text-orange-300">HUBINBD · RENT A CAR</span><h2 className="mt-2 text-2xl font-bold text-white">অনলাইন রেন্ট এ কার</h2><span className="mt-3 rounded-full bg-[#ff6b00] px-5 py-2 text-sm font-bold text-white">Book Now ↗</span></div></Link>
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{items.slice(1).map((item, i) => <Link key={item.slot} href={item.link_url} className="group flex h-[86px] min-w-0 items-center gap-2 rounded-[20px] border border-[#333] bg-[#222] px-3 text-white hover:border-[#ff6b00] sm:flex-col sm:justify-center"><span className="text-2xl">{icons[i]}</span><span className="truncate text-xs font-semibold">{item.title}</span>{item.image_url && <Image src={item.image_url} alt={item.title} width={30} height={30} unoptimized/>}</Link>)}</div>
 </div></section>;
}
