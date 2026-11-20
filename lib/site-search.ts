export type SiteSearchItem = { title: string; titleBn: string; description: string; keywords: string[]; href: string; type: "tool" | "service" | "page" };

export const siteSearchItems: SiteSearchItem[] = [
  { title: "PDF Tools", titleBn: "PDF টুলস", description: "PDF মার্জ, স্প্লিট, কমপ্রেস ও কনভার্ট", keywords: ["pdf", "পিডিএফ", "merge", "split", "compress", "convert"], href: "https://www.ilovepdf.com/", type: "tool" },
  { title: "QR Maker", titleBn: "QR কোড মেকার", description: "লিংক বা তথ্য থেকে QR কোড তৈরি", keywords: ["qr", "qr code", "কিউআর", "কিউআর কোড"], href: "https://www.qr-code-generator.com/", type: "tool" },
  { title: "Graphics", titleBn: "গ্রাফিক্স", description: "অনলাইনে পোস্ট, ব্যানার ও ডিজাইন তৈরি", keywords: ["graphics", "graphic", "গ্রাফিক্স", "design", "ডিজাইন", "canva"], href: "https://www.canva.com/", type: "tool" },
  { title: "Image Tools", titleBn: "ইমেজ টুলস", description: "ছবি কমপ্রেস, রিসাইজ ও কনভার্ট", keywords: ["image", "ছবি", "ইমেজ", "compress", "resize"], href: "https://www.iloveimg.com/", type: "tool" },
  { title: "Hisab Khata", titleBn: "হিসাব খাতা", description: "ব্যবসার আয়-ব্যয় ও লেনদেনের হিসাব", keywords: ["hisab", "খাতা", "হিসাব", "account", "ledger"], href: "https://docs.google.com/spreadsheets/", type: "tool" },
  { title: "Data Maker", titleBn: "ডাটা মেকার", description: "ডাটা টেবিল ও স্প্রেডশিট তৈরি", keywords: ["data", "ডাটা", "spreadsheet", "শিট", "excel"], href: "https://sheets.google.com/", type: "tool" },
  { title: "Age Calculator", titleBn: "বয়স ক্যালকুলেটর", description: "জন্মতারিখ থেকে বয়স হিসাব", keywords: ["age", "বয়স", "calculator", "ক্যালকুলেটর"], href: "/tools/age-calculator", type: "tool" },
  { title: "BMI Calculator", titleBn: "BMI ক্যালকুলেটর", description: "উচ্চতা ও ওজন দিয়ে BMI হিসাব", keywords: ["bmi", "body mass", "ওজন", "উচ্চতা"], href: "/tools/bmi-calculator", type: "tool" },
  { title: "Logo Design", titleBn: "লোগো ডিজাইন", description: "ব্যবসা বা ব্র্যান্ডের জন্য লোগো ডিজাইন সার্ভিস", keywords: ["logo", "লোগো", "design", "ডিজাইন"], href: "/computer-work", type: "service" },
  { title: "Graphics Design", titleBn: "গ্রাফিক্স ডিজাইন", description: "সোশ্যাল মিডিয়া পোস্ট, ব্যানার ও ফ্লায়ার", keywords: ["graphics", "গ্রাফিক্স", "banner", "ব্যানার"], href: "/computer-work", type: "service" },
  { title: "Document Work", titleBn: "ডকুমেন্ট ও টাইপিং", description: "বাংলা-ইংরেজি টাইপিং ও PDF প্রস্তুত", keywords: ["document", "ডকুমেন্ট", "typing", "টাইপিং", "pdf"], href: "/computer-work", type: "service" },
  { title: "Data Entry", titleBn: "ডাটা এন্ট্রি", description: "ডাটা এন্ট্রি, স্প্রেডশিট ও রিপোর্ট", keywords: ["data entry", "ডাটা এন্ট্রি", "report", "রিপোর্ট"], href: "/computer-work", type: "service" },
  { title: "Clothing", titleBn: "জামা-কাপড়", description: "ছেলে, মেয়ে ও বাচ্চাদের পোশাক", keywords: ["clothing", "জামা", "কাপড়", "ছেলে", "মেয়ে", "বাচ্চা"], href: "/clothing", type: "page" },
  { title: "Computer Work", titleBn: "কম্পিউটার ওয়ার্ক", description: "ডিজাইন, ডাটা ও ডকুমেন্ট সার্ভিস", keywords: ["computer", "কম্পিউটার", "work", "সার্ভিস"], href: "/computer-work", type: "page" },
  { title: "Online Tools", titleBn: "অনলাইন টুলস", description: "HubinBD-এর ডিজিটাল টুলস", keywords: ["tools", "tool", "টুলস", "টুল"], href: "/tools", type: "page" },
];

export function findSiteSearchItems(query: string) {
  const normalize = (value: string) => value.toLocaleLowerCase().normalize("NFKC").replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit))).replace(/[^\\p{L}\\p{N}]+/gu, " ").trim();
  const q = normalize(query);
  if (!q) return [];
  return siteSearchItems.filter((item) => normalize([item.title, item.titleBn, item.description, ...item.keywords].join(" ")).includes(q) || q.split(" ").every((part) => normalize([item.title, item.titleBn, item.description, ...item.keywords].join(" ")).includes(part)));
}
