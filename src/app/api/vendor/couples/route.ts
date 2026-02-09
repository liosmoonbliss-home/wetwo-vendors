import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const vendorId = request.nextUrl.searchParams.get('vendor_id');
  const vendorRef = request.nextUrl.searchParams.get('vendor_ref');

  if (!vendorId && !vendorRef) {
    return NextResponse.json({ error: 'vendor_id or vendor_ref required' }, { status: 400 });
  }

  try {
    let resolvedId = vendorId;

    // Resolve vendor_ref to vendor_id if needed
    if (!resolvedId && vendorRef) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('ref', vendorRef)
        .single();
      resolvedId = vendor?.id;
    }

    if (!resolvedId) {
      return NextResponse.json({ couples: [] });
    }

    // Fetch all couples referred by this vendor
    const { data: couples, error } = await supabase
      .from('couples')
      .select('id, slug, partner_a, partner_b, email, state, created_at, affiliate_commission, amount_paid, order_num, order_value, wedding_date, guest_count')
      .eq('referred_by_vendor_id', resolvedId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Couples lookup error:', error);
      return NextResponse.json({ couples: [] });
    }

    // Enrich with dashboard links
    const enriched = (couples || []).map(c => ({
      ...c,
      display_name: c.partner_b ? `${c.partner_a} & ${c.partner_b}` : c.partner_a,
      registry_url: `https://wetwo.love/collections/registry-${c.slug}`,
      dashboard_url: `/sanctuary/celebrate/couple/${c.slug}/dashboard`,
      total_earned: parseFloat(c.affiliate_commission || '0'),
      total_orders: c.order_num || 0,
      total_value: parseFloat(c.order_value || '0'),
    }));

    return NextResponse.json({ couples: enriched });
  } catch (err) {
    console.error('Vendor couples error:', err);
    return NextResponse.json({ couples: [] });
  }
}
