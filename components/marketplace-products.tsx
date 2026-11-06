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
  { key: "mens", title: "ছেলেদের জামা", aliases: ["ছেলেদের জামা", "mens", "men", "পুরুষ"] },
  { key: "womens", title: "মেয়েদের জামা", aliases: ["মেয়েদের জামা", "মেয়েদের জামা", "womens", "women", "ladies"] },
  { key: "kids", title: "বাচ্চাদের জামা", aliases: ["বাচ্চাদের জামা", "শিশুদের জামা", "kids", "children", "child"] },
  { key: "winter", title: "শীতের জামা", aliases: ["শীতের জামা", "winter", "winter wear", "শীতের পোশাক"] },
  { key: "other", title: "অন্যান্য পণ্য", aliases: ["অন্যান্য", "onno", "other", "others"] },
];

function matchesCategory(category: string, aliases: string[]) {
  const value = category.trim().toLocaleLowerCase();
  return aliases.some((alias) => {
    const normalized = alias.toLocaleLowerCase();
    if (value === normalized) return true;
    if (/^[a-z]+$/.test(normalized)) return new RegExp(`(^|[^a-z])${normalized}([^a-z]|$)`).test(value);
    return value.includes(normalized);
  });
}

function money(value: number | string | null) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? new Intl.NumberFormat("bn-BD").format(amount) : "0";
}

function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center"><span className="text-3xl">🛍️</span><p className="mt-3 text-sm font-semibold text-slate-700">এই ক্যাটাগরিতে এখনো পণ্য প্রকাশ করা হয়নি</p><p className="mt-1 text-xs text-slate-500">নতুন পণ্য যোগ হলে এখানে দেখা যাবে।</p></div>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
      {products.map((product) => {
        const image = product.image_urls?.[0];
        const discount = product.old_price && Number(product.old_price) > Number(product.price)
          ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100) : 0;
        return (
          <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-[#172033] shadow-[0_3px_14px_rgba(15,23,42,.04)] transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_12px_30px_rgba(15,23,42,.10)]">
            <div className="relative aspect-square overflow-hidden bg-slate-100">
              {image ? <Image src={image} alt={product.name_bn || product.name} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-4xl">🛍️</div>}
              {discount > 0 && <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2.5 py-1 text-[10px] font-extrabold text-white">{discount}% ছাড়</span>}
            </div>
            <div className="p-3 sm:p-3.5">
              <h3 className="line-clamp-2 min-h-10 text-[13px] font-bold leading-5 text-slate-800 sm:text-sm">{product.name_bn || product.name}</h3>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                <p className="text-base font-extrabold text-orange-700">৳{money(product.price)}</p>
                {product.old_price && Number(product.old_price) > Number(product.price) && <p className="text-[11px] text-slate-400 line-through">৳{money(product.old_price)}</p>}
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-slate-500">{product.stock && product.stock > 0 ? "✓ স্টকে আছে" : "স্টক যাচাই করুন"}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function MarketplaceProducts({ onlyCategory }: { onlyCategory?: "womens" | "mens" | "kids" | "winter" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase.from("products").select("id,name,name_bn,description,image_urls,price,old_price,category,stock").eq("is_active", true).order("created_at", { ascending: false });
      if (mounted) {
        if (!error && data) setProducts(data as Product[]);
        else setLoadError(true);
        setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  const visibleSections = onlyCategory ? sections.filter((section) => section.key === onlyCategory) : sections;
  const grouped = useMemo(() => visibleSections.map((section) => ({
    ...section,
    products: products.filter((product) => matchesCategory(product.category, section.aliases)),
  })), [products, visibleSections]);

  if (loadError && !loading) return <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">পণ্য লোড করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।</p>;

  return (
    <div className="space-y-10 sm:space-y-12">
      {grouped.map((section) => (
        <section key={section.key} aria-labelledby={section.key + "-products"}>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><h2 id={section.key + "-products"} className="text-xl font-black text-[#172033] sm:text-2xl">{section.title}</h2><p className="mt-1 text-xs text-slate-500">নতুন কালেকশন ও পছন্দের পণ্য</p></div>
            {!onlyCategory && <Link href={section.key === "winter" ? "/clothing" : `/?category=${section.key}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-600 transition hover:border-orange-300 hover:text-orange-700">সব দেখুন ↗</Link>}
          </div>
          {loading ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-200" />)}</div> : <ProductGrid products={section.products} />}
        </section>
      ))}
    </div>
  );
}
