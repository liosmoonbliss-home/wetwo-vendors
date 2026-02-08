import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple admin auth — same backdoor password
const ADMIN_KEY = 'wetwo-admin-2026';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const view = req.nextUrl.searchParams.get('view') || 'overview';
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
  const vendor_ref = req.nextUrl.searchParams.get('vendor_ref');

  try {
    if (view === 'overview') {
      // Counts across all vendors
      const { count: totalLeads } = await supabase
        .from('vendor_leads')
        .select('*', { count: 'exact', head: true });

      const { count: totalShoppers } = await supabase
        .from('vendor_clients')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'shopper');

      const { count: totalCouples } = await supabase
        .from('vendor_clients')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'couple');

      const { count: totalVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

      // Today's numbers
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { count: leadsToday } = await supabase
        .from('vendor_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      const { count: shoppersToday } = await supabase
        .from('vendor_clients')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'shopper')
        .gte('created_at', todayISO);

      // Recent activity across all vendors
      const { data: recentActivity } = await supabase
        .from('vendor_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({
        totals: {
          vendors: totalVendors || 0,
          leads: totalLeads || 0,
          shoppers: totalShoppers || 0,
          couples: totalCouples || 0,
        },
        today: {
          leads: leadsToday || 0,
          shoppers: shoppersToday || 0,
        },
        recentActivity: recentActivity || [],
      });
    }

    if (view === 'leads') {
      let query = supabase
        .from('vendor_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (vendor_ref) query = query.eq('vendor_ref', vendor_ref);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ leads: data });
    }

    if (view === 'shoppers') {
      let query = supabase
        .from('vendor_clients')
        .select('*')
        .eq('type', 'shopper')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (vendor_ref) query = query.eq('vendor_ref', vendor_ref);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ shoppers: data });
    }

    if (view === 'activity') {
      let query = supabase
        .from('vendor_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (vendor_ref) query = query.eq('vendor_ref', vendor_ref);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ activity: data });
    }

    if (view === 'claude') {
      let query = supabase
        .from('assistant_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (vendor_ref) query = query.eq('vendor_ref', vendor_ref);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ conversations: data });
    }

    return NextResponse.json({ error: 'Invalid view. Use: overview, leads, shoppers, activity, claude' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
