import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// ADMIN: Update Vendor Tier — Cascades to Supabase + GoAffPro
// ═══════════════════════════════════════════════════════════════
//
// POST /api/admin/update-vendor-tier
// Body: { vendor_id: string, tier: 'free' | 'pro' | 'elite' }
// Header: x-admin-key: <ADMIN_API_KEY env var>
//
// Cascade:
//   1. Update vendors table (boost_tier, current_pool, subscription_active)
//   2. PATCH GoAffPro affiliate commission
//   3. Log to admin_events
//   4. Return updated vendor data
// ═══════════════════════════════════════════════════════════════

const TIER_CONFIG: Record<string, { pool: string; commission: number; subscription_active: boolean }> = {
  free:  { pool: '0.20', commission: 20, subscription_active: false },
  pro:   { pool: '0.30', commission: 30, subscription_active: true },
  elite: { pool: '0.40', commission: 40, subscription_active: true },
}

export async function POST(req: NextRequest) {
  // --- Auth check ---
  const adminKey = req.headers.get('x-admin-key')
  const expectedKey = process.env.ADMIN_API_KEY

  // If ADMIN_API_KEY is set, enforce it. If not set, allow (dev mode).
  if (expectedKey && adminKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- Supabase client (inside handler — Vercel serverless requirement) ---
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await req.json()
    const { vendor_id, tier } = body

    // --- Validate ---
    if (!vendor_id) {
      return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 })
    }
    if (!tier || !TIER_CONFIG[tier]) {
      return NextResponse.json(
        { error: `tier must be one of: free, pro, elite. Got: ${tier}` },
        { status: 400 }
      )
    }

    const config = TIER_CONFIG[tier]

    // --- 1. Fetch current vendor ---
    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('id, ref, business_name, email, boost_tier, current_pool, goaffpro_affiliate_id, subscription_active')
      .eq('id', vendor_id)
      .maybeSingle()

    if (fetchError) {
      console.error('[admin/update-vendor-tier] Supabase fetch error:', fetchError)
      return NextResponse.json({ error: 'Database error', details: fetchError.message }, { status: 500 })
    }

    if (!vendor) {
      return NextResponse.json({ error: `Vendor not found: ${vendor_id}` }, { status: 404 })
    }

    const oldTier = vendor.boost_tier || 'free'
    const oldPool = vendor.current_pool || '0.20'

    // Skip if already on this tier
    if (vendor.boost_tier === tier && vendor.current_pool === config.pool) {
      return NextResponse.json({
        message: `Vendor already on ${tier} tier`,
        vendor: { id: vendor.id, ref: vendor.ref, business_name: vendor.business_name },
        tier,
        pool: config.pool,
        commission: config.commission,
        skipped: true
      })
    }

    // --- 2. Update Supabase ---
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        boost_tier: tier,
        current_pool: config.pool,
        subscription_active: config.subscription_active,
      })
      .eq('id', vendor_id)

    if (updateError) {
      console.error('[admin/update-vendor-tier] Supabase update error:', updateError)
      return NextResponse.json({ error: 'Failed to update vendor', details: updateError.message }, { status: 500 })
    }

    // --- 3. Update GoAffPro commission ---
    let goaffproResult = { success: false, message: 'No GoAffPro affiliate ID' }

    if (vendor.goaffpro_affiliate_id) {
      try {
        const goaffproResponse = await fetch(
          `https://api.goaffpro.com/v1/admin/affiliates/${vendor.goaffpro_affiliate_id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!,
            },
            body: JSON.stringify({
              commission: { type: 'percentage', amount: String(config.commission) }
            })
          }
        )

        if (goaffproResponse.ok) {
          goaffproResult = { success: true, message: `Commission set to ${config.commission}%` }
        } else {
          const errText = await goaffproResponse.text()
          goaffproResult = { success: false, message: `GoAffPro error ${goaffproResponse.status}: ${errText}` }
          console.error('[admin/update-vendor-tier] GoAffPro error:', errText)
        }
      } catch (goaffproError: any) {
        goaffproResult = { success: false, message: `GoAffPro request failed: ${goaffproError.message}` }
        console.error('[admin/update-vendor-tier] GoAffPro exception:', goaffproError)
      }
    }

    // --- 4. Log to admin_events ---
    await supabase.from('admin_events').insert({
      event_type: 'vendor_tier_update',
      vendor_id: vendor.id,
      details: {
        vendor_ref: vendor.ref,
        business_name: vendor.business_name,
        old_tier: oldTier,
        new_tier: tier,
        old_pool: oldPool,
        new_pool: config.pool,
        old_commission: Math.round(parseFloat(oldPool) * 100),
        new_commission: config.commission,
        goaffpro_affiliate_id: vendor.goaffpro_affiliate_id,
        goaffpro_result: goaffproResult,
        source: 'admin_api',
      },
    })

    // --- 5. Return result ---
    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        ref: vendor.ref,
        business_name: vendor.business_name,
        email: vendor.email,
      },
      changes: {
        tier: { from: oldTier, to: tier },
        pool: { from: oldPool, to: config.pool },
        commission: { from: Math.round(parseFloat(oldPool) * 100), to: config.commission },
        subscription_active: config.subscription_active,
      },
      goaffpro: goaffproResult,
    })

  } catch (err: any) {
    console.error('[admin/update-vendor-tier] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}

// GET handler — list all vendors with their current tiers (for admin panel)
export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  const expectedKey = process.env.ADMIN_API_KEY

  if (expectedKey && adminKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('id, ref, business_name, email, boost_tier, current_pool, goaffpro_affiliate_id, subscription_active, contact_name')
    .neq('ref', 'wetwo-default')
    .order('business_name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
  }

  return NextResponse.json({ vendors, count: vendors?.length || 0 })
}
