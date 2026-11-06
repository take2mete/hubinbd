import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ServiceOrderForm from "@/components/service-order-form";

export const metadata: Metadata = {
  title: "কম্পিউটার ওয়ার্ক ও ডিজাইন সার্ভিস",
  description: "HubinBD-তে গ্রাফিক্স, লোগো ডিজাইন ও ডাটা এন্ট্রি সার্ভিস।",
  alternates: { canonical: "/computer-work" },
};

const services = [
  { title: "Logo Design", bn: "লোগো ডিজাইন", icon: "✳️", tag: "Brand Identity", desc: "আপনার ব্যবসা বা ব্র্যান্ডের জন্য পরিচ্ছন্ন, স্মরণীয় ও আধুনিক লোগো।", color: "from-violet-100 via-fuchsia-50 to-white" },
  { title: "Graphics Design", bn: "গ্রাফিক্স ডিজাইন", icon: "🎨", tag: "Creative Studio", desc: "সোশ্যাল মিডিয়া পোস্ট, ব্যানার, ফ্লায়ার ও প্রচারণার ডিজাইন।", color: "from-orange-100 via-rose-50 to-white" },
  { title: "Data Maker", bn: "ডাটা মেকার", icon: "📊", tag: "Data & Sheets", desc: "ডাটা এন্ট্রি, তালিকা তৈরি, স্প্রেডশিট ও রিপোর্ট সাজানো।", color: "from-sky-100 via-cyan-50 to-white" },
  { title: "Document Work", bn: "ডকুমেন্ট ও টাইপিং", icon: "📝", tag: "Document Desk", desc: "বাংলা ও ইংরেজি টাইপিং, ডকুমেন্ট ফরম্যাটিং ও PDF প্রস্তুতি।", color: "from-emerald-100 via-lime-50 to-white" },
];

export default function ComputerWorkPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f4f6fa] px-4 py-9 text-[#172033] sm:py-12">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/" className="text-sm font-semibold text-slate-500 transition hover:text-orange-700">← হোমে ফিরুন</Link>
          <header className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#111d35] via-[#1b3153] to-[#244c73] p-7 text-white shadow-xl sm:p-11">
            <p className="text-[11px] font-extrabold tracking-[.22em] text-orange-300">HUBINBD DIGITAL SERVICES</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">কম্পিউটার ওয়ার্ক</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">ডিজাইন, ডাটা ও ডকুমেন্টের কাজ—আপনার প্রয়োজন লিখে অর্ডার পাঠান।</p>
            <Link href="#order" className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-orange-400">সার্ভিস অর্ডার করুন ↓</Link>
          </header>
          <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article key={service.title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className={`relative grid h-40 place-items-center bg-gradient-to-br ${service.color}`}>
                  <span className="text-6xl transition duration-300 group-hover:scale-110">{service.icon}</span>
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-700">{service.tag}</span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-extrabold tracking-[.16em] text-orange-700">{service.title}</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-900">{service.bn}</h2>
                  <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-600">{service.desc}</p>
                  <Link href="#order" className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700">এই সার্ভিসটি অর্ডার করুন ↗</Link>
                </div>
              </article>
            ))}
          </section>
          <ServiceOrderForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
