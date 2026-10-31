import Link from "next/link";
import type { ToolDefinition } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group rounded-2xl border border-white/10 bg-[#111214] p-5 transition hover:-translate-y-1 hover:border-[#ff6b00]/60 hover:bg-[#151515] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff6b00]"
    >
      <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-[#ff6b00]/10 text-2xl" aria-hidden="true">
        {tool.icon}
      </span>
      <h2 className="text-lg font-bold">{tool.titleBn}</h2>
      <p className="mt-1 text-sm font-medium text-zinc-400">{tool.title}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-500">{tool.descriptionBn}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ff8a36]">
        টুল ব্যবহার করুন <span aria-hidden="true">↗</span>
      </span>
    </Link>
  );
}
