import { trackEvent } from '@/lib/admin-track';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // 1. Insert into vendor_clients (what the vendor dashboard reads)
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
      if (insertError.code === '23505') {
        const { data: existingClient } = await supabase.from('vendor_clients').select('id').eq('email', email).eq('type', 'shopper').single();
        return NextResponse.json({ success: true, existing: true, client: existingClient, storeUrl });
      }
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }

    // 2. Create GoAffPro AFFILIATE for shopper (same pattern as couples/vendors)
    let shopperAffiliateId: string | null = null;
    const shopperRefCode = `shopper-${email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      const goaffproResponse = await fetch('https://api.goaffpro.com/v1/admin/affiliates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: name.trim().replace(/&/g, 'and').replace(/[^\w\s-]/g, '').trim(),
          ref_code: shopperRefCode,
        }),
      });

      const affiliateData = await goaffproResponse.json();
      console.log('🎯 GoAffPro shopper response:', JSON.stringify(affiliateData));

      if (goaffproResponse.ok && affiliateData?.affiliate_id) {
        shopperAffiliateId = String(affiliateData.affiliate_id);
        console.log('✅ GoAffPro shopper affiliate created:', shopperAffiliateId);
        // Save GoAffPro data back to vendor_clients
        const refCode = affiliateData.ref_code || shopperRefCode;
        await supabase.from('vendor_clients').update({
          goaffpro_affiliate_id: shopperAffiliateId,
          goaffpro_referral_code: refCode,
        }).eq('id', client?.id);
      } else if (affiliateData?.message?.includes('already') || affiliateData?.error?.includes('exists')) {
        console.log('ℹ️ GoAffPro shopper affiliate already exists');
      } else {
        console.error('⚠️ GoAffPro shopper creation unexpected:', affiliateData);
      }

      // 3. MLM: Assign shopper under vendor's affiliate tree
      if (shopperAffiliateId && vendor_ref) {
        console.log('🔗 MLM: Assigning shopper under vendor...');

        const { data: vendorData } = await supabase
          .from('vendors')
          .select('goaffpro_affiliate_id, business_name')
          .eq('ref', vendor_ref)
          .single();

        if (vendorData?.goaffpro_affiliate_id) {
          console.log(`🔗 Found vendor GoAffPro ID: ${vendorData.goaffpro_affiliate_id} (${vendorData.business_name})`);

          const mlmResponse = await fetch(
            `https://api.goaffpro.com/v1/admin/mlm/move/${shopperAffiliateId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!,
              },
              body: `new_parent=${encodeURIComponent(vendorData.goaffpro_affiliate_id)}`,
            }
          );

          const mlmText = await mlmResponse.text();
          console.log('🔗 MLM response:', mlmResponse.status, mlmText);

          if (mlmResponse.ok) {
            console.log(`✅ Shopper assigned under vendor ${vendorData.business_name}`);
          } else {
            console.error('⚠️ MLM assignment failed:', mlmResponse.status, mlmText);
          }
        } else {
          console.warn('⚠️ Vendor has no GoAffPro affiliate ID, skipping MLM');
        }
      }
    } catch (goaffproError) {
      console.error('⚠️ GoAffPro affiliate creation failed (non-blocking):', goaffproError);
    }

    // 4. Log to vendor_activity (dashboard activity feed)
    try {
      await supabase.from('vendor_activity').insert({
        vendor_ref: vendor_ref,
        type: 'shopper',
        description: `New shopper: ${name} unlocked cashback`,
        metadata: {
          client_id: client?.id,
          name,
          email,
          source: source || 'cashback_banner',
          goaffpro_affiliate_id: shopperAffiliateId,
        },
      });
    } catch {}

    // 5. Send admin email to David
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
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">GoAffPro:</td><td style="padding: 8px 0; color: ${shopperAffiliateId ? '#22c55e' : '#ef4444'};">${shopperAffiliateId ? `✅ Affiliate ${shopperAffiliateId}` : '❌ Not created'}</td></tr>
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


    // Track shopper signup event
    try {
      await trackEvent({
        event_type: 'shopper_signup',
        vendor_ref: vendor_ref || undefined,
        actor_name: name || undefined,
        actor_email: email || undefined,
        summary: `New shopper: ${name || email || 'unknown'} under ${vendor_ref || 'direct'}`,
      });
    } catch (e) { /* tracking should never break signup */ }

    return NextResponse.json({ success: true, client, storeUrl });
  } catch (err) {
    console.error('Shoppers API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
