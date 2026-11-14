import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration missing: Supabase admin key is not configured." },
        { status: 503 },
      );
    }

    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) {
      return NextResponse.json({ error: "অনুমোদিত সেশন পাওয়া যায়নি।" }, { status: 401 });
    }

    const publicClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await publicClient.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "লগইন সেশনটি বৈধ নয়।" }, { status: 401 });
    }

    const adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: actorRole, error: actorRoleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (actorRoleError || actorRole?.role !== "owner_admin") {
      return NextResponse.json({ error: "শুধু Owner Admin এই কাজ করতে পারবেন।" }, { status: 403 });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("userId" in body) || typeof body.userId !== "string") {
      return NextResponse.json({ error: "সঠিক ইউজার নির্বাচন করুন।" }, { status: 400 });
    }
    const userId = body.userId;

    if (userId === authData.user.id) {
      return NextResponse.json({ error: "নিজের অ্যাকাউন্ট ডিলিট করা যাবে না।" }, { status: 400 });
    }

    const { data: targetRole, error: targetRoleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (targetRoleError) {
      return NextResponse.json({ error: targetRoleError.message }, { status: 500 });
    }
    if (targetRole?.role === "owner_admin" || targetRole?.role === "admin" || targetRole?.role === "sub_admin") {
      return NextResponse.json({ error: "Admin/Owner Admin অ্যাকাউন্ট এই পেজ থেকে ডিলিট করা যাবে না।" }, { status: 403 });
    }

    const { count: sellerOrderCount, error: ordersError } = await adminClient
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", userId);

    if (ordersError) {
      return NextResponse.json({ error: "সেলারের অর্ডার যাচাই করা যায়নি: " + ordersError.message }, { status: 500 });
    }
    if ((sellerOrderCount || 0) > 0) {
      return NextResponse.json(
        { error: "এই সেলারের অর্ডার ইতিহাস আছে। অর্ডার রেকর্ড অক্ষত রাখতে অ্যাকাউন্টটি ডিলিট করা যাচ্ছে না। আগে সেলার অ্যাকাউন্ট নিষ্ক্রিয়/রোল পরিবর্তন করুন।" },
        { status: 409 },
      );
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      return NextResponse.json(
        { error: "অ্যাকাউন্ট ডিলিট হয়নি: " + deleteAuthError.message },
        { status: 409 },
      );
    }

    // These records are not guaranteed to cascade from auth.users in this project.
    await adminClient.from("vendors").delete().eq("user_id", userId);
    await adminClient.from("user_roles").delete().eq("user_id", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "অজানা সার্ভার সমস্যা";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
