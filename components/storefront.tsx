"use client";

import { useMemo, useState } from "react";

const categories = [
  { id: "all", label: "সব ক্যাটাগরি", icon: "▣" },
  { id: "mens", label: "ছেলেদের জামা", icon: "👕" },
  { id: "womens", label: "মেয়েদের জামা", icon: "👗" },
  { id: "winter", label: "শীতের জামা", icon: "❄" },
  { id: "tools", label: "টুলস", icon: "🛠", href: "/tools" },
  { id: "computer-work", label: "কম্পিউটার ওয়ার্ক", icon: "💻", href: "/computer-work" },
];

const tools = [
  ["▧", "Image Tools", "ছবি এডিট ও কনভার্ট", "/tools"],
  ["▤", "PDF Tools", "PDF ফাইল নিয়ে কাজ", "/tools"],
  ["▦", "QR Maker", "QR কোড তৈরি", "/tools"],
  ["▥", "Hisab Khata", "হিসাব রাখুন সহজে", "/tools"],
];
const computer = [
  ["▣", "Windows Install & Setup", "উইন্ডোজ ইনস্টল ও সেটআপ", "/computer-work"],
  ["⌨", "Typing & Documentation", "বাংলা ও ইংরেজি টাইপিং", "/computer-work"],
  ["▤", "Office Work", "MS Word, Excel, PowerPoint", "/computer-work"],
  ["▧", "Data Maker", "ডাটা তৈরি ও সাজানো", "/computer-work"],
  ["✎", "Graphics", "পোস্টার, ব্যানার ও ডিজাইন", "/computer-work"],
  ["◎", "Online Application", "অনলাইন আবেদন সহায়তা", "/computer-work"],
];
const products = [
  { name: "Galaxy S24 Ultra 5G", category: "electronics", price: "৳১,১৮,৯৯০", old: "৳১,৩৬,০০০", discount: "১২%", tag: "Best Seller", rating: "4.8", sold: "2.1k sold", art: "phone" },
  { name: "AirPods Pro Max", category: "electronics", price: "৳২৫,৫০০", old: "৳৩০,০০০", discount: "১৫%", tag: "11.11 Sale", rating: "4.9", sold: "5.4k sold", art: "audio" },
  { name: "কটন টি-শার্ট", category: "mens", price: "৳৪৫০", old: "৳৭০০", discount: "৩৭%", tag: "Edit New", rating: "4.7", sold: "890 sold", art: "shirt" },
  { name: "Runner Sneakers", category: "mens", price: "৳১,২০০", old: "৳২,০০০", discount: "৪০%", tag: "Trending", rating: "4.6", sold: "1.2k sold", art: "shoe" },
  { name: "MacBook Air M3", category: "electronics", price: "৳১,১২,০০০", old: "৳১,৬৬,০০০", discount: "৩২%", tag: "Limited", rating: "5.0", sold: "320 sold", art: "laptop" },
  { name: "Watch Series 9", category: "electronics", price: "৳৬,৫০০", old: "৳৯,৫০০", discount: "৩২%", tag: "Flash", rating: "4.8", sold: "3.3k sold", art: "watch" },
  { name: "Rice Cooker 1.8L", category: "home", price: "৳৩,৪৫০", old: "৳৪,৮০০", discount: "২৮%", tag: "Home", rating: "4.5", sold: "780 sold", art: "cooker" },
  { name: "Travel Backpack", category: "womens", price: "৳১,৭০০", old: "৳২,৫০০", discount: "৩২%", tag: "New", rating: "4.7", sold: "2.8k sold", art: "bag" },
];

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return <div className="section-title"><div><h2>{children}</h2>{sub && <p>{sub}</p>}</div><a href="#products">সব দেখুন <span>→</span></a></div>;
}

export default function Storefront() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const visibleProducts = useMemo(() => products.filter((p) => {
    const matchCategory = category === "all" || category === "tools" || category === "computer-work" || p.category === category || (category === "winter" && p.category === "mens");
    return matchCategory && p.name.toLowerCase().includes(query.toLowerCase());
  }), [category, query]);

  return <main className="storefront">
    <div className="top-hero">
      <a className="rent-banner" href="https://cars.hubinbd.com/" target="_blank" rel="noreferrer">
        <div className="rent-copy"><strong>🚙 cars.hubinbd.com</strong><b>অনলাইনে রেন্ট এ কার</b><span>বাংলাদেশের যেকোনো স্থানে গাড়ি বুক করুন</span><em>Book Now →</em></div>
        <div className="rent-car-art" aria-hidden="true">🚘</div>
      </a>
      <div className="quick-tools">{[...tools, computer[4], computer[3]].map((item) => <a href={item[3]} key={item[1]}><span>{item[0]}</span>{item[1]}</a>)}</div>
    </div>

    <div className="category-tiles">{categories.filter((item) => item.id !== "all").map((item) => item.href ? <a className="category-tile" href={item.href} key={item.id}><span>{item.icon}</span><b>{item.label}</b></a> : <button className={category === item.id ? "category-tile active" : "category-tile"} key={item.id} onClick={() => setCategory(item.id)}><span>{item.icon}</span><b>{item.label}</b></button>)}</div>
    <nav className="category-pills" aria-label="ক্যাটাগরি">{categories.map((item) => item.href ? <a key={item.id} className="category-pill-link" href={item.href}>{item.label}</a> : <button key={item.id} className={category === item.id ? "selected" : ""} onClick={() => setCategory(item.id)}>{item.label}</button>)}</nav>

    <section className="service-panel" id="tools">
      <SectionTitle sub="ইমেজ কনভার্ট, PDF টুলস, QR কোড জেনারেট ও অনলাইন কাজের সুবিধা">অনলাইন টুলস পেজ</SectionTitle>
      <div className="tool-grid">{tools.map((item) => <a className="service-card" href={item[3]} key={item[1]}><span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small></a>)}</div>
      <p className="panel-note">টুলসগুলো প্রয়োজনীয় প্রাথমিক কাজ ও সম্পাদনার জন্য তৈরি</p>
    </section>

    <section className="service-panel" id="computer-work">
      <SectionTitle sub="কম্পিউটার, সফটওয়্যার ও অনলাইন কাজের নানা সহায়তা">কম্পিউটার ওয়ার্ক পেজ</SectionTitle>
      <div className="computer-grid">{computer.map((item) => <a className="service-card" href={item[3]} key={item[1]}><span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small></a>)}</div>
      <p className="panel-note">সেবার বিস্তারিত ও বুকিং সুবিধা শীঘ্রই যুক্ত করা হবে</p>
    </section>

    <section className="products-section" id="products">
      <SectionTitle sub="✨ Trending · নতুন পণ্য · জনপ্রিয় কালেকশন">আপনার জন্য</SectionTitle>
      <div className="product-toolbar"><div className="product-filters">{["সব পণ্য", "ছেলেদের জামা", "মেয়েদের জামা", "শীতের জামা"].map((label, i) => <button key={label} onClick={() => setCategory(["all","mens","womens","winter"][i])}>{label}</button>)}</div><span>{visibleProducts.length}টি পণ্য</span></div>
      <div className="product-grid">{visibleProducts.map((p) => <article className="product-card" key={p.name}>
        <div className={"product-art " + p.art}><span className="product-tag">{p.tag}</span><button aria-label="পছন্দের তালিকায় যোগ" className="heart" onClick={() => setFavorites((v) => v.includes(p.name) ? v.filter((x) => x !== p.name) : [...v, p.name])}>{favorites.includes(p.name) ? "♥" : "♡"}</button><div className="art-shape">{p.art === "shirt" ? "👕" : p.art === "shoe" ? "👟" : p.art === "audio" ? "🎧" : p.art === "laptop" ? "💻" : p.art === "watch" ? "⌚" : p.art === "bag" ? "🎒" : p.art === "cooker" ? "🍚" : "📱"}</div></div>
        <div className="product-info"><small>HubinBD Collection</small><b>{p.name}</b><div className="price-line"><strong>{p.price}</strong><del>{p.old}</del><i>-{p.discount}</i></div><div className="product-meta"><span>⭐ {p.rating}</span><small>{p.sold}</small><button aria-label="কার্টে যোগ করুন" onClick={() => setCart((v) => v + 1)}>🛒</button></div></div>
      </article>)}</div>
      {visibleProducts.length === 0 && <p className="empty-state">এই ক্যাটাগরিতে এখনো পণ্য যোগ করা হয়নি।</p>}
    </section>

    <section className="more-services"><SectionTitle>আরও সেবা এক নজরে</SectionTitle><div className="more-grid"><a className="rent-service" href="https://cars.hubinbd.com/" target="_blank" rel="noreferrer"><span>🚙 RENT A CAR · ২৪/৭</span><h3>ঢাকা থেকে বাংলাদেশের যেকোনো স্থানে</h3><b>যাত্রা শুরু ৳৫০০ টাকা থেকে</b><small>✓ নিরাপদ যাত্রা　 ✓ সহজ বুকিং</small><strong>গাড়ি বুক করুন →</strong></a><div className="mini-tools"><h3>🛠 অনলাইন টুলস</h3><p>৫০+ FREE TOOLS</p><div>{tools.map((t) => <a href={t[3]} key={t[1]}>{t[0]} {t[1]}</a>)}</div></div></div></section>

    <section className="stats"><div><b>৬০k+</b><span>সন্তুষ্ট কাস্টমার</span></div><div><b>১২k+</b><span>দৈনিক অর্ডার</span></div><div><b>৩৪</b><span>জেলায় ডেলিভারি</span></div><div><b>৪.৮/৫</b><span>গড় রেটিং</span></div></section>

    <footer className="footer"><div className="footer-brand"><b><i>H</i> hubinbd</b><p>বাংলাদেশের সহজ ও নির্ভরযোগ্য অনলাইন শপিং, সার্ভিস, টুলস, শিক্ষা ও কম্পিউটার ওয়ার্কের ঠিকানা।</p><span>●　▶　in</span></div><div><b>ই-কমার্স সেবা</b><a href="#products">ছেলেদের জামা</a><a href="#products">মেয়েদের জামা</a><a href="#products">শীতের জামা</a><a href="#products">জনপ্রিয় পণ্য</a></div><div><b>অনলাইন সেবা</b><a href="#tools">PDF Tools</a><a href="#tools">QR Maker</a><a href="#computer-work">কম্পিউটার ওয়ার্ক</a><a href="https://cars.hubinbd.com/">Rent a Car</a></div><div><b>যোগাযোগ</b><p>☎ 09613-xxxxxx</p><small>© 2025–2026 hubinbd.com · Made with ❤️ in Bangladesh</small></div></footer>

    <div className="bottom-bar"><a className="brand-mark" href="#"><i>H</i><b>hubinbd<small>HUB IN BANGLADESH</small></b></a><form className="search-box" onSubmit={(e) => { e.preventDefault(); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="খোঁজো, গাড়ি, টুলস খুঁজুন..." /><button>খুঁজুন</button></form><button className="location-button">♧ ঢাকা</button><button className="bar-icon" onClick={() => setCart((v) => v + 1)}>🛒<sup>{cart}</sup></button><button className="bar-icon" onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}>☰</button><button className="bar-icon" onClick={() => setLoginOpen(true)}>♙</button></div>

    {loginOpen && <div className="modal-backdrop" onClick={() => setLoginOpen(false)}><div className="login-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setLoginOpen(false)}>×</button><h2>HubinBD অ্যাকাউন্ট</h2><p>লগইন বা নতুন অ্যাকাউন্ট তৈরি করুন</p><form onSubmit={(e) => { e.preventDefault(); alert("লগইন সুবিধা Supabase Auth সংযোগের পর চালু হবে।"); }}><label>ইমেইল বা মোবাইল<input required placeholder="আপনার ইমেইল বা মোবাইল" /></label><label>পাসওয়ার্ড<input type="password" required placeholder="পাসওয়ার্ড" /></label><button className="login-submit">লগইন</button></form><small>নতুন ব্যবহারকারী? সাইন আপ সুবিধা Auth সংযোগের পর চালু হবে।</small></div></div>}
  </main>;
}
