import Link from "next/link";

const tools = [
  { name: "PDF Tools", description: "PDF ফাইল একত্র করা, ভাগ করা ও প্রয়োজনীয় কাজের জন্য টুলস।", icon: "▤" },
  { name: "QR Maker", description: "লিংক, লেখা বা যোগাযোগের তথ্য থেকে QR কোড তৈরি করুন।", icon: "▦" },
  { name: "Image Tools", description: "ছবি রিসাইজ, কনভার্ট ও প্রয়োজনীয় সম্পাদনার সুবিধা।", icon: "▧" },
  { name: "Hisab Khata", description: "দৈনিক আয়-ব্যয়ের হিসাব সহজে সংরক্ষণ করুন।", icon: "▥" },
];

export default function ToolsPage() {
  return <main className="directory-page">
    <Link className="directory-back" href="/">← হোম পেজে ফিরুন</Link>
    <header><span>HUBINBD · ONLINE TOOLS</span><h1>টুলস পেজ</h1><p>আপনার প্রয়োজনীয় অনলাইন টুলস এক জায়গায়।</p></header>
    <section className="directory-grid">{tools.map((tool) => <article className="directory-card" key={tool.name}><span>{tool.icon}</span><h2>{tool.name}</h2><p>{tool.description}</p><small>শীঘ্রই ব্যবহার করা যাবে</small></article>)}</section>
  </main>;
}
