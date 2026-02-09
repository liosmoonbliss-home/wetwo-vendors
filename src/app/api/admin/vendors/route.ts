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

  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');

  if (ref) {
    // Single vendor detail
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('ref', ref)
      .single();

    if (error || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Get vendor's couples
    const { data: couples } = await supabase
      .from('couples')
      .select('*')
      .eq('referred_by_vendor_id', vendor.id)
      .order('created_at', { ascending: false });

    // Get vendor's clients (shoppers)
    const { data: clients } = await supabase
      .from('vendor_clients')
      .select('*')
      .eq('vendor_ref', ref)
      .eq('type', 'shopper')
      .order('created_at', { ascending: false });

    // Get vendor's leads
    const { data: leads } = await supabase
      .from('vendor_leads')
      .select('*')
      .eq('vendor_ref', ref)
      .order('created_at', { ascending: false });

    // Get vendor's events
    const { data: events } = await supabase
      .from('admin_events')
      .select('*')
      .eq('vendor_ref', ref)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      vendor,
      couples: couples || [],
      clients: clients || [],
      leads: leads || [],
      events: events || [],
    });
  }

  // All vendors
  const { data, error } = await supabase
    .from('vendors')
    .select('id, ref, business_name, email, category, state, city, page_active, subscription_active, created_at, photo_url')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vendors: data || [] });
}
