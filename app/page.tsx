import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SevenBanners from "@/components/SevenBanners";
import MarketplaceProducts from "@/components/marketplace-products";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f5f6f8] text-[#172033]">
        <SevenBanners />
        <div className="mx-auto max-w-[1280px] px-3 pb-12 sm:px-5">
          <section className="mb-9 rounded-3xl bg-gradient-to-r from-[#172033] via-[#243650] to-[#344b68] px-6 py-9 text-white sm:px-10 sm:py-12">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-orange-300">Welcome to HubinBD</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">বাংলাদেশের অনলাইন শপিং ও ডিজিটাল সার্ভিস হাব</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">পোশাক, প্রয়োজনীয় অনলাইন টুলস এবং কম্পিউটার সার্ভিস—সবকিছু এক জায়গায়।</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/clothing" className="rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-bold text-white hover:bg-orange-600">পোশাক দেখুন</Link>
              <Link href="/tools" className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">অনলাইন টুলস</Link>
              <Link href="/computer-work" className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">কম্পিউটার ওয়ার্ক</Link>
            </div>
          </section>
          <MarketplaceProducts />
          <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/tools" className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <span className="text-3xl">🧰</span><h2 className="mt-3 text-xl font-extrabold">টুলস</h2><p className="mt-1 text-sm text-zinc-600">PDF Tools, QR Maker, Image Tools ও Hisab Khata</p><span className="mt-4 inline-block text-sm font-bold text-orange-600">সব টুলস দেখুন ↗</span>
            </Link>
            <Link href="/computer-work" className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <span className="text-3xl">💻</span><h2 className="mt-3 text-xl font-extrabold">কম্পিউটার ওয়ার্ক</h2><p className="mt-1 text-sm text-zinc-600">Logo Design, Graphics, Data Maker ও Document Work</p><span className="mt-4 inline-block text-sm font-bold text-orange-600">সার্ভিস দেখুন ↗</span>
            </Link>
          </section>
        </div>
      </main>
      <footer className="border-t border-zinc-200 bg-white px-5 py-6 text-center text-xs text-zinc-500">© {new Date().getFullYear()} HubinBD · Made in Bangladesh</footer>
    </>
  );
}
