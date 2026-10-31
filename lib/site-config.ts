export type StoreCategory = {
  id: string;
  label: string;
  href: string;
};

/** Shared navigation metadata for the HubinBD storefront. */
export const storeCategories: StoreCategory[] = [
  { id: "mens", label: "ছেলেদের জামা", href: "/?category=mens" },
  { id: "womens", label: "মেয়েদের জামা", href: "/?category=womens" },
  { id: "winter", label: "শীতের জামা", href: "/?category=winter" },
  { id: "tools", label: "Tools", href: "/tools" },
  { id: "computer-work", label: "কম্পিউটার ওয়ার্ক", href: "/computer-work" },
];

export const externalDestinations = {
  rentACar: "https://cars.hubinbd.com/",
} as const;
