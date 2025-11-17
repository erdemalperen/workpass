import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["success", "info", "alert", "offer"] as const;
type NotificationType = (typeof ALLOWED_TYPES)[number];

const normalizeType = (type?: string | null): NotificationType => {
  if (!type) return "info";
  const lowered = type.toLowerCase();
  if (lowered === "warning" || lowered === "error") return "alert";
  return (ALLOWED_TYPES.includes(lowered as NotificationType)
    ? lowered
    : "info") as NotificationType;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminProfile) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      businessIds,
      title,
      message,
      type,
    } = body as { businessIds?: string[]; title?: string; message?: string; type?: string };

    const ids = (businessIds ?? []).filter(Boolean);
    if (!ids.length) {
      return NextResponse.json(
        { success: false, error: "At least one businessId is required" },
        { status: 400 },
      );
    }

    const trimmedTitle = (title ?? "").trim();
    const trimmedMessage = (message ?? "").trim();
    if (!trimmedTitle || !trimmedMessage) {
      return NextResponse.json(
        { success: false, error: "Title and message are required" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createAdminClient();
    const normalizedType = normalizeType(type);

    const payload = ids.map((businessId) => ({
      business_id: businessId,
      title: trimmedTitle,
      content: trimmedMessage,
      type: normalizedType,
    }));

    const { error: insertError } = await supabaseAdmin.from("business_notifications").insert(payload);
    if (insertError) {
      console.error("Admin notifications insert error:", insertError);
      throw insertError;
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error: any) {
    console.error("Admin notifications error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to send notifications" },
      { status: 500 },
    );
  }
}

