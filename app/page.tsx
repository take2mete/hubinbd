import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SevenBanners from "@/components/SevenBanners";
import SiteFooter from "@/components/site-footer";
import MarketplaceProducts from "@/components/marketplace-products";

export default function HomePage() {
  return <>
    <SiteHeader />
    <main className="min-h-screen bg-[#f4f6fa] text-[#172033]">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-5">
        <SevenBanners />
        <section className="pb-12 pt-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-[11px] font-bold tracking-[.18em] text-orange-600">HUBINBD MARKETPLACE</p><h1 className="mt-1 text-2xl font-black text-[#172033] sm:text-3xl">জনপ্রিয় পণ্য ও নতুন কালেকশন</h1></div>
            <Link href="/clothing" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-300 hover:text-orange-600">সব পোশাক দেখুন ↗</Link>
          </div>
          <MarketplaceProducts mode="home" />
        </section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
