import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');

  if (!id && !email) {
    return NextResponse.json({ error: 'Missing id or email' }, { status: 400 });
  }

  let query = supabase
    .from('vendor_clients')
    .select('*')
    .eq('type', 'shopper');

  if (id) {
    query = query.eq('id', id);
  } else if (email) {
    query = query.eq('email', email);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return NextResponse.json({ error: 'Shopper not found' }, { status: 404 });
  }

  // Get vendor info if referred
  let vendor = null;
  if (data.vendor_ref) {
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('ref, business_name, photo_url')
      .eq('ref', data.vendor_ref)
      .single();
    vendor = vendorData;
  }

  return NextResponse.json({ shopper: data, vendor });
}
