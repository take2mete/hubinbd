import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hubinbd.com"),
  title: { default: "HubinBD — বাংলাদেশের অনলাইন শপিং ও ডিজিটাল সার্ভিস", template: "%s | HubinBD" },
  description: "HubinBD-তে পোশাক, অনলাইন টুলস এবং কম্পিউটার ওয়ার্ক সার্ভিস খুঁজুন।",
  applicationName: "HubinBD",
  keywords: ["HubinBD", "Bangladesh online shopping", "অনলাইন শপিং", "PDF Tools", "Computer Work"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", title: "HubinBD", description: "বাংলাদেশের অনলাইন শপিং ও ডিজিটাল সার্ভিস হাব।", url: "https://www.hubinbd.com", siteName: "HubinBD", locale: "bn_BD" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body>{children}</body></html>;
}
