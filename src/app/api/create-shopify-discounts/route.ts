import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SHOPIFY_STORE = 'bb0sam-tz.myshopify.com';
const SHOPIFY_API_VERSION = '2024-01';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { vendor_id } = await req.json();

    if (!vendor_id) {
      return NextResponse.json({ error: 'vendor_id required' }, { status: 400 });
    }

    const shopifyToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    if (!shopifyToken) {
      return NextResponse.json({ error: 'Shopify token not configured' }, { status: 500 });
    }

    // Get vendor info
    const { data: vendor, error: vendorErr } = await supabase
      .from('vendors')
      .select('id, business_name, referral_slug')
      .eq('id', vendor_id)
      .single();

    if (vendorErr || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Get coupon incentives that need Shopify codes
    const { data: coupons, error: coupErr } = await supabase
      .from('vendor_incentives')
      .select('*')
      .eq('vendor_id', vendor_id)
      .eq('incentive_type', 'coupon')
      .is('shopify_price_rule_id', null);

    if (coupErr) {
      return NextResponse.json({ error: coupErr.message }, { status: 500 });
    }

    if (!coupons || coupons.length === 0) {
      return NextResponse.json({
        status: 'no_new_coupons',
        message: 'All coupon codes already created in Shopify'
      });
    }

    const results = [];

    for (const coupon of coupons) {
      try {
        // Step 1: Create Shopify Price Rule
        const priceRuleRes = await fetch(
          `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/price_rules.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': shopifyToken,
            },
            body: JSON.stringify({
              price_rule: {
                title: `WeTwo-${vendor.referral_slug}-${coupon.percentage}pct`,
                target_type: 'line_item',
                target_selection: 'all',
                allocation_method: 'across',
                value_type: 'percentage',
                value: `-${coupon.percentage}.0`,
                customer_selection: 'all',
                starts_at: new Date().toISOString(),
                usage_limit: null,
                once_per_customer: false,
              }
            }),
          }
        );

        if (!priceRuleRes.ok) {
          const errText = await priceRuleRes.text();
          console.error(`Price rule failed for ${coupon.code}:`, errText);
          results.push({ code: coupon.code, percentage: coupon.percentage, error: errText });
          continue;
        }

        const { price_rule } = await priceRuleRes.json();

        // Step 2: Create Discount Code under the Price Rule
        const discountRes = await fetch(
          `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/price_rules/${price_rule.id}/discount_codes.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': shopifyToken,
            },
            body: JSON.stringify({
              discount_code: { code: coupon.code }
            }),
          }
        );

        if (!discountRes.ok) {
          const errText = await discountRes.text();
          console.error(`Discount code failed for ${coupon.code}:`, errText);
          results.push({ code: coupon.code, percentage: coupon.percentage, error: errText });
          continue;
        }

        const { discount_code } = await discountRes.json();

        // Step 3: Update Supabase with Shopify IDs
        await supabase
          .from('vendor_incentives')
          .update({
            shopify_price_rule_id: price_rule.id,
            shopify_discount_id: discount_code.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', coupon.id);

        results.push({
          code: coupon.code,
          percentage: coupon.percentage,
          shopify_price_rule_id: price_rule.id,
          shopify_discount_id: discount_code.id,
          status: 'created',
        });

        // Rate limit: Shopify allows 2 requests/second
        await new Promise(r => setTimeout(r, 600));

      } catch (err: any) {
        console.error(`Error for ${coupon.code}:`, err);
        results.push({ code: coupon.code, percentage: coupon.percentage, error: err.message });
      }
    }

    return NextResponse.json({
      status: 'complete',
      vendor: vendor.business_name,
      vendor_id: vendor.id,
      results,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
