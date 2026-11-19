import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SearchResultsClient from "@/components/search-results";
import { getSearchProducts } from "@/lib/search-products";

type SearchParams = Promise<{ q?: string; category?: string; main_category_id?: string; sub_category_id?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const canonicalParams = new URLSearchParams();
  for (const key of ["q", "category", "main_category_id", "sub_category_id"] as const) {
    const value = params[key];
    if (value) canonicalParams.set(key, value);
  }
  const query = canonicalParams.toString();
  return {
    title: "সার্চ ফলাফল",
    description: "HubinBD-তে পণ্য খুঁজুন।",
    alternates: { canonical: query ? "/search?" + query : "/search" },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = (params.q || "").trim().slice(0, 80);
  const mainCategoryId = Math.max(0, Number(params.main_category_id || 0));
  const subCategoryId = Math.max(0, Number(params.sub_category_id || 0));
  const safeMainId = Number.isSafeInteger(mainCategoryId) ? mainCategoryId : 0;
  const safeSubId = Number.isSafeInteger(subCategoryId) ? subCategoryId : 0;
  let initialProducts = [];
  try {
    initialProducts = await getSearchProducts(query, safeMainId, safeSubId);
  } catch {
    initialProducts = [];
  }
  const initialSearchKey = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  ).toString();

  return <>
    <SiteHeader />
    <SearchResultsClient initialProducts={initialProducts} initialSearchKey={initialSearchKey} />
    <SiteFooter />
  </>;
}
