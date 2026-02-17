import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { setGoaffproCommission, tierToCommission } from '@/lib/set-goaffpro-commission'
import crypto from 'crypto'

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || ''

const SUBSCRIPTION_PRODUCTS: Record<string, { tier: string; pool: string }> = {
  '9106774261982': { tier: 'pro', pool: '0.30' },
  '9106752635102': { tier: 'elite', pool: '0.40' },
}

function verifyWebhook(body: string, hmac: string): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET) return true
  const hash = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64')
  return hash === hmac
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const hmac = request.headers.get('x-shopify-hmac-sha256') || ''

  if (!verifyWebhook(body, hmac)) {
    console.error('❌ Webhook HMAC verification failed')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = JSON.parse(body)
  console.log('📦 Shopify order webhook:', order.id, order.email)

  let upgrade: { tier: string; pool: string } | null = null
  for (const item of order.line_items || []) {
    const productId = String(item.product_id)
    if (SUBSCRIPTION_PRODUCTS[productId]) {
      upgrade = SUBSCRIPTION_PRODUCTS[productId]
      break
    }
  }

  if (!upgrade) {
    return NextResponse.json({ status: 'ignored', reason: 'no subscription product' })
  }

  console.log(`🚀 Subscription purchase detected: ${upgrade.tier} tier`)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const customerEmail = (order.email || '').toLowerCase().trim()
  const { data: vendor, error: vendorErr } = await supabase
    .from('vendors')
    .select('id, ref, business_name, goaffpro_affiliate_id, boost_tier')
    .eq('email', customerEmail)
    .maybeSingle()

  if (vendorErr || !vendor) {
    console.error('⚠️ Vendor not found for email:', customerEmail, vendorErr)
    return NextResponse.json({ status: 'error', reason: 'vendor not found' }, { status: 200 })
  }

  console.log(`✅ Found vendor: ${vendor.business_name} (${vendor.ref})`)

  const { error: updateErr } = await supabase
    .from('vendors')
    .update({
      boost_tier: upgrade.tier,
      current_pool: upgrade.pool,
      subscription_active: true,
    })
    .eq('id', vendor.id)

  if (updateErr) {
    console.error('❌ Vendor update failed:', updateErr)
    return NextResponse.json({ status: 'error', reason: updateErr.message }, { status: 200 })
  }

  console.log(`✅ Vendor updated: ${vendor.business_name} → ${upgrade.tier} (${upgrade.pool})`)

  if (vendor.goaffpro_affiliate_id) {
    const newRate = tierToCommission(upgrade.tier)
    await setGoaffproCommission(vendor.goaffpro_affiliate_id, newRate)
  }

  try {
    await supabase.from('admin_events').insert({
      event_type: 'subscription_change',
      vendor_ref: vendor.ref,
      vendor_name: vendor.business_name,
      summary: `${vendor.business_name} upgraded to ${upgrade.tier} (${parseFloat(upgrade.pool) * 100}% pool)`,
      metadata: {
        tier: upgrade.tier,
        pool: upgrade.pool,
        order_id: order.id,
        email: customerEmail,
      },
    })
  } catch (e) {
    console.warn('⚠️ Admin event log failed:', e)
  }

  return NextResponse.json({ status: 'upgraded', vendor: vendor.ref, tier: upgrade.tier })
}
