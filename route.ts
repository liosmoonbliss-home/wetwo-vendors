/***********************************************************************
 * WeTwo — Coupon Management API v2
 * /api/coupons/manage
 *
 * Simplified: One action — generate a code.
 * - percentage: 5/10/15/20
 * - usage_limit: 1 (one person) or null (everyone)
 * - expires_hours: auto-calculated, max 14 days safety net
 ***********************************************************************/

import { NextRequest, NextResponse } from 'next/server'

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'bb0sam-tz.myshopify.com'
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || ''

async function shopifyAdmin(endpoint: string, method = 'GET', body?: any) {
  const url = `https://${SHOPIFY_STORE}/admin/api/2024-01/${endpoint}`
  const opts: RequestInit = {
    method,
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      'Content-Type': 'application/json',
    },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(url, opts)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Shopify ${method} ${endpoint}: ${res.status} — ${text}`)
  }
  return res.json()
}

function generateCode(pct: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let slug = ''
  for (let i = 0; i < 5; i++) slug += chars[Math.floor(Math.random() * chars.length)]
  return `WT-${pct}OFF-${slug}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, vendor_ref, percentage, expires_hours, usage_limit, customer_note } = body

    if (!vendor_ref) {
      return NextResponse.json({ error: 'vendor_ref required' }, { status: 400 })
    }

    if (action === 'flash') {
      if (!percentage || percentage < 1 || percentage > 25) {
        return NextResponse.json({ error: 'percentage must be 1-25' }, { status: 400 })
      }

      const code = generateCode(percentage)

      // Max 14-day safety net (336 hours)
      const maxHours = 14 * 24
      const actualHours = Math.min(expires_hours || 72, maxHours)
      const expiresAt = new Date(Date.now() + actualHours * 60 * 60 * 1000).toISOString()

      const isOneUse = usage_limit === 1

      // Create Shopify price rule
      const priceRule = await shopifyAdmin('price_rules.json', 'POST', {
        price_rule: {
          title: `${isOneUse ? 'Flash' : 'Campaign'} ${percentage}% — ${vendor_ref} — ${code}`,
          target_type: 'line_item',
          target_selection: 'all',
          allocation_method: 'across',
          value_type: 'percentage',
          value: `-${percentage}`,
          customer_selection: 'all',
          usage_limit: isOneUse ? 1 : null,
          once_per_customer: true,
          starts_at: new Date().toISOString(),
          ends_at: expiresAt,
        },
      })

      const priceRuleId = priceRule.price_rule.id

      // Create discount code
      const discount = await shopifyAdmin(
        `price_rules/${priceRuleId}/discount_codes.json`,
        'POST',
        { discount_code: { code } }
      )

      return NextResponse.json({
        success: true,
        flash_code: code,
        percentage,
        expires_at: expiresAt,
        usage_limit: isOneUse ? 1 : 'unlimited',
        price_rule_id: priceRuleId,
        discount_code_id: discount.discount_code.id,
        customer_note: customer_note || null,
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })

  } catch (err: any) {
    console.error('Coupon manage error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
