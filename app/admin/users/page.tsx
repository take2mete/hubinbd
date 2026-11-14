"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type UserRow = { user_id: string; email: string | null; role: string; created_at: string };

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const { data, error: loadError } = await supabase.rpc("admin_list_users");
    if (loadError) setError(loadError.message);
    else setRows((data || []) as UserRow[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function changeRole(userId: string, role: string) {
    setBusy(userId);
    setError("");
    const { error: roleError } = await supabase.rpc("admin_set_user_role", {
      p_user_id: userId,
      p_role: role,
    });
    if (roleError) setError(roleError.message);
    else await load();
    setBusy("");
  }

  async function deleteUser(row: UserRow) {
    const label = row.email || row.user_id;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ${label} অ্যাকাউন্টটি ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।`)) return;
    setBusy(row.user_id);
    setError("");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (sessionError || !token) {
      setError("আপনার লগইন সেশন পাওয়া যায়নি। আবার লগইন করুন।");
      setBusy("");
      return;
    }
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: row.user_id }),
      });
      const result = await response.json();
      if (!response.ok) setError(result.error || "অ্যাকাউন্ট ডিলিট করা যায়নি।");
      else await load();
    } catch {
      setError("সার্ভারের সঙ্গে যোগাযোগ করা যায়নি।");
    }
    setBusy("");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm text-blue-700">← Admin Dashboard</a>
        <h1 className="my-5 text-3xl font-black">ব্যবহারকারী ও রোল ব্যবস্থাপনা</h1>
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          শুধুমাত্র Owner Admin রোল পরিবর্তন ও অ্যাকাউন্ট ডিলিট করতে পারবেন। Owner Admin অ্যাকাউন্ট সুরক্ষার জন্য এখানে পরিবর্তন বা ডিলিট করা যাবে না। সেলার রোল দিতে হলে অনুমোদিত সেলার আবেদন থাকতে হবে।
        </p>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? <p className="rounded-xl bg-white p-5">লোড হচ্ছে…</p> : (
          <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100"><tr>
                <th className="p-3">ইমেইল</th><th className="p-3">বর্তমান রোল</th><th className="p-3">রোল পরিবর্তন</th><th className="p-3">অ্যাকশন</th>
              </tr></thead>
              <tbody>
                {rows.map((row) => {
                  const protectedRole = ["owner_admin", "admin", "sub_admin"].includes(row.role);
                  return <tr key={row.user_id} className="border-t">
                    <td className="p-3">{row.email || "—"}</td>
                    <td className="p-3 font-semibold">{row.role}</td>
                    <td className="p-3">
                      <select aria-label={row.email || "User role"} disabled={busy === row.user_id || row.role === "owner_admin"} value={row.role}
                        onChange={(event) => void changeRole(row.user_id, event.target.value)} className="rounded-lg border p-2">
                        <option value="customer">customer</option><option value="vendor">vendor (সেলার)</option>
                        <option value="admin">admin</option><option value="sub_admin">sub_admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button type="button" disabled={busy === row.user_id || protectedRole}
                        onClick={() => void deleteUser(row)}
                        className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">
                        {busy === row.user_id ? "অপেক্ষা করুন…" : "ডিলিট"}
                      </button>
                    </td>
                  </tr>;
                })}
                {rows.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">কোনো ব্যবহারকারী পাওয়া যায়নি।</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
