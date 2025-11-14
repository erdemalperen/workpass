import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: account } = await supabase
      .from("business_accounts")
      .select("business_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!account?.business_id) {
      return NextResponse.json({ success: true, tickets: [] });
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from("support_tickets")
      .select("id, subject, priority, status, created_at, updated_at")
      .eq("business_id", account.business_id)
      .order("created_at", { ascending: false });

    if (ticketsError) throw ticketsError;

    const ticketIds = (tickets ?? []).map((t) => t.id);
    let responsesByTicket: Record<string, any[]> = {};
    if (ticketIds.length > 0) {
      const { data: responses, error: responsesError } = await supabase
        .from("support_responses")
        .select("id, ticket_id, sender, message, created_at")
        .in("ticket_id", ticketIds)
        .order("created_at", { ascending: true });

      if (responsesError) throw responsesError;

      responsesByTicket = (responses ?? []).reduce<Record<string, any[]>>((acc, r) => {
        (acc[r.ticket_id] ||= []).push(r);
        return acc;
      }, {});
    }

    return NextResponse.json({
      success: true,
      tickets: (tickets ?? []).map((t) => ({
        id: t.id,
        subject: t.subject,
        priority: t.priority,
        status: t.status,
        createdAt: t.created_at,
        lastUpdate: t.updated_at,
        responses: responsesByTicket[t.id] ?? [],
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to load support tickets" },
      { status: 500 },
    );
  }
}

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

    const body = await request.json();
    const { subject, priority, message } = body as { subject?: string; priority?: string; message?: string };

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ success: false, error: "Subject and message are required" }, { status: 400 });
    }

    const { data: account, error: accountError } = await supabase
      .from("business_accounts")
      .select("business_id")
      .eq("id", user.id)
      .single();

    if (accountError) throw accountError;

    if (!account.business_id) {
      return NextResponse.json({ success: false, error: "Business not linked" }, { status: 400 });
    }

    const { data: ticket, error: insertTicketError } = await supabase
      .from("support_tickets")
      .insert({
        business_id: account.business_id,
        subject: subject.trim(),
        priority: (priority ?? "medium").toLowerCase(),
      })
      .select("id")
      .single();

    if (insertTicketError) throw insertTicketError;

    const { error: insertResponseError } = await supabase
      .from("support_responses")
      .insert({ ticket_id: ticket.id, sender: "business", message: message.trim() });

    if (insertResponseError) throw insertResponseError;

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to create support ticket" },
      { status: 500 },
    );
  }
}


