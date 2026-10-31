import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AgeCalculator from "@/components/tools/age-calculator/age-calculator";
import BmiCalculator from "@/components/tools/bmi-calculator/bmi-calculator";
import { getToolBySlug, tools } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tools.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.descriptionBn,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:py-16">
      <Link href="/" className="text-sm text-zinc-400 transition hover:text-[#ff8a36]">← HubinBD হোমে ফিরুন</Link>
      <header className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#ff7a1a]">HubinBD Tool</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">{tool.titleBn}</h1>
        <p className="mt-2 text-zinc-400">{tool.title} · {tool.description}</p>
      </header>
      <section className="mt-8 rounded-2xl border border-white/10 bg-[#111214] p-5 sm:p-8">
        {slug === "age-calculator" ? <AgeCalculator /> : <BmiCalculator />}
      </section>
      <p className="mt-6 text-xs leading-6 text-zinc-600">এই টুলটি সাধারণ তথ্যের জন্য। ফলাফল ব্যবহারের আগে প্রয়োজন অনুযায়ী যাচাই করুন।</p>
    </main>
  );
}
