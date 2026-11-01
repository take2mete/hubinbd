import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "কম্পিউটার ওয়ার্ক ও ডিজাইন সার্ভিস",
  description: "HubinBD-তে গ্রাফিক্স, লোগো ডিজাইন ও ডাটা এন্ট্রি সার্ভিস।",
  alternates: { canonical: "/computer-work" },
};

const services = [
  { title: "Logo Design", bn: "লোগো ডিজাইন", icon: "✳️", tag: "Branding", desc: "ব্যবসা বা ব্র্যান্ডের জন্য পরিচ্ছন্ন, স্বতন্ত্র ও আধুনিক লোগো ডিজাইন।", color: "from-violet-100 to-fuchsia-50" },
  { title: "Graphics Design", bn: "গ্রাফিক্স ডিজাইন", icon: "🎨", tag: "Creative Design", desc: "সোশ্যাল মিডিয়া পোস্ট, ব্যানার, ফ্লায়ার ও প্রোমোশনাল ডিজাইন।", color: "from-orange-100 to-rose-50" },
  { title: "Data Maker", bn: "ডাটা মেকার", icon: "📊", tag: "Data & Spreadsheet", desc: "ডাটা এন্ট্রি, তালিকা তৈরি ও স্প্রেডশিট সাজানোর কাজ।", color: "from-sky-100 to-cyan-50" },
  { title: "Document Work", bn: "ডকুমেন্ট ও টাইপিং", icon: "📝", tag: "Document Services", desc: "বাংলা ও ইংরেজি টাইপিং, ডকুমেন্ট ফরম্যাটিং ও PDF প্রস্তুতি।", color: "from-emerald-100 to-lime-50" },
];

export default function ComputerWorkPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f5f6f8] px-4 py-10 text-[#172033]">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-sm text-zinc-500 hover:text-orange-600">← হোমে ফিরুন</Link>
          <header className="mt-5 rounded-3xl bg-gradient-to-r from-[#172033] to-[#354b68] p-8 text-white sm:p-10">
            <p className="text-xs font-bold tracking-[.2em] text-orange-300">HUBINBD DIGITAL SERVICES</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">কম্পিউটার ওয়ার্ক</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">ডিজাইন, ডাটা ও ডকুমেন্টের কাজের জন্য সার্ভিস খুঁজুন।</p>
          </header>
          <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className={`relative grid h-44 place-items-center bg-gradient-to-br ${service.color}`}>
                  <span className="text-6xl drop-shadow-sm">{service.icon}</span>
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-700">{service.tag}</span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold">{service.bn}</h2>
                  <p className="mt-1 text-xs font-semibold text-orange-600">{service.title}</p>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600">{service.desc}</p>
                  <div className="mt-4 border-t border-zinc-100 pt-4 text-sm font-bold text-zinc-500">সার্ভিস ক্যাটালগ</div>
                </div>
              </article>
            ))}
          </section>
          <p className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">সার্ভিস অর্ডার, মূল্য ও যোগাযোগের ব্যবস্থা পরবর্তী ধাপে যুক্ত করতে হবে।</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
