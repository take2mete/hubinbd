import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

type PublicProduct = {
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
  sub_category_id?: number | null;
};

const cachedPublicProducts = unstable_cache(
  async (cacheKey: string): Promise<PublicProduct[]> => {
    const params = new URLSearchParams(cacheKey);
    const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!configuredUrl || !key) throw new Error("Supabase public environment is not configured");
    // Supabase createClient expects the project root URL, not a URL already
    // ending in /rest/v1. Normalize both forms to prevent /rest/v1/rest/v1.
    const url = configuredUrl.trim().replace(/\\/rest\\/v1\\/?$/i, "").replace(/\\/+$/, "");

    // Use only the public anon key. RLS remains the source of authorization;
    // this endpoint never uses service_role or returns private seller/customer data.
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const mode = params.get("mode") || "home";
    const offset = Math.max(0, Number(params.get("offset") || 0));
    const limit = Math.min(1000, Math.max(1, Number(params.get("limit") || 24)));
    const query = (params.get("q") || "").trim();
    const category = params.get("category") || "all";
    const subCategoryId = Number(params.get("sub_category_id") || 0);
    const mainCategoryId = Number(params.get("main_category_id") || 0);

    const columns = mode === "search"
      ? "id,name,name_bn,image_urls,price,category,created_at"
      : "id,name,name_bn,image_urls,price,old_price,category,stock,sold,created_at,tag,sub_category_id";

    let request = supabase
      .from("products")
      .select(columns)
      .eq("is_active", true)
      .eq("status", "Approved")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (mode === "search") {
      if (query) {
        // Remove PostgREST filter syntax characters from user input.
        const safeQuery = query.replace(/[(),.%_*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
        if (safeQuery) request = request.or("name.ilike.%"+safeQuery+"%,name_bn.ilike.%"+safeQuery+"%");
      }
      if (category === "clothing") request = request.ilike("category", "%জামা%");
      if (subCategoryId > 0 && Number.isSafeInteger(subCategoryId)) {
        request = request.eq("sub_category_id", subCategoryId);
      } else if (mainCategoryId > 0 && Number.isSafeInteger(mainCategoryId)) {
        const { data: subs, error: subError } = await supabase
          .from("sub_categories").select("id")
          .eq("main_category_id", mainCategoryId).eq("is_active", true);
        if (subError) throw subError;
        const ids = (subs || []).map((item) => item.id);
        if (!ids.length) return [];
        request = request.in("sub_category_id", ids);
      }
    }

    const { data, error } = await request.range(offset, offset + limit - 1);
    if (error) throw error;
    // Supabase's select() parser cannot infer a literal row type from the
    // conditional column list above. The selected columns are defined here.
    return (data || []) as unknown as PublicProduct[];
  },
  ["hubinbd-public-products-v1"],
  { revalidate: 30, tags: ["hubinbd-public-products"] },
);

export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  const source = request.nextUrl.searchParams;
  for (const key of ["mode", "q", "category", "main_category_id", "sub_category_id", "offset", "limit"]) {
    const value = source.get(key);
    if (value !== null) params.set(key, value);
  }
  const mode = params.get("mode") || "home";
  if (!["home", "clothing", "search"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  const offset = Number(params.get("offset") || 0);
  const limit = Number(params.get("limit") || (mode === "search" ? 60 : mode === "home" ? 1000 : 24));
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
    return NextResponse.json({ error: "Invalid pagination" }, { status: 400 });
  }
  params.sort();
  try {
    const data = await cachedPublicProducts(params.toString());
    return NextResponse.json({ data }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Public products are temporarily unavailable" }, { status: 503 });
  }
}
