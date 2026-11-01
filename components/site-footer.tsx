import Link from "next/link";

const exploreLinks = [
  { href: "/clothing", label: "শপিং মার্কেটপ্লেস" },
  { href: "https://cars.hubinbd.com/", label: "রেন্ট-এ-কার" , external: true },
  { href: "/tools", label: "ফ্রি ডিজিটাল টুলস" },
  { href: "/computer-work", label: "কম্পিউটার ও ডিজাইন সার্ভিস" },
];

const quickLinks = [
  { href: "/", label: "হোম" },
  { href: "/login", label: "লগইন / সাইন আপ" },
  { href: "/cart", label: "শপিং কার্ট" },
];

function FooterLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  const className = "text-sm leading-6 text-zinc-400 transition hover:text-white";
  return external
    ? <a href={href} target="_blank" rel="noreferrer" className={className}>{children}<span aria-hidden="true"> ↗</span></a>
    : <Link href={href} className={className}>{children}</Link>;
}

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#090b10] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
      <div className="mx-auto max-w-[1280px] px-5 pb-7 pt-12 sm:px-8 sm:pt-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1.15fr] lg:gap-12">
          <div>
            <Link href="/" aria-label="HubinBD হোমপেজ" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl font-black text-[#090b10] shadow-lg shadow-white/10">H</span>
              <span className="leading-none"><span className="block text-2xl font-extrabold tracking-tight">HubinBD</span><span className="mt-1.5 block text-[10px] font-semibold tracking-[.25em] text-zinc-400">ALL IN ONE HUB</span></span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-zinc-400">HubinBD — কেনাকাটা, সেবা ও ডিজিটাল টুলস, সব এক জায়গায়। আপনার দৈনন্দিন প্রয়োজনের সবকিছু, এক ঠিকানায়।</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3.5 py-2 text-xs font-medium text-zinc-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> বাংলাদেশের জন্য তৈরি · Made in Bangladesh</div>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">এক্সপ্লোর করুন</h2>
            <ul className="mt-5 space-y-3">{exploreLinks.map((item) => <li key={item.href}><FooterLink href={item.href} external={item.external}>{item.label}</FooterLink></li>)}</ul>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">দ্রুত লিংক</h2>
            <ul className="mt-5 space-y-3">{quickLinks.map((item) => <li key={item.href}><FooterLink href={item.href}>{item.label}</FooterLink></li>)}</ul>
            <div className="mt-7"><h3 className="text-xs font-bold text-zinc-300">আমাদের লক্ষ্য</h3><p className="mt-2 max-w-[220px] text-xs leading-6 text-zinc-500">সহজ, নির্ভরযোগ্য ও ব্যবহারবান্ধব ডিজিটাল অভিজ্ঞতা।</p></div>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">যোগাযোগ করুন</h2>
            <div className="mt-5 space-y-4">
              <a href="mailto:support@hubinbd.com" className="group flex items-center gap-3 text-sm text-zinc-400 transition hover:text-white"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[.08] text-base transition group-hover:bg-orange-500">✉</span><span><span className="block text-[11px] text-zinc-500">ইমেইল</span><span className="mt-0.5 block">support@hubinbd.com</span></span></a>
              <div className="flex items-center gap-3 text-sm text-zinc-400"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[.08] text-base">⌖</span><span><span className="block text-[11px] text-zinc-500">অবস্থান</span><span className="mt-0.5 block">ঢাকা, বাংলাদেশ</span></span></div>
            </div>
            <a href="https://cars.hubinbd.com/" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600">রেন্ট-এ-কার বুক করুন <span aria-hidden="true">↗</span></a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HubinBD. সর্বস্বত্ব সংরক্ষিত।</p>
          <p>আপনার প্রতিদিনের প্রয়োজন, এখন এক ঠিকানায়।</p>
        </div>
      </div>
    </footer>
  );
}
