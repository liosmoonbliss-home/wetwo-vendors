import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Logs a vendor's Claude assistant interaction.
 * Called from the assistant route after each exchange.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendor_ref,
      vendor_name,
      vendor_id,
      question,      // What the vendor asked
      response,      // What Claude replied (truncated for storage)
      category,      // Auto-categorized: 'getting_started', 'upgrade', 'links', 'commission', 'technical', 'other'
    } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    // Insert into assistant_conversations table
    const { data, error } = await supabase
      .from('assistant_conversations')
      .insert({
        vendor_ref: vendor_ref || null,
        vendor_name: vendor_name || null,
        vendor_id: vendor_id || null,
        question,
        response: response ? response.substring(0, 2000) : null, // Cap at 2000 chars
        category: category || 'other',
      })
      .select()
      .single();

    if (error) {
      console.error('Assistant log insert error:', error);
      // Non-blocking — don't fail the assistant response
      return NextResponse.json({ logged: false });
    }

    return NextResponse.json({ logged: true, id: data?.id });
  } catch (err) {
    console.error('Assistant log error:', err);
    return NextResponse.json({ logged: false });
  }
}

/**
 * GET: Fetch recent assistant conversations for David's admin view.
 * Query params: ?limit=50&vendor_ref=xxx&category=upgrade
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const vendor_ref = searchParams.get('vendor_ref');
    const category = searchParams.get('category');
    const since = searchParams.get('since'); // ISO date

    let query = supabase
      .from('assistant_conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 200));

    if (vendor_ref) {
      query = query.eq('vendor_ref', vendor_ref);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (since) {
      query = query.gte('created_at', since);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Assistant log fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    return NextResponse.json({ conversations: data });
  } catch (err) {
    console.error('Assistant log GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
