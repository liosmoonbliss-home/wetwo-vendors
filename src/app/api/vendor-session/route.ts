import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { ref, business_name, email, plan } = await req.json()

    if (!ref) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Check if we already logged a session for this vendor in the last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    const { data: recent } = await supabase
      .from('admin_events')
      .select('id')
      .eq('event_type', 'vendor_login')
      .eq('vendor_ref', ref)
      .gte('created_at', twoHoursAgo)
      .limit(1)

    if (recent && recent.length > 0) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Log the session
    const { error } = await supabase.from('admin_events').insert({
      event_type: 'vendor_login',
      vendor_ref: ref,
      vendor_name: business_name || ref,
      actor_email: email || null,
      summary: `${business_name || ref} opened dashboard`,
      metadata: { email: email || null, plan: plan || 'free' },
    })

    if (error) {
      console.error('[SESSION] Track error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[SESSION] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
