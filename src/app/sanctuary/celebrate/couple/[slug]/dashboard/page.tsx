'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  Copy, Check, ExternalLink, DollarSign, 
  ShoppingBag, Share2, ChevronRight,
  MessageCircle, Edit3, Users, Wallet,
  FileText, Download, X, Calendar, MapPin, Phone
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// WETWO BRIDE DASHBOARD - WITH BUYING GROUP WELCOME OVERLAY
// Updated for Wedding Buying Group positioning
// ═══════════════════════════════════════════════════════════════

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RegistryStats {
  itemCount: number
  totalValue: number
  cashbackAmount: number
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Format budget range for display
// ═══════════════════════════════════════════════════════════════
function formatBudgetRange(range: string | null): string {
  if (!range) return 'Not specified'
  const labels: Record<string, string> = {
    'under-15k': 'Under $15,000',
    '15k-30k': '$15,000 – $30,000',
    '30k-50k': '$30,000 – $50,000',
    '50k-75k': '$50,000 – $75,000',
    '75k-100k': '$75,000 – $100,000',
    '100k-150k': '$100,000 – $150,000',
    '150k-plus': '$150,000+',
    'not-sure': 'To be determined',
  }
  return labels[range] || range
}

function formatGuestCount(count: string | null): string {
  if (!count) return 'Not specified'
  const labels: Record<string, string> = {
    'under-50': 'Under 50 guests',
    '50-100': '50 – 100 guests',
    '100-150': '100 – 150 guests',
    '150-200': '150 – 200 guests',
    '200-250': '200 – 250 guests',
    '250-300': '250 – 300 guests',
    '300-plus': '300+ guests',
    'not-sure': 'To be determined',
  }
  return labels[count] || count
}

function formatLocation(location: string | null): string {
  if (!location) return 'Not specified'
  const labels: Record<string, string> = {
    'boston': 'Boston Area',
    'providence': 'Providence / Rhode Island',
    'cape-cod': 'Cape Cod',
    'new-hampshire': 'New Hampshire',
    'maine': 'Maine',
    'connecticut': 'Connecticut',
    'other-new-england': 'Other New England',
    'not-sure': 'To be determined',
  }
  return labels[location] || location
}

// ═══════════════════════════════════════════════════════════════
// WELCOME OVERLAY COMPONENT - Wedding Buying Group Style
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// WETWO WELCOME OVERLAY - CASHBACK REGISTRY FOCUS
// Replace the existing WelcomeOverlay function in dashboard/page.tsx
// ═══════════════════════════════════════════════════════════════

function WelcomeOverlay({ 
  isOpen, 
  onClose, 
  couple 
}: { 
  isOpen: boolean
  onClose: () => void
  couple: any 
}) {
  if (!isOpen || !couple) return null

  const registryUrl = `https://wetwo.love/collections/registry-${couple.slug}?ref=${couple.slug}&owner=true`

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(4px)'
        }}
      />
      
      {/* Modal */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        maxHeight: '90vh',
        margin: '0 16px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a15 100%)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(212, 175, 116, 0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header with emoji */}
        <div style={{
          padding: '28px 24px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
            {couple.partner_a}'s Cashback Registry
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, margin: 0 }}>
            is ready to customize
          </p>
        </div>
        
        {/* Content - scrollable */}
        <div style={{
          padding: '0 24px 24px',
          overflowY: 'auto',
          flex: 1
        }}>
          
          {/* THE HOOK - Cashback Math */}
          <div style={{
            background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            <p style={{ color: '#0a0a15', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>
              $10,000 in gifts
            </p>
            <p style={{ color: '#0a0a15', fontSize: 16, margin: 0 }}>
              = gifts + <strong>${(10000 * (0.25 + parseFloat(couple.referral_bonus_percent || '0'))).toLocaleString()} cash back</strong>
            </p>
          </div>
          
          {/* How it works */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ 
              color: '#d4af74', 
              fontSize: 11, 
              fontWeight: 600, 
              letterSpacing: 1.5, 
              textTransform: 'uppercase', 
              margin: '0 0 14px' 
            }}>
              How It Works
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#0a0a15', fontWeight: 700, fontSize: 13 }}>1</span>
                </div>
                <div>
                  <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>
                    We pre-filled your registry
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                    57 of our most-loved items are already in your registry. Keep what you like.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#0a0a15', fontWeight: 700, fontSize: 13 }}>2</span>
                </div>
                <div>
                  <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>
                    Remove what you don't want
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                    Click "View Your Registry" below to remove items. Add from our full store anytime.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#0a0a15', fontWeight: 700, fontSize: 13 }}>3</span>
                </div>
                <div>
                  <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>
                    Share with guests & earn
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                    When guests buy from your registry, you get 25% back. Real cash, paid monthly.
                  </p>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Why this works */}
          <div style={{
            background: 'rgba(74, 222, 128, 0.08)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
            borderRadius: 10,
            padding: 14,
            marginBottom: 20
          }}>
            <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>
              💰 How {Math.round((0.25 + parseFloat(couple?.referral_bonus_percent || '0')) * 100)}%??
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              We buy wholesale, list at discounted prices, and share the margin with you. Your guests buy you gifts at a discount — you get the gifts plus Honeymoon cash.
            </p>
          </div>
          
        </div>
        
        {/* CTA Button */}
        <div style={{ padding: '0 24px 24px' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
              border: 'none',
              borderRadius: 10,
              color: '#0a0a15',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            Got It — View My Dashboard
            <ChevronRight size={18} />
          </button>
        </div>
        
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function BrideDashboard({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams()
  const [couple, setCouple] = useState<any>(null)
  const [stats, setStats] = useState<RegistryStats>({ itemCount: 0, totalValue: 0, cashbackAmount: 0 })
  const [earnings, setEarnings] = useState<{ totalEarned: number, pendingBalance: number, paidOut: number }>({ 
    totalEarned: 0, 
    pendingBalance: 0, 
    paidOut: 0 
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  const slug = params.slug
  const cashbackRate = 0.25

  // Welcome overlay logic - show on first visit or ?blueprint=1
  useEffect(() => {
    const blueprintParam = searchParams.get('blueprint')
    const hasSeenWelcome = localStorage.getItem(`welcome-seen-${slug}`)
    
    if (blueprintParam === '1' || !hasSeenWelcome) {
      setShowWelcome(true)
    }
  }, [searchParams, slug])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem(`welcome-seen-${slug}`, 'true')
  }

  // Load couple data AND earnings - ALWAYS FRESH (no cache)
  useEffect(() => {
    const loadCouple = async () => {
      console.log('[Dashboard] Loading couple for slug:', slug)
      
      // ALWAYS fetch fresh from Supabase - no cache
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('slug', slug)
        .single()

      console.log('[Dashboard] Supabase response:', { data, error })

      if (data && !error) {
        setCouple(data)
        
        // Log ALL fields to see what we have
        console.log('[Dashboard] Full couple data keys:', Object.keys(data))
        console.log('[Dashboard] affiliate_commission =', data.affiliate_commission, typeof data.affiliate_commission)
        console.log('[Dashboard] amount_paid =', data.amount_paid, typeof data.amount_paid)
        console.log('[Dashboard] budget_range =', data.budget_range)
        console.log('[Dashboard] guest_count =', data.guest_count)
        console.log('[Dashboard] wedding_date =', data.wedding_date)
        console.log('[Dashboard] wedding_location =', data.wedding_location)
        
        // Parse earnings - handle string or number
        const commission = data.affiliate_commission
        const paid = data.amount_paid
        
        const totalEarned = typeof commission === 'string' 
          ? parseFloat(commission) 
          : (typeof commission === 'number' ? commission : 0)
        
        const paidOut = typeof paid === 'string'
          ? parseFloat(paid)
          : (typeof paid === 'number' ? paid : 0)
        
        console.log('[Dashboard] PARSED: totalEarned =', totalEarned, ', paidOut =', paidOut)
        
        setEarnings({
          totalEarned: totalEarned || 0,
          pendingBalance: (totalEarned || 0) - (paidOut || 0),
          paidOut: paidOut || 0
        })
      } else {
        console.log('[Dashboard] Error or no data:', error)
      }
      
      setLoading(false)
    }

    if (slug) loadCouple()
  }, [slug])

  // Load registry stats from Shopify
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`/api/registry/stats?slug=${slug}`)
        const data = await res.json()
        if (data.success) {
          setStats({
            itemCount: data.itemCount || 0,
            totalValue: data.totalValue || 0,
            cashbackAmount: (data.totalValue || 0) * cashbackRate
          })
        }
      } catch (err) {
        console.error('Failed to load registry stats:', err)
      }
    }

    if (slug) loadStats()
  }, [slug])

  // Look up vendor name if referred
  useEffect(() => {
    if (!couple?.referred_by_vendor_id) return
    const name = couple.referred_by_vendor
    // If referred_by_vendor looks like a UUID, look up the actual name
    if (name && !/^[0-9a-f]{8}-/.test(name)) {
      setVendorName(name)
    } else {
      const lookup = async () => {
        const { data } = await supabase
          .from('vendors')
          .select('business_name')
          .eq('id', couple.referred_by_vendor_id)
          .single()
        if (data?.business_name) setVendorName(data.business_name)
      }
      lookup()
    }
  }, [couple])

  const copyGuestLink = () => {
    const link = `https://wetwo.love/collections/registry-${slug}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareGuestLink = async () => {
    const link = `https://wetwo.love/collections/registry-${slug}`
    if (navigator.share) {
      await navigator.share({
        title: `${couple?.partner_a} & ${couple?.partner_b}'s Wedding Registry`,
        text: 'Check out our wedding registry!',
        url: link
      })
    } else {
      copyGuestLink()
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4af74'
      }}>
        Loading...
      </div>
    )
  }

  if (!couple) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444',
        padding: 20
      }}>
        Registry not found. Please check your link.
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Welcome Overlay */}
      <WelcomeOverlay 
        isOpen={showWelcome} 
        onClose={handleCloseWelcome} 
        couple={couple}
      />

      {/* Main Content */}
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '20px 16px 40px'
      }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ 
  color: 'white', 
  fontSize: 24, 
  fontWeight: 700, 
  margin: '0 0 4px' 
}}>
  Welcome, {couple.partner_a}{couple.partner_b ? ` & ${couple.partner_b}` : ''}!
</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
            Your WeTwo Registry Dashboard
          </p>
        </div>

        {/* Registry Section Header */}
        <p style={{ 
          color: '#d4af74', 
          fontSize: 11, 
          fontWeight: 600, 
          letterSpacing: 1.5, 
          textTransform: 'uppercase', 
          margin: '20px 0 12px',
          paddingLeft: 4
        }}>
          Your Cashback Registry
        </p>

        {/* Vendor Referrer Banner */}
        {couple?.referred_by_vendor_id && (
          <div style={{
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: 20 }}>🤝</span>
            <div>
              <div style={{ color: '#4ade80', fontSize: 14, fontWeight: 600 }}>
                Referred by {vendorName || 'a WeTwo Vendor'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                Your vendor earns when guests buy from your registry
              </div>
            </div>
          </div>
        )}

        {/* 1. VIEW REGISTRY */}
        <a
          href={`https://wetwo.love/collections/registry-${slug}?ref=${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            textDecoration: 'none',
            marginBottom: 12
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(212, 175, 116, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Edit3 size={20} color="#d4af74" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>View Your Registry</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Edit mode — add or remove items</div>
          </div>
          <ExternalLink size={16} color="rgba(255,255,255,0.3)" />
        </a>

        {/* Registry Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          marginBottom: 12
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#d4af74', fontSize: 24, fontWeight: 700 }}>{stats.itemCount}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase' }}>Items</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>${stats.totalValue.toLocaleString()}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase' }}>Value</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#4ade80', fontSize: 24, fontWeight: 700 }}>${stats.cashbackAmount.toLocaleString()}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase' }}>Cashback</div>
          </div>
        </div>

        {/* 2. BROWSE STORE */}
        <a
          href={`https://wetwo.love/collections/all?ref=${slug}&owner=true`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            textDecoration: 'none',
            marginBottom: 12
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={20} color="#0a0a15" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Browse & Add Items</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Shop the store, add to registry</div>
          </div>
          <ExternalLink size={16} color="rgba(255,255,255,0.3)" />
        </a>

        {/* 3. GUEST LINK */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(212, 175, 116, 0.15) 0%, rgba(212, 175, 116, 0.05) 100%)',
          border: '1px solid rgba(212, 175, 116, 0.3)',
          borderRadius: 14,
          marginBottom: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(212, 175, 116, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={20} color="#d4af74" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Guest Link</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Share with friends & family</div>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(10, 10, 21, 0.6)',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 10,
            fontSize: 12,
            color: '#d4af74',
            wordBreak: 'break-all'
          }}>
            wetwo.love/collections/registry-{slug}
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={copyGuestLink}
              style={{
                flex: 1,
                padding: '12px',
                background: copied ? 'rgba(74, 222, 128, 0.2)' : 'rgba(10, 10, 21, 0.6)',
                border: `1px solid ${copied ? 'rgba(74, 222, 128, 0.4)' : 'rgba(212, 175, 116, 0.3)'}`,
                borderRadius: 8,
                color: copied ? '#4ade80' : '#d4af74',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            
            <button
              onClick={shareGuestLink}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#0a0a15',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>

        {/* 4. EARNINGS */}
        <div style={{
          padding: '16px',
          background: 'rgba(20, 30, 50, 0.8)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: 14,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(74, 222, 128, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet size={20} color="#4ade80" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Earnings</span>
                <span style={{
                  background: 'rgba(74, 222, 128, 0.2)',
                  color: '#4ade80',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700
                }}>{Math.round((0.25 + parseFloat(couple?.referral_bonus_percent || '0')) * 100)}% Cashback</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Track cashback & set up transfers</div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 12
          }}>
            <div style={{
              background: 'rgba(10, 10, 21, 0.5)',
              borderRadius: 10,
              padding: 14,
              textAlign: 'center'
            }}>
              <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 700 }}>
                ${earnings.totalEarned.toFixed(2)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Total Earned</div>
            </div>
            <div style={{
              background: 'rgba(10, 10, 21, 0.5)',
              borderRadius: 10,
              padding: 14,
              textAlign: 'center'
            }}>
              <div style={{ color: '#d4af74', fontSize: 22, fontWeight: 700 }}>
                ${earnings.pendingBalance.toFixed(2)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Pending</div>
            </div>
          </div>
          
          <a
            href="https://wetwo.goaffpro.com/forgot-password"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: 8,
              color: '#4ade80',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: 10
            }}
          >
            <DollarSign size={16} />
            Set Up Payout Account
            <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </a>
          
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 11,
            margin: 0,
            textAlign: 'center'
          }}>
            Use your registry email to set password, then Settings → Payment
          </p>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 16px 32px',
        textAlign: 'center',
        borderTop: '1px solid rgba(212, 175, 116, 0.1)',
        marginTop: 20
      }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>
          © 2026 WeTwo · The Wedding Buying Group
        </p>
      </div>

    </div>
  )
}