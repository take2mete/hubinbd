"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  name_bn: string | null;
  description: string | null;
  image_urls: string[] | null;
  price: number | string;
  old_price: number | string | null;
  category: string;
  stock: number | null;
};

const sections = [
  { key: "kids", title: "বাচ্চাদের জামা", aliases: ["বাচ্চাদের জামা", "kids", "children", "শিশু"] },
  { key: "womens", title: "মেয়েদের জামা", aliases: ["মেয়েদের জামা", "মেয়েদের জামা", "womens", "women", "ladies"] },
  { key: "mens", title: "ছেলেদের জামা", aliases: ["ছেলেদের জামা", "mens", "men", "পুরুষ"] },
];

function money(value: number | string | null) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? new Intl.NumberFormat("bn-BD").format(amount) : "0";
}

function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-7 text-center text-sm text-zinc-500">এই ক্যাটাগরিতে এখনো কোনো পণ্য প্রকাশ করা হয়নি। নতুন পণ্য যোগ হলে এখানে দেখা যাবে।</div>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
      {products.map((product) => {
        const image = product.image_urls?.[0];
        return (
          <article key={product.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white text-[#172033] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative aspect-square bg-zinc-100">
              {image ? <Image src={image} alt={product.name_bn || product.name} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw" className="object-cover" /> : <div className="grid h-full place-items-center text-4xl">🛍️</div>}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-2 min-h-10 text-sm font-semibold">{product.name_bn || product.name}</h3>
              <p className="mt-2 font-bold text-[#e65f00]">৳{money(product.price)}</p>
              {product.old_price && Number(product.old_price) > Number(product.price) ? <p className="text-xs text-zinc-400 line-through">৳{money(product.old_price)}</p> : null}
              <p className="mt-1 text-[11px] text-zinc-500">{product.stock && product.stock > 0 ? "স্টকে আছে" : "স্টক যাচাই করুন"}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function MarketplaceProducts({ onlyCategory }: { onlyCategory?: "kids" | "womens" | "mens" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,name_bn,description,image_urls,price,old_price,category,stock")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (mounted) {
        if (!error && data) setProducts(data as Product[]);
        setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  const visibleSections = onlyCategory ? sections.filter((section) => section.key === onlyCategory) : sections;
  const grouped = useMemo(() => {
    return visibleSections.map((section) => ({
      ...section,
      products: products.filter((product) => section.aliases.some((alias) => product.category?.toLocaleLowerCase().includes(alias.toLocaleLowerCase()))),
    }));
  }, [products, visibleSections]);

  return (
    <div className="space-y-10">
      {grouped.map((section) => (
        <section key={section.key} aria-labelledby={section.key + "-products"}>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 id={section.key + "-products"} className="text-xl font-extrabold text-[#172033] sm:text-2xl">{section.title}</h2>
              <p className="mt-1 text-xs text-zinc-500">নতুন কালেকশন ও পছন্দের পণ্য</p>
            </div>
            {!onlyCategory && <Link href="/clothing" className="shrink-0 text-xs font-bold text-[#e65f00] hover:underline">সব পণ্য দেখুন ↗</Link>}
          </div>
          {loading ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-zinc-200" />)}</div> : <ProductGrid products={grouped.find((item) => item.key === section.key)?.products ?? []} />}
        </section>
      ))}
    </div>
  );
}
