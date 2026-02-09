import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type EventType =
  | 'dashboard_visit'
  | 'claude_chat'
  | 'couple_signup'
  | 'shopper_signup'
  | 'lead_form'
  | 'vendor_created'
  | 'subscription_change'
  | 'page_view';

interface TrackEventParams {
  event_type: EventType;
  vendor_ref?: string;
  vendor_name?: string;
  actor_name?: string;
  actor_email?: string;
  summary?: string;
  metadata?: Record<string, any>;
}

export async function trackEvent(params: TrackEventParams) {
  try {
    const { error } = await supabase.from('admin_events').insert({
      event_type: params.event_type,
      vendor_ref: params.vendor_ref || null,
      vendor_name: params.vendor_name || null,
      actor_name: params.actor_name || null,
      actor_email: params.actor_email || null,
      summary: params.summary || null,
      metadata: params.metadata || {},
    });
    if (error) console.error('Track event error:', error);
  } catch (err) {
    console.error('Track event failed:', err);
  }
}
