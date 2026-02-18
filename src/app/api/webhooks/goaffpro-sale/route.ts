import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// GoAffPro Sale Webhook — Vendor Earnings from Bride Sales
// ═══════════════════════════════════════════════════════════════
//
// Trigger: GoAffPro fires `orders/after` when a sale is attributed
//
// Logic:
//   1. Receive sale data (affiliate_id, order total, commission)
//   2. Check if affiliate is a COUPLE (bride) — skip if vendor
//   3. Look up the vendor parent + their pool rate
//   4. Calculate vendor share: (vendor_pool% - bride_cashback%) × sale amount
//   5. POST reward to vendor's GoAffPro account
//   6. Log to admin_events + vendor_activity
//
// Result: Vendor sees their share in GoAffPro alongside direct earnings
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await req.json()
    console.log('[goaffpro-sale] Webhook received:', JSON.stringify(body).slice(0, 500))

    // --- Extract sale data ---
    // GoAffPro sends order data — extract what we need
    const order = body.order || body
    const affiliateId = order.affiliate_id || order.affiliateId
    const orderId = order.id || order.order_id || order.orderId
    const saleAmount = parseFloat(order.sale_amount || order.order_total || order.total || order.amount || '0')
    const brideCommission = parseFloat(order.commission || order.commission_amount || '0')

    if (!affiliateId) {
      console.log('[goaffpro-sale] No affiliate_id in webhook payload, skipping')
      return NextResponse.json({ skipped: true, reason: 'no affiliate_id' })
    }

    if (!saleAmount || saleAmount <= 0) {
      console.log('[goaffpro-sale] Zero or missing sale amount, skipping')
      return NextResponse.json({ skipped: true, reason: 'no sale amount' })
    }

    // --- 1. Is this affiliate a couple (bride)? ---
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('id, partner_a, partner_b, email, goaffpro_affiliate_id, referred_by_vendor_id, cashback_rate')
      .eq('goaffpro_affiliate_id', String(affiliateId))
      .maybeSingle()

    if (coupleError) {
      console.error('[goaffpro-sale] Supabase couple lookup error:', coupleError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!couple) {
      // Not a couple — this is a vendor's direct sale. GoAffPro handles it. Nothing to do.
      console.log(`[goaffpro-sale] Affiliate ${affiliateId} is not a couple — vendor direct sale, skipping`)
      return NextResponse.json({ skipped: true, reason: 'vendor_direct_sale' })
    }

    // --- 2. Look up the referring vendor ---
    if (!couple.referred_by_vendor_id) {
      console.log(`[goaffpro-sale] Couple ${couple.id} has no referring vendor, skipping`)
      return NextResponse.json({ skipped: true, reason: 'no_referring_vendor' })
    }

    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, ref, business_name, goaffpro_affiliate_id, boost_tier, current_pool')
      .eq('id', couple.referred_by_vendor_id)
      .maybeSingle()

    if (vendorError || !vendor) {
      console.error('[goaffpro-sale] Vendor lookup error:', vendorError)
      return NextResponse.json({ error: 'Vendor not found' }, { status: 500 })
    }

    if (!vendor.goaffpro_affiliate_id) {
      console.log(`[goaffpro-sale] Vendor ${vendor.ref} has no GoAffPro ID, skipping`)
      return NextResponse.json({ skipped: true, reason: 'vendor_no_goaffpro' })
    }

    // --- 3. Calculate vendor's share ---
    // Vendor pool rate (decimal string like '0.30' → 30)
    const vendorPoolPct = vendor.current_pool
      ? (parseFloat(vendor.current_pool) < 1
        ? Math.round(parseFloat(vendor.current_pool) * 100)
        : Math.round(parseFloat(vendor.current_pool)))
      : 20

    // Bride cashback rate (stored as integer like 15)
    const brideCashbackPct = couple.cashback_rate || 0

    // Vendor's share = their pool minus what the bride gets
    const vendorSharePct = vendorPoolPct - brideCashbackPct

    if (vendorSharePct <= 0) {
      // Bride gets the full pool — vendor earns nothing on this sale
      console.log(`[goaffpro-sale] Vendor share is ${vendorSharePct}% (pool ${vendorPoolPct}% - bride ${brideCashbackPct}%), skipping`)

      // Still log it
      await supabase.from('admin_events').insert({
        event_type: 'bride_sale_no_vendor_share',
        vendor_id: vendor.id,
        details: {
          order_id: orderId,
          affiliate_id: affiliateId,
          couple_id: couple.id,
          sale_amount: saleAmount,
          vendor_pool_pct: vendorPoolPct,
          bride_cashback_pct: brideCashbackPct,
          vendor_share_pct: vendorSharePct,
        }
      })

      return NextResponse.json({ skipped: true, reason: 'zero_vendor_share' })
    }

    // Calculate dollar amount
    const vendorShareAmount = parseFloat(((saleAmount * vendorSharePct) / 100).toFixed(2))

    console.log(`[goaffpro-sale] Sale $${saleAmount} | Bride gets ${brideCashbackPct}% | Vendor ${vendor.ref} gets ${vendorSharePct}% = $${vendorShareAmount}`)

    // --- 4. POST reward to vendor's GoAffPro account ---
    const rewardResponse = await fetch('https://api.goaffpro.com/v1/admin/rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        rewards: [{
          amount: vendorShareAmount,
          affiliate_id: parseInt(vendor.goaffpro_affiliate_id),
          type: 'sale_commission',
          status: 'approved',
          level: 1,
          order_id: orderId,
        }]
      })
    })

    const rewardResult = await rewardResponse.json()
    const rewardSuccess = rewardResponse.ok && rewardResult.success

    console.log(`[goaffpro-sale] Reward POST result:`, JSON.stringify(rewardResult))

    // --- 5. Log to admin_events ---
    await supabase.from('admin_events').insert({
      event_type: 'bride_sale_vendor_reward',
      vendor_id: vendor.id,
      details: {
        order_id: orderId,
        goaffpro_order: order,
        couple_id: couple.id,
        couple_name: `${couple.partner_a || ''} & ${couple.partner_b || ''}`.trim(),
        couple_affiliate_id: affiliateId,
        sale_amount: saleAmount,
        bride_cashback_pct: brideCashbackPct,
        bride_commission: brideCommission,
        vendor_pool_pct: vendorPoolPct,
        vendor_share_pct: vendorSharePct,
        vendor_share_amount: vendorShareAmount,
        vendor_goaffpro_id: vendor.goaffpro_affiliate_id,
        reward_posted: rewardSuccess,
        reward_result: rewardResult,
      }
    })

    // --- 6. Log to vendor_activity ---
    await supabase.from('vendor_activity').insert({
      vendor_id: vendor.id,
      activity_type: 'bride_sale_commission',
      description: `Earned $${vendorShareAmount.toFixed(2)} from ${couple.partner_a || 'couple'}'s registry sale ($${saleAmount.toFixed(2)} × ${vendorSharePct}%)`,
      metadata: {
        order_id: orderId,
        couple_id: couple.id,
        sale_amount: saleAmount,
        vendor_share: vendorShareAmount,
      }
    })

    return NextResponse.json({
      success: true,
      sale_amount: saleAmount,
      bride_cashback_pct: brideCashbackPct,
      vendor_share_pct: vendorSharePct,
      vendor_share_amount: vendorShareAmount,
      reward_posted: rewardSuccess,
    })

  } catch (err: any) {
    console.error('[goaffpro-sale] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}
