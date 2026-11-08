import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { tools } from "@/lib/tools";
export const metadata: Metadata = { title: "অনলাইন টুলস | HubinBD", description: "PDF, QR, Graphics, Image, Hisab Khata ও Data Maker টুলস।", alternates: { canonical: "/tools" } };
const serviceTools = [
 { title: "PDF Tools", bn: "PDF টুলস", desc: "PDF মার্জ, স্প্লিট, কমপ্রেস ও কনভার্ট করুন।", icon: "📄", href: "https://www.ilovepdf.com/" },
 { title: "QR Maker", bn: "QR কোড মেকার", desc: "লিংক বা তথ্য থেকে QR কোড তৈরি করুন।", icon: "▦", href: "https://www.qr-code-generator.com/" },
 { title: "Graphics", bn: "গ্রাফিক্স", desc: "অনলাইনে পোস্ট, ব্যানার ও ডিজাইন তৈরি করুন।", icon: "🎨", href: "https://www.canva.com/" },
 { title: "Image Tools", bn: "ইমেজ টুলস", desc: "ছবি কমপ্রেস, রিসাইজ ও কনভার্ট করুন।", icon: "🖼️", href: "https://www.iloveimg.com/" },
 { title: "Hisab Khata", bn: "হিসাব খাতা", desc: "ব্যবসার আয়-ব্যয় ও লেনদেন হিসাব রাখুন।", icon: "📒", href: "https://docs.google.com/spreadsheets/" },
 { title: "Data Maker", bn: "ডাটা মেকার", desc: "ডাটা টেবিল ও স্প্রেডশিট তৈরি করুন।", icon: "📊", href: "https://sheets.google.com/" }
];
export default function ToolsPage() {
 return <><SiteHeader /><main className="min-h-screen bg-[#f4f6fa] px-4 py-9 text-[#172033] sm:py-12"><div className="mx-auto max-w-[1200px]">
 <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-orange-700">← হোমে ফিরুন</Link>
 <header className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10"><p className="text-[11px] font-extrabold tracking-[.2em] text-orange-600">HUBINBD UTILITIES</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">অনলাইন টুলস</h1><p className="mt-2 text-sm text-slate-600">প্রয়োজনীয় ডিজিটাল টুলস—এক জায়গায়।</p></header>
 <section className="mt-8"><h2 className="mb-4 text-xl font-black">সব টুলস</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {serviceTools.map(tool => <a key={tool.title} href={tool.href} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"><span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-2xl">{tool.icon}</span><h3 className="mt-4 text-lg font-extrabold">{tool.bn}</h3><p className="mt-1 text-xs font-bold text-orange-700">{tool.title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{tool.desc}</p><span className="mt-4 inline-block text-xs font-bold text-orange-700">টুলটি খুলুন ↗</span></a>)}
 {tools.map(tool => <Link key={tool.slug} href={"/tools/"+tool.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-lg"><span className="text-2xl">{tool.icon}</span><h3 className="mt-4 font-extrabold">{tool.titleBn}</h3><p className="mt-2 text-sm text-slate-600">{tool.descriptionBn}</p><span className="mt-4 inline-block text-xs font-bold text-orange-700">নিজস্ব টুল চালু করুন ↗</span></Link>)}
 </div></section>
 <section className="mt-8 flex flex-col gap-3 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-extrabold">ডিজাইন বা ডাটা সংক্রান্ত কাজ লাগবে?</h2><p className="mt-1 text-sm text-slate-300">HubinBD Computer Work থেকে সার্ভিস অর্ডার দিন।</p></div><Link href="/computer-work" className="w-fit rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold">সার্ভিস দেখুন ↗</Link></section>
 </div></main><SiteFooter /></>;
}