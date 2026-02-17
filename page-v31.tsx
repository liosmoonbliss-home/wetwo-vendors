'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import VendorToolbox from '@/components/VendorToolbox'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

// ============================================================
// WeTwo — Vendor Dashboard v3.1
// ============================================================

const TIER_INFO: Record<string, { pool: number; price: number; label: string; color: string }> = {
  free:    { pool: 20, price: 0,   label: 'Free',    color: '#6b5e52' },
  starter: { pool: 30, price: 97,  label: 'Starter', color: '#3584e4' },
  pro:     { pool: 35, price: 197, label: 'Pro',     color: '#9141ac' },
  elite:   { pool: 40, price: 297, label: 'Elite',   color: '#e5a50a' },
}

function generateEarningsData() {
  const data = []
  for (let sales = 0; sales <= 30; sales++) {
    data.push({
      sales,
      starter: Math.max(sales * 15 - 97, -97),
      pro: Math.max(sales * 22.5 - 197, -197),
      elite: Math.max(sales * 30 - 297, -297),
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
        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#fff' }}>{label} sales/mo × $150</p>
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
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={earningsData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
          <XAxis dataKey="sales" tick={{ fontSize: 11, fill: '#9a8d80' }}
            label={{ value: 'Sales per month', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#9a8d80' }} />
          <YAxis tick={{ fontSize: 11, fill: '#9a8d80' }} tickFormatter={(v: number) => `$${v}`}
            label={{ value: 'Monthly profit', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#9a8d80' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#e4ddd4" strokeWidth={2} />
          <Line type="monotone" dataKey="starter" name="Starter $97/mo" stroke="#3584e4" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="pro" name="Pro $197/mo" stroke="#9141ac" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="elite" name="Elite $297/mo" stroke="#e5a50a" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          <Legend verticalAlign="top" height={36} formatter={(v: string) => <span style={{ fontSize: '12px', color: '#6b5e52', fontWeight: 600 }}>{v}</span>} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
        {[
          { tier: 'Starter', profit: 20 * 15 - 97, rate: '$15', color: '#3584e4' },
          { tier: 'Pro', profit: 20 * 22.5 - 197, rate: '$22.50', color: '#9141ac' },
          { tier: 'Elite', profit: 20 * 30 - 297, rate: '$30', color: '#e5a50a' },
        ].map(p => (
          <div key={p.tier} style={{
            textAlign: 'center' as const, padding: '12px', borderRadius: '10px',
            background: `${p.color}08`, border: `1px solid ${p.color}20`,
          }}>
            <div style={{ fontSize: '10px', color: '#9a8d80', fontWeight: 700, textTransform: 'uppercase' as const }}>{p.tier} at 20 sales</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: p.color }}>${p.profit.toFixed(0)}/mo</div>
            <div style={{ fontSize: '10px', color: '#6b5e52' }}>{p.rate}/sale after break-even</div>
          </div>
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

  if (sidebarPage) {
    return (
      <div>
        <header className="dash-header">
          <button onClick={() => setSidebarPage(null)} className="back-btn">← Back to Dashboard</button>
        </header>
        <div className="page-content">
          {sidebarPage === 'how-it-works' && <HowItWorks pool={t.pool} />}
          {sidebarPage === 'grow' && <GrowYourBusiness tier={tier} />}
          {sidebarPage === 'playbook' && <Playbook />}
        </div>
        <style jsx>{sharedStyles}</style>
      </div>
    )
  }

  return (
    <div>
      {/* ===== HEADER ===== */}
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Welcome, {firstName}</h1>
          <p className="dash-sub">
            You earn <strong>{t.pool}%</strong> on every sale.
            {stats.totalCommission > 0 && <> So far: <strong style={{ color: '#22c55e' }}>${stats.totalCommission.toFixed(0)}</strong></>}
          </p>
        </div>
        <Link href={`/vendor/${vendor.ref}`} target="_blank" className="view-page-btn">View Store →</Link>
      </header>

      <div className="page-content">

        {/* ===== HERO EXPLAINER ===== */}
        <div className="hero-explainer">
          <h2>We gave you a landing page and a store — for free.</h2>
          <p>Here's how they work together to make you money:</p>
          <div className="hero-flow">
            <div className="flow-step">
              <span className="flow-num">1</span>
              <span>Your <strong>landing page</strong> captures leads and builds trust</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-num">2</span>
              <span>Your <strong>store</strong> has thousands of products at or below market price</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-num">3</span>
              <span>You earn <strong style={{ color: '#22c55e' }}>{t.pool}%</strong> on everything sold — and share incentives to drive more sales</span>
            </div>
          </div>
          <p className="hero-costco">We don't make margin. We make memberships — like Costco for small businesses. The savings go to you and your clients.</p>
        </div>

        {/* ===== COUPLES — REGISTRY LINKS ===== */}
        <CouplesSection vendorRef={vendor.ref} tier={tier} pool={t.pool} />

        {/* ===== EVERYONE — CODE GENERATOR ===== */}
        <VendorToolbox vendorRef={vendor.ref} tier={tier} showCouplesSection={false} />

        {/* ===== LEARN MORE PILLS ===== */}
        <div className="learn-grid">
          <button onClick={() => setSidebarPage('how-it-works')} className="learn-pill small">
            <span className="pill-icon">💡</span>
            <span className="pill-label">How it works</span>
          </button>
          <button onClick={() => setSidebarPage('grow')} className="learn-pill big">
            <span className="pill-icon big-icon">📈</span>
            <span className="pill-label big-label">Grow your business</span>
            <span className="pill-sub">See the math. Upgrade to earn more while giving more.</span>
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
// COUPLES SECTION with accordion
// ============================================================
function CouplesSection({ vendorRef, tier, pool }: { vendorRef: string; tier: string; pool: number }) {
  const [open, setOpen] = useState(false)
  const refSlug = vendorRef ? `vendor-${vendorRef}` : 'vendor-demo'

  const links = [
    { pct: 10, code: `https://wetwo.love/?ref=${refSlug}&cb=10` },
    { pct: 15, code: `https://wetwo.love/?ref=${refSlug}&cb=15` },
    { pct: 20, code: `https://wetwo.love/?ref=${refSlug}&cb=20` },
  ]

  return (
    <div className="section-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>🎁</span>
        <div>
          <h3 className="section-title">For Couples — Cashback Registry</h3>
          <p className="section-desc">
            Give a bride your registry link. When her guests buy gifts, she gets <strong>cashback</strong> — 
            real money toward her honeymoon. 150 guests × $150 average gift = <strong>thousands back in her pocket</strong>.
          </p>
          <p className="section-desc" style={{ marginBottom: 0 }}>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>You don't pay for it.</span> The cashback comes out of your {pool}% pool. 
            You keep the rest. The more you give, the more brides choose you — and the more you sell.
          </p>
        </div>
      </div>

      {/* Accordion */}
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '10px 16px', background: open ? 'rgba(201,148,74,0.06)' : '#fafaf8',
        border: '1px solid #e4ddd4', borderRadius: open ? '10px 10px 0 0' : '10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2c2420' }}>
          Your 3 Registry Links
        </span>
        <span style={{ fontSize: '16px', color: '#c9944a', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
      </button>

      {open && (
        <div style={{
          border: '1px solid #e4ddd4', borderTop: 'none', borderRadius: '0 0 10px 10px',
          padding: '12px', display: 'flex', flexDirection: 'column' as const, gap: '8px',
          animation: 'slideDown 0.2s ease',
        }}>
          {links.map((link, i) => (
            <CopyRow key={i} pct={link.pct} code={link.code} type="cashback" />
          ))}
        </div>
      )}
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
// SUB-PAGES
// ============================================================
function HowItWorks({ pool }: { pool: number }) {
  return (
    <div className="sub-page">
      <h2>💡 How it works</h2>
      <p>Every product is priced at or below market. We don't make margin — we make memberships, like Costco for small businesses.</p>
      <p>You earn <strong style={{ color: '#22c55e' }}>{pool}% on everything sold</strong> through your store. That pool is yours to keep or share as incentives up to 20%.</p>
      <h3>For couples</h3>
      <p>Give a bride your registry link. She creates a registry. Her guests buy gifts. She gets cashback on every one. Every guest sees your name. You earn your pool on every sale — without paying for the cashback. It comes from the pool.</p>
      <h3>For everyone else</h3>
      <p>Generate a discount code. Share it on social, text it to clients, hand it out at events. They get a real discount at checkout. You earn your pool minus whatever you gave.</p>
      <h3>The generosity math</h3>
      <p>The more you give, the more people use your links. The more they use your links, the more you sell. Generosity isn't charity — it's the growth engine.</p>
    </div>
  )
}

function GrowYourBusiness({ tier }: { tier: string }) {
  return (
    <div className="sub-page">
      <h2>📈 Grow your business</h2>
      <p>Break-even is 7–10 sales for every tier. After that, higher tiers earn faster — Elite at <strong>double</strong> the rate of Starter.</p>
      <EarningsChart />
      <div style={{ marginTop: '24px' }}>
        <h3>The math at maximum generosity (giving 20%)</h3>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginTop: '12px' }}>
          {[
            { name: 'Free', keep: 0, note: 'Pure generosity. Build your list.', color: '#6b5e52' },
            { name: 'Starter $97/mo', keep: 10, note: '7 gifts to break even. Then $15/gift profit.', color: '#3584e4' },
            { name: 'Pro $197/mo', keep: 15, note: '9 gifts to break even. Then $22.50/gift.', color: '#9141ac' },
            { name: 'Elite $297/mo', keep: 20, note: '10 gifts to break even. Then $30/gift — double Starter.', color: '#e5a50a' },
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
              <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '14px' }}>
                {p.keep > 0 ? `Keep ${p.keep}%` : 'Keep $0'}
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
          <span style={{ fontSize: '28px', color: '#22c55e' }}>$4,500 profit.</span>
        </p>
      </div>
      {tier === 'free' && (
        <div style={{ marginTop: '24px' }}>
          <h3>Paid tier benefits</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            {['Your branding — no WeTwo', 'Bigger pool on every sale', 'Add your own products & services', 'Incentives apply to everything', 'Give 20% and still profit', 'Featured collection spot'].map((b, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#6b5e52', display: 'flex', gap: '6px' }}>
                <span style={{ color: '#22c55e' }}>✓</span> {b}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center' as const }}>
            <Link href="/dashboard/earnings" style={{
              display: 'inline-block', padding: '12px 28px', background: '#22c55e', color: '#fff',
              borderRadius: '10px', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
            }}>Upgrade Now →</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Playbook() {
  return (
    <div className="sub-page">
      <h2>📋 Your first week</h2>
      {[
        { num: '1', title: 'Shop your own store', desc: 'Buy something. Feel the experience from the customer side.' },
        { num: '2', title: 'Text 5 past clients', desc: '"I have something to share — exclusive savings on thousands of products. Want the link?"' },
        { num: '3', title: 'Generate your first code', desc: 'Pick 10% or 15%, send it to your best contacts. Watch the orders.' },
        { num: '4', title: 'Post on Instagram', desc: '"I have a gift for you 🎁 DM me GIFT for exclusive access." Every DM = a warm lead.' },
        { num: '5', title: 'Set up one registry', desc: 'One bride. 150 guests. Thousands in cashback for the couple. Hundreds of impressions for you.' },
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
  .back-btn { background: none; border: none; color: #c9944a; font-weight: 600; font-size: 14px; cursor: pointer; padding: 0; font-family: inherit; }
  .back-btn:hover { text-decoration: underline; }
  .page-content { padding: 24px 28px; max-width: 800px; }

  /* Hero explainer */
  .hero-explainer { background: linear-gradient(135deg, #2c2420, #1a1614); border-radius: 16px; padding: 24px 28px; margin-bottom: 20px; color: #fff; }
  .hero-explainer h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; margin: 0 0 6px; line-height: 1.3; color: #fff; }
  .hero-explainer > p { font-size: 14px; color: rgba(255,255,255,0.6); margin: 0 0 16px; }
  .hero-flow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .flow-step { flex: 1; min-width: 160px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.5; display: flex; align-items: flex-start; gap: 8px; }
  .flow-step strong { color: #fff; }
  .flow-num { background: #c9944a; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
  .flow-arrow { color: #c9944a; font-weight: 700; font-size: 16px; flex-shrink: 0; }
  .hero-costco { font-size: 12px; color: rgba(255,255,255,0.45); margin: 0; font-style: italic; }

  /* Section cards */
  .section-card { background: #fff; border-radius: 14px; border: 1px solid #e4ddd4; padding: 20px 24px; margin-bottom: 16px; }
  .section-title { margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #2c2420; }
  .section-desc { margin: 0 0 10px; font-size: 13px; color: #6b5e52; line-height: 1.6; }
  .section-desc strong { color: #2c2420; }

  /* Learn more grid */
  .learn-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto; gap: 10px; margin-top: 20px; }
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

  @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }

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
    .learn-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
    .learn-pill.big { grid-row: span 1; grid-column: 1; }
  }
`
