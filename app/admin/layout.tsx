"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
type GateState = "checking" | "allowed" | "denied";
const subAdminRoutes = ["/admin", "/admin/business", "/admin/sales-reports", "/admin/analytics"];
const ownerOnlyRoutes = ["/admin/monitoring", "/admin/security", "/admin/audit-logs", "/admin/users", "/admin/finance", "/admin/affiliates", "/admin/expenses"];
export default function AdminLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const [state,setState] = useState<GateState>("checking");
 const [message,setMessage] = useState("");
 useEffect(() => {
  let active = true;
  if (pathname === "/admin/login") { setState("allowed"); return () => { active=false; }; }
  async function verifyAccess() {
   setState("checking");
   const {data:{user},error:authError}=await supabase.auth.getUser();
   if(!active)return;
   if(authError||!user){window.location.replace("/admin/login");return;}
   const {data:roleRow,error:roleError}=await supabase.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
   if(!active)return;
   if(roleError||!roleRow||!["owner_admin","admin","sub_admin"].includes(roleRow.role)){setMessage("এই পেজ ব্যবহারের জন্য Admin অনুমতি প্রয়োজন।");setState("denied");return;}
   if(roleRow.role==="sub_admin"&&!subAdminRoutes.includes(pathname)){setMessage("Sub-admin শুধু Business Dashboard, Sales Reports ও Website Analytics দেখতে পারবেন।");setState("denied");return;}
   if(roleRow.role!=="owner_admin"&&ownerOnlyRoutes.includes(pathname)){setMessage("এই বিভাগটি শুধু Owner Admin-এর জন্য সংরক্ষিত।");setState("denied");return;}
   setState("allowed");
  }
  void verifyAccess();
  return()=>{active=false;};
 },[pathname]);
 if(state==="checking")return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-600">Admin অনুমতি যাচাই হচ্ছে…</main>;
 if(state==="denied")return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><section className="max-w-md rounded-2xl border bg-white p-6 shadow-sm"><h1 className="text-xl font-black text-slate-900">প্রবেশাধিকার নেই</h1><p className="mt-2 text-sm text-slate-600">{message}</p><a href="/admin" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Admin Dashboard</a></section></main>;
 return <>{children}</>;
}