import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "অনলাইন টুলস",
  description: "HubinBD-এর অনলাইন ক্যালকুলেটর, PDF, QR ও Image টুলস।",
  alternates: { canonical: "/tools" },
};

const serviceTools = [
  { title: "PDF Tools", titleBn: "PDF টুলস", description: "PDF ফাইল মার্জ, স্প্লিট ও কনভার্ট করুন।", icon: "📄", href: "https://www.ilovepdf.com/", label: "বাইরের টুল খুলুন" },
  { title: "QR Maker", titleBn: "QR কোড মেকার", description: "লিংক বা তথ্য থেকে QR কোড তৈরি করুন।", icon: "▦", href: "https://www.qr-code-generator.com/", label: "বাইরের টুল খুলুন" },
  { title: "Image Tools", titleBn: "ইমেজ টুলস", description: "ছবি কমপ্রেস, রিসাইজ ও কনভার্ট করুন।", icon: "🖼️", href: "https://www.iloveimg.com/", label: "বাইরের টুল খুলুন" },
];

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f4f6fa] px-4 py-9 text-[#172033] sm:py-12">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/" className="text-sm font-semibold text-slate-500 transition hover:text-orange-700">← হোমে ফিরুন</Link>
          <header className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div><p className="text-[11px] font-extrabold tracking-[.2em] text-orange-600">HUBINBD UTILITIES</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">অনলাইন টুলস</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">দৈনন্দিন কাজের দরকারি ডিজিটাল টুলস—এক জায়গায়, সহজে ব্যবহার করুন।</p></div>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">বাংলা ও ইংরেজি ইন্টারফেস</span>
          </header>
          <section className="mt-8">
            <div className="mb-4"><h2 className="text-lg font-extrabold">HubinBD-এর নিজস্ব টুলস</h2><p className="mt-1 text-xs text-slate-500">সরাসরি এই ওয়েবসাইটে ব্যবহার করুন</p></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {tools.map((tool) => <Link key={tool.slug} href={"/tools/" + tool.slug} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:p-6"><span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-2xl group-hover:bg-orange-100">{tool.icon}</span><h3 className="mt-4 font-extrabold text-slate-800">{tool.titleBn}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{tool.descriptionBn}</p><span className="mt-4 inline-flex text-xs font-bold text-orange-700">টুল চালু করুন ↗</span></Link>)}
            </div>
          </section>
          <section className="mt-10">
            <div className="mb-4"><h2 className="text-lg font-extrabold">জনপ্রিয় অনলাইন টুলস</h2><p className="mt-1 text-xs text-slate-500">নিচের কিছু টুল তৃতীয় পক্ষের ওয়েবসাইটে খুলবে</p></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {serviceTools.map((tool) => <a key={tool.title} href={tool.href} target="_blank" rel="noreferrer" className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-100 text-2xl group-hover:bg-orange-50">{tool.icon}</span><span><strong className="block text-sm font-extrabold text-slate-800">{tool.titleBn}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{tool.description}</span><span className="mt-3 inline-block text-xs font-bold text-orange-700">{tool.label} ↗</span></span></a>)}
            </div>
          </section>
          <section className="mt-8 flex flex-col gap-3 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7"><div><h2 className="text-lg font-extrabold">ডিজাইন বা ডাটা সংক্রান্ত কাজ লাগবে?</h2><p className="mt-1 text-sm text-slate-300">HubinBD Computer Work থেকে সার্ভিস অর্ডার দিন।</p></div><Link href="/computer-work" className="inline-flex w-fit rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-orange-400">সার্ভিস দেখুন ↗</Link></section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
