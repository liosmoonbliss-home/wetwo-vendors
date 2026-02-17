'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 🔑 LocalStorage cache key - matches the dashboard
const COUPLE_CACHE_KEY = 'couple_dashboard_data'

export default function CoupleSignup() {
  const [partnerA, setPartnerA] = useState('')
  const [partnerB, setPartnerB] = useState('')
  const [email, setEmail] = useState('')
  const [addressState, setAddressState] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [magicLink, setMagicLink] = useState('')

  // 🆕 REFERRAL TRACKING STATE (vendor cookie-based)
  const [referralData, setReferralData] = useState<{
    vendorId: string
    vendorName: string
    referralSlug: string
  } | null>(null)

  // 🆕 PARTNER REFERRAL STATE (URL param-based)
  const [partnerData, setPartnerData] = useState<{
    partnerId: string
    partnerName: string
    partnerCode: string
  } | null>(null)

  const searchParams = useSearchParams()

  // 🆕 CAPTURE REFERRAL FROM URL ?ref= PARAMETER (from vendor pages)
  useEffect(() => {
    const refParam = searchParams.get('ref')
    
    if (refParam && refParam.startsWith('vendor-')) {
      console.log('[Signup] 🔍 Vendor ref found:', refParam)
      
      // Extract the vendor ref (e.g., "vendor-glitter-thicket-t13f" -> need to find by goaffpro_referral_code)
      const lookupVendor = async () => {
        const { data: vendor, error } = await supabase
          .from('vendors')
          .select('id, business_name, goaffpro_referral_code, ref')
          .eq('goaffpro_referral_code', refParam)
          .single()
        
        if (vendor && !error) {
          setReferralData({
            vendorId: vendor.id,
            vendorName: vendor.business_name,
            referralSlug: vendor.ref
          })
          console.log('[Signup] ✅ Vendor found from ref:', vendor.business_name)
        } else {
          console.log('[Signup] ⚠️ Vendor not found for ref:', refParam)
        }
      }
      
      lookupVendor()
    }
  }, [searchParams])

  // 🆕 CAPTURE REFERRAL FROM COOKIE ON MOUNT (fallback)
  useEffect(() => {
    // Only check cookie if we don't already have referral from URL
    if (referralData) return
    
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }
    
    const cookieData = getCookie('wetwo_referral')
    
    if (cookieData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieData))
        // Check if referral is less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setReferralData({
            vendorId: parsed.vendorId,
            vendorName: parsed.vendorName,
            referralSlug: parsed.referralSlug
          })
          console.log('[Signup] ✅ Referral captured from cookie:', parsed.vendorName)
        }
      } catch (e) {
        console.error('[Signup] Error parsing referral cookie:', e)
      }
    }
  }, [referralData])

  // 🆕 CAPTURE PARTNER FROM URL PARAM
  useEffect(() => {
    const partnerCode = searchParams.get('partner')
    
    if (partnerCode) {
      console.log('[Signup] 🔍 Partner code found:', partnerCode)
      
      // Look up partner by their referral code
      const lookupPartner = async () => {
        const { data: partner, error } = await supabase
          .from('vendors')
          .select('id, business_name, partner_referral_code, is_partner')
          .eq('partner_referral_code', partnerCode)
          .eq('is_partner', true)
          .single()
        
        if (partner && !error) {
          setPartnerData({
            partnerId: partner.id,
            partnerName: partner.business_name,
            partnerCode: partner.partner_referral_code
          })
          console.log('[Signup] ✅ Partner found:', partner.business_name)
        } else {
          console.log('[Signup] ⚠️ Partner not found for code:', partnerCode)
        }
      }
      
      lookupPartner()
    }
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMagicLink('')

    // 🔑 Validate required fields
    if (!addressState) {
      setMessage('Please select your state')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/couples/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_a: partnerA,
          partner_b: partnerB,
          email: email,
          address_state: addressState,
          // 🆕 PASS REFERRAL TO API (vendor ID to both fields for compatibility)
          referred_by_vendor: referralData?.vendorId || null,
          referred_by_vendor_id: referralData?.vendorId || null,
          // 🆕 PASS PARTNER TO API
          referred_by_partner_id: partnerData?.partnerId || null
        })
      })

      const data = await response.json()

      if (data.success) {
        // 🔑 Cache couple data
        if (data.couple) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(COUPLE_CACHE_KEY, JSON.stringify(data.couple))
            console.log('[Signup] ✅ Cached new couple data')
          }
        }

        // 🆕 CLEAR REFERRAL COOKIE
        document.cookie = 'wetwo_referral=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        console.log('[Signup] ✅ Cleared referral cookie')
        
        // 📧 Show success message
        setMessage('✓ Registry created! Redirecting to your dashboard...')
        
        // 🎉 Redirect to their DASHBOARD (not registry editing page)
        setTimeout(() => {
          // Use the dashboard URL with token
          if (data.dashboardUrl) {
            window.location.href = data.dashboardUrl
          } else if (data.couple?.slug && data.couple?.magic_token) {
            window.location.href = `/sanctuary/celebrate/couple/${data.couple.slug}/dashboard?token=${data.couple.magic_token}`
          } else if (data.registryUrl) {
            // Fallback to registry URL
            window.location.href = data.registryUrl
          }
        }, 1500)
      } else {
        setMessage(data.message || 'Failed to create registry')
      }
    } catch (error) {
      setMessage('Error creating registry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Determine the display name for the referring vendor
  const referrerName = partnerData?.partnerName || referralData?.vendorName || null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2e 20%, #1e2a47 50%, #2a3d5f 80%, #1a1a2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'rgba(20, 30, 50, 0.9)',
        borderRadius: '20px',
        border: '1px solid rgba(212, 175, 116, 0.3)',
        padding: '40px 36px',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Ring Icon */}
        <div style={{
          width: '70px',
          height: '70px',
          margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px'
        }}>
          💍
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '32px',
          color: 'white',
          textAlign: 'center',
          marginBottom: '8px',
          fontWeight: 500
        }}>
          Start Your Registry
        </h1>

        {/* Value Prop */}
        <p style={{
          fontSize: '18px',
          color: '#d4af74',
          textAlign: 'center',
          marginBottom: '8px',
          fontWeight: 600
        }}>
          Get cash back on every gift your guests buy
        </p>

        {/* Subtext */}
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          Your guests choose the perfect gifts — you get cash in your bridal purse on top.
        </p>

        {/* 🆕 PARTNER REFERRAL BANNER */}
        {partnerData && (
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <span style={{ color: '#a855f7', fontSize: '14px' }}>
              🤝 Gifted by <strong>{partnerData.partnerName}</strong>
            </span>
          </div>
        )}

        {/* 🆕 VENDOR REFERRAL BANNER (only show if no partner) */}
        {referralData && !partnerData && (
          <div style={{
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <span style={{ color: '#4ade80', fontSize: '14px' }}>
              ✨ Courtesy of <strong>{referralData.vendorName}</strong>
            </span>
          </div>
        )}

        {/* SIGNUP FORM */}
        <form onSubmit={handleSignup}>
          {/* Partner Names - Side by Side */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            marginBottom: '16px' 
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                color: 'rgba(212, 175, 116, 0.9)',
                marginBottom: '6px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                Your Name *
              </label>
              <input
                type="text"
                value={partnerA}
                onChange={(e) => setPartnerA(e.target.value)}
                placeholder="Jane"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(10, 20, 35, 0.6)',
                  border: '2px solid rgba(212, 175, 116, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                color: 'rgba(212, 175, 116, 0.9)',
                marginBottom: '6px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {"Partner's"} Name *
              </label>
              <input
                type="text"
                value={partnerB}
                onChange={(e) => setPartnerB(e.target.value)}
                placeholder="John"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(10, 20, 35, 0.6)',
                  border: '2px solid rgba(212, 175, 116, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: 'rgba(212, 175, 116, 0.9)',
              marginBottom: '6px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(10, 20, 35, 0.6)',
                border: '2px solid rgba(212, 175, 116, 0.3)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* State */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: 'rgba(212, 175, 116, 0.9)',
              marginBottom: '6px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              State *
            </label>
            <select
              value={addressState}
              onChange={(e) => setAddressState(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(10, 20, 35, 0.6)',
                border: '2px solid rgba(212, 175, 116, 0.3)',
                borderRadius: '10px',
                color: addressState ? 'white' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select state...</option>
              {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          {!magicLink && (
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? 'rgba(212, 175, 116, 0.5)' : 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#0a0a15',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Creating your registry...' : 'Create Free Registry →'}
            </button>
          )}
        </form>

        {/* Message */}
        {message && (
          <div style={{
            marginTop: '20px',
            padding: '14px',
            background: message.includes('✓') ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: message.includes('✓') ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: message.includes('✓') ? '#4ade80' : '#ef4444',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Footer - Just 2 items */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(212, 175, 116, 0.15)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>💰</div>
            <div style={{ fontSize: '12px', color: '#d4af74', fontWeight: 600 }}>Cash Back</div>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>On every gift</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>✨</div>
            <div style={{ fontSize: '12px', color: '#d4af74', fontWeight: 600 }}>Free Forever</div>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>No hidden fees</div>
          </div>
        </div>
      </div>
    </div>
  )
}
