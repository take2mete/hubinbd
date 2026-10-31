"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const categories = [
  { value: "all", label: "সব ক্যাটাগরি" },
  { value: "mens", label: "ছেলেদের জামা" },
  { value: "womens", label: "মেয়েদের জামা" },
  { value: "winter", label: "শীতের জামা" },
  { value: "tools", label: "টুলস ও যন্ত্রপাতি" },
  { value: "computer-work", label: "কম্পিউটার ওয়ার্ক" },
  { value: "car-parts", label: "গাড়ির যন্ত্রাংশ" },
];

const navLinks = [
  { href: "/", label: "হোম" },
  { href: "/?category=mens", label: "ছেলেদের জামা" },
  { href: "/?category=womens", label: "মেয়েদের জামা" },
  { href: "/?category=winter", label: "শীতের জামা" },
  { href: "/tools", label: "টুলস" },
  { href: "/computer-work", label: "কম্পিউটার ওয়ার্ক" },
];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

function CartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h2l2.3 11.5a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 1.9-1.4L21 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
}

function MenuIcon({ open }: { open: boolean }) {
  return open
    ? <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
}

export default function SiteHeader() {
  const [selected, setSelected] = useState(categories[0]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCategoryOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-[#f5f5f5] text-[#101828] shadow-[0_2px_14px_rgba(16,24,40,0.045)]">
      <div className="mx-auto max-w-[1280px] px-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-3 py-3 lg:gap-6">
          <Link href="/" aria-label="HubinBD হোমপেজ" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#ff6b00] text-xl font-extrabold text-white">H</span>
            <span className="leading-none">
              <span className="font-[Inter,Arial,sans-serif] text-[18px] font-extrabold tracking-tight text-[#ff6b00]">hubinbd</span>
              <span className="ml-0.5 rounded bg-black px-1 py-0.5 font-[Inter,Arial,sans-serif] text-[9px] font-bold text-white">.COM</span>
              <span className="mt-1 block text-[9px] font-semibold tracking-[0.14em] text-zinc-400">HUB IN BANGLADESH</span>
            </span>
          </Link>

          <form role="search" action="/search" method="GET" className="order-3 flex h-12 w-full min-w-0 items-center rounded-full border-2 border-[#101828] bg-white pl-1 pr-1 lg:order-none lg:ml-2 lg:max-w-[560px] lg:flex-1">
            <div ref={categoryRef} className="relative shrink-0">
              <button
                type="button"
                aria-expanded={categoryOpen}
                aria-haspopup="listbox"
                onClick={() => setCategoryOpen((open) => !open)}
                className="flex h-10 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 sm:px-3.5 sm:text-[13px]"
              >
                <span className="max-w-[104px] truncate sm:max-w-none">{selected.label}</span>
                <span className="text-zinc-500" aria-hidden="true">▾</span>
              </button>
              <input type="hidden" name="category" value={selected.value} />
              {categoryOpen && (
                <ul role="listbox" aria-label="সার্চ ক্যাটাগরি" className="absolute left-0 top-[48px] z-[60] w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1.5 text-[#101828] shadow-xl">
                  {categories.map((category) => (
                    <li key={category.value} role="option" aria-selected={selected.value === category.value}>
                      <button type="button" onClick={() => { setSelected(category); setCategoryOpen(false); }} className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-orange-50 hover:text-[#e65f00]">
                        {category.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <span className="hidden h-5 w-px bg-zinc-200 sm:block" />
            <input name="q" type="search" placeholder="প্রোডাক্ট, গাড়ি, টুলস খুঁজুন..." aria-label="প্রোডাক্ট, গাড়ি বা টুলস খুঁজুন" className="min-w-0 flex-1 bg-transparent px-2 text-[13px] text-zinc-800 outline-none placeholder:text-zinc-400 sm:px-3 sm:text-[14px]" />
            <button type="submit" aria-label="খুঁজুন" className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#101828] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#263247] sm:px-5">
              <SearchIcon /><span className="hidden sm:inline">খুঁজুন</span>
            </button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <Link href="/cart" aria-label="শপিং কার্ট" className="relative grid h-11 w-11 place-items-center rounded-xl bg-[#101828] text-white transition hover:bg-[#263247]">
              <CartIcon />
              <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#ff6b00] px-1 text-[10px] font-bold text-white">0</span>
            </Link>
            <button type="button" aria-label={menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"} aria-expanded={menuOpen} aria-controls="hubinbd-menu" onClick={() => setMenuOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded-xl bg-[#101828] text-white transition hover:bg-[#263247]">
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </div>

      <nav aria-label="প্রধান নেভিগেশন" className="hidden border-t border-zinc-200/80 lg:block">
        <div className="mx-auto flex max-w-[1280px] items-center gap-1 px-4">
          {navLinks.map((item) => (
            <Link key={item.href + item.label} href={item.href} className="rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-zinc-700 transition hover:bg-white hover:text-[#ff6b00]">
              {item.label}
            </Link>
          ))}
          <a href="https://cars.hubinbd.com/" className="ml-auto rounded-lg px-3.5 py-2.5 text-[13px] font-bold text-[#ff6b00] transition hover:bg-white">
            রেন্ট-এ-কার ↗
          </a>
        </div>
      </nav>

      {menuOpen && (
        <nav id="hubinbd-menu" aria-label="মোবাইল ও অতিরিক্ত মেনু" className="border-t border-zinc-200 bg-white px-4 py-3 shadow-lg">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[#101828] hover:bg-orange-50 hover:text-[#ff6b00]">লগইন / সাইন আপ</Link>
            {navLinks.map((item) => (
              <Link key={item.href + item.label} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm text-zinc-700 hover:bg-orange-50 hover:text-[#ff6b00]">{item.label}</Link>
            ))}
            <a href="https://cars.hubinbd.com/" className="rounded-xl px-4 py-3 text-sm font-semibold text-[#ff6b00] hover:bg-orange-50">রেন্ট-এ-কার বুকিং ↗</a>
          </div>
        </nav>
      )}

      <nav aria-label="দ্রুত টুলস নেভিগেশন" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center gap-2 overflow-x-auto px-3 py-2.5 sm:px-4">
          {[
            { href: "/pdf-tools", label: "PDF Tools", icon: "📄" },
            { href: "/qr-maker", label: "QR Maker", icon: "▦" },
            { href: "/graphics", label: "Graphics", icon: "🎨" },
            { href: "/image-tools", label: "Image Tools", icon: "🖼️" },
            { href: "/hisab-khata", label: "Hisab Khata", icon: "📒" },
            { href: "/data-maker", label: "Data Maker", icon: "📊" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-[#fafafa] px-3.5 py-2 text-[12px] font-semibold text-zinc-700 transition hover:border-[#ff6b00]/40 hover:bg-orange-50 hover:text-[#e65f00] sm:text-[13px]">
              <span aria-hidden="true" className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
