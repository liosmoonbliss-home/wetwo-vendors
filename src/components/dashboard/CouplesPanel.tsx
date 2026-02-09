'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Users, DollarSign, Calendar, ShoppingBag, Eye } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// VENDOR COUPLES PANEL — Shows referred couples in vendor dashboard
// Import into Dashboard.tsx and render when panel === 'couples'
//
// Usage:
//   import CouplesPanel from '@/components/dashboard/CouplesPanel'
//   {panel === 'couples' && <CouplesPanel vendorId={vendor.id} vendorRef={vendor.ref} />}
// ═══════════════════════════════════════════════════════════════

interface CoupleRow {
  id: string
  slug: string
  partner_a: string
  partner_b: string | null
  email: string
  state: string
  created_at: string
  display_name: string
  registry_url: string
  dashboard_url: string
  total_earned: number
  total_orders: number
  total_value: number
  wedding_date: string | null
  guest_count: string | null
}

export default function CouplesPanel({ vendorId, vendorRef }: { vendorId?: string; vendorRef?: string }) {
  const [couples, setCouples] = useState<CoupleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const params = vendorId ? `vendor_id=${vendorId}` : `vendor_ref=${vendorRef}`
        const res = await fetch(`/api/vendor/couples?${params}`)
        const data = await res.json()
        setCouples(data.couples || [])
      } catch (err) {
        console.error('Failed to load couples:', err)
      }
      setLoading(false)
    }
    load()
  }, [vendorId, vendorRef])

  if (loading) {
    return <p style={{ color: 'var(--text-muted, rgba(255,255,255,0.5))', padding: '20px 0' }}>Loading couples...</p>
  }

  if (couples.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        background: 'rgba(255,255,255,0.02)', borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <Users size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: 12 }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 8px' }}>
          No couples yet
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
          Share your couple signup link to get started. When couples register through your link, they'll appear here.
        </p>
      </div>
    )
  }

  // Summary stats
  const totalCouples = couples.length
  const totalOrders = couples.reduce((s, c) => s + c.total_orders, 0)
  const totalRevenue = couples.reduce((s, c) => s + c.total_value, 0)

  return (
    <div>
      {/* Summary bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        marginBottom: 20
      }}>
        <div style={{
          background: 'rgba(212, 175, 116, 0.1)', border: '1px solid rgba(212, 175, 116, 0.2)',
          borderRadius: 10, padding: '14px 12px', textAlign: 'center'
        }}>
          <div style={{ color: '#d4af74', fontSize: 22, fontWeight: 700 }}>{totalCouples}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Couples
          </div>
        </div>
        <div style={{
          background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)',
          borderRadius: 10, padding: '14px 12px', textAlign: 'center'
        }}>
          <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 700 }}>{totalOrders}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Orders
          </div>
        </div>
        <div style={{
          background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)',
          borderRadius: 10, padding: '14px 12px', textAlign: 'center'
        }}>
          <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 700 }}>
            ${totalRevenue > 0 ? totalRevenue.toLocaleString() : '0'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Revenue
          </div>
        </div>
      </div>

      {/* Couple cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {couples.map(c => {
          const isExpanded = expandedId === c.id
          const daysAgo = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000)
          const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`

          return (
            <div key={c.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${isExpanded ? 'rgba(212, 175, 116, 0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 12, overflow: 'hidden',
              transition: 'border-color 0.2s ease'
            }}>
              {/* Main row — clickable */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: c.total_orders > 0 
                    ? 'rgba(74, 222, 128, 0.15)' 
                    : 'rgba(212, 175, 116, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {c.total_orders > 0 
                    ? <DollarSign size={18} color="#4ade80" />
                    : <Users size={18} color="#d4af74" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.display_name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    {c.state} · {timeLabel}
                  </div>
                </div>
                {c.total_value > 0 && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#4ade80', fontSize: 14, fontWeight: 700 }}>
                      ${c.total_value.toLocaleString()}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                      {c.total_orders} order{c.total_orders !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
                <div style={{ 
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', 
                  transition: 'transform 0.2s ease',
                  color: 'rgba(255,255,255,0.3)'
                }}>
                  ›
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  padding: '0 16px 14px',
                  borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      <span>📧 {c.email}</span>
                    </div>
                    {c.wedding_date && (
                      <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                        <Calendar size={12} /> {c.wedding_date}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a
                        href={c.registry_url}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 12px',
                          background: 'rgba(212, 175, 116, 0.1)',
                          border: '1px solid rgba(212, 175, 116, 0.25)',
                          borderRadius: 8, color: '#d4af74',
                          fontSize: 12, fontWeight: 600, textDecoration: 'none'
                        }}
                      >
                        <ShoppingBag size={14} />
                        View Registry
                      </a>
                      <a
                        href={c.dashboard_url}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 12px',
                          background: 'rgba(74, 222, 128, 0.1)',
                          border: '1px solid rgba(74, 222, 128, 0.25)',
                          borderRadius: 8, color: '#4ade80',
                          fontSize: 12, fontWeight: 600, textDecoration: 'none'
                        }}
                      >
                        <Eye size={14} />
                        Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
