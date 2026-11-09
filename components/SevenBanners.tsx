"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { bannerDefaults } from "@/lib/banners";
import { supabase } from "@/lib/supabase/client";

const icons = ["📄", "▦", "🎨", "🖼️", "📒", "📊"];
const destinationForSlot = (slot: number) => slot === 1 ? "https://cars.hubinbd.com/" : slot === 4 || slot === 7 ? "/computer-work" : "/tools";

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
    <section aria-label="HubinBD featured services" className="mx-auto my-4 max-w-7xl rounded-2xl bg-[#111] p-1 sm:my-7 sm:rounded-3xl sm:p-2">
      <div className="grid grid-cols-[1.15fr_1fr] gap-1.5 sm:gap-2 lg:grid-cols-[58fr_42fr]">
        <Link href="https://cars.hubinbd.com/" aria-label="রেন্ট এ কার বুকিং" className="group relative block h-[164px] min-w-0 overflow-hidden rounded-xl bg-[#eaf2ff] sm:h-[210px] sm:rounded-2xl">
          <Image src="https://rgplfsmxkarqnlwwaowd.supabase.co/storage/v1/object/public/site-assets/Untitled-2.jpg" alt="HubinBD রেন্ট এ কার ব্যানার" fill priority unoptimized sizes="(max-width: 1024px) 100vw, 58vw" className="object-contain sm:object-cover transition-transform duration-500 sm:group-hover:scale-[1.02]" />
        </Link>

        <div className="grid min-w-0 grid-cols-2 grid-rows-3 gap-1.5 sm:gap-2">
          {items.slice(1).map((item, index) => <Link key={item.slot} href={destinationForSlot(item.slot)} className="group flex h-full min-h-0 min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg border border-[#333] bg-[#222] px-1 py-1 text-center text-white transition hover:border-[#ff6b00] sm:rounded-[20px] sm:gap-2 sm:px-3">{item.image_url ? <Image src={item.image_url} alt={item.title} width={30} height={30} className="h-5 w-5 object-contain sm:h-[30px] sm:w-[30px]" unoptimized loading="lazy" /> : <span aria-hidden="true" className="text-lg leading-5 sm:text-2xl">{icons[index]}</span>}<span className="w-full truncate text-[9px] font-semibold leading-3 sm:text-xs">{item.title}</span></Link>)}
        </div>
      </div>
    </section>
  );
}
