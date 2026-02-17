'use client'
import PayPalConnect from '@/components/dashboard/PayPalConnect'

import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [vendor, setVendor] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  if (!vendor) return null

  const isFree = vendor.plan === 'free'
  const isPro = vendor.plan === 'pro'
  const isElite = vendor.plan === 'elite'

  const poolMap: Record<string, number> = { free: 20, pro: 30, elite: 40 }
  const pool = poolMap[vendor.plan] || 20

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {`${vendor.plan.charAt(0).toUpperCase() + vendor.plan.slice(1)} Plan — ${pool}% pool. You control the split between buyer discounts and your commission.`}
          </p>
        </div>
      </header>

      <div className="page-content">
        {/* Current Earnings */}
        <div className="earnings-hero">
          <div className="earnings-total">$0.00</div>
          <div className="earnings-label">Total Commission Earned</div>
          <div className="rate-badge">
            {`${pool}% pool — you control the split`}
          </div>
        </div>

        {/* Payout Setup */}
        <div style={{ marginBottom: 24 }}>
          <PayPalConnect type="vendor" refId={vendor.ref} />
        </div>

        {/* Choose Your Plan */}
        <h3 className="section-heading">Your Plan</h3>
        <p className="section-subheading">A bigger pool means more margin — whether you use it for buyer incentives, commission, or both.</p>
        <div className="tiers-grid">
          {/* FREE */}
          <div className={`tier-card ${isFree ? 'current' : ''}`}>
            <div className="tier-name">Free</div>
            <div className="tier-rate">20%</div>
            <div className="tier-label">pool</div>
            <div className="tier-price">$0/month</div>
            <ul className="tier-features">
              <li>✓ Premium vendor page</li>
              <li>✓ Shopping links for clients</li>
              <li>✓ Contact form & leads</li>
              <li>✓ AI assistant</li>
              <li className="highlight">✓ 20% pool — yours to split</li>
              <li>✓ Up to 20% buyer discount</li>
              <li>✓ Up to 20% commission</li>
            </ul>
            {isFree && <div className="current-badge">Current Plan</div>}
          </div>

          {/* PRO */}
          <div className={`tier-card featured ${isPro ? 'current' : ''}`}>
            <div className="tier-popular">Most Popular</div>
            <div className="tier-name">Pro</div>
            <div className="tier-rate green">30%</div>
            <div className="tier-label">pool</div>
            <div className="tier-price">$97/month</div>
            <div className="tier-daily">{"That's $3.23/day — a cup of coffee"}</div>
            <ul className="tier-features">
              <li>✓ Everything in Free</li>
              <li className="highlight">✓ 30% pool — yours to split</li>
              <li>✓ Branded Couples{"'"} Store</li>
              <li>✓ 7-day branded trial included</li>
              <li>✓ Up to 20% buyer discount + 10% commission</li>
              <li>✓ Or up to 30% commission (no discount)</li>
              <li>✓ ~7 sales covers your plan</li>
            </ul>
            {isPro
              ? <div className="current-badge">Current Plan</div>
              : <a href="https://wetwo.love/products/wetwo-vendor-subscription-pro-tier" target="_blank" rel="noopener" className="tier-btn primary">Upgrade to Pro →</a>
            }
          </div>

          {/* ELITE */}
          <div className={`tier-card ${isElite ? 'current' : ''}`}>
            <div className="tier-name">Elite</div>
            <div className="tier-rate green">40%</div>
            <div className="tier-label">pool</div>
            <div className="tier-price">$197/month</div>
            <div className="tier-daily">{"That's $6.57/day — less than lunch"}</div>
            <ul className="tier-features">
              <li>✓ Everything in Pro</li>
              <li className="highlight">✓ 40% pool — yours to split</li>
              <li className="highlight">✓ Buyer contact list on every sale</li>
              <li>✓ Up to 20% buyer discount + 20% commission</li>
              <li>✓ Or up to 40% commission (no discount)</li>
              <li>✓ ~7 sales covers your plan</li>
            </ul>
            {isElite
              ? <div className="current-badge">Current Plan</div>
              : <a href="https://wetwo.love/products/wetwo-vendor-subscription-elite-tier" target="_blank" rel="noopener" className="tier-btn outline">Upgrade to Elite →</a>
            }
          </div>
        </div>

        {/* Quick Math */}
        <div className="accelerator-card">
          <h3>🚀 One wedding. 150 guests. Your earnings at max commission:</h3>
          <p className="accelerator-intro">
            {"At $150 average gift spend, that's $22,500 flowing through the registry. Even if only half buy registry items:"}
          </p>

          <div className="accel-grid">
            <div className="accel-item">
              <div className="accel-tier-name">Free (20%)</div>
              <div className="accel-value">$2,250</div>
              <div className="accel-extra">commission</div>
            </div>
            <div className="accel-item">
              <div className="accel-tier-name">Pro (30%)</div>
              <div className="accel-value">$3,375</div>
              <div className="accel-extra">commission</div>
            </div>
            <div className="accel-item featured">
              <div className="accel-tier-name">Elite (40%)</div>
              <div className="accel-value">$4,500</div>
              <div className="accel-extra">+ buyer contacts</div>
            </div>
          </div>

          <p className="accelerator-kicker">
            {"That's from one couple. Most wedding vendors work with 5–20+ couples per year."}
          </p>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/dashboard/earnings" className="detail-link">See full earnings breakdown & math →</a>
          </div>
        </div>

        {/* The Real Value */}
        <div className="real-value-card">
          <h3>{"💎 The real ROI isn't the commission"}</h3>
          <p className="real-value-text">
            {"The commission is spending money — a nice bonus. But the"} <strong>real</strong> {"return is what this system does for your main business:"}
          </p>
          <div className="value-grid">
            <div className="value-item">
              <div className="value-icon">🏠</div>
              <strong>Your landing page</strong>
              <p>A high-converting page that turns clicks into inquiries. One booking pays for years of membership.</p>
            </div>
            <div className="value-item">
              <div className="value-icon">💡</div>
              <strong>Reactivated leads</strong>
              <p>Every cold lead now has a reason to hear from you. One reopened conversation = one potential booking.</p>
            </div>
            <div className="value-item">
              <div className="value-icon">🌐</div>
              <strong>Network effect</strong>
              <p>{"Every couple's registry puts your name in front of 150+ guests. That's exposure money can't buy."}</p>
            </div>
          </div>
          <p className="real-value-kicker">
            {"A single booking is worth $2,000–$10,000+ to your business. "}
            <strong>{"That's the real math."}</strong>
          </p>
        </div>

        {/* Upgrade CTA */}
        {!isElite && (
          <div className="upgrade-cta">
            <h4>{"Ready to grow your pool?"}</h4>
            <p>{"A bigger pool means more flexibility — more room for buyer incentives and a healthier commission."}</p>
            <div className="upgrade-buttons">
              {isFree && (
                <a href="https://wetwo.love/products/wetwo-vendor-subscription-pro-tier" target="_blank" rel="noopener" className="tier-btn primary">Upgrade to Pro — $97/mo →</a>
              )}
              <a href="https://wetwo.love/products/wetwo-vendor-subscription-elite-tier" target="_blank" rel="noopener" className="tier-btn outline">
                {isPro ? 'Upgrade to Elite — $197/mo →' : 'Go straight to Elite — $197/mo →'}
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-header {
          background: #fff;
          border-bottom: 1px solid #e4ddd4;
          padding: 20px 32px;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .page-content { padding: 28px 32px; max-width: 900px; }
        .earnings-hero {
          background: linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02));
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          margin-bottom: 28px;
        }
        .earnings-total { font-size: 44px; font-weight: 700; color: #22c55e; margin-bottom: 4px; }
        .earnings-label { font-size: 14px; color: #6b5e52; }
        .rate-badge {
          display: inline-block;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          color: #22c55e;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-top: 12px;
        }

        .section-heading { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .section-subheading { font-size: 13px; color: #9a8d80; font-style: italic; margin: 0 0 14px; }
        .tiers-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 14px; margin-bottom: 28px;
        }
        .tier-card {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 14px;
          padding: 24px 20px; text-align: center; position: relative; transition: all 0.2s;
        }
        .tier-card:hover { transform: translateY(-2px); border-color: #c9944a; }
        .tier-card.featured { border-color: #c9944a; border-width: 2px; }
        .tier-card.current { background: rgba(34,197,94,0.03); border-color: rgba(34,197,94,0.3); }
        .tier-popular {
          position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
          background: #c9944a; color: #fff; padding: 2px 14px; border-radius: 12px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .tier-name { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9a8d80; margin-bottom: 8px; }
        .tier-rate { font-size: 32px; font-weight: 700; margin-bottom: 0; }
        .tier-rate.green { color: #22c55e; }
        .tier-label { font-size: 12px; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .tier-price { font-size: 14px; color: #6b5e52; margin-bottom: 4px; }
        .tier-daily { font-size: 11px; color: #c9944a; font-weight: 600; margin-bottom: 16px; font-style: italic; }
        .tier-features { list-style: none; padding: 0; margin: 0 0 16px; text-align: left; }
        .tier-features li { font-size: 12px; color: #6b5e52; padding: 4px 0; line-height: 1.4; }
        .tier-features li.highlight { color: #22c55e; font-weight: 600; }
        .tier-features li.dim { color: #9a8d80; }
        .tier-btn {
          display: block; padding: 10px; border-radius: 8px; font-size: 13px;
          font-weight: 700; text-decoration: none; text-align: center; transition: all 0.2s;
        }
        .tier-btn.primary { background: #c9944a; color: #fff; }
        .tier-btn.primary:hover { filter: brightness(1.1); }
        .tier-btn.outline { background: transparent; border: 1px solid #e4ddd4; color: #6b5e52; }
        .tier-btn.outline:hover { border-color: #c9944a; color: #c9944a; }
        .current-badge {
          padding: 8px; background: rgba(34,197,94,0.1); color: #22c55e;
          border-radius: 8px; font-size: 12px; font-weight: 700;
        }

        /* Accelerator */
        .accelerator-card {
          background: linear-gradient(135deg, rgba(34,197,94,0.04), rgba(201,148,74,0.04));
          border: 1px solid rgba(34,197,94,0.2); border-radius: 14px;
          padding: 24px; margin-bottom: 28px;
        }
        .accelerator-card h3 { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .accelerator-intro { font-size: 14px; color: #6b5e52; line-height: 1.6; margin: 0 0 16px; }
        .accelerator-intro strong { color: #2c2420; }
        .accel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
        .accel-item {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 10px;
          padding: 18px 14px; text-align: center; transition: all 0.2s;
        }
        .accel-item.featured { border-color: #22c55e; background: rgba(34,197,94,0.03); }
        .accel-tier-name { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9a8d80; margin-bottom: 4px; }
        .accel-value { font-size: 28px; font-weight: 700; color: #22c55e; }
        .accel-extra { font-size: 12px; color: #c9944a; font-weight: 600; margin-top: 4px; }
        .accelerator-kicker { font-size: 14px; color: #2c2420; font-weight: 600; margin: 0; font-style: italic; text-align: center; }

        .detail-link {
          font-size: 13px; color: #c9944a; font-weight: 600; text-decoration: none;
        }
        .detail-link:hover { text-decoration: underline; }

        /* Real Value Card */
        .real-value-card {
          background: #fff; border: 2px solid #c9944a; border-radius: 14px;
          padding: 28px; margin-bottom: 28px;
        }
        .real-value-card h3 { font-size: 18px; font-weight: 700; color: #2c2420; margin: 0 0 10px; }
        .real-value-text { font-size: 14px; color: #6b5e52; line-height: 1.6; margin: 0 0 20px; }
        .real-value-text strong { color: #2c2420; }
        .value-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
        .value-item {
          background: #faf8f5; border: 1px solid #e4ddd4; border-radius: 10px; padding: 18px; text-align: center;
        }
        .value-icon { font-size: 24px; margin-bottom: 8px; }
        .value-item strong { font-size: 14px; color: #2c2420; display: block; margin-bottom: 6px; }
        .value-item p { font-size: 12px; color: #6b5e52; line-height: 1.5; margin: 0; }
        .real-value-kicker {
          font-size: 15px; color: #2c2420; text-align: center; margin: 0; line-height: 1.6;
        }
        .real-value-kicker strong { color: #c9944a; }

        /* Upgrade CTA */
        .upgrade-cta {
          background: linear-gradient(135deg, rgba(201,148,74,0.06), rgba(34,197,94,0.04));
          border: 2px solid rgba(201,148,74,0.3); border-radius: 14px;
          padding: 24px; text-align: center;
        }
        .upgrade-cta h4 { font-size: 18px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .upgrade-cta p { font-size: 14px; color: #6b5e52; margin: 0 0 16px; }
        .upgrade-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .upgrade-buttons .tier-btn { display: inline-block; min-width: 220px; padding: 12px 20px; }

        @media (max-width: 768px) {
          .page-content { padding: 20px; }
          .tiers-grid { grid-template-columns: 1fr 1fr; }
          .accel-grid { grid-template-columns: 1fr; }
          .value-grid { grid-template-columns: 1fr; }
          .upgrade-buttons { flex-direction: column; align-items: center; }
        }
        @media (max-width: 480px) {
          .tiers-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
