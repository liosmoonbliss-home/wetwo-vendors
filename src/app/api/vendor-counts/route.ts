import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')

    if (!ref) {
      return NextResponse.json({ error: 'ref is required' }, { status: 400 })
    }

    // Get vendor ID from ref
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('ref', ref)
      .single()

    if (!vendor) {
      return NextResponse.json({ couples: 0, clients: 0, leads: 0, newCouples: 0, newClients: 0, newLeads: 0 })
    }

    const vendorId = vendor.id
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    // All data lives in vendor_leads
    // Shoppers = interest is 'Shop'
    // Leads = everything else (contact form inquiries)
    const [
      { count: couples },
      { count: newCouples },
      { count: shoppers },
      { count: newShoppers },
      { count: leads },
      { count: newLeads },
    ] = await Promise.all([
      supabase.from('couples').select('*', { count: 'exact', head: true }).eq('referred_by_vendor_id', vendorId),
      supabase.from('couples').select('*', { count: 'exact', head: true }).eq('referred_by_vendor_id', vendorId).gte('created_at', twoDaysAgo),
      supabase.from('vendor_leads').select('*', { count: 'exact', head: true }).eq('vendor_ref', ref).eq('interest', 'Shop'),
      supabase.from('vendor_leads').select('*', { count: 'exact', head: true }).eq('vendor_ref', ref).eq('interest', 'Shop').gte('created_at', twoDaysAgo),
      supabase.from('vendor_leads').select('*', { count: 'exact', head: true }).eq('vendor_ref', ref).neq('interest', 'Shop'),
      supabase.from('vendor_leads').select('*', { count: 'exact', head: true }).eq('vendor_ref', ref).neq('interest', 'Shop').gte('created_at', twoDaysAgo),
    ])

    return NextResponse.json({
      couples: couples || 0,
      clients: shoppers || 0,
      leads: leads || 0,
      newCouples: newCouples || 0,
      newClients: newShoppers || 0,
      newLeads: newLeads || 0,
    })
  } catch (err) {
    console.error('Vendor counts error:', err)
    return NextResponse.json({ couples: 0, clients: 0, leads: 0, newCouples: 0, newClients: 0, newLeads: 0 })
  }
}
