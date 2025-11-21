import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First, get all purchased passes for this customer
    const { data: userPasses, error: passesError } = await supabase
      .from("purchased_passes")
      .select("id")
      .eq("customer_id", user.id);

    if (passesError) {
      console.error("Error fetching user passes:", passesError);
      return NextResponse.json(
        { error: "Failed to fetch user passes" },
        { status: 500 }
      );
    }

    // If user has no passes, return empty data
    if (!userPasses || userPasses.length === 0) {
      return NextResponse.json({
        savingsHistory: [],
        stats: {
          totalSavings: 0,
          thisMonthSavings: 0,
          averageSaving: 0,
          totalEntries: 0,
        },
      });
    }

    const passIds = userPasses.map((p) => p.id);

    // Fetch user's pass usage history with discount information
    const { data: savingsData, error: savingsError } = await supabase
      .from("pass_usage_history")
      .select(`
        id,
        created_at,
        discount_percentage,
        original_amount,
        discounted_amount,
        notes,
        validation_location,
        purchased_pass:purchased_passes (
          id,
          pass_name,
          pass_type
        ),
        business:businesses (
          id,
          name,
          address,
          category
        )
      `)
      .in("purchased_pass_id", passIds)
      .order("created_at", { ascending: false });

    if (savingsError) {
      console.error("Error fetching savings:", savingsError);
      return NextResponse.json(
        { error: "Failed to fetch savings data" },
        { status: 500 }
      );
    }

    // Transform data to match frontend format
    const savingsHistory = (savingsData || []).map((entry: any) => {
      const savings =
        entry.original_amount && entry.discounted_amount
          ? Number(entry.original_amount) - Number(entry.discounted_amount)
          : 0;

      return {
        id: entry.id,
        placeName: entry.business?.name || "Unknown Business",
        location: entry.business?.address || entry.validation_location || "Unknown Location",
        amount: savings,
        date: entry.created_at,
        discount: entry.discount_percentage
          ? `${entry.discount_percentage}% off`
          : "Discount applied",
        originalAmount: entry.original_amount ? Number(entry.original_amount) : 0,
        discountedAmount: entry.discounted_amount ? Number(entry.discounted_amount) : 0,
        passName: entry.purchased_pass?.pass_name || "Pass",
        category: entry.business?.category || "General",
      };
    });

    // Calculate statistics
    const totalSavings = savingsHistory.reduce(
      (sum: number, entry: any) => sum + entry.amount,
      0
    );

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthSavings = savingsHistory
      .filter((entry: any) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() === currentMonth &&
          entryDate.getFullYear() === currentYear
        );
      })
      .reduce((sum: number, entry: any) => sum + entry.amount, 0);

    const averageSaving =
      savingsHistory.length > 0 ? totalSavings / savingsHistory.length : 0;

    return NextResponse.json({
      savingsHistory,
      stats: {
        totalSavings: Math.round(totalSavings * 100) / 100,
        thisMonthSavings: Math.round(thisMonthSavings * 100) / 100,
        averageSaving: Math.round(averageSaving * 100) / 100,
        totalEntries: savingsHistory.length,
      },
    });
  } catch (error) {
    console.error("Unexpected error in savings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
