import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import MarketplaceProducts from "@/components/marketplace-products";

export const metadata: Metadata = {
  title: "পোশাকের কালেকশন",
  description: "বাচ্চা, মেয়ে ও ছেলেদের পোশাকের কালেকশন দেখুন HubinBD-তে।",
  alternates: { canonical: "/clothing" },
};

export default function ClothingPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f5f6f8] px-3 py-8 sm:px-5 sm:py-12">
        <div className="mx-auto max-w-[1280px]">
          <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-orange-600">← হোমে ফিরুন</Link>
          <header className="mb-9 mt-5 rounded-3xl bg-gradient-to-r from-[#172033] to-[#34445f] p-7 text-white sm:p-10">
            <p className="text-xs font-bold tracking-[.2em] text-orange-300">HUBINBD COLLECTION</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">পোশাকের কালেকশন</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75">বাচ্চা, মেয়ে ও ছেলেদের পোশাক এক জায়গায় খুঁজে নিন।</p>
          </header>
          <MarketplaceProducts />
        </div>
      </main>
    </>
  );
}
