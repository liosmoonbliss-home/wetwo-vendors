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
      vendor_id,
      vendor_ref,
      vendor_name,
      name,
      email,
      phone,
      event_date,
      interest,
      message,
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Resolve vendor_id from ref if not provided
    let resolvedVendorId = vendor_id;
    let resolvedVendorName = vendor_name || 'Unknown Vendor';

    if (!resolvedVendorId && vendor_ref) {
      const { data: vendorRow } = await supabase
        .from('vendors')
        .select('id, business_name')
        .eq('ref', vendor_ref)
        .single();
      if (vendorRow) {
        resolvedVendorId = vendorRow.id;
        resolvedVendorName = vendorRow.business_name || resolvedVendorName;
      }
    }

    // Insert into leads table
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        vendor_id: resolvedVendorId,
        name,
        email,
        phone: phone || null,
        event_date: event_date || null,
        interest: interest || null,
        message: message || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Lead insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save inquiry' },
        { status: 500 }
      );
    }

    // Send admin notification email to David
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'WeTwo <notify@noreply.wetwo.love>',
            to: ['david@wetwo.love'],
            subject: `📬 New Inquiry — ${resolvedVendorName}`,
            html: `
              <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="background: linear-gradient(135deg, #c9944a, #d4a76a); padding: 20px 24px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #fff; font-size: 20px; margin: 0;">📬 New Contact Form Inquiry</h1>
                </div>
                <div style="background: #ffffff; border: 1px solid #e4ddd4; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #6b5e52; width: 120px;">Vendor:</td>
                      <td style="padding: 8px 0; color: #2c2420; font-weight: 700;">${resolvedVendorName}</td>
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
                    ${event_date ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Event Date:</td><td style="padding: 8px 0; color: #2c2420;">${event_date}</td></tr>` : ''}
                    ${interest ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Interest:</td><td style="padding: 8px 0; color: #2c2420;">${interest}</td></tr>` : ''}
                    ${message ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;" colspan="2">Message:</td></tr><tr><td colspan="2" style="padding: 8px 0 0; color: #2c2420; line-height: 1.6; background: #faf8f5; padding: 12px; border-radius: 8px;">${message}</td></tr>` : ''}
                  </table>
                  <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e4ddd4; font-size: 12px; color: #9a8d80;">
                    Lead ID: ${lead?.id || 'N/A'} · ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
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

    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error('Leads API error:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
