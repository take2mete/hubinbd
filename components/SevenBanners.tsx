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
    void (async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("slot,image_url,link_url,title")
        .in("slot", bannerDefaults.map((item) => item.slot))
        .order("slot");

      if (active && !error && data) {
        setItems(
          bannerDefaults.map(
            (item) => data.find((row) => row.slot === item.slot) ?? item,
          ),
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const [hero, services, tools] = items;

  return (
    <section
      aria-label="HubinBD featured banners"
      className="mx-auto my-4 max-w-7xl rounded-2xl bg-[#111] p-1 sm:my-7 sm:rounded-3xl sm:p-2"
    >
      <div className="grid grid-cols-[1.15fr_1fr] items-center gap-1.5 sm:items-stretch sm:gap-2 lg:grid-cols-[58fr_42fr]">
        {[hero, services, tools].map((item, index) => {
          const isHero = index === 0;
          const image = (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              priority={isHero}
              unoptimized
              sizes={isHero ? "(max-width: 1024px) 54vw, 58vw" : "(max-width: 1024px) 42vw, 42vw"}
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          );

          if (isHero) {
            return (
              <Link
                key={item.slot}
                href={item.link_url || "/"}
                aria-label={item.title}
                className="group relative row-span-2 block aspect-[3.4/1] min-w-0 overflow-hidden rounded-xl bg-[#eaf2ff] sm:aspect-auto sm:h-[210px] sm:rounded-2xl"
              >
                {image}
              </Link>
            );
          }

          return (
            <Link
              key={item.slot}
              href={item.link_url || "/"}
              aria-label={item.title}
              className={`group relative block min-h-0 min-w-0 overflow-hidden rounded-lg bg-[#06245b] sm:rounded-2xl ${index === 1 ? "aspect-[4.34/1]" : "aspect-[4.34/1]"}`}
            >
              {image}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
