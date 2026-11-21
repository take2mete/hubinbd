import Link from "next/link";

export default function Page() {
  return <main className="min-h-screen bg-[#f4f6fa] p-4 text-slate-900 sm:p-6">
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="rounded-3xl bg-[#172b4d] p-6 text-white">
        <Link href="/admin" className="text-sm text-slate-300">← Admin Dashboard</Link>
        <h1 className="mt-3 text-3xl font-black">Website Analytics</h1>
        <p className="mt-1 text-sm text-slate-300">Visitor ও Traffic রিপোর্ট — Google Analytics 4</p>
      </header>
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Google Analytics 4</h2>
        <p className="mt-2 text-sm text-slate-600">আজ, গত ৭ দিন ও ৩০ দিনের Visitor, Page Views, Device, Country/City, Traffic Source এবং Popular Pages দেখতে GA4 ব্যবহার করুন। District-level অবস্থান IP-ভিত্তিক আনুমানিক হতে পারে।</p>
        <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-[#172b4d] px-5 py-3 text-sm font-bold text-white">Google Analytics খুলুন ↗</a>
        <p className="mt-3 text-xs text-slate-500">GA4 Property ও Measurement ID যুক্ত না করা পর্যন্ত বাস্তব Visitor রিপোর্ট পাওয়া যাবে না। Public website-এ নতুন tracking script যোগ করা হয়নি, যাতে সাইট অপ্রয়োজনীয় ভারী না হয়।</p>
      </section>
    </div>
  </main>;
}
