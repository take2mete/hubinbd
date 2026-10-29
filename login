"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import RegisterForm from "@/components/auth/RegisterForm";

type Mode = "login" | "register" | "forgot" | "reset";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tripId, setTripId] = useState("TRIP ID: #BD-2026-XXXX");
  const redirecting = useRef(false);

  useEffect(() => {
    setTripId(`TRIP ID: #BD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    if (new URLSearchParams(window.location.search).get("tab") === "register") setMode("register");
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "PASSWORD_RECOVERY") setMode("reset");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const redirectByRole = async (userId: string) => {
    if (redirecting.current) return;
    redirecting.current = true;
    try {
      const { data: p, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (error) throw error;
      const role = String(p?.role || "").trim().toLowerCase().replaceAll(".", "_").replaceAll("-", "_").replaceAll(" ", "_");
      const destination = role === "passenger" ? "/pdb" : role === "user" ? "/pdb" : role === "driver" ? "/ddb" : role === "admin_cnt" || role === "admin.cnt" ? "/admin/cnt" : role === "admin_acu" || role === "admin.acu" ? "/cdb" : role === "admin_sub" || role === "sub" || role === "sub_admin" || role === "admin.sub" ? "/admin/cnt" : role === "admin" ? "/adsystem" : null;
      if (destination) window.location.replace(destination);
      else { setMessage("আপনার account role সঠিকভাবে পাওয়া যায়নি।"); redirecting.current = false; setLoading(false); }
    } catch (err: any) { setMessage(err?.message || "Dashboard নির্ধারণ করা যায়নি।"); redirecting.current = false; setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage(""); setSuccess(false);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (!data.user) throw new Error("User পাওয়া যায়নি");
      await redirectByRole(data.user.id);
    } catch (err: any) { setMessage(err.message); setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try { const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }); if (error) throw error; setSuccess(true); setMessage("✅ রিসেট লিংক ইমেইলে পাঠানো হয়েছে"); }
    catch (err: any) { setMessage(err.message); } finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); if (newPass.length < 6) return setMessage("৬ অক্ষর হতে হবে"); if (newPass !== confirmPass) return setMessage("মিলছে না"); setLoading(true);
    try { const { error } = await supabase.auth.updateUser({ password: newPass }); if (error) throw error; setSuccess(true); setMessage("✅ সফল!"); setTimeout(() => setMode("login"), 1500); }
    catch (err: any) { setMessage(err.message); } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#f8f6f3] flex relative overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap'); *{font-family:'Inter',system-ui,sans-serif}.mono{font-family:'JetBrains Mono',monospace}`}</style>
      <div className="hidden md:block pointer-events-none absolute left-[-4vw] top-[18%] text-[62vw] md:text-[42vw] font-[900] leading-none tracking-[-0.08em] text-black/[0.04] select-none">985</div>
      <div className="hidden md:flex absolute top-0 left-0 right-0 p-6 md:p-8 justify-between mono text-[11px] tracking-[0.18em] font-bold text-black/60 z-10"><span>TRIP METER / 06</span><span className="hidden md:inline">LIVE ODOMETER — 985 KM</span></div>
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1440px] mx-auto pt-0">
        <div className="hidden md:flex flex-1 px-6 md:px-12 lg:px-16 py-8 md:py-0 flex-col justify-center relative z-10"><div className="max-w-[520px]"><div className="mono text-[11px] font-bold tracking-[0.2em] text-black/40 flex items-center gap-3"><span className="w-6 h-[1px] bg-black/20"/> EVERY KILOMETER COUNTS.</div><h1 className="mt-5 text-[44px] md:text-[76px] lg:text-[88px] font-[900] leading-[0.85] tracking-[-0.05em] text-[#0a0a0a]">Every<br/>kilometer<br/>counts.</h1><div className="mt-10 flex items-center gap-4"><span className="mono text-[11px] font-bold tracking-[0.18em] text-black">LIVE ODOMETER</span><span className="h-[1px] w-24 md:w-40 bg-black/20"/><span className="mono text-[11px] font-bold text-black/30">985 KM</span></div></div><div className="absolute bottom-6 left-6 md:left-12 lg:left-16 mono text-[10px] font-bold tracking-widest flex items-center gap-2 px-3.5 py-2 rounded-full bg-black text-white shadow-lg"><span className="w-1.5 h-1.5 rounded-full bg-[#FFD60A] animate-pulse"/> ENGINE IDLE • 985 RPM</div></div>
        <div className="flex-1 px-4 md:px-8 py-4 md:py-0 flex items-center justify-center relative z-20"><div className="w-full max-w-[460px] bg-[#101010] rounded-[28px] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)] border border-white/[0.06] p-[22px]">
          <div className="flex items-center gap-2"><div className="h-9 w-9 rounded-[12px] bg-white/[0.08] border border-white/[0.08] grid place-items-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div className="h-9 w-9 rounded-[12px] bg-white/[0.08] border border-white/[0.08] grid place-items-center text-white/70"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg></div></div>
          {(mode === "login" || mode === "register") && <div className="mb-5 grid grid-cols-2 gap-1 rounded-[14px] bg-white/[0.06] p-1 border border-white/[0.08]">
            <button type="button" onClick={() => { setMode("login"); setMessage(""); }} className={`h-10 rounded-[10px] text-[11px] font-extrabold tracking-[0.08em] transition-all ${mode === "login" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>LOGIN</button>
            <button type="button" onClick={() => { setMode("register"); setMessage(""); }} className={`h-10 rounded-[10px] text-[11px] font-extrabold tracking-[0.08em] transition-all ${mode === "register" ? "bg-[#FFD60A] text-black" : "text-white/40 hover:text-white"}`}>REGISTRATION</button>
          </div>}
          {mode === "login" && <><div className="mt-2"><h2 className="text-[22px] font-[800] tracking-tight text-white">Access Portal</h2><p className="mono text-[11px] text-white/40 mt-1">LICENSED RENTAL • SECURE ENTRY</p></div><form onSubmit={handleLogin} className="space-y-4"><div><label className="mono text-[10px] font-bold tracking-[0.14em] text-white/50">LICENSE EMAIL</label><div className="mt-2 relative flex items-center bg-white rounded-[14px] h-[50px] px-1.5 shadow-inner"><input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="ops.driver" className="flex-1 bg-transparent px-3 text-[14px] font-medium outline-none placeholder:text-black/30"/><span className="mono text-[11px] font-bold bg-[#FFD60A] text-black px-3.5 py-2 rounded-[10px]">@TRIPBD</span></div></div><div><div className="flex justify-between items-center"><label className="mono text-[10px] font-bold tracking-[0.14em] text-white/50">IGNITION CODE</label><button type="button" onClick={() => setMode("forgot")} className="mono text-[10px] font-bold text-white/30 underline">FORGOT?</button></div><div className="mt-2 relative"><input value={password} onChange={e => setPassword(e.target.value)} required type={showPassword ? "text" : "password"} placeholder="••••••••••••" className="w-full h-[50px] rounded-[14px] bg-[#1c1c1c] border border-white/[0.08] px-4 pr-12 text-[14px] text-white outline-none focus:border-white/20 placeholder:text-white/20"/><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg grid place-items-center text-white/50 hover:text-white"><span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>{message && <div className={`rounded-[12px] px-3 py-2 mono text-[11px] font-bold border ${success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-300"}`}>{message}</div>}<button disabled={loading} className="w-full h-[52px] rounded-[14px] bg-[#FFD60A] text-black text-[13px] font-[800] tracking-[0.06em] flex items-center justify-center gap-2 hover:bg-[#ffd84d] active:scale-[0.98] transition-all">{loading ? "IGNITING..." : "START TRIP →"}</button></form><div className="mt-5 grid grid-cols-3 gap-2 mono text-[9px] font-bold tracking-widest text-white/30 border-t border-white/[0.06] pt-4"><div><span className="text-white/50">FUEL</span> 82%</div><div><span className="text-white/50">MODE</span> ECO</div><div><span className="text-white/50">GEAR</span> P</div></div><div className="mt-3 flex justify-between mono text-[10px] text-white/25"><span suppressHydrationWarning>{tripId}</span><span>v3.1 • SSL</span></div><p className="mt-4 text-center text-[12px] text-white/30">নতুন account? <button type="button" onClick={() => setMode("register")} className="font-bold text-white underline">Registration</button></p></>}
          {mode === "register" && <><div className="mt-2"><h2 className="text-[22px] font-[800] tracking-tight text-white">Create account</h2><p className="mono text-[11px] text-white/40 mt-1">REGISTER • SECURE ENTRY</p></div><RegisterForm onRegistered={() => setMode("login")} /><p className="mt-5 text-center text-[12px] text-white/30">অ্যাকাউন্ট আছে? <button type="button" onClick={() => setMode("login")} className="font-bold text-white underline">লগইন করুন</button></p></>}
          {mode === "forgot" && <form onSubmit={handleForgot} className="space-y-4 mt-2"><h2 className="text-[20px] font-bold text-white">Reset Ignition</h2><p className="mono text-[11px] text-white/40">Enter email to receive reset link</p><div className="mt-2 flex items-center bg-white rounded-[14px] h-[50px] px-1.5"><input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="you@tripbd.com" className="flex-1 bg-transparent px-3 text-[14px] outline-none"/><span className="mono text-[11px] font-bold bg-black text-white px-3 py-2 rounded-[10px]">RESET</span></div>{message && <div className="rounded-[12px] bg-white/10 border border-white/10 p-2 text-[11px] font-bold text-white text-center">{message}</div>}<button disabled={loading} className="w-full h-[52px] rounded-[14px] bg-[#FFD60A] text-black font-bold">{loading ? "Sending..." : "Send Reset Link"}</button><button type="button" onClick={() => setMode("login")} className="w-full h-[44px] rounded-[14px] border border-white/10 text-white/60 mono text-[11px] font-bold">← Back to ignition</button></form>}
          {mode === "reset" && <form onSubmit={handleReset} className="space-y-3 mt-2"><h2 className="text-[20px] font-bold text-white">New Ignition Code</h2><div className="relative"><input value={newPass} onChange={e => setNewPass(e.target.value)} type={showNewPass ? "text" : "password"} required placeholder="New password" className="w-full h-[50px] rounded-[14px] bg-[#1c1c1c] border border-white/10 px-4 pr-12 text-white outline-none"/><button type="button" onClick={() => setShowNewPass(v => !v)} aria-label={showNewPass ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center text-white/50 hover:text-white">{showNewPass ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><div className="relative"><input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} type={showConfirmPass ? "text" : "password"} required placeholder="Confirm password" className="w-full h-[50px] rounded-[14px] bg-[#1c1c1c] border border-white/10 px-4 pr-12 text-white outline-none"/><button type="button" onClick={() => setShowConfirmPass(v => !v)} aria-label={showConfirmPass ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center text-white/50 hover:text-white">{showConfirmPass ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{message && <div className="rounded-[12px] bg-white/10 p-2 text-[11px] text-white text-center">{message}</div>}<button className="w-full h-[52px] rounded-[14px] bg-[#FFD60A] text-black font-bold">Update Password</button><button type="button" onClick={() => setMode("login")} className="w-full h-[44px] rounded-[14px] border border-white/10 text-white/60 mono text-[11px] font-bold">← Back</button></form>}
        </div></div>
      </div>
      <div className="hidden md:flex absolute bottom-0 left-0 right-0 h-8 bg-black text-white/40 mono text-[10px] font-bold tracking-widest items-center justify-center gap-6"><span>● SSL SECURE</span><span>● BKASH/NAGAD</span><span>● 24/7 SUPPORT</span><span className="ml-auto pr-8">6.8KB • LCP 0.6s • OD-METER UI</span></div>
    </main>
  );
}
