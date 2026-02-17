import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ vendor: null })
  }

  // Strip "vendor-" prefix if present (Shopify URLs include it)
  const slug = ref.replace(/^vendor-/, '')

  try {
    // Try ref first, then referral_slug
    let { data: vendor } = await supabase
      .from('vendors')
      .select('id, ref, business_name, photo_url, boost_tier, plan, current_pool')
      .eq('ref', slug)
      .maybeSingle()

    if (!vendor) {
      const result = await supabase
        .from('vendors')
        .select('id, ref, business_name, photo_url, boost_tier, plan, current_pool')
        .eq('referral_slug', slug)
        .maybeSingle()
      vendor = result.data
    }

    if (!vendor) {
      return NextResponse.json({ vendor: null, debug: { slug, ref } })
    }

    const tier = vendor.boost_tier || vendor.plan || 'free'

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        ref: vendor.ref,
        business_name: vendor.business_name,
        photo_url: vendor.photo_url,
        tier,
      }
    })
  } catch (err: any) {
    console.error('Vendor resolve error:', err)
    return NextResponse.json({ vendor: null, error: err.message })
  }
}
