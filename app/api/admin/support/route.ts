import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Admin auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: adminProfile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();
    if (profileError || !adminProfile) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("support_tickets")
      .select(
        `id, subject, priority, status, created_at, updated_at, business:businesses(name)`
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      // Basic search on subject
      query = query.ilike("subject", `%${search}%`);
    }

    const { data: tickets, error } = await query;
    if (error) throw error;

    // Responses count per ticket
    const ticketIds = (tickets ?? []).map((t) => t.id);
    let responsesByTicket: Record<string, number> = {};
    if (ticketIds.length > 0) {
      const { data: responses, error: respErr } = await supabase
        .from("support_responses")
        .select("ticket_id, id")
        .in("ticket_id", ticketIds);
      if (respErr) throw respErr;
      for (const r of responses ?? []) {
        responsesByTicket[r.ticket_id] = (responsesByTicket[r.ticket_id] || 0) + 1;
      }
    }

    const ticketsData = (tickets ?? []) as any[];

    return NextResponse.json({
      success: true,
      tickets: ticketsData.map((t) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        date: t.created_at,
        lastUpdate: t.updated_at,
        from: t.business?.name ?? "Business",
        type: "business",
        responses: responsesByTicket[t.id] || 0,
      })),
    });
  } catch (error: any) {
    console.error("Admin support GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Admin auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: adminProfile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();
    if (profileError || !adminProfile) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { ticketId, message, status } = body as { ticketId?: string; message?: string; status?: string };
    if (!ticketId || !message?.trim()) {
      return NextResponse.json({ success: false, error: "Missing ticketId or message" }, { status: 400 });
    }

    // Insert response as admin
    const { error: insertErr } = await supabase
      .from("support_responses")
      .insert({ ticket_id: ticketId, sender: "admin", message: message.trim() });
    if (insertErr) throw insertErr;

    // Optionally update ticket status
    if (status && ["open", "in_progress", "resolved"].includes(status)) {
      await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", ticketId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin support POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to send response" }, { status: 500 });
  }
}


