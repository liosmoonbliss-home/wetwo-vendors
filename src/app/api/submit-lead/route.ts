import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { vendor_ref, name, email, phone, event_date, interest, message } = body

    if (!vendor_ref || !name) {
      return NextResponse.json({ error: 'vendor_ref and name required' }, { status: 400 })
    }

    // Insert lead
    const { data, error } = await supabase
      .from('vendor_leads')
      .insert({
        vendor_ref,
        name,
        email: email || null,
        phone: phone || null,
        event_date: event_date || null,
        interest: interest || null,
        message: message || null,
        source: 'contact_form',
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Lead submission error:', error)
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
    }

    // Log activity
    await supabase.from('vendor_activity').insert({
      vendor_ref,
      type: 'form_submit',
      description: `New inquiry from ${name}${interest ? ` about ${interest}` : ''}`,
      metadata: { lead_id: data.id, name, email, interest },
    })

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

