import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 })

  const { data, error } = await supabase
    .from('vendors')
    .select('subscription_active')
    .eq('ref', ref)
    .single()

  if (error || !data) {
    return NextResponse.json({ active: false })
  }

  return NextResponse.json({ active: data.subscription_active === true })
}
