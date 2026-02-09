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

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    let resolvedRef = vendor_ref;
    let resolvedName = vendor_name || 'Unknown Vendor';

    if (!resolvedRef && vendor_id) {
      const { data: vendorRow } = await supabase
        .from('vendors')
        .select('ref, business_name')
        .eq('id', vendor_id)
        .single();
      if (vendorRow) {
        resolvedRef = vendorRow.ref;
        resolvedName = vendorRow.business_name || resolvedName;
      }
    }

    // 1. Insert into vendor_leads (what the dashboard reads)
    const { data: lead, error: insertError } = await supabase
      .from('vendor_leads')
      .insert({
        vendor_ref: resolvedRef,
        name,
        email,
        phone: phone || null,
        event_date: event_date || null,
        interest: interest || null,
        message: message || null,
        source: 'contact_form',
        status: 'new',
      })
      .select()
      .single();

    if (insertError) {
      console.error('vendor_leads insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
    }

    // 2. Log to vendor_activity (dashboard activity feed)
    try {
      await supabase.from('vendor_activity').insert({
        vendor_ref: resolvedRef,
        type: 'lead',
        description: `New inquiry from ${name}${interest ? ` about ${interest}` : ''}`,
        metadata: { lead_id: lead?.id, name, email, interest, event_date },
      });
    } catch {}

    // 3. Send admin email to David
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
            subject: `📬 New Inquiry — ${resolvedName}`,
            html: `
              <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="background: linear-gradient(135deg, #c9944a, #d4a76a); padding: 20px 24px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #fff; font-size: 20px; margin: 0;">📬 New Contact Form Inquiry</h1>
                </div>
                <div style="background: #ffffff; border: 1px solid #e4ddd4; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52; width: 120px;">Vendor:</td><td style="padding: 8px 0; color: #2c2420; font-weight: 700;">${resolvedName}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Name:</td><td style="padding: 8px 0; color: #2c2420;">${name}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #c9944a;">${email}</a></td></tr>
                    ${phone ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Phone:</td><td style="padding: 8px 0; color: #2c2420;">${phone}</td></tr>` : ''}
                    ${event_date ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Event Date:</td><td style="padding: 8px 0; color: #2c2420;">${event_date}</td></tr>` : ''}
                    ${interest ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;">Interest:</td><td style="padding: 8px 0; color: #2c2420;">${interest}</td></tr>` : ''}
                    ${message ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #6b5e52;" colspan="2">Message:</td></tr><tr><td colspan="2" style="padding: 12px; color: #2c2420; line-height: 1.6; background: #faf8f5; border-radius: 8px;">${message}</td></tr>` : ''}
                  </table>
                  <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e4ddd4; font-size: 12px; color: #9a8d80;">
                    Lead ID: ${lead?.id || 'N/A'} · Vendor ref: ${resolvedRef} · ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
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


    // Track lead form event
    try {
      await trackEvent({
        event_type: 'lead_form',
        vendor_ref: resolvedRef || undefined,
        actor_name: name || undefined,
        actor_email: email || undefined,
        summary: `New lead from ${name || email || 'unknown'} for ${resolvedRef || 'unknown'}`,
        metadata: { message: (message || '').substring(0, 200) },
      });
    } catch (e) { /* tracking should never break form */ }

    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error('Leads API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
