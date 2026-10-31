import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "কম্পিউটার ওয়ার্ক ও ডিজাইন সার্ভিস",
  description: "HubinBD-তে গ্রাফিক্স, লোগো ডিজাইন ও ডাটা এন্ট্রি সার্ভিস।",
  alternates: { canonical: "/computer-work" },
};

const services = [
  { title: "Logo Design", bn: "লোগো ডিজাইন", icon: "✳️", desc: "ব্যবসা বা ব্র্যান্ডের জন্য পরিচ্ছন্ন ও আধুনিক লোগো ডিজাইন।" },
  { title: "Graphics Design", bn: "গ্রাফিক্স ডিজাইন", icon: "🎨", desc: "সোশ্যাল মিডিয়া পোস্ট, ব্যানার, ফ্লায়ার ও প্রোমোশনাল ডিজাইন।" },
  { title: "Data Maker", bn: "ডাটা মেকার", icon: "📊", desc: "ডাটা এন্ট্রি, তালিকা তৈরি ও স্প্রেডশিট সাজানোর কাজ।" },
  { title: "Document Work", bn: "ডকুমেন্ট ও টাইপিং", icon: "📝", desc: "বাংলা ও ইংরেজি টাইপিং, ডকুমেন্ট ফরম্যাটিং ও PDF প্রস্তুতি।" },
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
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">ডিজাইন, ডাটা ও ডকুমেন্ট-সংক্রান্ত কাজের সার্ভিস ক্যাটালগ।</p>
          </header>
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article key={service.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-2xl">{service.icon}</span>
                <h2 className="mt-5 text-lg font-bold">{service.bn}</h2>
                <p className="mt-1 text-xs font-semibold text-orange-600">{service.title}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{service.desc}</p>
              </article>
            ))}
          </section>
          <p className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">সার্ভিস অর্ডার ও মূল্য নির্ধারণের যোগাযোগ ব্যবস্থা এখনো যুক্ত করা হয়নি। এই পেজটি আপাতত সার্ভিস ক্যাটালগ হিসেবে প্রস্তুত।</p>
        </div>
      </main>
    </>
  );
}
