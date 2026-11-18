"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

type Product = {
  id: number;
  name: string;
  name_bn: string | null;
  price: number;
  image_urls: string[] | null;
  category: string;
};

const PAGE_SIZE = 24;

function SearchResults() {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError("");
      setItems([]);
      setHasMore(false);

      const filters = new URLSearchParams(searchKey);
      const params = new URLSearchParams({ mode: "search", limit: String(PAGE_SIZE), offset: "0" });
      for (const key of ["q", "category", "main_category_id", "sub_category_id"]) {
        const value = filters.get(key);
        if (value) params.set(key, value);
      }

      try {
        const response = await fetch("/api/public/products?" + params.toString());
        if (!response.ok) throw new Error("Search request failed");
        const result = (await response.json()) as { data: Product[] };
        if (active) {
          const data = result.data || [];
          setItems(data);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch {
        if (active) setError("সার্চ ফলাফল আনা যায়নি। আবার চেষ্টা করুন।");
      } finally {
        if (active) setLoading(false);
      }
    }

    void run();
    return () => {
      active = false;
    };
  }, [searchKey]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");

    const filters = new URLSearchParams(searchKey);
    const params = new URLSearchParams({
      mode: "search",
      limit: String(PAGE_SIZE),
      offset: String(items.length),
    });
    for (const key of ["q", "category", "main_category_id", "sub_category_id"]) {
      const value = filters.get(key);
      if (value) params.set(key, value);
    }

    try {
      const response = await fetch("/api/public/products?" + params.toString());
      if (!response.ok) throw new Error("Search request failed");
      const result = (await response.json()) as { data: Product[] };
      const data = result.data || [];
      setItems((current) => {
        const known = new Set(current.map((product) => product.id));
        return [...current, ...data.filter((product) => !known.has(product.id))];
      });
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      setError("আরও পণ্য আনা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoadingMore(false);
    }
  }

  const query = new URLSearchParams(searchKey).get("q")?.trim() || "";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-sm text-slate-600">← হোমে ফিরুন</Link>
        <h1 className="my-5 text-2xl font-black">সার্চ ফলাফল: {query || "সব পণ্য"}</h1>
        {loading ? (
          <p className="rounded-xl bg-white p-6" role="status">খোঁজা হচ্ছে…</p>
        ) : error && items.length === 0 ? (
          <p role="alert" className="rounded-xl bg-amber-50 p-6 text-amber-900">{error}</p>
        ) : items.length ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {items.map((product, index) => (
                <article key={product.id} className="overflow-hidden rounded-xl border bg-white p-3">
                  <Link href={"/checkout?product=" + product.id} aria-label={(product.name_bn || product.name) + " কিনুন"}>
                    {product.image_urls?.[0] ? (
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50">
                        <Image
                          src={product.image_urls[0]}
                          alt={product.name_bn || product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          quality={75}
                          priority={index === 0}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="grid aspect-square place-items-center bg-slate-100 text-3xl" aria-hidden="true">🛍️</div>
                    )}
                    <h2 className="mt-2 line-clamp-2 text-sm font-bold">{product.name_bn || product.name}</h2>
                    <p className="mt-1 font-black text-orange-800">৳{Number(product.price).toLocaleString("bn-BD")}</p>
                  </Link>
                </article>
              ))}
            </div>
            {error && <p role="alert" className="mt-4 text-center text-sm text-amber-900">{error}</p>}
            {hasMore && (
              <div className="flex justify-center py-8">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="rounded-lg border border-orange-700 bg-white px-6 py-3 text-sm font-bold text-orange-800 hover:bg-orange-50 disabled:opacity-60"
                >
                  {loadingMore ? "লোড হচ্ছে…" : "আরও পণ্য দেখুন"}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-700">কোনো পণ্য পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।</p>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className="min-h-screen bg-slate-50 p-8" role="status">লোড হচ্ছে…</main>}>
        <SearchResults />
      </Suspense>
      <SiteFooter />
    </>
  );
}
