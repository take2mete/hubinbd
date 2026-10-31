"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { bannerDefaults } from "@/lib/banners";
import { supabase } from "@/lib/supabase/client";

export default function BannerManager() {
 const [items,setItems] = useState(bannerDefaults);
 const [email,setEmail] = useState("");
 const [ready,setReady] = useState(false);
 const [saving,setSaving] = useState(false);
 const [message,setMessage] = useState("");
 useEffect(() => { let live=true; (async()=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){if(live)setReady(true);return;}
  const {data:role}=await supabase.from("user_roles").select("role").eq("user_id",session.user.id).maybeSingle();
  if(!role || !["owner_admin","sub_admin"].includes(role.role)){await supabase.auth.signOut();if(live){setMessage("এই পেজ ব্যবহারের অনুমতি নেই।");setReady(true);}return;}
  const {data}=await supabase.from("banners").select("slot,image_url,link_url,title").order("slot");
  if(live){setEmail(session.user.email||"");if(data)setItems(bannerDefaults.map(b=>data.find(x=>x.slot===b.slot)||b));setReady(true);}
 })();return()=>{live=false;};},[]);
 async function login(form:FormData){const {error}=await supabase.auth.signInWithPassword({email:String(form.get("email")),password:String(form.get("password"))});if(error)setMessage(error.message);else window.location.reload();}
 async function upload(slot:number,file?:File){
  if(!file)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5242880){setMessage("JPG, PNG বা WebP ছবি দিন (সর্বোচ্চ ৫ MB)।");return;}
  const bitmap=await createImageBitmap(file);const width=slot===1?720:200;const height=slot===1?200:90;const valid=bitmap.width===width&&bitmap.height===height;bitmap.close();
  if(!valid){setMessage("Slot "+slot+": ছবির মাপ "+width+" × "+height+" px হতে হবে।");return;}
  const path="slot-"+slot+"-"+Date.now()+"."+file.name.split(".").pop();
  const {error}=await supabase.storage.from("banner-images").upload(path,file,{contentType:file.type});
  if(error){setMessage(error.message);return;}
  const {data}=supabase.storage.from("banner-images").getPublicUrl(path);
  setItems(old=>old.map(b=>b.slot===slot?{...b,image_url:data.publicUrl}:b));setMessage("ছবি আপলোড হয়েছে। পরিবর্তন প্রকাশ করতে Save চাপুন।");
 }
 async function save(){setSaving(true);const {error}=await supabase.from("banners").upsert(items.map(({slot,image_url,link_url,title})=>({slot,image_url,link_url,title})),{onConflict:"slot"});setSaving(false);setMessage(error?error.message:"সাতটি ব্যানার সংরক্ষণ হয়েছে।");}
 if(!ready)return <main className="p-8">লোড হচ্ছে…</main>;
 if(!email)return <main className="mx-auto max-w-md p-6 pt-16"><h1 className="text-2xl font-bold">Banner Admin Login</h1><form action={login} className="mt-6 grid gap-3"><input name="email" type="email" required placeholder="Admin email" className="rounded-xl border border-zinc-700 bg-zinc-900 p-3"/><input name="password" type="password" required placeholder="Password" className="rounded-xl border border-zinc-700 bg-zinc-900 p-3"/><button className="rounded-xl bg-[#ff6b00] p-3 font-bold">Login</button></form>{message&&<p role="status" className="mt-4 text-sm text-orange-300">{message}</p>}</main>;
 return <main className="mx-auto max-w-6xl p-5 sm:p-8"><header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-orange-400">HUBINBD / ADMIN</p><h1 className="text-3xl font-black">Banner Manager</h1><p className="text-sm text-zinc-400">{email}</p></div><button onClick={()=>supabase.auth.signOut().then(()=>window.location.reload())} className="rounded-xl border border-zinc-700 px-4 py-2">Logout</button></header>
 <div className="mt-7 grid gap-4 md:grid-cols-2">{items.map(item=><section key={item.slot} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"><h2 className="font-bold">Slot {item.slot} · {item.title}</h2><p className="text-xs text-zinc-400">{item.slot===1?"Exact size: 720 × 200 px":"Exact size: 200 × 90 px"}</p><div className={"relative mt-3 w-full overflow-hidden rounded-xl bg-zinc-800 "+(item.slot===1?"aspect-[18/5]":"aspect-[20/9]")}>{item.image_url&&<Image src={item.image_url} alt={item.title} fill unoptimized className="object-contain"/>}</div><label className="mt-3 block text-xs text-zinc-400">Image upload (JPG / PNG / WebP, max 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>upload(item.slot,e.target.files?.[0])} className="mt-2 w-full text-xs"/></label><label className="mt-3 block text-xs text-zinc-400">Link URL<input value={item.link_url} onChange={e=>setItems(old=>old.map(b=>b.slot===item.slot?{...b,link_url:e.target.value}:b))} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-sm"/></label></section>)}</div>
 <button disabled={saving} onClick={save} className="mt-6 rounded-xl bg-[#ff6b00] px-7 py-3 font-bold disabled:opacity-50">{saving?"Saving…":"Save all banners"}</button>{message&&<p role="status" className="mt-3 text-sm text-orange-300">{message}</p>}</main>;
}
