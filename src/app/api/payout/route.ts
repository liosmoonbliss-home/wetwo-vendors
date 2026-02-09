import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trackEvent } from '@/lib/admin-track';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'vendor', 'couple', 'shopper'
  const ref = searchParams.get('ref');   // vendor ref, couple slug, or shopper ref

  if (!type || !ref) {
    return NextResponse.json({ error: 'Missing type or ref' }, { status: 400 });
  }

  let paypal_email = null;

  if (type === 'vendor') {
    const { data } = await supabase
      .from('vendors')
      .select('paypal_email')
      .eq('ref', ref)
      .single();
    paypal_email = data?.paypal_email || null;
  } else if (type === 'couple') {
    const { data } = await supabase
      .from('couples')
      .select('paypal_email')
      .eq('slug', ref)
      .single();
    paypal_email = data?.paypal_email || null;
  } else if (type === 'shopper') {
    const { data } = await supabase
      .from('vendor_clients')
      .select('paypal_email')
      .eq('id', ref)
      .single();
    paypal_email = data?.paypal_email || null;
  }

  return NextResponse.json({ paypal_email });
}

export async function POST(req: NextRequest) {
  try {
    const { type, ref, paypal_email } = await req.json();

    if (!type || !ref || !paypal_email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Basic email validation
    if (!paypal_email.includes('@') || !paypal_email.includes('.')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const cleanEmail = paypal_email.trim().toLowerCase();
    let goaffpro_id = null;
    let name = '';

    // 1. Save to Supabase
    if (type === 'vendor') {
      const { data, error } = await supabase
        .from('vendors')
        .update({ paypal_email: cleanEmail })
        .eq('ref', ref)
        .select('goaffpro_affiliate_id, business_name')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
      }
      goaffpro_id = data?.goaffpro_affiliate_id;
      name = data?.business_name || ref;

    } else if (type === 'couple') {
      const { data, error } = await supabase
        .from('couples')
        .update({ paypal_email: cleanEmail })
        .eq('slug', ref)
        .select('goaffpro_affiliate_id, partner_a, partner_b')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
      }
      goaffpro_id = data?.goaffpro_affiliate_id;
      name = `${data?.partner_a || ''} & ${data?.partner_b || ''}`;

    } else if (type === 'shopper') {
      const { data, error } = await supabase
        .from('vendor_clients')
        .update({ paypal_email: cleanEmail })
        .eq('id', ref)
        .select('goaffpro_affiliate_id, name')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
      }
      goaffpro_id = data?.goaffpro_affiliate_id;
      name = data?.name || 'Shopper';
    }

    // 2. Update GoAffPro if we have an affiliate ID
    if (goaffpro_id && process.env.GOAFFPRO_API_TOKEN) {
      try {
        await fetch(`https://api.goaffpro.com/v1/affiliates/${goaffpro_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-goaffpro-access-token': process.env.GOAFFPRO_API_TOKEN,
          },
          body: JSON.stringify({
            payout_details: {
              method: 'paypal',
              paypal_email: cleanEmail,
            },
          }),
        });
      } catch (e) {
        // Don't fail the request if GoAffPro update fails
        console.error('GoAffPro payout update failed:', e);
      }
    }

    // 3. Track event
    trackEvent({
      event_type: 'subscription_change', // reusing this type for payout setup
      vendor_ref: type === 'vendor' ? ref : undefined,
      actor_name: name,
      actor_email: cleanEmail,
      summary: `${name} connected PayPal (${type})`,
      metadata: { type, ref, paypal_email: cleanEmail },
    }).catch(() => {});

    return NextResponse.json({ success: true, paypal_email: cleanEmail });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
