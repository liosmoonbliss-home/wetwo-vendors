import { trackEvent } from '@/lib/admin-track';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — vendor submits a change request
// GET — admin fetches requests (optionally filtered by vendor_ref or status)
// PATCH — admin updates status/notes

export async function POST(req: NextRequest) {
  try {
    const { vendor_ref, vendor_name, message } = await req.json()

    if (!vendor_ref || !message?.trim()) {
      return NextResponse.json({ error: 'vendor_ref and message are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('vendor_change_requests')
      .insert({ vendor_ref, vendor_name: vendor_name || null, message: message.trim() })
      .select()
      .single()

    if (error) throw error

    // Track in activity feed
    trackEvent({
      event_type: 'vendor_request',
      vendor_ref,
      vendor_name: vendor_name || undefined,
      summary: `Page change request from ${vendor_name || vendor_ref}`,
      metadata: {
        request_id: data.id,
        message: message.trim().substring(0, 500),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, request: data })
  } catch (err) {
    console.error('Change request POST error:', err)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const vendor_ref = searchParams.get('ref')
    const status = searchParams.get('status')

    let query = supabase
      .from('vendor_change_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (vendor_ref) query = query.eq('vendor_ref', vendor_ref)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ requests: data || [] })
  } catch (err) {
    console.error('Change request GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, admin_notes } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Request id is required' }, { status: 400 })
    }

    const updates: any = {}
    if (status) updates.status = status
    if (admin_notes !== undefined) updates.admin_notes = admin_notes

    const { data, error } = await supabase
      .from('vendor_change_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, request: data })
  } catch (err) {
    console.error('Change request PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
