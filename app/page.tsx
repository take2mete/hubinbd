import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SevenBanners from "@/components/SevenBanners";
import SiteFooter from "@/components/site-footer";
import MarketplaceProducts from "@/components/marketplace-products";

type HomePageProps = { searchParams: Promise<{ category?: string }> };

const categoryLinks = [
  { key: "mens", title: "ছেলেদের জামা", note: "নতুন কালেকশন", icon: "👕" },
  { key: "womens", title: "মেয়েদের জামা", note: "স্টাইলিশ পোশাক", icon: "👗" },
  { key: "kids", title: "বাচ্চাদের জামা", note: "ছোটদের কালেকশন", icon: "🧸" },
  { key: "winter", title: "শীতের জামা", note: "শীতের প্রস্তুতি", icon: "🧥" },
];

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const category = ["mens", "womens", "kids", "winter"].includes(params.category ?? "")
    ? params.category as "mens" | "womens" | "kids" | "winter"
    : undefined;
  const heading = categoryLinks.find((item) => item.key === category)?.title;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f4f6fa] text-[#172033]">
        <div className="mx-auto max-w-[1320px] px-3 sm:px-5">
          <SevenBanners />
          <nav aria-label="পোশাকের ক্যাটাগরি" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categoryLinks.map((item) => (
              <Link key={item.key} href={`/?category=${item.key}`} className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-50 text-2xl transition group-hover:bg-orange-100">{item.icon}</span>
                <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-slate-800">{item.title}</span><span className="mt-1 block text-xs text-slate-500">{item.note}</span></span>
              </Link>
            ))}
          </nav>
          <section className="pb-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[.18em] text-orange-600">HUBINBD MARKETPLACE</p>
                <h1 className="mt-1 text-2xl font-black text-[#172033] sm:text-3xl">{heading ?? "জনপ্রিয় পণ্য ও নতুন কালেকশন"}</h1>
              </div>
              {category && <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-300 hover:text-orange-600">সব পণ্য দেখুন</Link>}
            </div>
            <MarketplaceProducts onlyCategory={category} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
