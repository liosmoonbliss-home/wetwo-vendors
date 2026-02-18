'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import VendorToolbox from '@/components/VendorToolbox'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

// ============================================================
// WeTwo — Vendor Dashboard v4.2
// 3-tier: Free (20%) → Pro $97 (30%) → Elite $197 (40%)
// 7-day branded store trial for all new vendors
// Accordion-first · Gold step-4 pill · Theme reinforcement
// ============================================================

const TIER_INFO: Record<string, {
  pool: number; price: number; label: string; color: string;
  branded: boolean; contacts: boolean; monthlyReport: boolean;
}> = {
  free: { pool: 20, price: 0, label: 'Free', color: '#6b5e52', branded: false, contacts: false, monthlyReport: false },
  pro:  { pool: 30, price: 97, label: 'Pro', color: '#9141ac', branded: true, contacts: false, monthlyReport: true },
  elite:{ pool: 40, price: 197, label: 'Elite', color: '#e5a50a', branded: true, contacts: true, monthlyReport: true },
}

// Source of truth: current_pool from Supabase, fallback to tier lookup
function getPoolPercent(v: any): number {
  if (v?.current_pool) {
    const n = parseFloat(v.current_pool)
    return n < 1 ? Math.round(n * 100) : Math.round(n)
  }
  const t = v?.boost_tier || v?.plan || 'free'
  const defaults: Record<string, number> = { free: 20, pro: 30, elite: 40 }
  return defaults[t] || 20

}

// ============================================================
// TRIAL HELPERS
// ============================================================
function getTrialInfo(vendor: any): { inTrial: boolean; daysLeft: number; trialExpired: boolean } {
  const trialStart = vendor.trial_start || vendor.created_at
  if (!trialStart) return { inTrial: false, daysLeft: 0, trialExpired: false }

  const start = new Date(trialStart)
  const now = new Date()
  const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const daysLeft = Math.max(0, 7 - daysPassed)

  const tier = vendor.boost_tier || vendor.plan || 'free'
  if (tier !== 'free') return { inTrial: false, daysLeft: 0, trialExpired: false }

  return { inTrial: daysLeft > 0, daysLeft, trialExpired: daysLeft === 0 }
}

// ============================================================
// REUSABLE ACCORDION CARD
// ============================================================
function AccordionCard({ icon, title, subtitle, children, defaultOpen = false, accentColor }: {
  icon: string; title: string; subtitle: string | React.ReactNode; children: React.ReactNode;
  defaultOpen?: boolean; accentColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #e4ddd4',
      marginBottom: '12px', overflow: 'hidden',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '16px 20px', background: open ? 'rgba(201,148,74,0.02)' : '#fff',
        border: 'none', borderBottom: open ? '1px solid #e4ddd4' : 'none',
        display: 'flex', alignItems: 'center', gap: '12px',
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
        textAlign: 'left' as const,
      }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#2c2420', lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: '12px', color: accentColor || '#9a8d80', marginTop: '2px', lineHeight: 1.4 }}>{subtitle}</div>
        </div>
        <span style={{
          fontSize: '18px', color: '#c9944a', transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0,
        }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '16px 20px', animation: 'slideDown 0.2s ease' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================
// EARNINGS CHART — 2 lines: Pro & Elite
// ============================================================
function generateEarningsData() {
  const data = []
  for (let sales = 0; sales <= 25; sales++) {
    data.push({
      sales,
      pro: Math.max(sales * 15 - 97, -97),
      elite: Math.max(sales * 30 - 197, -197),
    })
  }
  return data
}
const earningsData = generateEarningsData()

function EarningsChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null
    return (
      <div style={{ background: '#2c2420', borderRadius: '10px', padding: '14px 18px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#fff' }}>{label} sales/mo × $150 avg</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ margin: '2px 0', fontSize: '12px', color: p.color }}>
            <span style={{ fontWeight: 700 }}>{p.name}:</span>{' '}
            <span style={{ fontWeight: 800 }}>${p.value.toFixed(0)}</span>
            {p.value > 0 ? '/mo profit' : ''}
          </p>
        ))}
      </div>
    )
  }
  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={earningsData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
          <XAxis dataKey="sales" tick={{ fontSize: 11, fill: '#9a8d80' }}
            label={{ value: 'Sales per month', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#9a8d80' }} />
          <YAxis tick={{ fontSize: 11, fill: '#9a8d80' }} tickFormatter={(v: number) => `$${v}`}
            label={{ value: 'Monthly profit', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#9a8d80' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#e4ddd4" strokeWidth={2} />
          <Line type="monotone" dataKey="pro" name="Pro $97/mo" stroke="#9141ac" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="elite" name="Elite $197/mo" stroke="#e5a50a" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          <Legend verticalAlign="top" height={36} formatter={(v: string) => <span style={{ fontSize: '12px', color: '#6b5e52', fontWeight: 600 }}>{v}</span>} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
        {[
          { tier: 'Pro $97/mo', profit: 20 * 15 - 97, color: '#9141ac', note: 'Branded store + 10% margin', url: 'https://wetwo.love/products/wetwo-vendor-subscription-pro-tier' },
          { tier: 'Elite $197/mo', profit: 20 * 30 - 197, color: '#e5a50a', note: 'Branded + contacts + 20% margin', url: 'https://wetwo.love/products/wetwo-vendor-subscription-elite-tier' },
        ].map(p => (
          <a key={p.tier} href={p.url} target="_blank" rel="noopener" style={{
            textAlign: 'center' as const, padding: '14px', borderRadius: '10px',
            background: `${p.color}08`, border: `1px solid ${p.color}20`,
            textDecoration: 'none', display: 'block', transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: '10px', color: '#9a8d80', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{p.tier}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: p.color, margin: '4px 0' }}>${p.profit.toFixed(0)}/mo</div>
            <div style={{ fontSize: '11px', color: '#6b5e52' }}>at 20 sales · break-even at 7</div>
            <div style={{ fontSize: '10px', color: '#9a8d80', marginTop: '2px' }}>{p.note}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function DashboardHome() {
  const [vendor, setVendor] = useState<any>(null)
  const [stats, setStats] = useState({ totalCommission: 0, couples: 0, shoppers: 0 })
  const [sidebarPage, setSidebarPage] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) {
      const v = JSON.parse(stored)
      setVendor(v)
      // Refresh from Supabase to pick up tier/pool changes
      fetch(`/api/vendor/refresh-session?ref=${v.ref}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.vendor) {
            const merged = { ...v, ...data.vendor }
            localStorage.setItem('wetwo_vendor_session', JSON.stringify(merged))
            setVendor(merged)
          }
        })
        .catch(() => {})
      fetch(`/api/dashboard/stats?ref=${v.ref}`)
        .then(r => r.json())
        .then(d => { if (d.stats) setStats(d.stats) })
        .catch(() => {})
    }
  }, [])

  if (!vendor) return null

  const firstName = (vendor.contact_name || vendor.business_name || '').split(' ')[0]
  const tier = vendor.boost_tier || vendor.plan || 'free'
  const t = TIER_INFO[tier] || TIER_INFO.free
  const trial = getTrialInfo(vendor)
  const showBranded = t.branded || trial.inTrial

  // ============================================================
  // SUB-PAGE ROUTING
  // ============================================================
  if (sidebarPage) {
    return (
      <div>
        <header className="dash-header">
          <button onClick={() => setSidebarPage(null)} className="back-btn">← Back to Dashboard</button>
        </header>
        <div className="page-content">
          {sidebarPage === 'how-it-works' && <HowItWorks pool={getPoolPercent(vendor)} tier={tier} contacts={t.contacts} />}
          {sidebarPage === 'grow' && <GrowYourBusiness tier={tier} />}
          {sidebarPage === 'playbook' && <Playbook tier={tier} contacts={t.contacts} />}
        </div>
        <style jsx>{sharedStyles}</style>
      </div>
    )
  }

  // ============================================================
  // MAIN DASHBOARD VIEW
  // ============================================================
  return (
    <div>
      {/* ===== HEADER ===== */}
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Welcome, {firstName}</h1>
          <p className="dash-sub">
            You have a <strong>{getPoolPercent(vendor)}% pool</strong> — you control the split.
            {stats.totalCommission > 0 && <> So far: <strong style={{ color: '#22c55e' }}>${stats.totalCommission.toFixed(0)}</strong></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/vendor/${vendor.ref}`} target="_blank" className="view-page-btn">View Page →</Link>
          <a href={`https://wetwo.love/?ref=vendor-${vendor.ref}`} target="_blank" rel="noopener" className="view-store-btn">View Store →</a>
        </div>
      </header>

      <div className="page-content">

        {/* ===== TRIAL BANNER ===== */}
        {trial.inTrial && (
          <div className="trial-banner">
            <div className="trial-left">
              <span className="trial-icon">✨</span>
              <div>
                <strong>Your branded store is live</strong> — {trial.daysLeft} day{trial.daysLeft !== 1 ? 's' : ''} left.
                <span className="trial-sub"> Upgrade to keep it.</span>
              </div>
            </div>
            <a href="https://wetwo.love/products/wetwo-vendor-subscription-pro-tier" target="_blank" rel="noopener" className="trial-cta">Keep My Store →</a>
          </div>
        )}
        {trial.trialExpired && tier === 'free' && (
          <div className="trial-expired-banner">
            <div className="trial-left">
              <span className="trial-icon">🔔</span>
              <div>
                <strong>Your branded trial has ended.</strong>
                <span className="trial-sub"> Upgrade to Pro to bring your name back.</span>
              </div>
            </div>
            <a href="https://wetwo.love/products/wetwo-vendor-subscription-pro-tier" target="_blank" rel="noopener" className="trial-cta-urgent">Upgrade to Pro →</a>
          </div>
        )}

        {/* ===== HERO WITH STEP 4 GOLD PILL ===== */}
        <div className="hero-explainer">
          <h2>Your marketing system is live.</h2>
          <div className="hero-flow">
            <div className="flow-step">
              <span className="flow-num">1</span>
              <span><strong>Landing page</strong> builds trust</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-num">2</span>
              <span><strong>Store</strong> turns visitors into buyers</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-num">3</span>
              {t.contacts
                ? <span>You get their <strong>name + email</strong> forever</span>
                : <span>You control a <strong style={{ color: '#22c55e' }}>{getPoolPercent(vendor)}% pool</strong> on every sale</span>
              }
            </div>
          </div>
          {/* ===== STEP 4 — THE AHA MOMENT — GOLD PILL ===== */}
          <div className="hero-gold-pill">
            <span className="gold-pill-num">4</span>
            <span className="gold-pill-text">
              Every other way you attract customers costs you money. <strong>This one pays you</strong> — and builds your client list while it does.
            </span>
          </div>
        </div>

        {/* ===== YOUR STORE LINK — ALWAYS VISIBLE ===== */}
        {/* Option B reinforcement: competitive edge */}
        <div className="section-card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>🏪</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#2c2420' }}>
                {showBranded ? `${vendor.business_name || 'Your'} Store` : 'Your Store'} — {getPoolPercent(vendor)}% pool
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b5e52' }}>
                A customer attraction engine that pays for itself. Share this link anywhere.
              </p>
            </div>
          </div>
          <StoreLinkRow vendorRef={vendor.ref} />
        </div>

        {/* ===== COUPLES — ACCORDION ===== */}
        {/* Option C reinforcement: reframe */}
        <AccordionCard
          icon="🎁"
          title="For Couples — Cashback Registry"
          subtitle={t.contacts
            ? 'Not just a registry — a marketing system that earns you money while it brings you customers.'
            : 'Give brides honeymoon money from your pool — NOT YOUR POCKET. Plus, one wedding = up to 150 sales.'
          }
          accentColor="#c9944a"
        >
          <CouplesContent vendorRef={vendor.ref} pool={getPoolPercent(vendor)} contacts={t.contacts} tier={tier} />
        </AccordionCard>

        {/* ===== EVERYONE — CODE GENERATOR ===== */}
        <AccordionCard
          icon="🛒"
          title="For Everyone — Discount Codes"
          subtitle={t.contacts
            ? 'Your customer magnet and loyalty engine. Every code earns you commission + their contact info.'
            : <>Your customer magnet and loyalty engine. <span style={{ color: '#e5a50a' }}>Elite adds buyer contacts.</span></>
          }
          defaultOpen={true}
        >
          <VendorToolbox vendorRef={vendor.ref} tier={tier} showCouplesSection={false} />
        </AccordionCard>

        {/* ===== UPGRADE ===== */}
        {/* Option D reinforcement: gut punch */}
        {tier === 'free' && (
          <AccordionCard
            icon="🚀"
            title="Stop spending money to find customers"
            subtitle="Start getting paid to attract them. Both tiers break even at 7 sales."
            accentColor="#e5a50a"
          >
            <UpgradeFreeContent trial={trial} />
          </AccordionCard>
        )}
        {tier === 'pro' && (
          <AccordionCard
            icon="⭐"
            title="Stop spending money to find customers"
            subtitle="Elite gives you every buyer's name and email — marketing that pays for itself."
            accentColor="#e5a50a"
          >
            <UpgradeProContent />
          </AccordionCard>
        )}

        {/* ===== LEARN MORE PILLS ===== */}
        <div className="learn-grid">
          <button onClick={() => setSidebarPage('how-it-works')} className="learn-pill small">
            <span className="pill-icon">💡</span>
            <span className="pill-label">How it works</span>
          </button>
          <button onClick={() => setSidebarPage('grow')} className="learn-pill big">
            <span className="pill-icon big-icon">📈</span>
            <span className="pill-label big-label">Grow your business</span>
            <span className="pill-sub">See the math. Find your break-even.</span>
          </button>
          <button onClick={() => setSidebarPage('playbook')} className="learn-pill small">
            <span className="pill-icon">📋</span>
            <span className="pill-label">Your first week</span>
          </button>
        </div>

      </div>

      <style jsx>{sharedStyles}</style>
    </div>
  )
}

// ============================================================
// STORE LINK ROW
// ============================================================
function StoreLinkRow({ vendorRef }: { vendorRef: string }) {
  const [copied, setCopied] = useState(false)
  const refSlug = vendorRef ? `vendor-${vendorRef}` : 'vendor-demo'
  const storeUrl = `https://wetwo.love/?ref=${refSlug}`
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(storeUrl) } catch {
      const ta = document.createElement('textarea'); ta.value = storeUrl
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
      borderRadius: '10px', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: 'rgba(34,197,94,0.1)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        fontSize: '14px', fontWeight: 800, color: '#22c55e',
      }}>🔗</div>
      <div style={{
        flex: 1, padding: '3px 8px', background: '#f3efe9', borderRadius: '4px',
        fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#2c2420', fontWeight: 600,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
      }}>{storeUrl}</div>
      <button onClick={handleCopy} style={{
        padding: '6px 14px', borderRadius: '6px',
        border: copied ? '1.5px solid #22c55e' : '1.5px solid #22c55e40',
        background: copied ? 'rgba(34,197,94,0.08)' : '#fff',
        color: '#22c55e',
        fontSize: '12px', fontWeight: 700, cursor: 'pointer', minWidth: '90px', fontFamily: 'inherit',
      }}>{copied ? '✓ Copied' : 'Copy Link'}</button>
    </div>
  )
}

// ============================================================
// COUPLES CONTENT (inside accordion)
// ============================================================
function CouplesContent({ vendorRef, pool, contacts, tier }: { vendorRef: string; pool: number; contacts: boolean; tier: string }) {
  const refSlug = vendorRef ? `vendor-${vendorRef}` : 'vendor-demo'
  const links = [
    { pct: 10, code: `https://wetwo.love/?ref=${refSlug}&cb=10` },
    { pct: 15, code: `https://wetwo.love/?ref=${refSlug}&cb=15` },
    { pct: 20, code: `https://wetwo.love/?ref=${refSlug}&cb=20` },
  ]

  return (
    <div>
      <p style={{ fontSize: '13px', color: '#6b5e52', lineHeight: 1.6, margin: '0 0 12px' }}>
        When a bride's guests buy gifts, she gets <strong style={{ color: '#2c2420' }}>cashback</strong> from your {pool}% pool — <em style={{ color: '#c9944a' }}>not your wallet</em>.
        You choose 10%, 15%, or 20%. {contacts
          ? <><strong style={{ color: '#2c2420' }}>Every guest who buys = a new contact in your list.</strong></>
          : <>{tier !== 'elite' && <span style={{ color: '#e5a50a' }}>Upgrade to Elite to capture every guest's name and email.</span>}</>
        }
      </p>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
        {links.map((link, i) => (
          <CopyRow key={i} pct={link.pct} code={link.code} type="cashback" />
        ))}
      </div>
    </div>
  )
}

function CopyRow({ pct, code, type }: { pct: number; code: string; type: 'cashback' | 'discount' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code) } catch {
      const ta = document.createElement('textarea'); ta.value = code
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const isCashback = type === 'cashback'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
      borderRadius: '8px', border: '1px solid #e4ddd4',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: isCashback ? 'rgba(201,148,74,0.08)' : 'rgba(59,130,246,0.08)',
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: isCashback ? '#c9944a' : '#3b82f6', lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: '7px', fontWeight: 600, color: '#9a8d80' }}>{isCashback ? 'BACK' : 'OFF'}</span>
      </div>
      <div style={{
        flex: 1, padding: '3px 8px', background: '#f3efe9', borderRadius: '4px',
        fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#6b5e52',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
      }}>{code}</div>
      <button onClick={handleCopy} style={{
        padding: '5px 12px', borderRadius: '6px',
        border: copied ? '1.5px solid #22c55e' : '1.5px solid #ddd',
        background: copied ? 'rgba(34,197,94,0.08)' : '#fff',
        color: copied ? '#22c55e' : '#6b5e52',
        fontSize: '11px', fontWeight: 600, cursor: 'pointer', minWidth: '72px', fontFamily: 'inherit',
      }}>{copied ? '✓ Copied' : 'Copy Link'}</button>
    </div>
  )
}

// ============================================================
// UPGRADE CONTENT
// ============================================================
function UpgradeFreeContent({ trial }: { trial: { inTrial: boolean; daysLeft: number } }) {
  return (
    <div>
      {/* Theme reinforcement: Option A echo */}
      <p style={{ fontSize: '13px', color: '#6b5e52', lineHeight: 1.6, margin: '0 0 16px' }}>
        WeddingWire, The Knot, Instagram ads — they all cost you money with no guarantee. 
        This system <strong style={{ color: '#2c2420' }}>pays you</strong> while it attracts customers. Upgrade to earn more on every sale and unlock premium features.
      </p>

      {/* Tier comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {/* Pro */}
        <div style={{
          padding: '18px', borderRadius: '12px',
          background: 'rgba(145,65,172,0.04)', border: '1.5px solid rgba(145,65,172,0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '1px', color: '#9141ac',
              background: 'rgba(145,65,172,0.08)', padding: '3px 8px', borderRadius: '4px' }}>PRO</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#9141ac' }}>$97<span style={{ fontSize: '11px', fontWeight: 600 }}>/mo</span></span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2c2420', marginBottom: '6px' }}>30% pool</div>
          <div style={{ fontSize: '13px', color: '#6b5e52', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: '#9141ac' }}>✓</span> Branded store permanently</div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: '#9141ac' }}>✓</span> 30% pool — give 20%, keep 10%</div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: '#9141ac' }}>✓</span> Or keep up to 30% (no discount)</div>
            <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: '#9141ac' }}>✓</span> Break-even at 7 sales</div>
          </div>
          <a href="https://wetwo.love/products/wetwo-vendor-subscription-pro-tier" target="_blank" rel="noopener" style={{
            display: 'block', textAlign: 'center' as const, marginTop: '14px',
            padding: '10px', background: '#9141ac', color: '#fff',
            borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
          }}>Upgrade to Pro →</a>
        </div>

        {/* Elite */}
        <div style={{
          padding: '18px', borderRadius: '12px', position: 'relative' as const,
          background: 'rgba(229,165,10,0.04)', border: '1.5px solid rgba(229,165,10,0.3)',
        }}>
          <div style={{
            position: 'absolute' as const, top: '-8px', right: '14px',
            background: '#e5a50a', color: '#fff', fontSize: '9px', fontWeight: 800,
            padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
          }}>Best Value</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '1px', color: '#e5a50a',
              background: 'rgba(229,165,10,0.08)', padding: '3px 8px', borderRadius: '4px' }}>ELITE</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#e5a50a' }}>$197<span style={{ fontSize: '11px', fontWeight: 600 }}>/mo</span></span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2c2420', marginBottom: '6px' }}>40% pool</div>
          <div style={{ fontSize: '13px', color: '#6b5e52', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: '#e5a50a' }}>✓</span> Everything in Pro</div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: '#e5a50a' }}>✓</span> 40% pool — give 20%, keep <strong>20%</strong></div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: '#22c55e', fontWeight: 700 }}>★</span> <strong>Buyer names + emails</strong></div>
            <div style={{ display: 'flex', gap: '6px' }}><span style={{ color: '#e5a50a' }}>✓</span> Break-even at 7 sales</div>
          </div>
          <a href="https://wetwo.love/products/wetwo-vendor-subscription-elite-tier" target="_blank" rel="noopener" style={{
            display: 'block', textAlign: 'center' as const, marginTop: '14px',
            padding: '10px', background: '#e5a50a', color: '#fff',
            borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
          }}>Upgrade to Elite →</a>
        </div>
      </div>

      {/* Option C reinforcement */}
      <div style={{
        padding: '12px 16px', borderRadius: '10px',
        background: 'rgba(229,165,10,0.06)', border: '1px solid rgba(229,165,10,0.15)',
        textAlign: 'center' as const, fontSize: '13px', color: '#6b5e52',
      }}>
        This isn't just a store — it's the only marketing system that <strong style={{ color: '#2c2420' }}>makes you money</strong> while it <strong style={{ color: '#22c55e' }}>brings you customers</strong>.
      </div>
    </div>
  )
}

function UpgradeProContent() {
  return (
    <div>
      <p style={{ fontSize: '13px', color: '#6b5e52', lineHeight: 1.6, margin: '0 0 12px' }}>
        You're already getting paid to attract customers — that's what makes this different from every other platform. 
        Elite takes it further: the <strong style={{ color: '#2c2420' }}>name and email of every buyer</strong> goes into your list. 
        40% pool means you give 20% and still keep 20%.
      </p>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' as const }}>
        <a href="https://wetwo.love/products/wetwo-vendor-subscription-elite-tier" target="_blank" rel="noopener" style={{
          display: 'inline-block', padding: '10px 24px', background: '#e5a50a', color: '#fff',
          borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
        }}>Upgrade to Elite — $197/mo →</a>
        <span style={{ fontSize: '12px', color: '#9a8d80' }}>Break-even at 7 sales. Double the profit.</span>
      </div>
    </div>
  )
}

// ============================================================
// SUB-PAGES — with theme reinforcement throughout
// ============================================================
function HowItWorks({ pool, tier, contacts }: { pool: number; tier: string; contacts: boolean }) {
  return (
    <div className="sub-page">
      <h2>💡 How it works</h2>
      <p>Every product in your store is priced at or below market. We power the backend — like Costco for small businesses.</p>
      <p>You earn <strong style={{ color: '#22c55e' }}>{pool}%</strong> on everything sold. That's your pool — split it between buyer discounts (up to 20%) and your commission however you like.</p>

      {/* Option D reinforcement */}
      <h3>Why this is different</h3>
      <p>WeddingWire costs thousands a year. The Knot charges for leads. Instagram ads are a gamble. They all cost you money with no guaranteed return. <strong>This system pays you while it attracts customers.</strong> You now have something no competitor has: a customer attraction engine that pays for itself.</p>

      {contacts ? (
        <>
          <h3>The real value — your contact list</h3>
          <p>Every buyer gives you their <strong>name and email</strong>. Someone buys a toaster with your code — you email them about your core service. Now they're a prospect. Give them another discount as a thank-you. The cycle repeats. <strong>Customer for life.</strong></p>
        </>
      ) : (
        <>
          <h3>Build momentum, then unlock the full flywheel</h3>
          <p>Every sale earns you commission — money in your pocket for doing what you already do: sharing a link. <strong style={{ color: '#e5a50a' }}>With Elite ($197/mo)</strong>, you unlock the full power: the name and email of every buyer goes into your contact list. Email them about your core business, run reactivation campaigns, build a loyalty program — all from customers who found you through a discounted toaster.</p>
        </>
      )}

      <h3>For couples</h3>
      <p>A bride's guests buy gifts. She gets cashback from your pool — <strong style={{ color: '#c9944a', fontStyle: 'italic' }}>not your wallet</strong>. {contacts ? 'Every guest = a new contact. One wedding = up to 150 names.' : 'One wedding = up to 150 sales through your store.'} The bride becomes your biggest fan — and you never spent a dollar to make it happen.</p>

      <h3>For everyone else</h3>
      <p>Generate codes. Share on social, text to clients, hand out at events. They save, you earn. {contacts ? 'And you get their contact info.' : ''} Every code is marketing that makes you money instead of costing it.</p>

      <h3>The flywheel</h3>
      <p>Discount → purchase → {contacts ? 'new contact → market your business → new client → reward → repeat' : 'earnings → more incentives → more purchases → repeat'}. It compounds. The store isn't just a revenue stream — it's the engine that feeds everything else you do.</p>
    </div>
  )
}

function GrowYourBusiness({ tier }: { tier: string }) {
  return (
    <div className="sub-page">
      <h2>📈 Grow your business</h2>
      {/* Option B reinforcement */}
      <p>You have something no competitor has: a customer attraction engine that pays for itself. Both paid tiers break even at <strong>7 sales</strong>. After that, Elite earns double — and gives you buyer contacts.</p>
      <EarningsChart />
      <div style={{ marginTop: '24px' }}>
        <h3>The math at maximum generosity (giving 20%)</h3>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginTop: '12px' }}>
          {[
            { name: 'Free', keep: '20% pool — all to buyers', note: 'Pure generosity. Give the max — start attracting customers on day one.', color: '#6b5e52', keepColor: '#6b5e52' },
            { name: 'Pro $97/mo', keep: 'Keep 10%', note: '7 sales to break even. Then $15/sale profit.', color: '#9141ac', keepColor: '#22c55e' },
            { name: 'Elite $197/mo', keep: 'Keep 20%', note: '7 sales to break even. Then $30/sale + buyer contacts.', color: '#e5a50a', keepColor: '#22c55e' },
          ].map(p => (
            <div key={p.name} style={{
              padding: '14px 18px', borderRadius: '10px',
              background: `${p.color}08`, border: `1px solid ${p.color}25`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontWeight: 700, color: '#2c2420', fontSize: '14px' }}>{p.name}</span>
                <span style={{ color: '#6b5e52', fontSize: '13px', marginLeft: '12px' }}>{p.note}</span>
              </div>
              <span style={{ fontWeight: 700, color: p.keepColor, fontSize: '14px' }}>
                {p.keep}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{
        marginTop: '24px', padding: '20px', borderRadius: '12px',
        background: 'rgba(229,165,10,0.06)', border: '1px solid rgba(229,165,10,0.2)',
        textAlign: 'center' as const,
      }}>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#2c2420', fontFamily: "'Playfair Display', Georgia, serif" }}>
          One wedding. 150 guests. Elite tier giving 20%:<br/>
          <span style={{ fontSize: '28px', color: '#22c55e' }}>$4,500 profit</span>
          <span style={{ fontSize: '16px', color: '#e5a50a' }}> + 150 contacts</span>
        </p>
        {/* Option A echo */}
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#9a8d80', fontStyle: 'italic' }}>
          Name one other marketing channel that pays you $4,500 while delivering 150 new leads.
        </p>
      </div>
      {tier !== 'elite' && (
        <div style={{ marginTop: '24px', textAlign: 'center' as const, display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
          {tier === 'free' && (
            <a href="https://wetwo.love/products/wetwo-vendor-subscription-pro-tier" target="_blank" rel="noopener" style={{
              display: 'inline-block', padding: '12px 28px', background: '#9141ac', color: '#fff',
              borderRadius: '10px', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
            }}>Upgrade to Pro →</a>
          )}
          <a href="https://wetwo.love/products/wetwo-vendor-subscription-elite-tier" target="_blank" rel="noopener" style={{
            display: 'inline-block', padding: '12px 28px', background: '#e5a50a', color: '#fff',
            borderRadius: '10px', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
          }}>{tier === 'pro' ? 'Upgrade to Elite →' : 'Go Elite →'}</a>
        </div>
      )}
    </div>
  )
}

function Playbook({ tier, contacts }: { tier: string; contacts: boolean }) {
  return (
    <div className="sub-page">
      <h2>📋 Your first week</h2>
      {/* Option D reinforcement */}
      <p style={{ marginBottom: '20px' }}>Stop spending money to find customers. Start getting paid to attract them. Here's how to get your first sales this week:</p>
      {[
        { num: '1', title: 'Shop your own store', desc: 'Buy something. Feel the experience. See how the discount, the checkout, and the follow-up actually work.' },
        { num: '2', title: 'Text 5 past clients', desc: `"I have something for you — exclusive savings on thousands of products." Every one who buys = ${contacts ? 'a contact you can market to again' : 'a sale that earns you commission'}.` },
        { num: '3', title: 'Generate your first code', desc: `Pick 10% or 15%, send it to your best contacts. Every order earns you money${contacts ? ' and a name + email for your list' : ''} — marketing that pays you.` },
        { num: '4', title: 'Post on Instagram', desc: `"I have a gift for you 🎁 DM me GIFT for exclusive access." Every DM = a warm lead. Every purchase = ${contacts ? 'a customer for life' : 'income from a new customer'}.` },
        { num: '5', title: 'Set up one registry', desc: `One bride. 150 guests. That's 150 ${contacts ? 'new contacts' : 'sales'} — and you're putting honeymoon money in her bridal purse without taking a dollar from your pocket. She's your biggest fan. You're ours.` },
      ].map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: '14px', padding: '14px 0', borderBottom: i < 4 ? '1px solid #e4ddd4' : 'none' }}>
          <div style={{
            width: '28px', height: '28px', background: '#c9944a', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0,
          }}>{step.num}</div>
          <div>
            <h4 style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 700, color: '#2c2420' }}>{step.title}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b5e52', lineHeight: 1.5 }}>{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// STYLES
// ============================================================
const sharedStyles = `
  .dash-header { background: #fff; border-bottom: 1px solid #e4ddd4; padding: 16px 28px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; }
  .dash-title { font-size: 18px; font-weight: 700; color: #2c2420; margin: 0; }
  .dash-sub { font-size: 13px; color: #6b5e52; margin: 3px 0 0; }
  .dash-sub strong { color: #2c2420; }
  .view-page-btn { padding: 7px 14px; border: 1px solid #e4ddd4; border-radius: 8px; color: #6b5e52; text-decoration: none; font-size: 13px; font-weight: 600; transition: all 0.2s; }
  .view-page-btn:hover { border-color: #c9944a; color: #c9944a; }
  .view-store-btn { padding: 7px 14px; border: 1px solid #22c55e40; border-radius: 8px; color: #22c55e; text-decoration: none; font-size: 13px; font-weight: 600; transition: all 0.2s; background: rgba(34,197,94,0.04); }
  .view-store-btn:hover { border-color: #22c55e; background: rgba(34,197,94,0.08); }
  .back-btn { background: none; border: none; color: #c9944a; font-weight: 600; font-size: 14px; cursor: pointer; padding: 0; font-family: inherit; }
  .back-btn:hover { text-decoration: underline; }
  .page-content { padding: 24px 28px; max-width: 800px; }

  /* Trial banners */
  .trial-banner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; margin-bottom: 16px; border-radius: 12px; background: linear-gradient(135deg, rgba(145,65,172,0.06), rgba(229,165,10,0.06)); border: 1.5px solid rgba(145,65,172,0.2); }
  .trial-expired-banner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; margin-bottom: 16px; border-radius: 12px; background: rgba(220,38,38,0.04); border: 1.5px solid rgba(220,38,38,0.2); }
  .trial-left { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
  .trial-icon { font-size: 20px; flex-shrink: 0; }
  .trial-left div { font-size: 13px; color: #2c2420; line-height: 1.5; }
  .trial-sub { color: #6b5e52; }
  .trial-cta { flex-shrink: 0; padding: 8px 18px; background: #9141ac; color: #fff; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
  .trial-cta:hover { opacity: 0.9; }
  .trial-cta-urgent { flex-shrink: 0; padding: 8px 18px; background: #e5a50a; color: #fff; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
  .trial-cta-urgent:hover { opacity: 0.9; }

  /* Hero */
  .hero-explainer { background: linear-gradient(135deg, #2c2420, #1a1614); border-radius: 16px; padding: 20px 24px; margin-bottom: 16px; color: #fff; }
  .hero-explainer h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; margin: 0 0 12px; line-height: 1.3; color: #fff; }
  .hero-flow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .flow-step { flex: 1; min-width: 130px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 12px; font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.4; display: flex; align-items: flex-start; gap: 8px; }
  .flow-step strong { color: #fff; }
  .flow-num { background: #c9944a; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }
  .flow-arrow { color: #c9944a; font-weight: 700; font-size: 14px; flex-shrink: 0; }

  /* Step 4 — Gold Pill */
  .hero-gold-pill { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; background: linear-gradient(135deg, rgba(201,148,74,0.15), rgba(229,165,10,0.1)); border: 1px solid rgba(201,148,74,0.3); }
  .gold-pill-num { background: #c9944a; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }
  .gold-pill-text { font-size: 13px; color: rgba(255,255,255,0.9); line-height: 1.5; }
  .gold-pill-text strong { color: #e5a50a; }

  /* Section cards */
  .section-card { background: #fff; border-radius: 14px; border: 1px solid #e4ddd4; padding: 16px 20px; margin-bottom: 12px; }

  /* Learn more grid */
  .learn-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto; gap: 10px; margin-top: 16px; }
  .learn-pill { background: #fff; border: 1px solid #e4ddd4; border-radius: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .learn-pill:hover { border-color: #c9944a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(201,148,74,0.1); }
  .learn-pill.small { padding: 20px 14px; grid-row: span 1; }
  .learn-pill.big { padding: 24px 20px; grid-row: span 2; grid-column: 2; background: linear-gradient(135deg, rgba(34,197,94,0.04), rgba(229,165,10,0.04)); border-color: rgba(34,197,94,0.25); }
  .learn-pill.big:hover { border-color: #22c55e; background: linear-gradient(135deg, rgba(34,197,94,0.08), rgba(229,165,10,0.08)); }
  .pill-icon { font-size: 24px; margin-bottom: 6px; }
  .pill-icon.big-icon { font-size: 36px; margin-bottom: 10px; }
  .pill-label { font-size: 13px; font-weight: 600; color: #6b5e52; }
  .pill-label.big-label { font-size: 16px; font-weight: 800; color: #22c55e; }
  .pill-sub { font-size: 12px; color: #9a8d80; margin-top: 6px; line-height: 1.4; max-width: 180px; }

  @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 800px; } }

  /* Sub pages */
  .sub-page { max-width: 700px; }
  .sub-page h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #2c2420; margin: 0 0 16px; }
  .sub-page h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 24px 0 8px; }
  .sub-page p { font-size: 15px; color: #6b5e52; line-height: 1.7; margin: 0 0 12px; }
  .sub-page p strong { color: #2c2420; }

  @media (max-width: 768px) {
    .dash-header { padding: 14px 20px; flex-direction: column; gap: 10px; align-items: flex-start; }
    .page-content { padding: 20px; }
    .hero-flow { flex-direction: column; }
    .flow-arrow { transform: rotate(90deg); }
    .hero-gold-pill { margin-top: 4px; }
    .learn-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
    .learn-pill.big { grid-row: span 1; grid-column: 1; }
    .trial-banner, .trial-expired-banner { flex-direction: column; align-items: flex-start; }
  }
`
