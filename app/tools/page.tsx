import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "অনলাইন টুলস",
  description: "HubinBD-এর অনলাইন PDF, QR, Image এবং হিসাবের টুলস।",
  alternates: { canonical: "/tools" },
};

const serviceTools = [
  { title: "PDF Tools", titleBn: "PDF টুলস", description: "PDF ফাইল মার্জ, স্প্লিট ও কনভার্ট করুন।", icon: "📄", href: "https://www.ilovepdf.com/" },
  { title: "QR Maker", titleBn: "QR কোড মেকার", description: "লিংক বা তথ্য থেকে QR কোড তৈরি করুন।", icon: "▦", href: "https://www.qr-code-generator.com/" },
  { title: "Image Tools", titleBn: "ইমেজ টুলস", description: "ছবি সম্পাদনা ও রূপান্তরের প্রয়োজনীয় টুলস।", icon: "🖼️", href: "https://www.iloveimg.com/" },
  { title: "Hisab Khata", titleBn: "হিসাব খাতা", description: "দৈনন্দিন আয়-ব্যয়ের হিসাব রাখুন।", icon: "📒", href: null },
];

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f5f6f8] px-4 py-10 text-[#172033]">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-sm text-zinc-500 hover:text-orange-600">← হোমে ফিরুন</Link>
          <header className="mt-5">
            <p className="text-xs font-bold tracking-[.18em] text-orange-600">HUBINBD UTILITIES</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">অনলাইন টুলস</h1>
            <p className="mt-2 text-zinc-600">দৈনন্দিন কাজ সহজ করার জন্য প্রয়োজনীয় টুলস এক জায়গায়।</p>
          </header>
          <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tools.map((tool) => (
              <Link key={tool.slug} href={"/tools/" + tool.slug} className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md sm:p-6">
                <span className="grid h-14 w-14 place-items-center rounded-xl bg-orange-50 text-3xl text-orange-700 group-hover:bg-orange-100">{tool.icon}</span>
                <h2 className="mt-4 text-base font-bold sm:text-lg">{tool.titleBn}</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">{tool.descriptionBn}</p>
                <span className="mt-4 inline-block text-sm font-bold text-orange-600">টুল চালু করুন ↗</span>
              </Link>
            ))}
            {serviceTools.map((tool) => {
              const card = <><span className="grid h-14 w-14 place-items-center rounded-xl bg-orange-50 text-3xl text-orange-700 group-hover:bg-orange-100">{tool.icon}</span><h2 className="mt-4 text-base font-bold sm:text-lg">{tool.titleBn}</h2><p className="mt-1 text-sm leading-6 text-zinc-500">{tool.description}</p><span className="mt-4 inline-block text-sm font-bold text-orange-600">{tool.href ? "টুল চালু করুন ↗" : "শিগগিরই আসছে"}</span></>;
              return tool.href ? <a key={tool.title} href={tool.href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md sm:p-6">{card}</a> : <article key={tool.title} className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">{card}</article>;
            })}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
