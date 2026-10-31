import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HubinBD — বাংলাদেশের অনলাইন শপিং ও সেবা",
  description: "HubinBD online shopping, tools, computer services and rent a car",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body>{children}</body></html>;
}
