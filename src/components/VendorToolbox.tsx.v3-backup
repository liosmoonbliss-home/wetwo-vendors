'use client'

import { useState, useEffect } from 'react'

// ============================================================
// WeTwo — Vendor Toolbox v3
// Simplified: Registry Links + One Code Generator
// Every code has a purpose, a use limit, and an expiry.
// 14-day safety net on all codes.
// ============================================================

interface ToolboxProps {
  vendorRef?: string
  tier?: string
  showCouplesSection?: boolean
}

interface GeneratedCode {
  code: string
  percentage: number
  uses: string // '1' or 'unlimited'
  expires_at: string
  note?: string
  created_at: string
}

// ---- Copy Button ----
function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea'); ta.value = text
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} style={{
      padding: '6px 14px', borderRadius: '6px',
      border: copied ? '1.5px solid #22c55e' : '1.5px solid #ddd',
      background: copied ? 'rgba(34,197,94,0.08)' : '#fff',
      color: copied ? '#22c55e' : '#6b5e52',
      fontSize: '12px', fontWeight: 600, cursor: 'pointer', minWidth: '72px', fontFamily: 'inherit',
    }}>
      {copied ? '✓ Copied' : label || 'Copy'}
    </button>
  )
}

// Generate a unique code like "WT-15OFF-X8K2M"
function makeCodeString(pct: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let slug = ''
  for (let i = 0; i < 5; i++) slug += chars[Math.floor(Math.random() * chars.length)]
  return `WT-${pct}OFF-${slug}`
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function VendorToolbox({ vendorRef, tier, showCouplesSection = true }: ToolboxProps) {
  const [vRef, setVRef] = useState(vendorRef || '')
  const [vTier, setVTier] = useState(tier || 'free')

  // Code generator state
  const [percentage, setPercentage] = useState(10)
  const [uses, setUses] = useState<'1' | 'unlimited'>('unlimited')
  const [expiryDays, setExpiryDays] = useState(7)
  const [note, setNote] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [codes, setCodes] = useState<GeneratedCode[]>([])

  useEffect(() => {
    if (!vendorRef) {
      const stored = localStorage.getItem('wetwo_vendor_session')
      if (stored) {
        const v = JSON.parse(stored)
        setVRef(v.ref || '')
        setVTier(v.boost_tier || v.plan || 'free')
      }
    }
  }, [vendorRef])

  // Load saved codes
  useEffect(() => {
    if (vRef) {
      const saved = localStorage.getItem(`wetwo_codes_${vRef}`)
      if (saved) try { setCodes(JSON.parse(saved)) } catch {}
    }
  }, [vRef])

  const saveCodes = (updated: GeneratedCode[]) => {
    setCodes(updated)
    if (vRef) localStorage.setItem(`wetwo_codes_${vRef}`, JSON.stringify(updated))
  }

  const refSlug = vRef ? `vendor-${vRef}` : 'vendor-demo'

  // Registry links (permanent, no expiry)
  const registryLinks = [
    { pct: 10, code: `https://wetwo.love/?ref=${refSlug}&cb=10` },
    { pct: 15, code: `https://wetwo.love/?ref=${refSlug}&cb=15` },
    { pct: 20, code: `https://wetwo.love/?ref=${refSlug}&cb=20` },
  ]

  // Enforce 14-day max safety net
  const actualExpiry = Math.min(expiryDays, 14)
  const expiresAt = new Date(Date.now() + actualExpiry * 24 * 60 * 60 * 1000)

  const generateCode = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/coupons/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'flash',
          vendor_ref: vRef,
          percentage,
          expires_hours: actualExpiry * 24,
          usage_limit: uses === '1' ? 1 : null,
          customer_note: note || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')

      const newCode: GeneratedCode = {
        code: data.flash_code || makeCodeString(percentage),
        percentage,
        uses,
        expires_at: data.expires_at || expiresAt.toISOString(),
        note: note || undefined,
        created_at: new Date().toISOString(),
      }
      saveCodes([newCode, ...codes].slice(0, 50))
      setNote('')
    } catch (err: any) {
      // If API fails, still generate locally for demo
      const newCode: GeneratedCode = {
        code: makeCodeString(percentage),
        percentage,
        uses,
        expires_at: expiresAt.toISOString(),
        note: note || undefined,
        created_at: new Date().toISOString(),
      }
      saveCodes([newCode, ...codes].slice(0, 50))
      setNote('')
    }
    setGenerating(false)
  }

  const activeCodes = codes.filter(c => new Date(c.expires_at) > new Date())
  const expiredCodes = codes.filter(c => new Date(c.expires_at) <= new Date())

  return (
    <div>

      {/* ===== SECTION 1: FOR COUPLES — REGISTRY LINKS ===== */}
      {showCouplesSection && (
      <div style={{
        background: '#fff', borderRadius: '14px', border: '1px solid #e4ddd4',
        padding: '20px 24px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>🎁</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#2c2420' }}>For Couples — Registry Links</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9a8d80' }}>
              Permanent links. Share with brides. They get cashback on every gift.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
          {registryLinks.map((link, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
              borderRadius: '10px', border: '1px solid #e4ddd4',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: 'rgba(201,148,74,0.08)', display: 'flex',
                flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#c9944a', lineHeight: 1 }}>{link.pct}%</span>
                <span style={{ fontSize: '7px', fontWeight: 600, color: '#9a8d80' }}>BACK</span>
              </div>
              <div style={{
                flex: 1, padding: '3px 8px', background: '#f3efe9', borderRadius: '4px',
                fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#6b5e52',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
              }}>{link.code}</div>
              <CopyBtn text={link.code} label="Copy Link" />
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ===== SECTION 2: FOR EVERYONE — CODE GENERATOR ===== */}
      <div style={{
        background: '#fff', borderRadius: '14px', border: '1px solid #e4ddd4',
        padding: '20px 24px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>🛒</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#2c2420' }}>For Everyone — Generate a Code</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9a8d80' }}>
              Give a discount, get a customer. Every person who uses your code gives you their name, their email, and a reason to follow up: <em>"Thanks for the purchase — here's what we do. Let us take care of your next event."</em>
            </p>
          </div>
        </div>

        {/* Generator */}
        <div style={{
          padding: '16px', borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(34,197,94,0.04))',
          border: '1px solid rgba(59,130,246,0.15)',
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const, alignItems: 'flex-end' }}>
            {/* Discount */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#9a8d80', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Discount</label>
              <select value={percentage} onChange={e => setPercentage(+e.target.value)} style={{
                padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e4ddd4',
                fontSize: '14px', fontWeight: 700, color: '#2c2420', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <option value={5}>5% off</option>
                <option value={10}>10% off</option>
                <option value={15}>15% off</option>
                <option value={20}>20% off</option>
              </select>
            </div>

            {/* Who can use it */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#9a8d80', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Who</label>
              <select value={uses} onChange={e => setUses(e.target.value as '1' | 'unlimited')} style={{
                padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e4ddd4',
                fontSize: '14px', fontWeight: 600, color: '#2c2420', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <option value="unlimited">Everyone</option>
                <option value="1">One person</option>
              </select>
            </div>

            {/* Expires */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#9a8d80', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Expires</label>
              <select value={expiryDays} onChange={e => setExpiryDays(+e.target.value)} style={{
                padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e4ddd4',
                fontSize: '14px', fontWeight: 600, color: '#2c2420', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <option value={1}>Tonight</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
              </select>
            </div>

            {/* Note */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px', flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '10px', color: '#9a8d80', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Note (optional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Valentine's sale, Sarah's booking"
                style={{
                  padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e4ddd4',
                  fontSize: '13px', color: '#2c2420', background: '#fff', fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Generate */}
            <button onClick={generateCode} disabled={generating} style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: generating ? '#d4cec6' : '#3b82f6',
              color: '#fff', fontSize: '14px', fontWeight: 700, cursor: generating ? 'wait' : 'pointer',
              whiteSpace: 'nowrap' as const, fontFamily: 'inherit',
            }}>
              {generating ? '...' : 'Generate Code'}
            </button>
          </div>

          {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: '8px 0 0' }}>⚠️ {error}</p>}
        </div>

        {/* Active codes */}
        {activeCodes.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
              Active ({activeCodes.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
              {activeCodes.slice(0, 10).map((c, i) => {
                const daysLeft = Math.ceil((new Date(c.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                    borderRadius: '8px', border: '1px solid #e4ddd4', background: '#fff',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: 'rgba(59,130,246,0.08)', display: 'flex',
                      flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>{c.percentage}%</span>
                      <span style={{ fontSize: '7px', color: '#9a8d80', fontWeight: 600 }}>OFF</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' as const }}>
                        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '13px', fontWeight: 700, color: '#2c2420' }}>{c.code}</span>
                        <span style={{
                          fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                          background: c.uses === '1' ? 'rgba(229,165,10,0.1)' : 'rgba(59,130,246,0.1)',
                          color: c.uses === '1' ? '#e5a50a' : '#3b82f6',
                          textTransform: 'uppercase' as const,
                        }}>{c.uses === '1' ? '1 use' : 'unlimited'}</span>
                        <span style={{ fontSize: '10px', color: daysLeft <= 1 ? '#ef4444' : '#9a8d80' }}>
                          {daysLeft <= 1 ? 'Expires today' : `${daysLeft}d left`}
                        </span>
                      </div>
                      {c.note && <div style={{ fontSize: '11px', color: '#6b5e52', marginTop: '2px' }}>{c.note}</div>}
                    </div>
                    <CopyBtn text={c.code} label="Copy" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Expired codes (collapsed) */}
        {expiredCodes.length > 0 && (
          <details style={{ marginTop: '12px' }}>
            <summary style={{ fontSize: '12px', color: '#9a8d80', cursor: 'pointer', fontWeight: 600 }}>
              Expired ({expiredCodes.length})
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px', marginTop: '8px' }}>
              {expiredCodes.slice(0, 5).map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  borderRadius: '6px', background: '#fafaf8', opacity: 0.6, fontSize: '12px',
                }}>
                  <span style={{ fontFamily: "'Courier New', monospace", fontWeight: 600, color: '#9a8d80' }}>{c.code}</span>
                  <span style={{ color: '#9a8d80' }}>{c.percentage}% off</span>
                  {c.note && <span style={{ color: '#b0a898' }}>· {c.note}</span>}
                  <span style={{ marginLeft: 'auto', color: '#b0a898', fontSize: '11px' }}>expired</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
