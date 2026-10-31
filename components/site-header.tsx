import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3" aria-label="HubinBD home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff6b00] text-xl font-black text-white">H</span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight">Hubin<span className="text-[#ff6b00]">BD</span></span>
            <span className="block text-[10px] uppercase tracking-[.2em] text-zinc-500">Bangladesh's Digital Hub</span>
          </span>
        </Link>
        <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">বাংলা · English</span>
      </div>
    </header>
  );
}
