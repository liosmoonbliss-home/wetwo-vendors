import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ vendor: null })
  }

  const slug = ref.replace(/^vendor-/, '')

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('id, ref, business_name, photo_url, boost_tier, current_pool')
      .eq('ref', slug)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ vendor: null, debug: { slug, error: error.message } })
    }

    if (!vendor) {
      return NextResponse.json({ vendor: null, debug: { slug, note: 'no match on ref' } })
    }

    const tier = vendor.boost_tier || 'free'

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
    return NextResponse.json({ vendor: null, debug: { slug, error: err.message } })
  }
}
