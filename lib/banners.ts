export type Banner = { id?: number; slot: number; image_url: string; link_url: string; title: string; created_at?: string };

const storageBase = "https://rgplfsmxkarqnlwwaowd.supabase.co/storage/v1/object/public/banner-images/home-banners";

export const bannerDefaults: Banner[] = [
  {
    slot: 101,
    image_url: `${storageBase}/slot-101-1794567342144.webp`,
    link_url: "https://cars.hubinbd.com/",
    title: "অনলাইন রেন্ট এ কার",
  },
  {
    slot: 102,
    image_url: `${storageBase}/slot-102-1794567322310.webp`,
    link_url: "/computer-work",
    title: "HubinBD Services",
  },
  {
    slot: 103,
    image_url: `${storageBase}/slot-103-1794567303257.webp`,
    link_url: "/tools",
    title: "HubinBD Tools",
  },
];
