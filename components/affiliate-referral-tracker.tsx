"use client";
import {useEffect} from "react";
import {supabase} from "@/lib/supabase/client";
export default function AffiliateReferralTracker(){
 useEffect(()=>{let alive=true;const run=async()=>{const params=new URLSearchParams(window.location.search);const code=params.get("ref");if(!code)return;
 const {data,error}=await supabase.rpc("resolve_affiliate_referral",{p_code:code,p_landing_path:window.location.pathname});
 if(!alive||error||!Array.isArray(data)||!data[0]?.affiliate_id)return;
 const {data:settings}=await supabase.from("affiliate_settings").select("cookie_days,attribution_model,program_enabled").eq("id",true).maybeSingle();
 if(!settings?.program_enabled)return;
 const existing=document.cookie.split("; ").find(x=>x.startsWith("hubinbd_affiliate="))?.split("=").slice(1).join("=");
 if(settings.attribution_model==="first_click"&&existing)return;
 const payload=btoa(JSON.stringify({id:data[0].affiliate_id,code:data[0].affiliate_code,at:new Date().toISOString()}));
 const days=Math.max(1,Math.min(90,Number(settings.cookie_days)||30));
 document.cookie="hubinbd_affiliate="+encodeURIComponent(payload)+"; Max-Age="+(days*86400)+"; Path=/; SameSite=Lax; Secure";
 };
 void run();return()=>{alive=false}},[]);
 return null;
}
