'use client'

import PayPalConnect from '@/components/dashboard/PayPalConnect'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  Copy, Check, ExternalLink, DollarSign, 
  Share2, ChevronRight, Edit3, Users, Wallet, Send, ShoppingBag, Trash2
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// WETWO COUPLE DASHBOARD — v2 REWRITE
// Priority: Share > Stats > Edit > Earnings > Payout
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
// WELCOME OVERLAY — First visit cashback education
// ═══════════════════════════════════════════════════════════════

function WelcomeOverlay({ 
  isOpen, onClose, couple 
}: { 
  isOpen: boolean; onClose: () => void; couple: any 
}) {
  if (!isOpen || !couple) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(4px)'
      }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 440,
        maxHeight: '90vh', margin: '0 16px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a15 100%)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(212, 175, 116, 0.2)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
            {couple.partner_a}'s Cashback Registry
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, margin: 0 }}>
            is ready to customize
          </p>
        </div>
        
        <div style={{ padding: '0 24px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{
            background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
            borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center'
          }}>
            <p style={{ color: '#0a0a15', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>
              $10,000 in gifts
            </p>
            <p style={{ color: '#0a0a15', fontSize: 16, margin: 0 }}>
              = gifts + <strong>$2,500 cash back</strong>
            </p>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <p style={{ 
              color: '#d4af74', fontSize: 11, fontWeight: 600, 
              letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 14px' 
            }}>How It Works</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { n: '1', t: 'We pre-filled your registry', d: '57 of our most-loved items are already in your registry. Keep what you like.' },
                { n: '2', t: 'Customize & share', d: 'Remove items you don\'t want, add from our store, then share your link with guests.' },
                { n: '3', t: 'Guests buy, you earn', d: 'When guests buy from your registry, you get 25% back. Real cash, paid monthly.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    flexShrink: 0, width: 28, height: 28,
                    background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ color: '#0a0a15', fontWeight: 700, fontSize: 13 }}>{s.n}</span>
                  </div>
                  <div>
                    <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>{s.t}</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, margin: 0, lineHeight: 1.4 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(74, 222, 128, 0.08)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
            borderRadius: 10, padding: 14
          }}>
            <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>
              💰 How 25%?
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              We buy wholesale, list at discounted prices, and share the margin with you. Your guests buy you gifts at a discount — you get the gifts plus Honeymoon cash.
            </p>
          </div>
        </div>
        
        <div style={{ padding: '0 24px 24px' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '16px 24px',
              background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
              border: 'none', borderRadius: 10, color: '#0a0a15',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
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
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

export default function BrideDashboard({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams()
  const [couple, setCouple] = useState<any>(null)
  const [stats, setStats] = useState<RegistryStats>({ itemCount: 0, totalValue: 0, cashbackAmount: 0 })
  const [earnings, setEarnings] = useState({ totalEarned: 0, pendingBalance: 0, paidOut: 0 })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  const slug = params.slug
  const cashbackRate = 0.25

  useEffect(() => {
    const bp = searchParams.get('blueprint')
    const seen = localStorage.getItem(`welcome-seen-${slug}`)
    if (bp === '1' || !seen) setShowWelcome(true)
  }, [searchParams, slug])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem(`welcome-seen-${slug}`, 'true')
  }

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('couples').select('*').eq('slug', slug).single()
      if (data && !error) {
        setCouple(data)
        const c = typeof data.affiliate_commission === 'string' ? parseFloat(data.affiliate_commission) : (data.affiliate_commission || 0)
        const p = typeof data.amount_paid === 'string' ? parseFloat(data.amount_paid) : (data.amount_paid || 0)
        setEarnings({ totalEarned: c || 0, pendingBalance: (c || 0) - (p || 0), paidOut: p || 0 })
      }
      setLoading(false)
    }
    if (slug) load()
  }, [slug])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`/api/registry/stats?slug=${slug}`)
        const data = await res.json()
        if (data.success) {
          setStats({
            itemCount: data.itemCount || 0,
            totalValue: data.totalValue || 0,
            cashbackAmount: Math.round((data.totalValue || 0) * cashbackRate)
          })
        }
      } catch {}
    }
    if (slug) loadStats()
  }, [slug])

  useEffect(() => {
    if (!couple?.referred_by_vendor_id) return
    const n = couple.referred_by_vendor
    if (n && !/^[0-9a-f]{8}-/.test(n)) { setVendorName(n); return }
    supabase.from('vendors').select('business_name').eq('id', couple.referred_by_vendor_id).single()
      .then(({ data }) => { if (data?.business_name) setVendorName(data.business_name) })
  }, [couple])

  const copyGuestLink = () => {
    navigator.clipboard.writeText(`https://wetwo.love/collections/registry-${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareGuestLink = async () => {
    const link = `https://wetwo.love/collections/registry-${slug}`
    if (navigator.share) {
      await navigator.share({
        title: `${couple?.partner_a}${couple?.partner_b ? ` & ${couple.partner_b}` : ''}'s Wedding Registry`,
        text: 'Check out our wedding registry — and we get 25% cashback on every gift!',
        url: link
      })
    } else { copyGuestLink() }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af74'
    }}>Loading...</div>
  )

  if (!couple) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', padding: 20
    }}>Registry not found. Please check your link.</div>
  )

  const names = couple.partner_b?.trim() ? `${couple.partner_a} & ${couple.partner_b}` : couple.partner_a

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <WelcomeOverlay isOpen={showWelcome} onClose={handleCloseWelcome} couple={couple} />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>
            Welcome, {names}!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
            Your WeTwo Registry Dashboard
          </p>
        </div>

        <p style={{ 
          color: '#d4af74', fontSize: 11, fontWeight: 600, 
          letterSpacing: 1.5, textTransform: 'uppercase', 
          margin: '20px 0 12px', paddingLeft: 4
        }}>Your Cashback Registry</p>

        {/* ═══ 1. VENDOR REFERRER ═══ */}
        {couple?.referred_by_vendor_id && (
          <div style={{
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10
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

        {/* ═══ 2. REGISTRY STATS ═══ */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
          padding: 16,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14, marginBottom: 16
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#d4af74', fontSize: 24, fontWeight: 700 }}>{stats.itemCount}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              In Registry
            </div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>
              ${stats.totalValue > 0 ? stats.totalValue.toLocaleString() : '—'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Registry Value
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#4ade80', fontSize: 24, fontWeight: 700 }}>
              ${stats.cashbackAmount > 0 ? stats.cashbackAmount.toLocaleString() : '—'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Potential Cashback
            </div>
          </div>
        </div>

        {/* ═══ 3. SHARE YOUR REGISTRY — HERO ═══ */}
        <div style={{
          padding: '20px 16px',
          background: 'linear-gradient(135deg, rgba(212, 175, 116, 0.18) 0%, rgba(212, 175, 116, 0.06) 100%)',
          border: '1px solid rgba(212, 175, 116, 0.35)',
          borderRadius: 14, marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Send size={22} color="#0a0a15" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>Share Your Registry</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                Send to guests to start earning cashback
              </div>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(10, 10, 21, 0.6)',
            borderRadius: 8, padding: '10px 12px', marginBottom: 12,
            fontSize: 12, color: '#d4af74', wordBreak: 'break-all', fontFamily: 'monospace'
          }}>
            wetwo.love/collections/registry-{slug}
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={copyGuestLink}
              style={{
                flex: 1, padding: 14,
                background: copied ? 'rgba(74, 222, 128, 0.2)' : 'rgba(10, 10, 21, 0.6)',
                border: `1px solid ${copied ? 'rgba(74, 222, 128, 0.4)' : 'rgba(212, 175, 116, 0.3)'}`,
                borderRadius: 10, color: copied ? '#4ade80' : '#d4af74',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={shareGuestLink}
              style={{
                flex: 1, padding: 14,
                background: 'linear-gradient(135deg, #d4af74 0%, #c9a663 100%)',
                border: 'none', borderRadius: 10, color: '#0a0a15',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>

        {/* ═══ 4. REMOVE ITEMS ═══ */}
        <a
          href={`https://wetwo.love/collections/registry-${slug}?ref=${slug}&owner=true`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14, textDecoration: 'none', marginBottom: 10
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Trash2 size={20} color="#ef4444" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Remove Items from Registry</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Review and remove items you don't want</div>
          </div>
          <ExternalLink size={16} color="rgba(255,255,255,0.3)" />
        </a>

        {/* ═══ 4b. ADD ITEMS ═══ */}
        <a
          href={`https://wetwo.love/collections/all?ref=${slug}&owner=true`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14, textDecoration: 'none', marginBottom: 16
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(212, 175, 116, 0.2) 0%, rgba(212, 175, 116, 0.1) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShoppingBag size={20} color="#d4af74" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Add Items to Registry</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Browse the store and add more items</div>
          </div>
          <ExternalLink size={16} color="rgba(255,255,255,0.3)" />
        </a>

        {/* ═══ 5. EARNINGS ═══ */}
        <div style={{
          padding: 16,
          background: 'rgba(20, 30, 50, 0.8)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: 14, marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(74, 222, 128, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Wallet size={20} color="#4ade80" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Earnings</span>
                <span style={{
                  background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80',
                  padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700
                }}>25% Cashback</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Track cashback & set up transfers</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{
              background: 'rgba(10, 10, 21, 0.5)', borderRadius: 10, padding: 14, textAlign: 'center'
            }}>
              <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 700 }}>${earnings.totalEarned.toFixed(2)}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Total Earned</div>
            </div>
            <div style={{
              background: 'rgba(10, 10, 21, 0.5)', borderRadius: 10, padding: 14, textAlign: 'center'
            }}>
              <div style={{ color: '#d4af74', fontSize: 22, fontWeight: 700 }}>${earnings.pendingBalance.toFixed(2)}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Pending</div>
            </div>
          </div>
          
          <PayPalConnect type="couple" refId={slug} darkTheme={true} />
        </div>

      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 16px 32px', textAlign: 'center',
        borderTop: '1px solid rgba(212, 175, 116, 0.1)', marginTop: 20
      }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>
          © 2026 WeTwo · The Wedding Buying Group
        </p>
      </div>
    </div>
  )
}
