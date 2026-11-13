export type Banner = { id?: number; slot: number; image_url: string; link_url: string; title: string; created_at?: string };

const storageBase = "https://rgplfsmxkarqnlwwaowd.supabase.co/storage/v1/object/public/site-assets";

export const bannerDefaults: Banner[] = [
  {
    slot: 101,
    image_url: `${storageBase}/Untitled-2.jpg`,
    link_url: "https://cars.hubinbd.com/",
    title: "অনলাইন রেন্ট এ কার",
  },
  {
    slot: 102,
    image_url: `${storageBase}/Service.png`,
    link_url: "/computer-work",
    title: "HubinBD Services",
  },
  {
    slot: 103,
    image_url: `${storageBase}/Tools.png`,
    link_url: "/tools",
    title: "HubinBD Tools",
  },
];
