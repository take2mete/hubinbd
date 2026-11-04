"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Role = "owner_admin" | "sub_admin" | "admin" | "vendor" | "customer" | null;
type Vendor = { user_id: string; business_name: string; contact_name: string; phone: string; address: string; status: string; submitted_at: string };

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const buttonClass = "w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60";
const panelClass = "w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8";

function message(error: unknown) {
  if (error && typeof error === "object") {
    const value = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [value.message, value.details, value.hint, value.code]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0);
    if (parts.length) return parts.join(" — ");
  }
  return error instanceof Error ? error.message : "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।";
}
function englishDigits(value: string) {
  return value.replace(/[০-৯]/g, digit => String("০১২৩৪৫৬৭৮৯".indexOf(digit)));
}

async function roleFor(userId: string): Promise<Role> {
  const { data: roleRow, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  const role = roleRow?.role as Role | undefined;
  if (role === "owner_admin" || role === "sub_admin" || role === "admin" || role === "vendor" || role === "customer") return role;
  const { data: vendor, error: vendorError } = await supabase.from("vendors").select("user_id").eq("user_id", userId).maybeSingle();
  if (vendorError) throw vendorError;
  return vendor ? "vendor" : null;
}
async function destinationFor(userId: string) {
  const role = await roleFor(userId);
  if (role === "owner_admin" || role === "sub_admin" || role === "admin") return "/admin";
  if (role === "vendor") return "/seller/dashboard";
  return "/";
}
function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900"><section className={panelClass}><Link href="/" aria-label="HubinBD home" className="text-sm font-bold text-blue-700">HubinBD</Link><h1 className="mt-5 text-2xl font-bold">{title}</h1><p className="mt-2 text-sm text-slate-600">{subtitle}</p><div className="mt-7">{children}</div></section></main>;
}
function AuthFields({ mode, seller = false, admin = false }: { mode: "login" | "register"; seller?: boolean; admin?: boolean }) {
  const router = useRouter(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState(""); const [phone,setPhone]=useState(""); const [address,setAddress]=useState(""); const [confirmPassword,setConfirmPassword]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [notice,setNotice]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");setNotice("");try{
    if(mode==="register"){if(password!==confirmPassword)throw new Error("পাসওয়ার্ড ও Confirm Password মিলছে না।");const {data,error:signUpError}=await supabase.auth.signUp({email,password,options:{data:{full_name:name.trim(),phone:englishDigits(phone).trim(),address:address.trim()}}});if(signUpError)throw signUpError;if(!data.session){setNotice("রেজিস্ট্রেশন হয়েছে। ইমেইল verification সম্পন্ন করে লগইন করুন।");return;}router.replace("/");return;}
    const {data,error:signInError}=await supabase.auth.signInWithPassword({email,password});if(signInError)throw signInError;
    const role=await roleFor(data.user.id);
    if(admin&&role!=="owner_admin"&&role!=="sub_admin"&&role!=="admin"){await supabase.auth.signOut();throw new Error("এই অ্যাকাউন্টের Admin অনুমতি নেই।");}
    if(seller&&role!=="vendor"){router.replace("/seller/register");return;}
    router.replace(admin?"/admin":seller?"/seller/dashboard":await destinationFor(data.user.id));
  }catch(err){setError(message(err));}finally{setBusy(false);}}
  return <form onSubmit={submit} className="space-y-4">
    {mode==="register"&&<label className="block text-sm font-medium">আপনার নাম<input required value={name} onChange={e=>setName(e.target.value)} className={inputClass+" mt-1.5"} autoComplete="name"/></label>}
    <label className="block text-sm font-medium">মোবাইল নম্বর<input required type="tel" value={phone} onChange={e=>setPhone(englishDigits(e.target.value))} className={inputClass+" mt-1.5"} autoComplete="tel"/></label>}
    {mode==="register"&&<label className="block text-sm font-medium">বাসার ঠিকানা<input required value={address} onChange={e=>setAddress(e.target.value)} className={inputClass+" mt-1.5"} autoComplete="street-address"/></label>}
    <label className="block text-sm font-medium">ইমেইল<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className={inputClass+" mt-1.5"} autoComplete="email"/></label>
    <label className="block text-sm font-medium">পাসওয়ার্ড<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} className={inputClass+" mt-1.5"} autoComplete={mode==="login"?"current-password":"new-password"}/></label>
    {mode==="register"&&<label className="block text-sm font-medium">Confirm Password<input required minLength={6} type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className={inputClass+" mt-1.5"} autoComplete="new-password"/></label>}
    {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    <button disabled={busy} className={buttonClass}>{busy?"অপেক্ষা করুন...":mode==="login"?"লগইন":"অ্যাকাউন্ট তৈরি করুন"}</button>
  </form>;
}
export function LoginPage({seller=false,admin=false}:{seller?:boolean;admin?:boolean}) {
  return <Shell title={admin?"Admin Login":seller?"Seller Login":"লগইন"} subtitle={admin?"শুধুমাত্র অনুমোদিত Admin অ্যাকাউন্ট প্রবেশ করতে পারবে।":seller?"আপনার Seller অ্যাকাউন্টে প্রবেশ করুন।":"আপনার HubinBD অ্যাকাউন্টে প্রবেশ করুন।"}>
    <AuthFields mode="login" seller={seller} admin={admin}/>
    {!seller&&!admin&&<p className="mt-5 text-center text-sm text-slate-600">নতুন এখানে? <Link className="font-semibold text-blue-700" href="/register">রেজিস্টার করুন</Link></p>}
    {seller&&<p className="mt-5 text-center text-sm text-slate-600">Seller অ্যাকাউন্ট নেই? <Link className="font-semibold text-blue-700" href="/seller/register">আবেদন করুন</Link></p>}
    <Link href="/" className="mt-5 block text-center text-sm text-slate-500">হোমপেজে ফিরে যান</Link>
  </Shell>;
}
export function RegisterPage(){return <Shell title="নতুন অ্যাকাউন্ট" subtitle="HubinBD-তে কেনাকাটা ও সেবা ব্যবহারের জন্য রেজিস্টার করুন।"><AuthFields mode="register"/><p className="mt-5 text-center text-sm text-slate-600">আগে থেকেই অ্যাকাউন্ট আছে? <Link href="/login" className="font-semibold text-blue-700">লগইন</Link></p></Shell>;}
export function SellerRegisterPage(){
  const [shop,setShop]=useState("");const [contact,setContact]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [phone,setPhone]=useState("");const [district,setDistrict]=useState("");const [upazila,setUpazila]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");setNotice("");try{
    const normalizedPhone=englishDigits(phone).trim();if(!normalizedPhone)throw new Error("মোবাইল নম্বর দিন।");
    const {data:signup,error:signupError}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:contact.trim()}}});if(signupError)throw signupError;
    if(!signup.user)throw new Error("অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    if(!signup.session){setNotice("অ্যাকাউন্ট তৈরি হয়েছে। আপনার ইমেইলে পাঠানো verification link-এ ক্লিক করুন। এরপর Seller Login করে একই দোকানের তথ্য দিয়ে আবেদন জমা দিন।");return;}
    const {data:existing,error:existingError}=await supabase.from("vendors").select("status").eq("user_id",signup.user.id).maybeSingle();if(existingError)throw existingError;
    if(existing){setNotice(existing.status==="approved"?"আপনার Seller অ্যাকাউন্ট অনুমোদিত।":"আপনার আবেদন আগে থেকেই জমা আছে। অনুমোদনের অপেক্ষায় থাকুন।");return;}
    const {error:insertError}=await supabase.from("vendors").insert({user_id:signup.user.id,business_name:shop.trim(),contact_name:contact.trim(),phone:normalizedPhone,address:[upazila.trim(),district.trim()].filter(Boolean).join(", "),status:"pending"});
    if(insertError)throw insertError;setNotice("অ্যাকাউন্ট ও Seller আবেদন তৈরি হয়েছে। Admin অনুমোদনের অপেক্ষায় থাকুন।");
  }catch(err){setError(message(err));}finally{setBusy(false);}}
  return <Shell title="Seller Registration" subtitle="অ্যাকাউন্ট তৈরি করে দোকানের তথ্য দিয়ে বিক্রেতা হওয়ার আবেদন করুন।"><form onSubmit={submit} className="space-y-4">
    <label className="block text-sm font-medium">আপনার নাম<input required value={contact} onChange={e=>setContact(e.target.value)} className={inputClass+" mt-1.5"} autoComplete="name"/></label>
    <label className="block text-sm font-medium">ইমেইল<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className={inputClass+" mt-1.5"} autoComplete="email"/></label>
    <label className="block text-sm font-medium">পাসওয়ার্ড<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} className={inputClass+" mt-1.5"} autoComplete="new-password"/></label>
    <label className="block text-sm font-medium">দোকানের নাম<input required value={shop} onChange={e=>setShop(e.target.value)} className={inputClass+" mt-1.5"}/></label>
    <label className="block text-sm font-medium">মোবাইল নম্বর<input required type="tel" value={phone} onChange={e=>setPhone(englishDigits(e.target.value))} className={inputClass+" mt-1.5"}/></label>
    <label className="block text-sm font-medium">জেলা<input required value={district} onChange={e=>setDistrict(e.target.value)} className={inputClass+" mt-1.5"}/></label>
    <label className="block text-sm font-medium">উপজেলা<input required value={upazila} onChange={e=>setUpazila(e.target.value)} className={inputClass+" mt-1.5"}/></label>
    {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    <button disabled={busy} className={buttonClass}>{busy?"অ্যাকাউন্ট তৈরি হচ্ছে...":"অ্যাকাউন্ট তৈরি ও আবেদন জমা দিন"}</button>
  </form><p className="mt-5 text-center text-sm text-slate-600">আগে থেকেই অ্যাকাউন্ট আছে? <Link href="/seller/login" className="font-semibold text-blue-700">Seller Login</Link></p></Shell>;
}
export function SellerDashboardPage(){
  const router=useRouter();const [loading,setLoading]=useState(true);const [vendor,setVendor]=useState<Vendor|null>(null);const [error,setError]=useState("");const [notice,setNotice]=useState("");const [name,setName]=useState("");const [description,setDescription]=useState("");const [price,setPrice]=useState("");const [category,setCategory]=useState("অন্যান্য");const [image,setImage]=useState("");const [stock,setStock]=useState("1");const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;(async()=>{try{const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace("/seller/login");return;}const {data:row,error:rowError}=await supabase.from("vendors").select("*").eq("user_id",user.id).maybeSingle();if(rowError)throw rowError;if(active)setVendor(row as Vendor|null);}catch(e){if(active)setError(message(e));}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[router]);
  async function addProduct(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");setNotice("");try{const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("আবার লগইন করুন।");const {error:insertError}=await supabase.from("products").insert({vendor_id:user.id,name:name.trim(),name_bn:name.trim(),description:description.trim(),price:Number(price),old_price:Number(price),stock:Number(stock),category,image_urls:image.trim()?[image.trim()]:[],is_active:true});if(insertError)throw insertError;setNotice("পণ্য যোগ হয়েছে।");setName("");setDescription("");setPrice("");setImage("");setStock("1");}catch(e){setError(message(e));}finally{setBusy(false);}}
  async function logout(){await supabase.auth.signOut();router.replace("/seller/login");}
  if(loading)return <main className="p-10 text-center text-slate-700">Dashboard লোড হচ্ছে...</main>;
  if(!vendor)return <main className="min-h-screen bg-slate-50 p-6 text-slate-900"><section className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow"><h1 className="text-2xl font-bold">Seller আবেদন পাওয়া যায়নি</h1><p className="mt-3 text-slate-600">প্রথমে Seller Registration সম্পন্ন করুন।</p><Link className="mt-5 inline-block text-blue-700" href="/seller/register">Seller Registration →</Link></section></main>;
  if(vendor.status!=="approved")return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 text-slate-900"><section className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl"><div className="text-4xl">⏳</div><h1 className="mt-4 text-2xl font-bold">Pending Approval</h1><p className="mt-3 text-slate-600">আপনার দোকান: {vendor.business_name}</p><p className="mt-2 text-slate-600">Admin আপনার আবেদন পর্যালোচনা করছেন। অনুমোদন হলে পণ্য যোগ করতে পারবেন।</p><button onClick={logout} className="mt-6 rounded-xl border border-slate-300 px-5 py-2.5">লগআউট</button></section></main>;
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900"><div className="mx-auto max-w-3xl"><header className="flex items-center justify-between"><div><p className="text-sm font-semibold text-blue-700">HubinBD Seller</p><h1 className="text-2xl font-bold">{vendor.business_name}</h1></div><button onClick={logout} className="rounded-xl border border-slate-300 bg-white px-4 py-2">লগআউট</button></header><section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold">নতুন পণ্য যোগ করুন</h2><form onSubmit={addProduct} className="mt-6 grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-medium sm:col-span-2">পণ্যের নাম<input required value={name} onChange={e=>setName(e.target.value)} className={inputClass+" mt-1.5"}/></label>
    <label className="text-sm font-medium sm:col-span-2">বিবরণ<textarea value={description} onChange={e=>setDescription(e.target.value)} className={inputClass+" mt-1.5"} rows={3}/></label>
    <label className="text-sm font-medium">দাম (৳)<input required min="1" type="number" value={price} onChange={e=>setPrice(e.target.value)} className={inputClass+" mt-1.5"}/></label>
    <label className="text-sm font-medium">স্টক<input required min="0" type="number" value={stock} onChange={e=>setStock(e.target.value)} className={inputClass+" mt-1.5"}/></label>
    <label className="text-sm font-medium">ক্যাটাগরি<input value={category} onChange={e=>setCategory(e.target.value)} className={inputClass+" mt-1.5"}/></label>
    <label className="text-sm font-medium">ছবির URL<input type="url" value={image} onChange={e=>setImage(e.target.value)} className={inputClass+" mt-1.5"}/></label>
    <div className="sm:col-span-2"><button disabled={busy} className={buttonClass}>{busy?"যোগ হচ্ছে...":"পণ্য প্রকাশ করুন"}</button></div>
  </form>{error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="mt-4 text-sm text-emerald-700">{notice}</p>}</section></div></main>;
}
export function AdminVendorsPage(){
  const router=useRouter();const [rows,setRows]=useState<Vendor[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [busyId,setBusyId]=useState<string|null>(null);
  async function load(){setError("");try{const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace("/admin/login");return;}const role=await roleFor(user.id);if(role!=="owner_admin"&&role!=="sub_admin"&&role!=="admin"){router.replace("/");return;}const {data,error:queryError}=await supabase.from("vendors").select("*").eq("status","pending").order("submitted_at",{ascending:true});if(queryError)throw queryError;setRows((data||[]) as Vendor[]);}catch(e){setError(message(e));}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  async function review(row:Vendor,status:"approved"|"rejected"){setBusyId(row.user_id);setError("");try{const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("লগইন সেশন শেষ হয়েছে।");const {error:updateError}=await supabase.from("vendors").update({status,reviewed_at:new Date().toISOString(),reviewed_by:user.id}).eq("user_id",row.user_id);if(updateError)throw updateError;setRows(current=>current.filter(item=>item.user_id!==row.user_id));}catch(e){setError(message(e));}finally{setBusyId(null);}}
  async function logout(){await supabase.auth.signOut();router.replace("/admin/login");}
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900"><div className="mx-auto max-w-5xl"><header className="flex items-center justify-between"><div><p className="font-semibold text-blue-700">HubinBD Admin</p><h1 className="text-2xl font-bold">Seller Approval</h1></div><button onClick={logout} className="rounded-xl border border-slate-300 bg-white px-4 py-2">লগআউট</button></header>
    {error&&<p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="mt-7 rounded-3xl bg-white p-5 shadow-sm sm:p-7"><h2 className="text-lg font-bold">Pending Applications ({rows.length})</h2>{loading?<p className="py-8 text-slate-500">লোড হচ্ছে...</p>:rows.length===0?<p className="py-8 text-slate-500">কোনো pending আবেদন নেই।</p>:<div className="mt-4 space-y-4">{rows.map(row=><article key={row.user_id} className="rounded-2xl border border-slate-200 p-4"><div className="grid gap-1 text-sm"><h3 className="text-base font-bold">{row.business_name}</h3><p>যোগাযোগ: {row.contact_name}</p><p>ফোন: {row.phone}</p><p>ঠিকানা: {row.address}</p><p className="text-slate-500">আবেদনের তারিখ: {new Date(row.submitted_at).toLocaleString("bn-BD")}</p></div><div className="mt-4 flex flex-wrap gap-2"><button disabled={busyId===row.user_id} onClick={()=>void review(row,"approved")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button><button disabled={busyId===row.user_id} onClick={()=>void review(row,"rejected")} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Reject</button></div></article>)}</div>}</section>
  </div></main>;
}
