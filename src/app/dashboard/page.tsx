'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardHome() {
  const [vendor, setVendor] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [stats, setStats] = useState({ leads: 0, couples: 0, shoppers: 0, totalCommission: 0 })

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

  const copyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!vendor) return null

  const firstName = (vendor.contact_name || vendor.business_name || '').split(' ')[0]
  const category = vendor.category || 'wedding services'
  const baseUrl = 'https://wetwo.love'
  const shopLink = `${baseUrl}?ref=vendor-${vendor.ref}`
  const registryLink = `${baseUrl}/couple/signup?ref=vendor-${vendor.ref}`
  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`
  const isFree = vendor.plan === 'free'

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Welcome, {firstName} 👋</h1>
          <p className="page-subtitle">WeTwo Wedding Buyers Club — Member Vendor</p>
        </div>
        <Link href={`/vendor/${vendor.ref}`} target="_blank" className="header-btn">
          View Your Page →
        </Link>
      </header>

      <div className="page-content">

        {/* ===== SECTION 1: HERE'S WHAT WE JUST BUILT FOR YOU ===== */}
        <div className="gift-card">
          <div className="gift-badge">🎁 HERE'S WHAT WE JUST BUILT FOR YOU</div>
          <h2 className="gift-title">A custom landing page. An AI assistant. An entire marketing system.</h2>
          <p className="gift-text">
            We designed a high-converting landing page specifically for {vendor.business_name || 'your business'}. 
            It showcases your work, has a built-in contact form that sends leads to your dashboard, 
            and it's built to be your <strong>universal landing page</strong> — put it on your Instagram bio, 
            your business cards, your email signature. Everywhere.
          </p>
          <p className="gift-text" style={{ marginBottom: 0 }}>
            You also have this AI assistant (Claude), exclusive member links, 
            a contact management system, and copy-paste marketing templates. 
            All of it is live. All of it is working for you right now.
          </p>
          <a href={pageLink} target="_blank" rel="noopener" className="gift-link">
            See your page live →
          </a>
        </div>

        {/* ===== SECTION 2: THE HOOK NOBODY ELSE HAS ===== */}
        <div className="hook-card">
          <div className="hook-header">
            <span className="hook-icon">🔑</span>
            <h2>Your page has a hook that nobody else has.</h2>
          </div>
          <p className="hook-text">
            Built into your page and your links is something no other {category} vendor in your area can offer: 
            you can <strong>gift everyone who comes through you</strong> exclusive access to 25% cashback 
            on thousands of real products — furniture, kitchen, bedroom, fashion, home goods.
          </p>
          <p className="hook-text">
            This deal <strong>does not exist</strong> anywhere else. Not online. Not in stores. Not on Google. 
            Not on the WeTwo website. The <em>only way</em> anyone gets access is through a member vendor like you.
          </p>
          <p className="hook-text" style={{ marginBottom: 0 }}>
            When someone shops through your link, the store says <strong>"Gift from {firstName}"</strong> — 
            linked right back to your page. You're not sharing a coupon. You're handing someone a key that 
            nobody else can give them.
          </p>
        </div>

        {/* ===== SECTION 3: THE REACTIVATION GAME CHANGER ===== */}
        <div className="reactivate-card">
          <div className="reactivate-header">
            <span className="reactivate-icon">💡</span>
            <h2>All those cold leads? Now you have a reason to reach out.</h2>
          </div>
          <p className="reactivate-text">
            Think about everyone who contacted you in the past few months and went quiet. 
            How do you reach back out without it being awkward?
          </p>
          <div className="reactivate-compare">
            <div className="compare-bad">
              <div className="compare-label">❌ Before</div>
              <p>"Hey, just checking in..." / "I have new availability..." / "I learned a new song..."</p>
              <span className="compare-verdict">No reason. Feels desperate.</span>
            </div>
            <div className="compare-good">
              <div className="compare-label">✅ Now</div>
              <p>"I just got access to something exclusive and wanted you to be one of the first to know."</p>
              <span className="compare-verdict">A genuine gift. Opens every door.</span>
            </div>
          </div>
          <p className="reactivate-text" style={{ marginBottom: 0 }}>
            This gives you a <strong>legitimate, valuable reason</strong> to reconnect with every single person 
            in your network — past clients, cold leads, people who didn't book, friends, 
            followers. It's not a sales pitch. It's a gift. And it changes the entire conversation.
          </p>
        </div>

        {/* ===== SECTION 4: YOUR NAME TRAVELS ===== */}
        <div className="network-card">
          <div className="network-header">
            <span className="network-icon">🌐</span>
            <h2>Every share grows your network. Your name travels with every link.</h2>
          </div>
          <p className="network-text">
            This isn't one-and-done. Every time you share your link, it starts working <em>for you</em> — and it keeps going.
          </p>

          <div className="network-steps">
            <div className="net-step">
              <div className="net-num">1</div>
              <div>
                <strong>You share your link with a couple.</strong>
                <p>They set up a registry. Now every guest — 100, 150, 200 people — sees <em>"Gift from {firstName}"</em> on the registry, linked back to your page.</p>
              </div>
            </div>
            <div className="net-step">
              <div className="net-num">2</div>
              <div>
                <strong>Those guests click your name.</strong>
                <p>They land on your page — the beautiful page we built for you. Your bio, your work, your contact form. They see what you do. They reach out.</p>
              </div>
            </div>
            <div className="net-step">
              <div className="net-num">3</div>
              <div>
                <strong>They share with their people.</strong>
                <p>"My wedding vendor got me 25% cashback on everything." They tell their friends. They text the link. Your name is on it.</p>
              </div>
            </div>
            <div className="net-step">
              <div className="net-num">4</div>
              <div>
                <strong>It compounds.</strong>
                <p>One couple's registry = 150+ people seeing your brand. One Instagram post = dozens of DMs. Every single person who clicks your link lands on <em>your</em> page.</p>
              </div>
            </div>
          </div>

          <div className="network-bottom">
            <div className="net-flow">
              <span className="flow-step">You share</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">They see your name</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">They click your page</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">They share with others</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step highlight">Your network grows</span>
            </div>
          </div>
        </div>

        {/* ===== SECTION 5: EVERYTHING ABOVE IS FREE ===== */}
        <div className="free-card">
          <div className="free-header">
            <span className="free-icon">✨</span>
            <h2>Everything above is free. No catch.</h2>
          </div>
          <p className="free-text">
            Your custom page. This AI assistant. Your exclusive links. The contact form. 
            The gifting power. The reactivation tool. The network effect. The competitive edge. 
            <strong> All of it works perfectly, right now, for free.</strong>
          </p>
          <p className="free-text" style={{ marginBottom: 0 }}>
            You only pay if you want to <strong>earn commission</strong> when people buy products through your links. 
            But everything else? That's yours.
          </p>
        </div>

        {/* ===== MONEY GATE: TRANSITION FROM FREE TO EARN ===== */}
        <div className="money-gate">
          <div className="money-gate-line" />
          <div className="money-gate-content">
            <span className="money-gate-icon">🚀</span>
            <h2 className="money-gate-headline">Ready to turn your links into income?</h2>
            <p className="money-gate-sub">
              Everything above is yours forever — no strings. What follows is <em>completely optional</em>: 
              a commission engine that turns every registry purchase into money in your pocket.
            </p>
          </div>
          <div className="money-gate-line" />
        </div>

        {/* ===== EARN ZONE: visually distinct ===== */}
        <div className="earn-zone">

        {/* ===== SECTION 6: THE ONLY TOOL THAT PAYS YOU BACK ===== */}
        <div className="payback-card">
          <div className="payback-header">
            <span className="payback-icon">💰</span>
            <h2>The only tool that pays you back.</h2>
          </div>
          <p className="payback-text">
            Every other tool you pay for — listing sites, CRMs, email platforms — 
            takes your money and hopes you see ROI "somewhere downstream, eventually." 
            No receipt. No direct line between your payment and money coming back in.
          </p>
          <p className="payback-text" style={{ fontWeight: 600, color: '#2c2420' }}>
            This is different. For the price of a cup of coffee a day, you get a system that generates leads, 
            reactivates cold contacts, puts your name in front of hundreds of new people — and pays you 
            trackable commission on top of it all.
          </p>

          <div className="real-value-callout">
            <div className="callout-icon">💎</div>
            <div>
              <strong>The real ROI isn't the commission — it's your main business.</strong>
              <p>One booking from a reactivated lead or a registry guest who found your page is worth $2,000–$10,000+. The commission is just spending money — a cherry on top.</p>
            </div>
          </div>

          <div className="payback-math">
            <div className="math-header">The commission math (per The Knot's 2024 study: avg wedding gift = $150)</div>
            <div className="math-grid">
              <div className="math-tier">
                <div className="tier-name">Starter</div>
                <div className="tier-price">$97/mo</div>
                <div className="daily-cost">$3.23/day</div>
                <div className="tier-rate">10% commission</div>
                <div className="tier-per">$15 per sale</div>
                <div className="tier-break"><strong>7 sales</strong> covers your plan</div>
              </div>
              <div className="math-tier featured">
                <div className="tier-badge">Sweet Spot</div>
                <div className="tier-name">Growth</div>
                <div className="tier-price">$197/mo</div>
                <div className="daily-cost">$6.57/day</div>
                <div className="tier-rate">15% commission</div>
                <div className="tier-per">$22.50 per sale</div>
                <div className="tier-break"><strong>9 sales</strong> covers your plan</div>
              </div>
              <div className="math-tier">
                <div className="tier-name">Pro</div>
                <div className="tier-price">$297/mo</div>
                <div className="daily-cost">$9.90/day</div>
                <div className="tier-rate">20% commission</div>
                <div className="tier-per">$30 per sale</div>
                <div className="tier-break"><strong>10 sales</strong> covers your plan</div>
              </div>
            </div>
          </div>

          <div className="payback-registry">
            <div className="registry-label">📋 The registry math</div>
            <p>
              When a couple sets up a registry through your link, every guest who buys a gift generates commission. 
              Average wedding = 150 guests. Average gift = $150. That's <strong>$22,500 in total purchases</strong> from one couple.
            </p>
            <div className="registry-numbers">
              <span>At 10% = <strong>$2,250</strong></span>
              <span>At 15% = <strong>$3,375</strong></span>
              <span>At 20% = <strong>$4,500</strong></span>
            </div>
            <p className="registry-kicker">
              That's from <strong>one couple</strong>. You work with multiple couples per year.
            </p>
          </div>

          <p className="payback-closer">
            Name one other tool you pay for that pays you back. This is the only one.
          </p>
        </div>

        </div>{/* end earn-zone */}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value green">{isFree ? '—' : `$${stats.totalCommission.toFixed(0)}`}</div>
            <div className="stat-label">Commission</div>
          </div>
          <div className="stat-card">
            <div className="stat-value brand">{stats.couples}</div>
            <div className="stat-label">Couples</div>
          </div>
          <div className="stat-card">
            <div className="stat-value gold">{stats.shoppers}</div>
            <div className="stat-label">Clients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value muted">{stats.leads}</div>
            <div className="stat-label">Leads</div>
          </div>
        </div>

        {/* Your 3 Links */}
        <h3 className="section-heading">Your 3 Exclusive Links</h3>
        <p className="section-intro">These only work because you're a member. Nobody else can generate them.</p>

        <div className="links-grid">
          <div className="link-card you">
            <div className="link-card-header">
              <span className="link-emoji">🛍️</span>
              <div>
                <h4 className="link-title">For You, Personally</h4>
                <p className="link-desc">You're a member — use this anytime for yourself, for gifts, for anything. Your 25% cashback.</p>
              </div>
            </div>
            <div className="link-row">
              <input type="text" value={shopLink} readOnly className="link-input" />
              <button className={`copy-btn ${copied === 'you' ? 'copied' : ''}`} onClick={() => copyLink(shopLink, 'you')}>
                {copied === 'you' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="link-card couples">
            <div className="link-card-header">
              <span className="link-emoji">💍</span>
              <div>
                <h4 className="link-title">For Your Couples</h4>
                <p className="link-desc">Registry link — their guests buy real gifts, couple gets 25% cash back. Every guest sees your name.</p>
              </div>
            </div>
            <div className="link-row">
              <input type="text" value={registryLink} readOnly className="link-input" />
              <button className={`copy-btn ${copied === 'couples' ? 'copied' : ''}`} onClick={() => copyLink(registryLink, 'couples')}>
                {copied === 'couples' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="link-card everyone">
            <div className="link-card-header">
              <span className="link-emoji">🎁</span>
              <div>
                <h4 className="link-title">For Everyone Else</h4>
                <p className="link-desc">Clients. Friends. Followers. Expo visitors. Everyone who clicks sees your name and page.</p>
              </div>
            </div>
            <div className="link-row">
              <input type="text" value={shopLink} readOnly className="link-input" />
              <button className={`copy-btn ${copied === 'everyone' ? 'copied' : ''}`} onClick={() => copyLink(shopLink, 'everyone')}>
                {copied === 'everyone' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade Nudge */}
        {isFree && (
          <div className="upgrade-nudge">
            <div className="nudge-icon">💡</div>
            <div>
              <h4>Before you start sharing — a smart move.</h4>
              <p>
                <strong>For the price of a cup of coffee a day, lock in commission before you push your links.</strong> Every sale from day one counts — 7 sales covers it.
              </p>
              <p style={{ marginBottom: 0 }}>
                The expense won't change your life. <strong>But what it unlocks absolutely can.</strong>
              </p>
            </div>
            <Link href="/dashboard/earnings" className="nudge-btn">
              See Plans →
            </Link>
          </div>
        )}

        {/* What To Do */}
        <h3 className="section-heading">Here's Exactly What To Do</h3>
        <p className="section-intro">You hold the key. Now use it.</p>

        <div className="playbook">
          <div className="play">
            <div className="play-number">1</div>
            <div className="play-content">
              <h4>Try it yourself first</h4>
              <p>Use your link, buy something you want, and see the 25% cashback hit. Once you've experienced it yourself, you'll talk about it completely differently.</p>
              <a href={shopLink} target="_blank" rel="noopener" className="play-link">Browse the store →</a>
            </div>
          </div>

          <div className="play">
            <div className="play-number">2</div>
            <div className="play-content">
              <h4>Reach out to every past client and cold lead</h4>
              <p>"I just got access to something exclusive and wanted you to be one of the first to know." This isn't a sales pitch — it's a gift that reopens every door.</p>
              <Link href="/dashboard/links" className="play-link">Get the copy-paste message →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">3</div>
            <div className="play-content">
              <h4>Text your current and upcoming couples</h4>
              <p>Every couple who uses the registry puts your name in front of all their guests. One couple = 150+ brand impressions.</p>
              <Link href="/dashboard/assistant" className="play-link">Have Claude write it →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">4</div>
            <div className="play-content">
              <h4>Post it on Instagram</h4>
              <p><em>"I'm now a member of the WeTwo Wedding Buyers Club 🔑 DM me for exclusive access."</em> Every DM is a warm lead.</p>
              <Link href="/dashboard/links" className="play-link">Get an Instagram caption →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">5</div>
            <div className="play-content">
              <h4>Make it part of every close</h4>
              <p>"One more thing — through my membership, you get 25% cashback on thousands of products. Nobody else can give you this." Use it as your competitive edge.</p>
            </div>
          </div>

          <div className="play">
            <div className="play-number">6</div>
            <div className="play-content">
              <h4>Add it to everything</h4>
              <p>Your universal landing page link goes on your website, business cards, email signature, every ad. One line: <em>"My clients get exclusive 25% cashback — ask me how."</em></p>
            </div>
          </div>
        </div>

        {/* Claude CTA */}
        <div className="claude-card">
          <div className="claude-header">
            <span className="claude-icon">✨</span>
            <div>
              <h3>Questions? Claude knows everything.</h3>
              <p>Need a message written? Want strategy ideas? Confused about anything? Hit the "Ask Claude" button in the corner — or click below for the full assistant.</p>
            </div>
          </div>
          <Link href="/dashboard/assistant" className="claude-btn">Talk to Claude →</Link>
        </div>

        {isFree && (
          <div className="bottom-upgrade">
            <h4>The system is yours. The commission is spending money.</h4>
            <p>
              Everything above works free. Upgrade for the price of a coffee a day, and every purchase 
              your network makes earns you <strong>trackable commission</strong> — while the real value is 
              the leads, the bookings, and the network you're building.
            </p>
            <Link href="/dashboard/earnings" className="upgrade-btn">See the math →</Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-header {
          background: #fff; border-bottom: 1px solid #e4ddd4; padding: 20px 32px;
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 50;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #c9944a; margin: 2px 0 0; font-weight: 600; }
        .header-btn {
          padding: 8px 16px; background: transparent; border: 1px solid #e4ddd4; border-radius: 8px;
          color: #6b5e52; text-decoration: none; font-size: 13px; font-weight: 600;
          transition: all 0.2s; white-space: nowrap;
        }
        .header-btn:hover { border-color: #c9944a; color: #c9944a; }
        .page-content { padding: 28px 32px; max-width: 880px; }

        /* SECTION 1: GIFT CARD */
        .gift-card {
          background: linear-gradient(135deg, #2c2420, #1a1614); border-radius: 16px;
          padding: 36px 32px; margin-bottom: 20px; text-align: center;
        }
        .gift-badge {
          display: inline-block; background: rgba(201,148,74,0.2); border: 1px solid rgba(201,148,74,0.4);
          color: #c9944a; padding: 4px 16px; border-radius: 20px; font-size: 11px;
          font-weight: 800; letter-spacing: 0.1em; margin-bottom: 16px;
        }
        .gift-title {
          font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600;
          color: #fff; line-height: 1.3; margin: 0 0 16px;
        }
        .gift-text {
          font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0 0 12px;
          max-width: 640px; margin-left: auto; margin-right: auto;
        }
        .gift-text strong { color: #c9944a; }
        .gift-link {
          display: inline-block; margin-top: 16px; padding: 10px 24px;
          background: rgba(201,148,74,0.2); border: 1px solid rgba(201,148,74,0.4);
          border-radius: 8px; color: #c9944a; text-decoration: none; font-size: 14px;
          font-weight: 600; transition: all 0.2s;
        }
        .gift-link:hover { background: rgba(201,148,74,0.3); }

        /* SECTION 2: HOOK */
        .hook-card {
          background: linear-gradient(135deg, rgba(201,148,74,0.08), rgba(201,148,74,0.02));
          border: 1px solid rgba(201,148,74,0.25); border-radius: 16px;
          padding: 32px; margin-bottom: 20px;
        }
        .hook-header { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
        .hook-icon { font-size: 32px; }
        .hook-header h2 { font-family: 'Playfair Display', serif; font-size: 20px; color: #2c2420; margin: 0; }
        .hook-text { font-size: 15px; color: #6b5e52; line-height: 1.7; margin: 0 0 12px; }
        .hook-text strong { color: #2c2420; }
        .hook-text em { color: #c9944a; font-style: normal; font-weight: 600; }

        /* SECTION 3: REACTIVATION */
        .reactivate-card {
          background: #fff; border: 2px solid rgba(34,197,94,0.2); border-radius: 16px;
          padding: 32px; margin-bottom: 20px;
        }
        .reactivate-header { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
        .reactivate-icon { font-size: 32px; }
        .reactivate-header h2 { font-family: 'Playfair Display', serif; font-size: 19px; color: #2c2420; margin: 0; line-height: 1.3; }
        .reactivate-text { font-size: 15px; color: #6b5e52; line-height: 1.7; margin: 0 0 16px; }
        .reactivate-text strong { color: #2c2420; }

        .reactivate-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .compare-bad { background: rgba(239,68,68,0.04); border: 1px solid rgba(239,68,68,0.15); border-radius: 12px; padding: 16px; }
        .compare-good { background: rgba(34,197,94,0.04); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; padding: 16px; }
        .compare-label { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
        .compare-bad .compare-label { color: #ef4444; }
        .compare-good .compare-label { color: #22c55e; }
        .compare-bad p, .compare-good p { font-size: 14px; color: #6b5e52; margin: 0 0 6px; line-height: 1.5; font-style: italic; }
        .compare-verdict { font-size: 12px; font-weight: 600; }
        .compare-bad .compare-verdict { color: #ef4444; }
        .compare-good .compare-verdict { color: #22c55e; }

        /* SECTION 4: NETWORK */
        .network-card {
          background: #fff; border: 2px solid rgba(59,130,246,0.2); border-radius: 16px;
          padding: 32px; margin-bottom: 20px;
        }
        .network-header { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
        .network-icon { font-size: 32px; }
        .network-header h2 { font-family: 'Playfair Display', serif; font-size: 19px; color: #2c2420; margin: 0; line-height: 1.3; }
        .network-text { font-size: 15px; color: #6b5e52; line-height: 1.6; margin: 0 0 20px; }
        .network-text em { color: #3b82f6; font-style: normal; font-weight: 600; }

        .network-steps { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .net-step { display: flex; gap: 14px; align-items: flex-start; }
        .net-num {
          width: 28px; height: 28px; background: #3b82f6; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: #fff;
          font-size: 13px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .net-step strong { font-size: 14px; color: #2c2420; display: block; margin-bottom: 2px; }
        .net-step p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .net-step em { color: #c9944a; font-style: normal; font-weight: 600; }

        .network-bottom { background: rgba(59,130,246,0.04); border-radius: 12px; padding: 20px; }
        .net-flow {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          justify-content: center;
        }
        .flow-step {
          padding: 6px 12px; background: #fff; border: 1px solid #e4ddd4;
          border-radius: 8px; font-size: 12px; font-weight: 600; color: #2c2420;
        }
        .flow-step.highlight { background: #3b82f6; color: #fff; border-color: #3b82f6; }
        .flow-arrow { color: #9a8d80; font-size: 14px; }

        /* SECTION 5: FREE */
        .free-card {
          background: linear-gradient(135deg, rgba(147,130,220,0.06), rgba(201,148,74,0.04));
          border: 2px solid rgba(147,130,220,0.2); border-radius: 16px;
          padding: 32px; margin-bottom: 0;
        }

        /* MONEY GATE */
        .money-gate {
          text-align: center; padding: 40px 0; margin-bottom: 0;
        }
        .money-gate-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,148,74,0.4), transparent);
          margin: 0 40px;
        }
        .money-gate-content { padding: 28px 20px; }
        .money-gate-icon { font-size: 36px; display: block; margin-bottom: 12px; }
        .money-gate-headline {
          font-family: 'Playfair Display', serif; font-size: 22px; color: #2c2420;
          margin: 0 0 10px; font-weight: 700;
        }
        .money-gate-sub {
          font-size: 15px; color: #6b5e52; line-height: 1.7;
          max-width: 560px; margin: 0 auto;
        }
        .money-gate-sub em { color: #7c6bc4; font-style: normal; font-weight: 600; }

        /* EARN ZONE */
        .earn-zone {
          background: linear-gradient(180deg, rgba(34,197,94,0.03) 0%, rgba(201,148,74,0.03) 100%);
          border: 1px solid rgba(34,197,94,0.12);
          border-radius: 20px; padding: 8px; margin-bottom: 20px;
        }
        .free-header { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
        .free-icon { font-size: 32px; }
        .free-header h2 { font-family: 'Playfair Display', serif; font-size: 20px; color: #2c2420; margin: 0; }
        .free-text { font-size: 15px; color: #6b5e52; line-height: 1.7; margin: 0 0 12px; }
        .free-text strong { color: #7c6bc4; }

        /* SECTION 6: PAYBACK */
        .payback-card {
          background: linear-gradient(135deg, rgba(34,197,94,0.04), rgba(201,148,74,0.02));
          border: 2px solid rgba(34,197,94,0.2); border-radius: 16px;
          padding: 32px; margin-bottom: 24px;
        }
        .payback-header { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
        .payback-icon { font-size: 32px; }
        .payback-header h2 { font-family: 'Playfair Display', serif; font-size: 20px; color: #2c2420; margin: 0; }
        .payback-text { font-size: 15px; color: #6b5e52; line-height: 1.7; margin: 0 0 12px; }

        .real-value-callout {
          display: flex; gap: 14px; align-items: flex-start;
          background: rgba(201,148,74,0.06); border: 1px solid rgba(201,148,74,0.2);
          border-radius: 12px; padding: 18px; margin-bottom: 20px;
        }
        .callout-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .real-value-callout strong { font-size: 14px; color: #2c2420; display: block; margin-bottom: 4px; }
        .real-value-callout p { font-size: 13px; color: #6b5e52; line-height: 1.5; margin: 0; }

        .payback-math {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 12px;
          padding: 24px; margin: 20px 0;
        }
        .math-header { font-size: 12px; color: #9a8d80; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 16px; text-align: center; }
        .math-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .math-tier {
          text-align: center; padding: 16px 12px; border: 1px solid #e4ddd4;
          border-radius: 10px; position: relative;
        }
        .math-tier.featured { border-color: #22c55e; background: rgba(34,197,94,0.03); }
        .tier-badge {
          position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
          background: #22c55e; color: #fff; font-size: 10px; font-weight: 700;
          padding: 2px 10px; border-radius: 10px;
        }
        .tier-name { font-size: 16px; font-weight: 700; color: #2c2420; margin-bottom: 2px; }
        .tier-price { font-size: 13px; color: #9a8d80; margin-bottom: 4px; }
        .daily-cost { font-size: 11px; color: #c9944a; font-weight: 600; font-style: italic; margin-bottom: 8px; }
        .tier-rate { font-size: 13px; color: #22c55e; font-weight: 600; margin-bottom: 4px; }
        .tier-per { font-size: 14px; color: #6b5e52; margin-bottom: 8px; }
        .tier-break { font-size: 13px; color: #2c2420; }
        .tier-break strong { color: #22c55e; }

        .payback-registry {
          background: rgba(201,148,74,0.06); border: 1px solid rgba(201,148,74,0.2);
          border-radius: 12px; padding: 20px; margin: 16px 0;
        }
        .registry-label { font-size: 14px; font-weight: 700; color: #2c2420; margin-bottom: 8px; }
        .payback-registry p { font-size: 14px; color: #6b5e52; line-height: 1.6; margin: 0 0 12px; }
        .payback-registry p strong { color: #c9944a; }
        .registry-numbers { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
        .registry-numbers span { font-size: 14px; color: #6b5e52; }
        .registry-numbers strong { color: #22c55e; font-size: 16px; }
        .registry-kicker { font-size: 14px; color: #2c2420; font-weight: 600; margin: 0 !important; }

        .payback-closer {
          font-family: 'Playfair Display', serif; font-size: 18px; color: #2c2420;
          font-weight: 600; text-align: center; margin: 20px 0 0; line-height: 1.4;
        }

        /* STATS */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
        .stat-card { background: #fff; border: 1px solid #e4ddd4; border-radius: 12px; padding: 18px; text-align: center; }
        .stat-value { font-size: 26px; font-weight: 700; }
        .stat-value.green { color: #22c55e; }
        .stat-value.brand { color: #c9944a; }
        .stat-value.gold { color: #d4a76a; }
        .stat-value.muted { color: #6b5e52; }
        .stat-label { font-size: 11px; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

        .section-heading { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .section-intro { font-size: 14px; color: #6b5e52; margin: 0 0 16px; line-height: 1.5; }

        /* LINKS */
        .links-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .link-card { background: #fff; border: 1px solid #e4ddd4; border-radius: 12px; padding: 20px; }
        .link-card.you { border-left: 3px solid #c9944a; }
        .link-card.couples { border-left: 3px solid #22c55e; }
        .link-card.everyone { border-left: 3px solid #3b82f6; }
        .link-card-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
        .link-emoji { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .link-title { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .link-desc { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .link-row { display: flex; gap: 8px; }
        .link-input { flex: 1; padding: 10px 12px; background: #f3efe9; border: 1px solid #e4ddd4; border-radius: 8px; font-size: 12px; color: #4a3f35; font-family: inherit; }
        .copy-btn { padding: 10px 18px; background: #c9944a; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap; }
        .copy-btn:hover { filter: brightness(1.1); }
        .copy-btn.copied { background: #22c55e; }

        /* UPGRADE */
        .upgrade-nudge { display: flex; gap: 16px; align-items: flex-start; background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.3); border-radius: 14px; padding: 24px; margin-bottom: 32px; }
        .nudge-icon { font-size: 28px; flex-shrink: 0; }
        .upgrade-nudge h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .upgrade-nudge p { font-size: 14px; color: #6b5e52; margin: 0 0 6px; line-height: 1.6; }
        .upgrade-nudge p strong { color: #2c2420; }
        .nudge-btn { padding: 12px 24px; background: #c9944a; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; flex-shrink: 0; align-self: center; transition: all 0.2s; }
        .nudge-btn:hover { filter: brightness(1.1); }

        /* PLAYBOOK */
        .playbook { display: flex; flex-direction: column; margin-bottom: 28px; }
        .play { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #e4ddd4; }
        .play:last-child { border-bottom: none; }
        .play-number { width: 32px; height: 32px; background: #c9944a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .play-content { flex: 1; }
        .play-content h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .play-content p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .play-content em { color: #c9944a; font-style: italic; }
        .play-link { display: inline-block; margin-top: 8px; font-size: 13px; color: #c9944a; text-decoration: none; font-weight: 600; }
        .play-link:hover { text-decoration: underline; }

        /* CLAUDE */
        .claude-card {
          background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06));
          border: 2px solid rgba(147,130,220,0.25); border-radius: 16px; padding: 28px; margin-bottom: 28px;
        }
        .claude-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
        .claude-icon { font-size: 36px; flex-shrink: 0; }
        .claude-card h3 { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 6px; line-height: 1.3; }
        .claude-card p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .claude-btn {
          display: inline-block; padding: 14px 28px; background: #7c6bc4; color: #fff;
          border: none; border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; transition: all 0.2s;
        }
        .claude-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

        .bottom-upgrade { background: linear-gradient(135deg, rgba(34,197,94,0.06), rgba(201,148,74,0.04)); border: 1px solid rgba(34,197,94,0.2); border-radius: 14px; padding: 28px; text-align: center; }
        .bottom-upgrade h4 { font-family: 'Playfair Display', serif; font-size: 18px; color: #2c2420; margin: 0 0 10px; }
        .bottom-upgrade p { font-size: 14px; color: #6b5e52; line-height: 1.7; margin: 0 0 16px; max-width: 640px; margin-left: auto; margin-right: auto; }
        .bottom-upgrade strong { color: #22c55e; }
        .upgrade-btn { display: inline-block; padding: 14px 28px; background: #22c55e; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
        .upgrade-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

        @media (max-width: 768px) {
          .page-header { padding: 16px 20px; flex-direction: column; gap: 12px; align-items: flex-start; }
          .page-content { padding: 20px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .gift-card, .hook-card, .network-card, .reactivate-card, .free-card, .payback-card { padding: 24px 20px; }
          .money-gate { padding: 28px 0; }
          .money-gate-headline { font-size: 19px; }
          .money-gate-sub { font-size: 14px; }
          .earn-zone { padding: 6px; border-radius: 16px; }
          .upgrade-nudge { flex-direction: column; }
          .claude-header { flex-direction: column; }
          .net-flow { flex-direction: column; gap: 4px; }
          .flow-arrow { transform: rotate(90deg); }
          .math-grid { grid-template-columns: 1fr; }
          .reactivate-compare { grid-template-columns: 1fr; }
          .registry-numbers { flex-direction: column; gap: 4px; }
        }
      `}</style>
    </div>
  )
}
