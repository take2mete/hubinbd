import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SevenBanners from "@/components/SevenBanners";
import SiteFooter from "@/components/site-footer";
import MarketplaceProducts from "@/components/marketplace-products";

type HomePageProps = { searchParams: Promise<{ category?: string }> };

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const category = params.category;
  const onlyCategory = category === "mens" || category === "womens" ? category : undefined;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f5f6f8] text-[#172033]">
        <SevenBanners />
        <div className="mx-auto max-w-[1280px] px-3 pb-12 sm:px-5">
          {onlyCategory && <div className="mb-6 flex items-center justify-between gap-3"><h1 className="text-2xl font-black text-[#172033]">{onlyCategory === "mens" ? "ছেলেদের জামা" : "মেয়েদের জামা"}</h1><Link href="/" className="text-sm font-semibold text-orange-600 hover:underline">সব ক্যাটাগরি দেখুন</Link></div>}
          {onlyCategory && <MarketplaceProducts onlyCategory={onlyCategory} />}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
