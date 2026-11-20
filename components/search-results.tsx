"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { SearchProduct } from "@/lib/search-products";
import { findSiteSearchItems } from "@/lib/site-search";

const PAGE_SIZE = 24;

function SearchResults({ initialProducts }: { initialProducts: SearchProduct[] }) {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const query = new URLSearchParams(searchKey).get("q")?.trim() || "";
  const siteItems = useMemo(() => findSiteSearchItems(query), [query]);
  const [items, setItems] = useState<SearchProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length === PAGE_SIZE);
  const [error, setError] = useState("");
  const firstRender = useRef(true);
  const requestVersion = useRef(0);
  const loadingMoreRef = useRef(false);
  const loadMoreController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const version = ++requestVersion.current;
    loadMoreController.current?.abort();
    loadMoreController.current = null;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    const controller = new AbortController();
    let active = true;
    async function run() {
      setLoading(true); setError(""); setItems([]); setHasMore(false);
      const filters = new URLSearchParams(searchKey);
      const params = new URLSearchParams({ mode: "search", limit: String(PAGE_SIZE), offset: "0" });
      const q = filters.get("q");
      if (q) params.set("q", q);
      try {
        const response = await fetch("/api/public/products?" + params.toString(), { signal: controller.signal });
        if (!response.ok) throw new Error("Search request failed");
        const result = (await response.json()) as { data: SearchProduct[] };
        if (active && requestVersion.current === version) { const data = result.data || []; setItems(data); setHasMore(data.length === PAGE_SIZE); }
      } catch {
        if (active && !controller.signal.aborted && requestVersion.current === version) setError("সার্চ ফলাফল আনা যায়নি। আবার চেষ্টা করুন।");
      } finally { if (active && requestVersion.current === version) setLoading(false); }
    }
    void run();
    return () => { active = false; controller.abort(); loadMoreController.current?.abort(); };
  }, [searchKey]);

  async function loadMore() {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true; setLoadingMore(true); setError("");
    const version = requestVersion.current;
    const controller = new AbortController();
    loadMoreController.current?.abort(); loadMoreController.current = controller;
    const params = new URLSearchParams({ mode: "search", limit: String(PAGE_SIZE), offset: String(items.length) });
    if (query) params.set("q", query);
    try {
      const response = await fetch("/api/public/products?" + params.toString(), { signal: controller.signal });
      if (!response.ok) throw new Error("Search request failed");
      const result = (await response.json()) as { data: SearchProduct[] };
      if (requestVersion.current !== version || controller.signal.aborted) return;
      const data = result.data || [];
      setItems((current) => { const known = new Set(current.map((product) => product.id)); return [...current, ...data.filter((product) => { if (known.has(product.id)) return false; known.add(product.id); return true; })]; });
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      if (!controller.signal.aborted && requestVersion.current === version) setError("আরও পণ্য আনা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      if (requestVersion.current === version) { loadingMoreRef.current = false; setLoadingMore(false); if (loadMoreController.current === controller) loadMoreController.current = null; }
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-sm text-slate-600">← হোমে ফিরুন</Link>
        <h1 className="my-5 text-2xl font-black">সার্চ ফলাফল: {query || "সব পণ্য ও সার্ভিস"}</h1>
        {siteItems.length > 0 && <>
          <h2 className="mb-3 text-lg font-extrabold">টুলস, সার্ভিস ও ওয়েবসাইট</h2>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {siteItems.map((item) => <a key={item.href + item.title} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-md">
              <p className="text-[10px] font-bold uppercase tracking-wide text-orange-700">{item.type === "tool" ? "টুল" : item.type === "service" ? "সার্ভিস" : "পেজ"}</p>
              <h3 className="mt-1 font-extrabold">{item.titleBn}</h3>
              <p className="mt-1 text-xs text-slate-600">{item.title} · {item.description}</p>
            </a>)}
          </div>
        </>}
        {loading ? <p className="rounded-xl bg-white p-6" role="status">খোঁজা হচ্ছে…</p> :
          error && items.length === 0 && siteItems.length === 0 ? <p role="alert" className="rounded-xl bg-amber-50 p-6 text-amber-900">{error}</p> :
          items.length ? <>
            <h2 className="mb-3 text-lg font-extrabold">পণ্য</h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
              {items.map((product, index) => <article key={product.id} className="min-w-0 overflow-hidden rounded-xl border bg-white p-2 sm:p-3">
                <Link href={"/product/" + product.id} aria-label={(product.name_bn || product.name) + " কিনুন"}>
                  {product.image_urls?.[0] ? <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50"><Image src={product.image_urls[0]} alt={product.name_bn || product.name} fill sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 16vw" quality={75} priority={index < 2} loading={index < 2 ? "eager" : "lazy"} fetchPriority={index < 2 ? "high" : undefined} className="object-cover" /></div> : <div className="grid aspect-square place-items-center bg-slate-100 text-3xl" aria-hidden="true">🛍️</div>}
                  <h3 className="mt-2 line-clamp-2 text-xs font-bold sm:text-sm">{product.name_bn || product.name}</h3>
                  <p className="mt-1 text-sm font-black text-orange-800 sm:text-base">৳{Number(product.price).toLocaleString("bn-BD")}</p>
                </Link>
              </article>)}
            </div>
            {hasMore && <div className="flex justify-center py-8"><button type="button" onClick={() => void loadMore()} disabled={loadingMore} className="rounded-lg border border-orange-700 bg-white px-6 py-3 text-sm font-bold text-orange-800 hover:bg-orange-50 disabled:opacity-60">{loadingMore ? "লোড হচ্ছে…" : "আরও পণ্য দেখুন"}</button></div>}
          </> : null}
        {error && (items.length > 0 || siteItems.length > 0) && <p role="alert" className="mt-4 text-center text-sm text-amber-900">{error}</p>}
        {!loading && items.length === 0 && siteItems.length === 0 && !error && <p className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-700">কোনো ফলাফল পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।</p>}
      </div>
    </main>
  );
}

export default function SearchResultsClient(props: { initialProducts: SearchProduct[] }) {
  return <Suspense fallback={<main className="min-h-screen bg-slate-50 p-8" role="status">লোড হচ্ছে…</main>}><SearchResults {...props} /></Suspense>;
}
