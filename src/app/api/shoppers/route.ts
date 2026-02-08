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
      source, // 'cashback_banner', 'shopping_link', 'registry_signup'
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Build the GoAffPro ref code for attribution
    const goaffproRef = vendor_ref ? `vendor-${vendor_ref}` : null;

    // Insert into shoppers table
    const { data: shopper, error: insertError } = await supabase
      .from('shoppers')
      .insert({
        name,
        email,
        phone: phone || null,
        referred_by_vendor_ref: goaffproRef,
        source: source || 'cashback_banner',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Shopper insert error:', insertError);
      // If duplicate email, still let them through to the store
      if (insertError.code === '23505') {
        const storeUrl = goaffproRef
          ? `https://wetwo.love?ref=${goaffproRef}`
          : 'https://wetwo.love';
        return NextResponse.json({
          success: true,
          existing: true,
          storeUrl,
          message: 'Welcome back! Redirecting to store...',
        });
      }
      return NextResponse.json(
        { error: 'Failed to register' },
        { status: 500 }
      );
    }

    // Build the store URL with affiliate attribution
    const storeUrl = goaffproRef
      ? `https://wetwo.love?ref=${goaffproRef}`
      : 'https://wetwo.love';

    // Send admin notification email to David
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
            from: 'WeTwo Shoppers <notifications@wetwo.love>',
            to: ['david@wetwo.love'],
            subject: `🛍️ New Shopper Signup — via ${resolvedVendorName}`,
            html: `
              <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px 24px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #fff; font-size: 20px; margin: 0;">🛍️ New Cashback Shopper</h1>
                </div>
                <div style="background: #ffffff; border: 1px solid #e4ddd4; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #6b5e52; width: 130px;">Via Vendor:</td>
                      <td style="padding: 8px 0; color: #2c2420; font-weight: 700;">${resolvedVendorName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Source:</td>
                      <td style="padding: 8px 0; color: #2c2420;">${source || 'cashback_banner'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Name:</td>
                      <td style="padding: 8px 0; color: #2c2420;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Email:</td>
                      <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #c9944a;">${email}</a></td>
                    </tr>
                    ${phone ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Phone:</td><td style="padding: 8px 0; color: #2c2420;">${phone}</td></tr>` : ''}
                  </table>
                  <div style="margin-top: 16px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <span style="font-size: 14px; color: #166534;">Affiliate ref: <code>${goaffproRef || 'none'}</code></span>
                  </div>
                  <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e4ddd4; font-size: 12px; color: #9a8d80;">
                    Shopper ID: ${shopper?.id || 'N/A'} · ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
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

    return NextResponse.json({
      success: true,
      shopper,
      storeUrl,
    });
  } catch (err) {
    console.error('Shoppers API error:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
