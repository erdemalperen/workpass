import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Use admin client so this public data endpoint works even when anon policies break
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('passes')
      .select(`
        *,
        pricing:pass_pricing(*),
        businesses:pass_businesses(
          *,
          business:businesses(*)
        )
      `)
      .eq('status', 'active')
      .order('popular', { ascending: false })
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching passes:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      passes: data || []
    });

  } catch (error: any) {
    console.error('Passes fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch passes'
    }, { status: 500 });
  }
}
