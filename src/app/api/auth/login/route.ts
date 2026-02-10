import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { trackEvent } from '@/lib/admin-track';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find vendor account
    const { data: account, error: accountError } = await supabase
      .from('vendor_accounts')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check password
    const hashedInput = hashPassword(password)
    if (account.password_hash !== hashedInput) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Get vendor data
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('ref', account.vendor_ref)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor record not found' }, { status: 404 })
    }

    // Update last login
    await supabase
      .from('vendor_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('id', account.id)

    // Track login in activity feed
    trackEvent({
      event_type: 'vendor_login',
      vendor_ref: vendor.ref,
      vendor_name: vendor.business_name || vendor.contact_name,
      actor_email: account.email,
      summary: `${vendor.business_name || vendor.ref} logged in`,
      metadata: { email: account.email, plan: account.plan || 'free' },
    }).catch(() => {});

    // Return session data (vendor info + account info)
    return NextResponse.json({
      vendor: {
        ref: vendor.ref,
        business_name: vendor.business_name,
        contact_name: vendor.contact_name,
        email: account.email,
        plan: account.plan,
        commission_rate: account.commission_rate,
        category: vendor.category,
        city: vendor.city,
        state: vendor.state,
        phone: vendor.phone,
        website: vendor.website,
        instagram_handle: vendor.instagram_handle,
        photo_url: vendor.photo_url,
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
