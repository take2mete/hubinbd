import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HubinBD — বাংলাদেশের অনলাইন শপিং",
  description: "HubinBD online shopping and services",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body>{children}</body></html>;
}
