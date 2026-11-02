import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata = {
  title: "শপিং কার্ট",
  description: "আপনার HubinBD শপিং কার্ট",
};

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] bg-[#f5f6f8] px-4 py-12 text-[#172033]">
        <section className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm">
          <div aria-hidden="true" className="text-5xl">🛒</div>
          <h1 className="mt-4 text-2xl font-black">আপনার শপিং কার্ট</h1>
          <p className="mt-2 text-zinc-600">কার্টে এখনো কোনো পণ্য যোগ করা হয়নি।</p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#ff6b00] px-5 py-3 font-bold text-white transition hover:bg-orange-700">শপিং শুরু করুন</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
