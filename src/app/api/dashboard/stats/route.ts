import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 })

  try {
    // Count leads
    const { count: leadsCount } = await supabase
      .from('vendor_leads')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_ref', ref)

    // Count couples
    const { count: couplesCount } = await supabase
      .from('vendor_clients')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_ref', ref)
      .eq('type', 'couple')

    // Count shoppers
    const { count: shoppersCount } = await supabase
      .from('vendor_clients')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_ref', ref)
      .eq('type', 'shopper')

    // Total commission
    const { data: commData } = await supabase
      .from('vendor_clients')
      .select('commission_earned')
      .eq('vendor_ref', ref)

    const totalCommission = (commData || []).reduce((sum: number, c: any) => sum + (c.commission_earned || 0), 0)

    // Recent activity
    const { data: activity } = await supabase
      .from('vendor_activity')
      .select('*')
      .eq('vendor_ref', ref)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        leads: leadsCount || 0,
        couples: couplesCount || 0,
        shoppers: shoppersCount || 0,
        totalCommission: totalCommission || 0,
      },
      activity: activity || [],
    })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}

