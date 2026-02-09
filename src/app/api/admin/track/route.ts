import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, EventType } from '@/lib/admin-track';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_CLIENT_EVENTS: EventType[] = ['dashboard_visit', 'page_view'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, vendor_ref, vendor_name, metadata } = body;

    if (!event_type || !ALLOWED_CLIENT_EVENTS.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Look up vendor name if not provided
    let resolvedName = vendor_name;
    if (!resolvedName && vendor_ref) {
      const { data } = await supabase
        .from('vendors')
        .select('business_name')
        .eq('ref', vendor_ref)
        .single();
      resolvedName = data?.business_name || vendor_ref;
    }

    await trackEvent({
      event_type,
      vendor_ref: vendor_ref || undefined,
      vendor_name: resolvedName || undefined,
      summary: event_type === 'dashboard_visit'
        ? `${resolvedName || vendor_ref || 'Unknown'} visited dashboard`
        : `Vendor page viewed: ${resolvedName || vendor_ref || 'Unknown'}`,
      metadata: metadata || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
