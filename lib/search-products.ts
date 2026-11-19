import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export type SearchProduct = {
  id: number;
  name: string;
  name_bn: string | null;
  price: number;
  image_urls: string[] | null;
  category: string;
};

const getCachedSearchProducts = unstable_cache(
  async (query: string, mainCategoryId: number, subCategoryId: number): Promise<SearchProduct[]> => {
    const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!configuredUrl || !key) throw new Error("Supabase public environment is not configured");
    const url = configuredUrl.trim().replace(/\\/rest\\/v1\\/?$/i, "").replace(/\\/+$/, "");
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    let request = supabase
      .from("products")
      .select("id,name,name_bn,image_urls,price,category")
      .eq("is_active", true)
      .eq("status", "Approved")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (query) {
      const safeQuery = query.replace(/[(),.%_*]/g, " ").replace(/\\s+/g, " ").trim().slice(0, 80);
      if (safeQuery) request = request.or("name.ilike.%"+safeQuery+"%,name_bn.ilike.%"+safeQuery+"%");
    }

    if (subCategoryId > 0) {
      request = request.eq("sub_category_id", subCategoryId);
    } else if (mainCategoryId > 0) {
      const { data: subs, error } = await supabase
        .from("sub_categories").select("id")
        .eq("main_category_id", mainCategoryId).eq("is_active", true);
      if (error) throw error;
      const ids = (subs || []).map((item) => item.id);
      if (!ids.length) return [];
      request = request.in("sub_category_id", ids);
    }

    const { data, error } = await request.range(0, 23);
    if (error) throw error;
    return (data || []) as unknown as SearchProduct[];
  },
  ["hubinbd-search-products-v1"],
  { revalidate: 30, tags: ["hubinbd-public-products"] },
);

export function getSearchProducts(query: string, mainCategoryId: number, subCategoryId: number) {
  return getCachedSearchProducts(query, mainCategoryId, subCategoryId);
}
