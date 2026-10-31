import SiteHeader from "@/components/site-header";
import ToolCard from "@/components/tool-card";
import { tools } from "@/lib/tools";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <section aria-labelledby="home-title">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[#ff7a1a]">Bangladesh's Digital Hub</p>
          <h1 id="home-title" className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            প্রয়োজনীয় ডিজিটাল টুলস, <span className="text-zinc-500">এক জায়গায়।</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            HubinBD-এর সহজ ও ফ্রি অনলাইন টুলস ব্যবহার করুন। বাংলা এবং English—দুই ভাষাতেই।
          </p>
        </section>
        <section aria-labelledby="tools-title" className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="tools-title" className="text-xl font-bold">Available Tools</h2>
              <p className="mt-1 text-sm text-zinc-500">আপনার প্রয়োজনীয় টুল বেছে নিন</p>
            </div>
            <span className="text-sm text-zinc-500">{tools.length} tools</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} HubinBD · Made in Bangladesh
      </footer>
    </>
  );
}
