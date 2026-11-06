"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string; name: string; name_bn: string | null; image_urls: string[] | null;
  price: number | string; old_price: number | string | null; category: string;
  stock: number | null; sold: string | null; created_at: string;
};

const sections = [
  { key: "mens", title: "ছেলেদের জামা", aliases: ["ছেলেদের জামা", "mens", "men", "পুরুষ"] },
  { key: "womens", title: "মেয়েদের জামা", aliases: ["মেয়েদের জামা", "মেয়েদের জামা", "womens", "women", "ladies"] },
  { key: "kids", title: "বাচ্চাদের জামা", aliases: ["বাচ্চাদের জামা", "শিশুদের জামা", "kids", "children", "child"] },
  { key: "winter", title: "শীতের জামা", aliases: ["শীতের জামা", "winter", "winter wear", "শীতের পোশাক"] },
];

function matchesCategory(category: string, aliases: string[]) {
  const value = category.trim().toLocaleLowerCase();
  return aliases.some((alias) => {
    const normalized = alias.toLocaleLowerCase();
    if (value === normalized) return true;
    if (/^[a-z]+$/.test(normalized)) return new RegExp("(^|[^a-z])" + normalized + "([^a-z]|$)").test(value);
    return value.includes(normalized);
  });
}

function soldCount(value: string | null) {
  const normalized = (value || "0").replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)));
  const parsed = Number.parseInt(normalized.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number | string | null) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? new Intl.NumberFormat("bn-BD").format(amount) : "0";
}

function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center"><span className="text-3xl">🛍️</span><p className="mt-3 text-sm font-semibold text-slate-700">এখনো কোনো পণ্য প্রকাশ করা হয়নি</p><p className="mt-1 text-xs text-slate-500">নতুন পণ্য যোগ হলে এখানে দেখা যাবে।</p></div>;
  return <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">{products.map((product) => {
    const image = product.image_urls && product.image_urls[0];
    const discount = product.old_price && Number(product.old_price) > Number(product.price) ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100) : 0;
    return <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-[#172033] shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-slate-100">{image ? <Image src={image} alt={product.name_bn || product.name} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-4xl">🛍️</div>}{discount > 0 && <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2.5 py-1 text-[10px] font-extrabold text-white">{discount}% ছাড়</span>}</div>
      <div className="p-3 sm:p-3.5"><h3 className="line-clamp-2 min-h-10 text-[13px] font-bold leading-5 text-slate-800 sm:text-sm">{product.name_bn || product.name}</h3><div className="mt-2 flex flex-wrap items-baseline gap-x-2"><p className="text-base font-extrabold text-orange-700">৳{money(product.price)}</p>{product.old_price && Number(product.old_price) > Number(product.price) && <p className="text-[11px] text-slate-400 line-through">৳{money(product.old_price)}</p>}</div><p className="mt-1.5 text-[10px] font-medium text-slate-500">{product.stock && product.stock > 0 ? "✓ স্টকে আছে" : "স্টক যাচাই করুন"}</p></div>
    </article>;
  })}</div>;
}

function ProductSection({ title, subtitle, products, href }: { title: string; subtitle: string; products: Product[]; href?: string }) {
  return <section><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-black text-[#172033] sm:text-2xl">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>{href && <Link href={href} className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-600 transition hover:border-orange-300 hover:text-orange-700">সব দেখুন ↗</Link>}</div><ProductGrid products={products} /></section>;
}

export default function MarketplaceProducts({ mode = "clothing" }: { mode?: "home" | "clothing" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase.from("products").select("id,name,name_bn,image_urls,price,old_price,category,stock,sold,created_at").eq("is_active", true).order("created_at", { ascending: false });
      if (mounted) { if (!error && data) setProducts(data as Product[]); else setLoadError(true); setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  const clothingProducts = useMemo(() => products.filter((product) => sections.some((section) => matchesCategory(product.category, section.aliases))), [products]);
  const topSelling = useMemo(() => [...clothingProducts].sort((a, b) => soldCount(b.sold) - soldCount(a.sold)), [clothingProducts]);
  const grouped = useMemo(() => sections.map((section) => ({ ...section, products: clothingProducts.filter((product) => matchesCategory(product.category, section.aliases)) })), [clothingProducts]);

  if (loading) return <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-200" />)}</div>;
  if (loadError) return <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">পণ্য লোড করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।</p>;

  if (mode === "home") {
    const firstRow = clothingProducts.slice(0, 6);
    const secondRow = topSelling.slice(0, 6);
    const thirdRow = topSelling.length > 6 ? topSelling.slice(6, 12) : topSelling.slice(0, 6);
    return <div className="space-y-10 sm:space-y-12">
      <ProductSection title="নতুন পোশাক" subtitle="Clothing পেজে সদ্য যোগ করা পণ্য" products={firstRow} href="/clothing" />
      <ProductSection title="টপ সেলিং প্রোডাক্ট" subtitle="সবচেয়ে বেশি বিক্রি হওয়া পোশাক" products={secondRow} href="/clothing" />
      <ProductSection title="আরও টপ সেলিং প্রোডাক্ট" subtitle="জনপ্রিয় ও বেশি বিক্রিত পোশাক" products={thirdRow} href="/clothing" />
    </div>;
  }

  return <div className="space-y-10 sm:space-y-12">
    <nav aria-label="পোশাকের ক্যাটাগরি" className="grid grid-cols-2 gap-3 sm:grid-cols-4">{sections.map((section) => <a key={section.key} href={"#" + section.key} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-extrabold text-slate-800 shadow-sm transition hover:border-orange-300 hover:text-orange-700">{section.title}<span className="mt-1 block text-xs font-normal text-slate-500">পণ্য দেখুন ↓</span></a>)}</nav>
    {grouped.map((section) => <section id={section.key} key={section.key}><ProductSection title={section.title} subtitle={section.title + " কালেকশন"} products={section.products} /></section>)}
  </div>;
}
