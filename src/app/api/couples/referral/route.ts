import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ referral: null }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    // Look up couple by slug
    const { data: couple } = await supabase
      .from('couples')
      .select('referred_by_vendor_id, referred_by_vendor')
      .eq('slug', slug)
      .single();

    if (!couple?.referred_by_vendor_id) {
      return NextResponse.json({ referral: null }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Look up vendor
    const { data: vendor } = await supabase
      .from('vendors')
      .select('ref, business_name, photo_url')
      .eq('id', couple.referred_by_vendor_id)
      .single();

    if (!vendor) {
      return NextResponse.json({ referral: null }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    return NextResponse.json({
      referral: {
        vendor: {
          ref: vendor.ref,
          business_name: vendor.business_name,
          photo_url: vendor.photo_url || null,
        },
      },
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('Referral lookup error:', err);
    return NextResponse.json({ referral: null }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
