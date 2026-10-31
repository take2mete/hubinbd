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
  { title: "PDF Tools", titleBn: "PDF টুলস", description: "PDF ফাইল নিয়ে প্রয়োজনীয় কাজের টুলস।", icon: "📄", status: "শিগগিরই আসছে" },
  { title: "QR Maker", titleBn: "QR কোড মেকার", description: "লিংক বা তথ্যের জন্য QR কোড তৈরি করুন।", icon: "▦", status: "শিগগিরই আসছে" },
  { title: "Image Tools", titleBn: "ইমেজ টুলস", description: "ছবি সম্পাদনা ও রূপান্তরের প্রয়োজনীয় টুলস।", icon: "🖼️", status: "শিগগিরই আসছে" },
  { title: "Hisab Khata", titleBn: "হিসাব খাতা", description: "দৈনন্দিন আয়-ব্যয়ের হিসাব রাখার সেবা।", icon: "📒", status: "শিগগিরই আসছে" },
];

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f5f6f8] px-4 py-10 text-[#172033]">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-sm text-zinc-500 hover:text-orange-600">← হোমে ফিরুন</Link>
          <h1 className="mt-5 text-3xl font-black sm:text-4xl">HubinBD Tools</h1>
          <p className="mt-2 text-zinc-600">দৈনন্দিন কাজ সহজ করার জন্য প্রয়োজনীয় অনলাইন টুলস।</p>
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link key={tool.slug} href={"/tools/" + tool.slug} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <span className="text-3xl">{tool.icon}</span>
                <h2 className="mt-4 text-lg font-bold">{tool.titleBn}</h2>
                <p className="mt-1 text-sm text-zinc-500">{tool.descriptionBn}</p>
                <span className="mt-4 inline-block text-sm font-bold text-orange-600">টুল চালু করুন ↗</span>
              </Link>
            ))}
            {serviceTools.map((tool) => (
              <article key={tool.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <span className="text-3xl">{tool.icon}</span>
                <h2 className="mt-4 text-lg font-bold">{tool.titleBn}</h2>
                <p className="mt-1 min-h-10 text-sm text-zinc-500">{tool.description}</p>
                <span className="mt-4 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{tool.status}</span>
              </article>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
