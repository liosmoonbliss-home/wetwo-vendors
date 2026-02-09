'use client'

import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// VENDOR COUPLES PANEL — Light theme for vendor dashboard
// Shows referred couples with registry stats + dashboard links
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
    return <p style={{ color: '#9a8d80', padding: '20px 0' }}>Loading couples...</p>
  }

  if (couples.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        background: '#fff', borderRadius: 12,
        border: '1px solid #e4ddd4'
      }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>💍</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2c2420', margin: '0 0 6px' }}>
          No couples yet
        </h3>
        <p style={{ fontSize: 14, color: '#6b5e52', margin: '0 auto 16px', maxWidth: 400, lineHeight: 1.5 }}>
          When couples sign up through your registry link, they'll appear here with their registry stats and dashboard links.
        </p>
        <a href="/dashboard/links" style={{
          display: 'inline-block', padding: '10px 20px',
          background: '#c9944a', color: '#fff', borderRadius: 8,
          textDecoration: 'none', fontSize: 14, fontWeight: 700
        }}>Go to Your Links →</a>
      </div>
    )
  }

  const totalCouples = couples.length
  const totalOrders = couples.reduce((s, c) => s + c.total_orders, 0)
  const totalRevenue = couples.reduce((s, c) => s + c.total_value, 0)

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{
          background: 'rgba(201,148,74,0.06)', border: '1px solid rgba(201,148,74,0.2)',
          borderRadius: 10, padding: '14px 12px', textAlign: 'center'
        }}>
          <div style={{ color: '#c9944a', fontSize: 24, fontWeight: 700 }}>{totalCouples}</div>
          <div style={{ color: '#9a8d80', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Couples</div>
        </div>
        <div style={{
          background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 10, padding: '14px 12px', textAlign: 'center'
        }}>
          <div style={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }}>{totalOrders}</div>
          <div style={{ color: '#9a8d80', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Orders</div>
        </div>
        <div style={{
          background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 10, padding: '14px 12px', textAlign: 'center'
        }}>
          <div style={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }}>
            ${totalRevenue > 0 ? totalRevenue.toLocaleString() : '0'}
          </div>
          <div style={{ color: '#9a8d80', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Revenue</div>
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
              background: '#fff',
              border: `1px solid ${isExpanded ? 'rgba(201,148,74,0.4)' : '#e4ddd4'}`,
              borderRadius: 12, overflow: 'hidden',
              transition: 'border-color 0.2s ease'
            }}>
              {/* Main row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: c.total_orders > 0 ? 'rgba(34,197,94,0.1)' : '#c9944a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: c.total_orders > 0 ? '#22c55e' : '#fff',
                  fontWeight: 700, fontSize: 14
                }}>
                  {c.total_orders > 0 ? '💰' : (c.display_name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#2c2420', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.display_name}
                  </div>
                  <div style={{ color: '#9a8d80', fontSize: 13 }}>
                    {c.state || 'Active'} · {timeLabel}
                  </div>
                </div>
                {c.total_value > 0 && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#22c55e', fontSize: 15, fontWeight: 700 }}>
                      ${c.total_value.toLocaleString()}
                    </div>
                    <div style={{ color: '#9a8d80', fontSize: 12 }}>
                      {c.total_orders} order{c.total_orders !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
                <div style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                  color: '#9a8d80', fontSize: 18
                }}>›</div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div style={{
                  padding: '0 20px 16px',
                  borderTop: '1px solid #f3efe9'
                }}>
                  <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 13, color: '#6b5e52' }}>
                      ✉️ {c.email}
                    </div>
                    {c.wedding_date && (
                      <div style={{ fontSize: 13, color: '#6b5e52' }}>
                        📅 {c.wedding_date}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a
                        href={c.registry_url}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 12px',
                          background: 'rgba(201,148,74,0.08)',
                          border: '1px solid rgba(201,148,74,0.25)',
                          borderRadius: 8, color: '#c9944a',
                          fontSize: 13, fontWeight: 600, textDecoration: 'none'
                        }}
                      >
                        🛍️ View Registry
                      </a>
                      <a
                        href={c.dashboard_url}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 12px',
                          background: 'rgba(34,197,94,0.08)',
                          border: '1px solid rgba(34,197,94,0.25)',
                          borderRadius: 8, color: '#22c55e',
                          fontSize: 13, fontWeight: 600, textDecoration: 'none'
                        }}
                      >
                        📊 Dashboard
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
