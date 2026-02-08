import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createGoAffProCustomer(name: string, email: string, vendorAffiliateRef: string) {
  const GOAFFPRO_API_KEY = process.env.GOAFFPRO_ACCESS_TOKEN || process.env.GOAFFPRO_API_KEY;
  if (!GOAFFPRO_API_KEY) {
    console.error('No GoAffPro API key configured');
    return null;
  }

  try {
    // Register customer attributed to the vendor's affiliate ref
    const res = await fetch('https://api.goaffpro.com/admin/customers', {
      method: 'POST',
      headers: {
        'x-access-token': GOAFFPRO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        ref: vendorAffiliateRef, // ties this customer to the vendor's affiliate
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('GoAffPro customer created:', data);
      return data;
    } else {
      const errText = await res.text();
      console.error('GoAffPro customer error:', res.status, errText);
      // 409 = duplicate email, still success for us
      if (res.status === 409) return { existing: true };
      return null;
    }
  } catch (err) {
    console.error('GoAffPro customer network error:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendor_ref,
      vendor_name,
      name,
      email,
      phone,
      source,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const affiliateRef = vendor_ref ? `vendor-${vendor_ref}` : null;
    const storeUrl = affiliateRef
      ? `https://wetwo.love?ref=${affiliateRef}`
      : 'https://wetwo.love';

    // 1. Insert into vendor_clients (what the dashboard reads)
    const { data: client, error: insertError } = await supabase
      .from('vendor_clients')
      .insert({
        vendor_ref: vendor_ref,
        type: 'shopper',
        name,
        email,
        phone: phone || null,
        link_clicked: true,
        registered: true,
        total_purchases: 0,
        commission_earned: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('vendor_clients insert error:', insertError);
      // Duplicate email — still let them through
      if (insertError.code === '23505') {
        return NextResponse.json({ success: true, existing: true, storeUrl });
      }
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }

    // 2. Create GoAffPro customer (ties shopper to vendor's affiliate)
    let goaffproResult = null;
    if (affiliateRef) {
      goaffproResult = await createGoAffProCustomer(name, email, affiliateRef);
    }

    // 3. Log to vendor_activity (dashboard activity feed)
    await supabase.from('vendor_activity').insert({
      vendor_ref: vendor_ref,
      type: 'shopper',
      description: `New shopper: ${name} unlocked cashback`,
      metadata: {
        client_id: client?.id,
        name,
        email,
        source: source || 'cashback_banner',
        goaffpro: goaffproResult ? true : false,
      },
    }).catch(() => {});

    // 4. Send admin email to David
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        const resolvedVendorName = vendor_name || vendor_ref || 'Direct';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'WeTwo <notify@noreply.wetwo.love>',
            to: ['david@wetwo.love'],
            subject: `🛍️ New Shopper — via ${resolvedVendorName}`,
            html: `
              <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px 24px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #fff; font-size: 20px; margin: 0;">🛍️ New Cashback Shopper</h1>
                </div>
                <div style="background: #ffffff; border: 1px solid #e4ddd4; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52; width: 130px;">Via Vendor:</td><td style="padding: 8px 0; color: #2c2420; font-weight: 700;">${resolvedVendorName}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Name:</td><td style="padding: 8px 0; color: #2c2420;">${name}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #c9944a;">${email}</a></td></tr>
                    ${phone ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Phone:</td><td style="padding: 8px 0; color: #2c2420;">${phone}</td></tr>` : ''}
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">GoAffPro:</td><td style="padding: 8px 0; color: ${goaffproResult ? '#22c55e' : '#ef4444'};">${goaffproResult ? '✅ Customer created' : '❌ Failed or no key'}</td></tr>
                  </table>
                  <div style="margin-top: 16px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <span style="font-size: 14px; color: #166534;">Affiliate ref: <code>${affiliateRef || 'none'}</code></span>
                  </div>
                  <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e4ddd4; font-size: 12px; color: #9a8d80;">
                    Client ID: ${client?.id || 'N/A'} · ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
                  </div>
                </div>
              </div>
            `,
          }),
        });
      }
    } catch (emailErr) {
      console.error('Admin email error (non-blocking):', emailErr);
    }

    return NextResponse.json({ success: true, client, storeUrl });
  } catch (err) {
    console.error('Shoppers API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
