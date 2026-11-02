"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { bannerDefaults } from "@/lib/banners";
import { supabase } from "@/lib/supabase/client";

const icons = ["📄", "▦", "🎨", "🖼️", "📒", "📊"];
const destinationForSlot = (slot: number) => slot === 1 ? "https://cars.hubinbd.com/" : slot >= 2 && slot <= 6 ? "/tools" : "/computer-work";

export default function SevenBanners() {
  const [items, setItems] = useState(bannerDefaults);
  useEffect(() => {
    let active = true;
    supabase.from("banners").select("slot,image_url,link_url,title").order("slot").then(({ data }) => {
      if (active && data) setItems(bannerDefaults.map((item) => data.find((row) => row.slot === item.slot) ?? item));
    });
    return () => { active = false; };
  }, []);
  const hero = items[0];
  return (
    <section aria-label="HubinBD featured services" className="mx-auto my-7 max-w-7xl rounded-3xl bg-[#111] p-1.5 sm:p-2">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[58fr_42fr]">

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.slice(1).map((item, index) => <Link key={item.slot} href={destinationForSlot(item.slot)} className="group flex h-[86px] min-w-0 items-center gap-2 rounded-[20px] border border-[#333] bg-[#222] px-3 text-white transition hover:border-[#ff6b00] sm:flex-col sm:justify-center">{item.image_url ? <Image src={item.image_url} alt={item.title} width={30} height={30} unoptimized loading="lazy" /> : <span aria-hidden="true" className="text-2xl">{icons[index]}</span>}<span className="truncate text-xs font-semibold">{item.title}</span></Link>)}
        </div>
      </div>
    </section>
  );
}
