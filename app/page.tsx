import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SevenBanners from "@/components/SevenBanners";
import SiteFooter from "@/components/site-footer";
import MarketplaceProducts from "@/components/marketplace-products";

type HomePageProps = { searchParams: Promise<{ category?: string }> };

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const category = params.category;
  const onlyCategory = category === "mens" || category === "womens" || category === "kids" ? category : undefined;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f5f6f8] text-[#172033]">
        <SevenBanners />
        <div className="mx-auto max-w-[1280px] px-3 pb-12 sm:px-5">
          {!onlyCategory && <nav aria-label="প্রধান ক্যাটাগরি" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { title: "ছেলেদের জামা", icon: "👔", href: "/?category=mens", color: "from-sky-100 to-blue-50" },
              { title: "মেয়েদের জামা", icon: "👗", href: "/?category=womens", color: "from-pink-100 to-rose-50" },
              { title: "শীতের জামা", icon: "🧥", href: "/clothing", color: "from-orange-100 to-amber-50" },
              { title: "Tools", icon: "🛠️", href: "/tools", color: "from-emerald-100 to-green-50" },
              { title: "কম্পিউটার ওয়ার্ক", icon: "💻", href: "/computer-work", color: "from-violet-100 to-indigo-50" },
            ].map((item) => (
              <Link key={item.title} href={item.href} className={`group flex min-h-[88px] items-center gap-3 rounded-2xl border border-zinc-200 bg-gradient-to-br ${item.color} px-3 py-3 text-[#172033] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[96px] sm:px-4`}>
                <span aria-hidden="true" className="shrink-0 text-3xl sm:text-4xl">{item.icon}</span>
                <span className="min-w-0 flex-1 text-sm font-extrabold leading-snug sm:text-base">{item.title}</span>
                <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#172033] text-xs text-white transition group-hover:bg-[#ff6b00]">➜</span>
              </Link>
            ))}
          </nav>}
          {onlyCategory && <div className="mb-6 flex items-center justify-between gap-3"><h1 className="text-2xl font-black text-[#172033]">{onlyCategory === "mens" ? "ছেলেদের জামা" : onlyCategory === "womens" ? "মেয়েদের জামা" : "বাচ্চাদের জামা"}</h1><Link href="/" className="text-sm font-semibold text-orange-600 hover:underline">সব ক্যাটাগরি দেখুন</Link></div>}
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
