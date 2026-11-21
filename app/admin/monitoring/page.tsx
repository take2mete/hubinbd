import Link from "next/link";

const links = [
  { id: "vercel", title: "Vercel — System Health", description: "Build Status, Function Invocations, Bandwidth, CDN Usage, Deployment ও Error Monitoring.", href: "https://vercel.com/take2mete/hubinbd", action: "Vercel Project খুলুন" },
  { id: "storage", title: "Supabase — Storage Manager", description: "Product Images, Banner Images, site-assets এবং Storage Used / Free দেখুন। কোনো ফাইল এখানে স্বয়ংক্রিয়ভাবে Delete হবে না.", href: "https://supabase.com/dashboard/project/rgplfsmxkarqnlwwaowd/storage", action: "Storage Dashboard খুলুন" },
  { id: "database", title: "Supabase — Database Monitor", description: "Database Size, Table Usage, Health ও Performance Advisor দেখুন.", href: "https://supabase.com/dashboard/project/rgplfsmxkarqnlwwaowd", action: "Database Dashboard খুলুন" },
  { id: "backup", title: "Supabase — Backup Center", description: "আপনার Plan-এ উপলব্ধ Backup ও Restore সুবিধা যাচাই করুন। Database backup এবং Storage file backup আলাদা করে নিশ্চিত করতে হবে.", href: "https://supabase.com/dashboard/project/rgplfsmxkarqnlwwaowd/settings/database", action: "Backup Settings খুলুন" },
];

export default function Page() {
  return <main className="min-h-screen bg-[#f4f6fa] p-4 text-slate-900 sm:p-6">
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-3xl bg-[#172b4d] p-6 text-white">
        <Link href="/admin" className="text-sm text-slate-300">← Admin Dashboard</Link>
        <h1 className="mt-3 text-3xl font-black">External Monitoring</h1>
        <p className="mt-1 text-sm text-slate-300">Vercel ও Supabase-এর বিদ্যমান Dashboard — নতুন Monitoring Engine নয়</p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {links.map(item => <section id={item.id} key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-bold">{item.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          <a href={item.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl border px-4 py-2.5 text-sm font-bold text-slate-800">{item.action} ↗</a>
        </section>)}
      </div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Storage Alert (70% / 85% / 95%) ও Email/WhatsApp notification এখনো আলাদা automation হিসেবে তৈরি হয়নি। এই পেজ শুধু আসল Supabase/Vercel Dashboard-এ নিয়ে যায়; কোনো ভুয়া Usage সংখ্যা দেখায় না।</p>
    </div>
  </main>;
}
