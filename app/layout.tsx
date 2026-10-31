import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://hubinbd.vercel.app"),
  title: {
    default: "HubinBD — Bangladesh's Digital Hub",
    template: "%s | HubinBD",
  },
  description:
    "HubinBD-এর ফ্রি অনলাইন টুলস ব্যবহার করুন। বয়স হিসাব করুন, BMI জানুন—বাংলা ও ইংরেজি সাপোর্টসহ।",
  applicationName: "HubinBD",
  keywords: [
    "HubinBD",
    "Bangladesh digital hub",
    "age calculator",
    "বয়স ক্যালকুলেটর",
    "BMI calculator",
    "বাংলা অনলাইন টুলস",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "HubinBD — Bangladesh's Digital Hub",
    description: "Free, simple online tools in Bangla and English.",
    url: "https://hubinbd.vercel.app",
    siteName: "HubinBD",
    locale: "bn_BD",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body><Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />{children}</body>
    </html>
  );
}
