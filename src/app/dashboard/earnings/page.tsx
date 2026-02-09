import PayPalConnect from '@/components/dashboard/PayPalConnect'
'use client'

import { useState, useEffect } from 'react'

export default function EarningsPage() {
  const [vendor, setVendor] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  if (!vendor) return null

  const isFree = vendor.plan === 'free'

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Commission & Earnings</h1>
          <p className="page-subtitle">
            {isFree ? 'You\'re on the free plan — everything works, you just don\'t earn commission yet' : `${vendor.plan.charAt(0).toUpperCase() + vendor.plan.slice(1)} Plan — ${vendor.commission_rate}% commission`}
          </p>
        </div>
      </header>

      <div className="page-content">
        {/* Current Earnings */}
        <div className="earnings-hero">
          <div className="earnings-total">{isFree ? '—' : '$0.00'}</div>
          <div className="earnings-label">Total Commission Earned</div>
          {!isFree && (
            <div className="rate-badge">✓ Earning {vendor.commission_rate}% on every purchase</div>
          )}
        </div>

        {/* Payout Setup */}
        <div style={{ marginBottom: 24 }}>
          <PayPalConnect type="vendor" refId={vendor.ref} />
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h3>How commission works</h3>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <div>
                <strong>You share your link</strong>
                <p>Anyone who gets your link — couples, clients, friends — can shop with 25% cashback.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <div>
                <strong>They buy something</strong>
                <p>Could be a registry gift, furniture, clothing — anything in the store.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <div>
                <strong>You earn a percentage</strong>
                <p>On a paid plan, you earn 10–20% of every cart purchase made through your links.</p>
              </div>
            </div>
          </div>
          <div className="clarity-note">
            You don't pay the 25% cashback. You don't discount your services.
            The commission is separate revenue that comes to you —
            before you wake up in the morning.
          </div>
        </div>

        {/* Choose Your Plan */}
        <h3 className="section-heading">Choose Your Plan</h3>
        <div className="tiers-grid">
          <div className={`tier-card ${vendor.plan === 'free' ? 'current' : ''}`}>
            <div className="tier-name">Free</div>
            <div className="tier-rate">0%</div>
            <div className="tier-price">$0/month</div>
            <ul className="tier-features">
              <li>✓ Premium vendor page</li>
              <li>✓ Cashback links for clients</li>
              <li>✓ Contact form & leads</li>
              <li>✓ AI assistant</li>
              <li className="dim">✗ No commission on purchases</li>
            </ul>
            {vendor.plan === 'free' && <div className="current-badge">Current Plan</div>}
          </div>

          <div className={`tier-card ${vendor.plan === 'starter' ? 'current' : ''}`}>
            <div className="tier-name">Starter</div>
            <div className="tier-rate green">10%</div>
            <div className="tier-price">$97/month</div>
            <ul className="tier-features">
              <li>✓ Everything in Free</li>
              <li className="highlight">✓ 10% commission on every cart</li>
              <li>✓ ~7 sales covers your plan</li>
            </ul>
            {vendor.plan === 'starter'
              ? <div className="current-badge">Current Plan</div>
              : <a href="https://wetwo.love/products/wetwo-vendor-subscription-starter-tier" target="_blank" rel="noopener" className="tier-btn outline">Choose Starter →</a>
            }
          </div>

          <div className={`tier-card featured ${vendor.plan === 'growth' ? 'current' : ''}`}>
            <div className="tier-popular">Most Popular</div>
            <div className="tier-name">Growth</div>
            <div className="tier-rate green">15%</div>
            <div className="tier-price">$197/month</div>
            <ul className="tier-features">
              <li>✓ Everything in Free</li>
              <li className="highlight">✓ 15% commission on every cart</li>
              <li>✓ ~9 sales covers your plan</li>
            </ul>
            {vendor.plan === 'growth'
              ? <div className="current-badge">Current Plan</div>
              : <a href="https://wetwo.love/products/wetwo-vendor-subscription-growth-tier" target="_blank" rel="noopener" className="tier-btn primary">Choose Growth →</a>
            }
          </div>

          <div className={`tier-card ${vendor.plan === 'pro' ? 'current' : ''}`}>
            <div className="tier-name">Pro</div>
            <div className="tier-rate green">20%</div>
            <div className="tier-price">$297/month</div>
            <ul className="tier-features">
              <li>✓ Everything in Free</li>
              <li className="highlight">✓ 20% commission on every cart</li>
              <li>✓ ~10 sales covers your plan</li>
            </ul>
            {vendor.plan === 'pro'
              ? <div className="current-badge">Current Plan</div>
              : <a href="https://wetwo.love/products/wetwo-vendor-subscription-pro-tier" target="_blank" rel="noopener" className="tier-btn outline">Choose Pro →</a>
            }
          </div>
        </div>

        {/* Profit Accelerator */}
        <div className="accelerator-card">
          <h3>🚀 Why the higher tier wins</h3>
          <p className="accelerator-intro">
            The break-even difference between tiers is just <strong>2–3 extra sales</strong>. 
            But every sale after that, the higher tier earns you more — and the gap keeps growing.
          </p>

          <div className="accelerator-label">Your next 10 sales after break-even:</div>
          <div className="accel-grid">
            <div className="accel-item">
              <div className="accel-tier-name">Starter</div>
              <div className="accel-math">10 × $15</div>
              <div className="accel-value">$150</div>
              <div className="accel-extra">profit</div>
            </div>
            <div className="accel-item featured">
              <div className="accel-tier-name">Growth</div>
              <div className="accel-math">10 × $22.50</div>
              <div className="accel-value">$225</div>
              <div className="accel-extra">+50% more</div>
            </div>
            <div className="accel-item">
              <div className="accel-tier-name">Pro</div>
              <div className="accel-math">10 × $30</div>
              <div className="accel-value">$300</div>
              <div className="accel-extra">double Starter</div>
            </div>
          </div>

          <p className="accelerator-kicker">
            Same effort. Same links. Same network. The only difference is which plan you chose <em>before</em> you started sharing.
          </p>
        </div>

        {/* The Real Math */}
        <div className="math-card">
          <h3>📊 The math that actually matters</h3>

          <div className="source-badge">
            <span className="source-icon">📋</span>
            <div>
              <strong>Based on real industry data</strong>
              <span>The Knot 2024 Guest Study — 1,000 U.S. adults surveyed</span>
            </div>
          </div>

          <div className="data-grid">
            <div className="data-card">
              <div className="data-value">$150</div>
              <div className="data-label">Average gift per guest</div>
              <div className="data-source">The Knot 2024 Guest Study</div>
            </div>
            <div className="data-card">
              <div className="data-value">$160</div>
              <div className="data-label">Close friends & family</div>
              <div className="data-source">The Knot 2024 Guest Study</div>
            </div>
            <div className="data-card">
              <div className="data-value">50%</div>
              <div className="data-label">Of guests buy a physical gift</div>
              <div className="data-source">vs. cash or gift card</div>
            </div>
          </div>

          <div className="registry-bomb">
            <div className="registry-bomb-header">
              <span>💣</span>
              <h4>One couple's registry = one subscription covered many times over</h4>
            </div>
            <p>Take a 150-guest wedding. At $150 average gift spend, that's <strong>$22,500 in total gift purchases</strong> flowing through the registry. Even if only half buy registry items, that's still $11,250.</p>

            <div className="range-label-row">
              <span className="range-label">▼ Conservative (half buy gifts)</span>
              <span className="range-label">Full registry ▼</span>
            </div>
            <div className="commission-calc">
              <div className="calc-row">
                <div className="calc-tier">Starter (10%)</div>
                <div className="calc-result">$1,125 – $2,250</div>
                <div className="calc-coverage">from <strong>one couple's</strong> registry</div>
              </div>
              <div className="calc-row highlight-row">
                <div className="calc-tier">Growth (15%)</div>
                <div className="calc-result">$1,687 – $3,375</div>
                <div className="calc-coverage">from <strong>one couple's</strong> registry</div>
              </div>
              <div className="calc-row">
                <div className="calc-tier">Pro (20%)</div>
                <div className="calc-result">$2,250 – $4,500</div>
                <div className="calc-coverage">from <strong>one couple's</strong> registry</div>
              </div>
            </div>

            <p className="bomb-note">
              That's from <strong>one couple</strong>. Most wedding vendors work with 5–20+ couples per year.
              And this doesn't count non-wedding shoppers in your network who buy year-round.
            </p>
          </div>

          <div className="bridge-line">
            But you don't even need a full registry to break even.
          </div>

          <div className="napkin-math">
            <h4>🧮 The napkin math (per sale)</h4>
            <p>On individual sales alone — no registry needed:</p>
            <div className="napkin-grid">
              <div className="napkin-item">
                <div className="napkin-number">~7</div>
                <div className="napkin-label">sales to cover <strong>Starter</strong> ($97/mo)</div>
              </div>
              <div className="napkin-item">
                <div className="napkin-number">~9</div>
                <div className="napkin-label">sales to cover <strong>Growth</strong> ($197/mo)</div>
              </div>
              <div className="napkin-item">
                <div className="napkin-number">~10</div>
                <div className="napkin-label">sales to cover <strong>Pro</strong> ($297/mo)</div>
              </div>
            </div>
            <p className="napkin-note">Based on ~$150 average cart value. A single couple's registry blows past this many times over.</p>
          </div>

          {/* Profit Graph */}
          <div className="profit-graph">
            <h4>📈 How the gap grows</h4>
            <p className="graph-intro">Monthly take-home profit as your sales volume increases:</p>
            
            <div className="graph-container">
              {/* 15 sales */}
              <div className="graph-row">
                <div className="graph-label">15 sales/mo</div>
                <div className="graph-bars">
                  <div className="graph-bar-group">
                    <div className="graph-bar starter" style={{ width: '21%' }}><span>$128</span></div>
                    <div className="graph-bar growth" style={{ width: '23%' }}><span>$140</span></div>
                    <div className="graph-bar pro" style={{ width: '25%' }}><span>$153</span></div>
                  </div>
                </div>
              </div>
              {/* 20 sales */}
              <div className="graph-row">
                <div className="graph-label">20 sales/mo</div>
                <div className="graph-bars">
                  <div className="graph-bar-group">
                    <div className="graph-bar starter" style={{ width: '34%' }}><span>$203</span></div>
                    <div className="graph-bar growth" style={{ width: '42%' }}><span>$253</span></div>
                    <div className="graph-bar pro" style={{ width: '50%' }}><span>$303</span></div>
                  </div>
                </div>
              </div>
              {/* 30 sales */}
              <div className="graph-row">
                <div className="graph-label">30 sales/mo</div>
                <div className="graph-bars">
                  <div className="graph-bar-group">
                    <div className="graph-bar starter" style={{ width: '49%' }}><span>$353</span></div>
                    <div className="graph-bar growth" style={{ width: '66%' }}><span>$478</span></div>
                    <div className="graph-bar pro" style={{ width: '84%' }}><span>$603</span></div>
                  </div>
                </div>
              </div>
              {/* 50 sales */}
              <div className="graph-row">
                <div className="graph-label">50 sales/mo</div>
                <div className="graph-bars">
                  <div className="graph-bar-group">
                    <div className="graph-bar starter" style={{ width: '54%' }}><span>$653</span></div>
                    <div className="graph-bar growth" style={{ width: '77%' }}><span>$928</span></div>
                    <div className="graph-bar pro" style={{ width: '100%' }}><span>$1,203</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="graph-legend">
              <span className="legend-item"><span className="legend-dot starter"></span>Starter (10%)</span>
              <span className="legend-item"><span className="legend-dot growth"></span>Growth (15%)</span>
              <span className="legend-item"><span className="legend-dot pro"></span>Pro (20%)</span>
            </div>

            <p className="graph-kicker">
              At 30 sales/month, Pro earns <strong>$250 more</strong> than Starter — every single month. 
              That's an extra <strong>$3,000/year</strong> for just 3 more sales to break even.
            </p>
          </div>

          <div className="payback-card">
            <h4>Name one other tool you pay for that pays you back.</h4>
            <p>
              The Knot charges $200–$400/month. WeddingWire, HoneyBook, Dubsado, Flodesk — they all charge you
              and promise "exposure" or "efficiency." None of them generate a single trackable dollar back to you.
            </p>
            <p className="payback-line">
              WeTwo is the only vendor tool where <strong>the subscription generates revenue per transaction</strong>.
              Not hope. Not "exposure." Actual trackable commission on every purchase your network makes.
            </p>
            <p className="payback-closer">
              This is the only one.
            </p>
          </div>
        </div>
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
        .how-it-works {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 28px;
        }
        .how-it-works h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .steps { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
        .step { display: flex; gap: 14px; align-items: flex-start; }
        .step-num {
          width: 28px; height: 28px; background: #c9944a; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .step strong { font-size: 14px; color: #2c2420; }
        .step p { font-size: 13px; color: #6b5e52; margin: 2px 0 0; line-height: 1.5; }
        .clarity-note {
          background: #f3efe9; border-radius: 8px; padding: 14px 16px;
          font-size: 13px; color: #6b5e52; line-height: 1.6;
        }
        .section-heading { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 14px; }
        .tiers-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
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
        .tier-rate { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
        .tier-rate.green { color: #22c55e; }
        .tier-price { font-size: 14px; color: #6b5e52; margin-bottom: 16px; }
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

        /* Math Section */
        .math-card {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 14px; padding: 28px;
        }
        .math-card h3 { font-size: 18px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }

        /* Profit Accelerator */
        .accelerator-card {
          background: linear-gradient(135deg, rgba(34,197,94,0.04), rgba(201,148,74,0.04));
          border: 1px solid rgba(34,197,94,0.2); border-radius: 14px;
          padding: 24px; margin-bottom: 28px;
        }
        .accelerator-card h3 { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .accelerator-intro { font-size: 14px; color: #6b5e52; line-height: 1.6; margin: 0 0 16px; }
        .accelerator-intro strong { color: #2c2420; }
        .accelerator-label { font-size: 12px; font-weight: 700; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
        .accel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
        .accel-item {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 10px;
          padding: 18px 14px; text-align: center; transition: all 0.2s;
        }
        .accel-item.featured { border-color: #22c55e; background: rgba(34,197,94,0.03); }
        .accel-tier-name { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9a8d80; margin-bottom: 4px; }
        .accel-math { font-size: 12px; color: #9a8d80; margin-bottom: 6px; }
        .accel-value { font-size: 28px; font-weight: 700; color: #22c55e; }
        .accel-extra { font-size: 12px; color: #c9944a; font-weight: 600; margin-top: 4px; }
        .accelerator-kicker { font-size: 14px; color: #2c2420; font-weight: 600; margin: 0; font-style: italic; text-align: center; }

        /* Profit Graph */
        .profit-graph {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 12px;
          padding: 24px; margin-bottom: 24px;
        }
        .profit-graph h4 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .graph-intro { font-size: 13px; color: #6b5e52; margin: 0 0 20px; }
        .graph-container { display: flex; flex-direction: column; gap: 16px; }
        .graph-row { display: flex; gap: 12px; align-items: center; }
        .graph-label { font-size: 12px; font-weight: 600; color: #6b5e52; width: 90px; flex-shrink: 0; text-align: right; }
        .graph-bars { flex: 1; }
        .graph-bar-group { display: flex; flex-direction: column; gap: 4px; }
        .graph-bar {
          height: 22px; border-radius: 4px; display: flex; align-items: center;
          justify-content: flex-end; padding: 0 8px; min-width: 50px; transition: width 0.4s ease;
        }
        .graph-bar span { font-size: 11px; font-weight: 700; color: #fff; }
        .graph-bar.starter { background: #c9944a; }
        .graph-bar.growth { background: #22c55e; }
        .graph-bar.pro { background: #2c2420; }
        .graph-legend { display: flex; gap: 20px; justify-content: center; margin: 20px 0 16px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b5e52; }
        .legend-dot { width: 10px; height: 10px; border-radius: 3px; }
        .legend-dot.starter { background: #c9944a; }
        .legend-dot.growth { background: #22c55e; }
        .legend-dot.pro { background: #2c2420; }
        .graph-kicker { font-size: 14px; color: #2c2420; line-height: 1.6; margin: 0; text-align: center; }
        .graph-kicker strong { color: #22c55e; }

        .source-badge {
          display: flex; gap: 12px; align-items: center;
          background: rgba(201,148,74,0.06); border: 1px solid rgba(201,148,74,0.2);
          border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;
        }
        .source-icon { font-size: 20px; }
        .source-badge strong { font-size: 14px; color: #2c2420; display: block; }
        .source-badge span { font-size: 12px; color: #6b5e52; }

        .data-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;
        }
        .data-card {
          background: #f3efe9; border-radius: 10px; padding: 16px; text-align: center;
        }
        .data-value { font-size: 28px; font-weight: 700; color: #c9944a; }
        .data-label { font-size: 12px; color: #6b5e52; margin-top: 2px; }
        .data-source { font-size: 10px; color: #9a8d80; margin-top: 4px; font-style: italic; }

        .registry-bomb {
          background: linear-gradient(135deg, rgba(34,197,94,0.04), rgba(201,148,74,0.04));
          border: 1px solid rgba(34,197,94,0.2); border-radius: 12px;
          padding: 24px; margin-bottom: 24px;
        }
        .registry-bomb-header { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
        .registry-bomb-header span { font-size: 20px; }
        .registry-bomb-header h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0; }
        .registry-bomb p { font-size: 14px; color: #6b5e52; line-height: 1.6; margin: 0 0 16px; }
        .registry-bomb p strong { color: #22c55e; }

        .range-label-row {
          display: flex; justify-content: space-between; padding: 0 16px; margin-bottom: 6px;
        }
        .range-label { font-size: 11px; color: #9a8d80; font-style: italic; letter-spacing: 0.02em; }

        .commission-calc { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .calc-row {
          display: grid; grid-template-columns: 120px 1fr 1fr; gap: 12px; align-items: center;
          padding: 12px 16px; background: #fff; border-radius: 8px; border: 1px solid #e4ddd4;
        }
        .calc-row.highlight-row { border-color: #c9944a; background: rgba(201,148,74,0.04); }
        .calc-tier { font-size: 12px; font-weight: 700; color: #6b5e52; }
        .calc-result { font-size: 14px; font-weight: 700; color: #22c55e; }
        .calc-coverage { font-size: 12px; color: #6b5e52; }
        .calc-coverage strong { color: #c9944a; }

        .bomb-note { font-size: 13px; color: #6b5e52; line-height: 1.6; margin: 0; }
        .bomb-note strong { color: #2c2420; }

        .bridge-line {
          font-size: 16px; font-weight: 700; color: #2c2420; text-align: center;
          padding: 16px 0 4px; font-style: italic;
        }

        .napkin-math {
          background: #f3efe9; border-radius: 12px; padding: 20px; margin-bottom: 24px;
        }
        .napkin-math h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .napkin-math > p { font-size: 13px; color: #6b5e52; margin: 0 0 14px; }
        .napkin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
        .napkin-item {
          background: #fff; border-radius: 8px; padding: 14px; text-align: center;
          border: 1px solid #e4ddd4;
        }
        .napkin-number { font-size: 28px; font-weight: 700; color: #c9944a; margin-bottom: 4px; }
        .napkin-label { font-size: 11px; color: #6b5e52; line-height: 1.4; }
        .napkin-label strong { color: #2c2420; }
        .napkin-note { font-size: 12px; color: #9a8d80; margin: 0; line-height: 1.5; }

        .payback-card {
          background: linear-gradient(135deg, rgba(44,36,32,0.04), rgba(201,148,74,0.06));
          border: 2px solid rgba(201,148,74,0.3); border-radius: 12px; padding: 24px;
        }
        .payback-card h4 {
          font-family: 'Playfair Display', serif; font-size: 18px; color: #2c2420;
          margin: 0 0 12px; font-style: italic;
        }
        .payback-card p { font-size: 14px; color: #6b5e52; line-height: 1.7; margin: 0 0 12px; }
        .payback-line { font-size: 14px; color: #6b5e52; }
        .payback-line strong { color: #22c55e; }
        .payback-closer {
          font-size: 15px; font-weight: 700; color: #c9944a; margin: 0; font-style: italic;
        }

        @media (max-width: 768px) {
          .page-content { padding: 20px; }
          .tiers-grid { grid-template-columns: 1fr 1fr; }
          .data-grid { grid-template-columns: 1fr; }
          .napkin-grid { grid-template-columns: 1fr; }
          .calc-row { grid-template-columns: 1fr; gap: 4px; }
          .accel-grid { grid-template-columns: 1fr; }
          .graph-row { flex-direction: column; gap: 4px; }
          .graph-label { text-align: left; width: auto; }
          .graph-legend { flex-direction: column; gap: 8px; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .tiers-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
