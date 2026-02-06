import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Only these columns exist in the vendors table — anything else gets stripped
const ALLOWED_COLUMNS = new Set([
  'business_name','category','service_area','service_radius','email','phone',
  'instagram_handle','website','years_in_business','price_range','bio',
  'portfolio_images','contact_name','service_states','service_type','city','state',
  'photo_url','pricing_packages','services_included','page_active',
  'theme_preset','brand_color','brand_color_secondary','active_sections',
  'section_order','hero_config','event_types','testimonials','video_urls',
  'faqs','team_members','venue_info','menu_categories','page_html','page_password',
  'first_name','account_status','profile_completed',
]);

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('placeholder')) {
      return NextResponse.json({ error: 'Supabase not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { vendor } = await req.json();
    if (!vendor || !vendor.business_name) {
      return NextResponse.json({ error: 'vendor.business_name is required' }, { status: 400 });
    }

    // Extract ref before stripping (ref is used for matching, not for writing)
    const vendorRef = vendor.ref;

    // Strip any fields not in the table (ref excluded — not writable)
    const cleanVendor: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(vendor)) {
      if (ALLOWED_COLUMNS.has(key)) cleanVendor[key] = value;
    }

    // Find existing vendor — prefer ref, fall back to business_name
    let existing: { id: number; ref: string } | null = null;
    if (vendorRef) {
      const { data } = await supabase
        .from('vendors')
        .select('id, ref')
        .eq('ref', vendorRef)
        .maybeSingle();
      existing = data;
    }
    if (!existing) {
      const { data } = await supabase
        .from('vendors')
        .select('id, ref')
        .eq('business_name', vendor.business_name)
        .maybeSingle();
      existing = data;
    }

    let result;
    if (existing) {
      // Update existing — write ALL fields from builder (overwrites old data)
      const { data, error } = await supabase
        .from('vendors')
        .update({ ...cleanVendor, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('vendors')
        .insert({ ...cleanVendor, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }
    return NextResponse.json({
      success: true,
      ref: result.ref,
      url: `https://wetwo-vendors.vercel.app/vendor/${result.ref}`,
      isUpdate: !!existing,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : JSON.stringify(err) }, { status: 500 });
  }
}
