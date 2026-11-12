import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ServiceOrderForm from "@/components/service-order-form";
import ComputerWorkServiceGrid from "@/components/computer-work-service-grid";

export const metadata: Metadata = {
  title: "কম্পিউটার ওয়ার্ক ও ডিজাইন সার্ভিস",
  description: "HubinBD-তে গ্রাফিক্স, লোগো ডিজাইন ও ডাটা এন্ট্রি সার্ভিস।",
  alternates: { canonical: "/computer-work" },
};

const services = [
  { title: "Logo Design", bn: "লোগো ডিজাইন", icon: "✳️", tag: "Brand Identity", desc: "আপনার ব্যবসা বা ব্র্যান্ডের জন্য পরিচ্ছন্ন, স্মরণীয় ও আধুনিক লোগো।", color: "from-violet-100 via-fuchsia-50 to-white", slug: "logo-design" },
  { title: "Graphics Design", bn: "গ্রাফিক্স ডিজাইন", icon: "🎨", tag: "Creative Studio", desc: "সোশ্যাল মিডিয়া পোস্ট, ব্যানার, ফ্লায়ার ও প্রচারণার ডিজাইন।", color: "from-orange-100 via-rose-50 to-white", slug: "graphics-design" },
  { title: "Data Maker", bn: "ডাটা মেকার", icon: "📊", tag: "Data & Sheets", desc: "ডাটা এন্ট্রি, তালিকা তৈরি, স্প্রেডশিট ও রিপোর্ট সাজানো।", color: "from-sky-100 via-cyan-50 to-white", slug: "data-maker" },
  { title: "Document Work", bn: "ডকুমেন্ট ও টাইপিং", icon: "📝", tag: "Document Desk", desc: "বাংলা ও ইংরেজি টাইপিং, ডকুমেন্ট ফরম্যাটিং ও PDF প্রস্তুতি।", color: "from-emerald-100 via-lime-50 to-white", slug: "document-work" },
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
          <ComputerWorkServiceGrid services={services} />
          <ServiceOrderForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
