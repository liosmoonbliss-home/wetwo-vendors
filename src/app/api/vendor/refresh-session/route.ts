import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// GET /api/vendor/refresh-session?ref=glitter-thicket-4l7j
//
// Returns fresh vendor data from Supabase.
// Dashboard should call this on load and update localStorage
// so tier/pool changes are reflected immediately.
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ error: 'ref is required' }, { status: 400 })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch fresh vendor data — same fields the dashboard needs
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('id, ref, business_name, email, contact_name, boost_tier, current_pool, subscription_active, goaffpro_affiliate_id, photo_url, trial_start, created_at, page_active')
    .eq('ref', ref)
    .maybeSingle()

  if (error) {
    console.error('[vendor/refresh-session] Supabase error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  return NextResponse.json({ vendor })
}
