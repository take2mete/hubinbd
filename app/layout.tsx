import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import AffiliateReferralTracker from "@/components/affiliate-referral-tracker";
import DeferredAdPlacementRenderer from "@/components/deferred-ad-placement-renderer";

const hindSiliguri = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hubinbd.com"),
  title: { default: "HubinBD — বাংলাদেশের অনলাইন শপিং ও ডিজিটাল সার্ভিস", template: "%s | HubinBD" },
  description: "HubinBD-তে পোশাক, অনলাইন টুলস এবং কম্পিউটার ওয়ার্ক সার্ভিস খুঁজুন।",
  applicationName: "HubinBD",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "128x128" }],
    shortcut: ["/icon.png"],
    apple: [{ url: "/icon.png", type: "image/png", sizes: "128x128" }],
  },
  keywords: ["HubinBD", "Bangladesh online shopping", "অনলাইন শপিং", "PDF Tools", "Computer Work"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "HubinBD",
    description: "বাংলাদেশের অনলাইন শপিং ও ডিজিটাল সার্ভিস হাব।",
    url: "https://www.hubinbd.com",
    siteName: "HubinBD",
    locale: "bn_BD",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={hindSiliguri.variable}>
      <body>
        <AffiliateReferralTracker />
        <DeferredAdPlacementRenderer />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
