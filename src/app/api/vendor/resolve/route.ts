import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Lightweight vendor lookup for the create-registry form
// Returns just enough to show "Referred by [Vendor]" + resolve vendor_id
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ vendor: null })
  }

  // Strip "vendor-" prefix if present (Shopify URLs include it)
  const slug = ref.replace(/^vendor-/, '')

  try {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('id, ref, business_name, photo_url, boost_tier, plan, current_pool')
      .or(`ref.eq.${slug},referral_slug.eq.${slug},ref.eq.vendor-${slug},referral_slug.eq.vendor-${slug}`)
      .single()

    if (error || !vendor) {
      return NextResponse.json({ vendor: null })
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
  } catch (err) {
    console.error('Vendor resolve error:', err)
    return NextResponse.json({ vendor: null })
  }
}
