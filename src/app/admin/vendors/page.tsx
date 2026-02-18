'use client'

import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// ADMIN: Vendor Tier Management
// ═══════════════════════════════════════════════════════════════
// Route: /admin/vendors
// 
// Lists all vendors with current tier/pool/commission.
// Click a tier button to cascade:
//   Supabase (boost_tier + current_pool) → GoAffPro commission → admin_events
//
// Auth: Uses ADMIN_API_KEY header (set in Vercel env vars)
// ═══════════════════════════════════════════════════════════════

interface Vendor {
  id: string
  ref: string
  business_name: string
  email: string
  contact_name: string
  boost_tier: string
  current_pool: string
  goaffpro_affiliate_id: string | null
  subscription_active: boolean
}

const TIERS = [
  { key: 'free',  label: 'Free',  pool: 20, price: '$0',   color: '#6b5e52' },
  { key: 'pro',   label: 'Pro',   pool: 30, price: '$97',  color: '#9141ac' },
  { key: 'elite', label: 'Elite', pool: 40, price: '$197', color: '#e5a50a' },
]

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // Check if admin key is stored in sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('wetwo_admin_key')
    if (stored) {
      setAdminKey(stored)
      setAuthed(true)
      fetchVendors(stored)
    }
  }, [])

  async function fetchVendors(key: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/update-vendor-tier', {
        headers: { 'x-admin-key': key }
      })
      if (!res.ok) {
        if (res.status === 401) {
          setAuthed(false)
          sessionStorage.removeItem('wetwo_admin_key')
          setError('Invalid admin key')
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setVendors(data.vendors || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin() {
    sessionStorage.setItem('wetwo_admin_key', adminKey)
    setAuthed(true)
    fetchVendors(adminKey)
  }

  async function updateTier(vendorId: string, tier: string) {
    setUpdating(vendorId + '-' + tier)
    setLastResult(null)
    setError(null)

    try {
      const res = await fetch('/api/admin/update-vendor-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ vendor_id: vendorId, tier })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      setLastResult(data)

      // Refresh vendor list
      fetchVendors(adminKey)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  function poolPercent(pool: string | null): number {
    if (!pool) return 20
    const n = parseFloat(pool)
    return n < 1 ? Math.round(n * 100) : Math.round(n)
  }

  const filteredVendors = filter === 'all'
    ? vendors
    : vendors.filter(v => (v.boost_tier || 'free') === filter)

  const tierCounts = {
    all: vendors.length,
    free: vendors.filter(v => (v.boost_tier || 'free') === 'free').length,
    pro: vendors.filter(v => v.boost_tier === 'pro').length,
    elite: vendors.filter(v => v.boost_tier === 'elite').length,
  }

  // --- Auth screen ---
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0f14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <div style={{
          background: '#1a1a24',
          border: '1px solid rgba(201, 148, 74, 0.2)',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '400px',
          width: '100%',
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '24px',
            color: '#c9944a',
            marginBottom: '8px',
          }}>WeTwo Admin</h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>
            Vendor tier management
          </p>
          <input
            type="password"
            placeholder="Admin key"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#0f0f14',
              border: '1px solid rgba(201, 148, 74, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              marginBottom: '16px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #c9944a 0%, #a87a3a 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#0f0f14',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Enter
          </button>
          {error && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{error}</p>
          )}
        </div>
      </div>
    )
  }

  // --- Main admin panel ---
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f14',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#fff',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid rgba(201, 148, 74, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '28px',
            color: '#c9944a',
            margin: 0,
          }}>Vendor Tiers</h1>
          <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0' }}>
            {vendors.length} vendors · Changes cascade to Supabase + GoAffPro
          </p>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('wetwo_admin_key')
            setAuthed(false)
            setAdminKey('')
          }}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#666',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Log out
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{
        padding: '16px 32px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {(['all', 'free', 'pro', 'elite'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              background: filter === f ? 'rgba(201, 148, 74, 0.15)' : 'transparent',
              border: filter === f ? '1px solid rgba(201, 148, 74, 0.3)' : '1px solid #222',
              borderRadius: '20px',
              color: filter === f ? '#c9944a' : '#666',
              fontSize: '13px',
              fontWeight: filter === f ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({tierCounts[f]})
          </button>
        ))}
      </div>

      {/* Success toast */}
      {lastResult && !lastResult.skipped && (
        <div style={{
          margin: '16px 32px',
          padding: '16px 20px',
          background: 'rgba(74, 222, 128, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '10px',
          fontSize: '13px',
        }}>
          <strong style={{ color: '#4ade80' }}>
            ✓ {lastResult.vendor?.business_name}
          </strong>
          <span style={{ color: '#aaa', marginLeft: '8px' }}>
            {lastResult.changes?.tier?.from} → {lastResult.changes?.tier?.to}
            {' · '}
            Commission: {lastResult.changes?.commission?.from}% → {lastResult.changes?.commission?.to}%
            {' · '}
            GoAffPro: {lastResult.goaffpro?.success ? '✓' : '⚠ ' + lastResult.goaffpro?.message}
          </span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          margin: '16px 32px',
          padding: '16px 20px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          color: '#ef4444',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Vendor list */}
      <div style={{ padding: '16px 32px' }}>
        {loading ? (
          <p style={{ color: '#666', padding: '32px 0', textAlign: 'center' }}>Loading vendors...</p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222' }}>
                <th style={{ ...th, width: '30%' }}>Vendor</th>
                <th style={{ ...th, width: '15%' }}>Contact</th>
                <th style={{ ...th, width: '12%', textAlign: 'center' }}>Current Tier</th>
                <th style={{ ...th, width: '10%', textAlign: 'center' }}>Pool</th>
                <th style={{ ...th, width: '10%', textAlign: 'center' }}>GoAffPro</th>
                <th style={{ ...th, textAlign: 'center' }}>Set Tier</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map(vendor => {
                const tier = vendor.boost_tier || 'free'
                const tierInfo = TIERS.find(t => t.key === tier) || TIERS[0]
                const pool = poolPercent(vendor.current_pool)

                return (
                  <tr key={vendor.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {/* Vendor name + ref */}
                    <td style={td}>
                      <div style={{ fontWeight: 500 }}>{vendor.business_name}</div>
                      <div style={{ color: '#555', fontSize: '12px', fontFamily: 'monospace' }}>{vendor.ref}</div>
                    </td>

                    {/* Contact */}
                    <td style={td}>
                      <span style={{ color: '#999' }}>{vendor.contact_name || '—'}</span>
                    </td>

                    {/* Current tier badge */}
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        background: `${tierInfo.color}22`,
                        border: `1px solid ${tierInfo.color}44`,
                        borderRadius: '12px',
                        color: tierInfo.color,
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>
                        {tierInfo.label}
                      </span>
                    </td>

                    {/* Pool */}
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{ color: '#c9944a', fontWeight: 600 }}>{pool}%</span>
                    </td>

                    {/* GoAffPro ID */}
                    <td style={{ ...td, textAlign: 'center' }}>
                      {vendor.goaffpro_affiliate_id ? (
                        <span style={{ color: '#4ade80', fontSize: '12px' }}>
                          {vendor.goaffpro_affiliate_id}
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', fontSize: '12px' }}>None</span>
                      )}
                    </td>

                    {/* Tier buttons */}
                    <td style={{ ...td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {TIERS.map(t => {
                          const isActive = tier === t.key
                          const isUpdating = updating === vendor.id + '-' + t.key

                          return (
                            <button
                              key={t.key}
                              disabled={isActive || !!updating}
                              onClick={() => {
                                if (confirm(`Set ${vendor.business_name} to ${t.label} (${t.pool}% commission)?`)) {
                                  updateTier(vendor.id, t.key)
                                }
                              }}
                              style={{
                                padding: '4px 14px',
                                background: isActive ? `${t.color}33` : 'transparent',
                                border: isActive ? `1px solid ${t.color}66` : '1px solid #333',
                                borderRadius: '6px',
                                color: isActive ? t.color : '#555',
                                fontSize: '12px',
                                fontWeight: isActive ? 600 : 400,
                                cursor: isActive || !!updating ? 'default' : 'pointer',
                                opacity: updating && !isUpdating ? 0.5 : 1,
                                minWidth: '52px',
                              }}
                            >
                              {isUpdating ? '...' : t.label}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// Table styles
const th: React.CSSProperties = {
  padding: '12px 8px',
  textAlign: 'left',
  color: '#666',
  fontWeight: 500,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const td: React.CSSProperties = {
  padding: '14px 8px',
}
