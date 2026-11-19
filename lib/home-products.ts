import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export type HomeProduct = {
  id: number;
  name: string;
  name_bn: string | null;
  image_urls: string[] | null;
  price: number | string;
  old_price: number | string | null;
  category: string;
  stock: number | null;
  sold: number | string | null;
  created_at: string;
  tag?: string | null;
};

export const getHomeProducts = unstable_cache(
  async (): Promise<HomeProduct[]> => {
    const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!configuredUrl || !key) return [];

    const url = configuredUrl.trim().replace(/\\/rest\\/v1\\/?$/i, "").replace(/\\/+$/, "");
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data, error } = await supabase
      .from("products")
      .select("id,name,name_bn,image_urls,price,old_price,category,stock,sold,created_at,tag")
      .eq("is_active", true)
      .eq("status", "Approved")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(24);

    if (error) {
      console.error("Homepage product query failed:", error.message);
      return [];
    }
    return (data ?? []) as HomeProduct[];
  },
  ["hubinbd-home-products-v1"],
  { revalidate: 60, tags: ["hubinbd-public-products"] },
);
