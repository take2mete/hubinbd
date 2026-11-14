import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    // Match the browser client: Supabase auth requires the project root URL,
    // not a REST endpoint such as /rest/v1.
    const url = configuredUrl.replace(/\\/rest\\/v1\\/?$/, "").replace(/\\/+$/, "");
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
    const userId = body.userId.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return NextResponse.json({ error: "সঠিক ইউজার নির্বাচন করুন।" }, { status: 400 });
    }
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
    if (["owner_admin", "admin", "sub_admin"].includes(targetRole?.role || "")) {
      return NextResponse.json({ error: "Admin/Owner Admin অ্যাকাউন্ট এই পেজ থেকে ডিলিট করা যাবে না।" }, { status: 403 });
    }

    // Preserve order and financial history for both seller and customer accounts.
    const { count: orderCount, error: ordersError } = await adminClient
      .from("orders")
      .select("id", { count: "exact", head: true })
      .or(`seller_id.eq.${userId},customer_id.eq.${userId}`);

    if (ordersError) {
      return NextResponse.json({ error: "অর্ডার ইতিহাস যাচাই করা যায়নি: " + ordersError.message }, { status: 500 });
    }
    if ((orderCount || 0) > 0) {
      return NextResponse.json(
        { error: "এই অ্যাকাউন্টের সঙ্গে অর্ডার যুক্ত আছে। অর্ডার ইতিহাস অক্ষত রাখতে ডিলিট করা যাবে না।" },
        { status: 409 },
      );
    }

    const { count: payoutCount, error: payoutsError } = await adminClient
      .from("payouts")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", userId);

    if (payoutsError) {
      return NextResponse.json({ error: "পেমেন্ট ইতিহাস যাচাই করা যায়নি: " + payoutsError.message }, { status: 500 });
    }
    if ((payoutCount || 0) > 0) {
      return NextResponse.json(
        { error: "এই সেলারের পেআউট/কমিশন রেকর্ড আছে। আর্থিক ইতিহাস সংরক্ষণের জন্য ডিলিট করা যাবে না।" },
        { status: 409 },
      );
    }

    const { count: voucherCount, error: vouchersError } = await adminClient
      .from("vouchers")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", userId);

    if (vouchersError) {
      return NextResponse.json({ error: "ভাউচার রেকর্ড যাচাই করা যায়নি: " + vouchersError.message }, { status: 500 });
    }
    if ((voucherCount || 0) > 0) {
      return NextResponse.json(
        { error: "এই সেলারের ভাউচার রেকর্ড আছে। রেকর্ড অক্ষত রাখতে ডিলিট করা যাবে না।" },
        { status: 409 },
      );
    }

    // Remove referencing rows first; only proceed to Auth deletion if each step succeeds.
    const { error: vendorDeleteError } = await adminClient.from("vendors").delete().eq("user_id", userId);
    if (vendorDeleteError) {
      return NextResponse.json({ error: "সেলার রেকর্ড মুছতে সমস্যা হয়েছে: " + vendorDeleteError.message }, { status: 409 });
    }

    const { error: roleDeleteError } = await adminClient.from("user_roles").delete().eq("user_id", userId);
    if (roleDeleteError) {
      return NextResponse.json({ error: "ইউজার রোল মুছতে সমস্যা হয়েছে: " + roleDeleteError.message }, { status: 409 });
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      return NextResponse.json(
        { error: "অ্যাকাউন্ট ডিলিট হয়নি: " + deleteAuthError.message },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "অজানা সার্ভার সমস্যা";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
