import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('wetwo_admin')?.value;
  if (adminCookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parallel queries for speed
    const [
      vendorsRes,
      activeVendorsRes,
      couplesRes,
      shoppersRes,
      leadsRes,
      sponsorsRes,
      recentEventsRes,
      todayEventsRes,
    ] = await Promise.all([
      supabase.from('vendors').select('*', { count: 'exact', head: true }),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('page_active', true),
      supabase.from('couples').select('*', { count: 'exact', head: true }),
      supabase.from('vendor_clients').select('*', { count: 'exact', head: true }).eq('type', 'shopper'),
      supabase.from('vendor_leads').select('*', { count: 'exact', head: true }),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('subscription_active', true),
      supabase.from('admin_events').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('admin_events').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);

    // Event type breakdown (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: weekEvents } = await supabase
      .from('admin_events')
      .select('event_type, created_at')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false });

    // Group events by type
    const eventBreakdown: Record<string, number> = {};
    (weekEvents || []).forEach((e: any) => {
      eventBreakdown[e.event_type] = (eventBreakdown[e.event_type] || 0) + 1;
    });

    // Group events by day
    const dailyActivity: Record<string, number> = {};
    (weekEvents || []).forEach((e: any) => {
      const day = new Date(e.created_at).toISOString().split('T')[0];
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    return NextResponse.json({
      counts: {
        vendors: vendorsRes.count || 0,
        activeVendors: activeVendorsRes.count || 0,
        couples: couplesRes.count || 0,
        shoppers: shoppersRes.count || 0,
        leads: leadsRes.count || 0,
        sponsors: sponsorsRes.count || 0,
        todayEvents: todayEventsRes.count || 0,
      },
      recentEvents: recentEventsRes.data || [],
      eventBreakdown,
      dailyActivity,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
