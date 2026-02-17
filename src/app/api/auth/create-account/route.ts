import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// POST: Create a vendor account
export async function POST(req: NextRequest) {
  try {
    const { vendor_ref, email, password, name, plan } = await req.json()

    if (!vendor_ref || !email || !password) {
      return NextResponse.json({ error: 'vendor_ref, email, and password are required' }, { status: 400 })
    }

    // Verify vendor exists
    const { data: vendor } = await supabase
      .from('vendors')
      .select('ref, business_name')
      .eq('ref', vendor_ref)
      .single()

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('vendor_accounts')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // Create account — v4.4 tier structure: free (0%), pro (10%), elite (20%)
    const { data: account, error } = await supabase
      .from('vendor_accounts')
      .insert({
        vendor_ref,
        email: email.toLowerCase().trim(),
        password_hash: hashPassword(password),
        name: name || vendor.business_name,
        plan: plan || 'free',
        commission_rate: plan === 'pro' ? 10 : plan === 'elite' ? 20 : 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Create account error:', error)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      account: { id: account.id, email: account.email, vendor_ref, plan: account.plan }
    })

  } catch (err) {
    console.error('Create account error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
