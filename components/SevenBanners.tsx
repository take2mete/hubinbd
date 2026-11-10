"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { bannerDefaults } from "@/lib/banners";
import { supabase } from "@/lib/supabase/client";

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

        <div className="grid min-w-0 grid-rows-2 gap-1.5 sm:gap-2">
          <Link href="/computer-work" aria-label="HubinBD Services" className="group relative block min-h-0 min-w-0 overflow-hidden rounded-lg bg-[#06245b] sm:rounded-2xl">
            <Image src="https://rgplfsmxkarqnlwwaowd.supabase.co/storage/v1/object/public/site-assets/Service.png" alt="HubinBD Services — Graphics, Data, Excel and Arabic" fill unoptimized sizes="(max-width: 1024px) 42vw, 42vw" className="object-contain transition-transform duration-300 group-hover:scale-[1.02]" />
          </Link>
          <Link href="/tools" aria-label="HubinBD Tools" className="group relative block min-h-0 min-w-0 overflow-hidden rounded-lg bg-[#06245b] sm:rounded-2xl">
            <Image src="https://rgplfsmxkarqnlwwaowd.supabase.co/storage/v1/object/public/site-assets/Tools.png" alt="HubinBD Tools — PDF, QR Code, Link Shortener and BG Remover" fill unoptimized sizes="(max-width: 1024px) 42vw, 42vw" className="object-contain transition-transform duration-300 group-hover:scale-[1.02]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
