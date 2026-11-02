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
          <MarketplaceProducts onlyCategory={onlyCategory} />
          {!onlyCategory && <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/tools" className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"><span className="text-3xl">🧰</span><h2 className="mt-3 text-xl font-extrabold">টুলস</h2><p className="mt-1 text-sm text-zinc-600">PDF Tools, QR Maker, Image Tools ও Hisab Khata</p><span className="mt-4 inline-block text-sm font-bold text-orange-600">সব টুলস দেখুন ↗</span></Link>
            <Link href="/computer-work" className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"><span className="text-3xl">💻</span><h2 className="mt-3 text-xl font-extrabold">কম্পিউটার ওয়ার্ক</h2><p className="mt-1 text-sm text-zinc-600">Logo Design, Graphics, Data Maker ও Document Work</p><span className="mt-4 inline-block text-sm font-bold text-orange-600">সার্ভিস দেখুন ↗</span></Link>
          </section>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
