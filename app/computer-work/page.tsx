import Link from "next/link";

const services = [
  { name: "Data Maker", description: "ডাটা তৈরি, সাজানো ও প্রয়োজনীয় ডকুমেন্ট প্রস্তুত।", icon: "▧" },
  { name: "Graphics", description: "পোস্টার, ব্যানার ও ডিজাইনের কাজ।", icon: "✎" },
  { name: "Windows Install & Setup", description: "উইন্ডোজ ইনস্টলেশন ও কম্পিউটার সেটআপ সহায়তা।", icon: "▣" },
  { name: "Typing & Documentation", description: "বাংলা ও ইংরেজি টাইপিং এবং ডকুমেন্ট তৈরি।", icon: "⌨" },
  { name: "Office Work", description: "MS Word, Excel ও PowerPoint-এর কাজ।", icon: "▤" },
  { name: "Online Application", description: "অনলাইন আবেদন ও ফর্ম পূরণে সহায়তা।", icon: "◎" },
];

export default function ComputerWorkPage() {
  return <main className="directory-page">
    <Link className="directory-back" href="/">← হোম পেজে ফিরুন</Link>
    <header><span>HUBINBD · COMPUTER SERVICES</span><h1>কম্পিউটার ওয়ার্ক</h1><p>Data Maker, Graphics-সহ কম্পিউটারভিত্তিক সেবা এক জায়গায়।</p></header>
    <section className="directory-grid">{services.map((service) => <article className="directory-card" key={service.name}><span>{service.icon}</span><h2>{service.name}</h2><p>{service.description}</p><small>শীঘ্রই ব্যবহার করা যাবে</small></article>)}</section>
  </main>;
}
