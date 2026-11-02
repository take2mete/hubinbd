import { createClient } from "@supabase/supabase-js";

// Supabase expects the project URL, not its REST endpoint. Normalize values
// in case the Vercel environment variable was accidentally saved with /rest/v1.
const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const url = configuredUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-publishable-key";

export const supabase = createClient(url, key);
