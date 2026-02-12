'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardHome() {
  const [vendor, setVendor] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [stats, setStats] = useState({ leads: 0, couples: 0, shoppers: 0, totalCommission: 0 })
  const [sponsorActive, setSponsorActive] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) {
      const v = JSON.parse(stored)
      setVendor(v)
      fetch(`/api/dashboard/stats?ref=${v.ref}`)
        .then(r => r.json())
        .then(d => { if (d.stats) setStats(d.stats) })
        .catch(() => {})
      fetch(`/api/vendor/sponsor-status?ref=${v.ref}`)
        .then(r => r.json())
        .then(d => setSponsorActive(d.active === true))
        .catch(() => setSponsorActive(false))
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
  const registryLink = `https://wetwo-vendors.vercel.app/wetwo/couple-signup?ref=vendor-${vendor.ref}`
  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`
  const isFree = vendor.plan === 'free'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'how', label: 'How It Works' },
    { id: 'earn', label: 'Earn Commission' },
    { id: 'playbook', label: 'Your Playbook' },
  ]

  return (
    <div>
      {/* ===== HEADER ===== */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Welcome, {firstName} 👋</h1>
          <p className="page-subtitle">Give, and it shall be given unto you. — Luke 6:38</p>
        </div>
        <Link href={`/vendor/${vendor.ref}`} target="_blank" className="header-btn">
          View Your Page →
        </Link>
      </header>

      <div className="page-content">

        {/* ===== SPONSOR BANNER ===== */}
        {sponsorActive === true && (
          <a href="https://wetwo.love/pages/your-sponsors" target="_blank" rel="noopener noreferrer" className="sponsor-banner live">
            <span className="sponsor-icon">✨</span>
            <div className="sponsor-text">
              <strong>You're live on wetwo.love</strong>
              <span>Your page is featured in the Sponsor Directory where couples browse wedding professionals.</span>
            </div>
            <span className="sponsor-cta">See your listing →</span>
          </a>
        )}
        {sponsorActive === false && (
          <div className="sponsor-banner expired">
            <span className="sponsor-icon">🔒</span>
            <div className="sponsor-text">
              <strong>Your Sponsor listing has expired</strong>
              <span>Upgrade to get back in front of couples browsing wetwo.love.</span>
            </div>
            <a href="/dashboard/earnings" className="sponsor-cta-btn">Become a Sponsor →</a>
          </div>
        )}

        {/* ===== HERO: HERE'S WHAT YOU HAVE ===== */}
        <div className="hero-block">
          <div className="hero-top">
            <h2 className="hero-headline">We gave you a gift. Now it's your turn.</h2>
            <p className="hero-sub">
              Everything below is yours — free. A custom page, an AI assistant, exclusive links, a complete marketing system.
              We built it for you because we believe in leading with generosity. Now pay it forward to every person you meet.
            </p>
          </div>

          <div className="toolkit-grid">
            <a href={pageLink} target="_blank" rel="noopener" className="tool-card">
              <div className="tool-icon-wrap page-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="tool-label">Your Landing Page</div>
              <div className="tool-status">Live →</div>
            </a>
            <div className="tool-card" onClick={() => { setActiveTab('overview'); setTimeout(() => document.getElementById('links-section')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>
              <div className="tool-icon-wrap links-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div className="tool-label">3 Gift Links</div>
              <div className="tool-status">Ready ↓</div>
            </div>
            <Link href="/dashboard/assistant" className="tool-card">
              <div className="tool-icon-wrap claude-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <div className="tool-label">AI Assistant</div>
              <div className="tool-status">Ask Claude →</div>
            </Link>
            <Link href="/dashboard/clients" className="tool-card">
              <div className="tool-icon-wrap contacts-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="tool-label">Contact System</div>
              <div className="tool-status">Manage →</div>
            </Link>
          </div>
        </div>

        {/* ===== STATS ===== */}
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

        {/* ===== YOUR 3 LINKS (always visible) ===== */}
        <div id="links-section" className="links-section">
          <h3 className="section-heading">Your 3 Gift Links</h3>
          <p className="section-intro">Each one puts real money in someone's pocket. Use them generously — that's the whole point.</p>

          <div className="links-grid">
            <div className="link-card you">
              <div className="link-card-header">
                <span className="link-emoji">🛍️</span>
                <div>
                  <h4 className="link-title">For You, Personally</h4>
                  <p className="link-desc">Your 25% cashback — use anytime for yourself, for gifts, for anything.</p>
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
                  <p className="link-desc">The honeymoon money link — a 150-guest wedding could mean $5,000+ cash back for the couple. Every guest sees your name.</p>
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
                  <p className="link-desc">A gift for anyone — clients, friends, family, followers, expo visitors. They enter their info, unlock cashback, and you capture the lead.</p>
                </div>
              </div>
              <div className="link-row">
                <input type="text" value={pageLink} readOnly className="link-input" />
                <button className={`copy-btn ${copied === 'everyone' ? 'copied' : ''}`} onClick={() => copyLink(pageLink, 'everyone')}>
                  {copied === 'everyone' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== UPGRADE NUDGE (for free users) ===== */}
        {isFree && (
          <div className="upgrade-nudge">
            <div className="nudge-content">
              <div className="nudge-badge">Pay It Forward</div>
              <h4>You're already giving. Become a Sponsor and get paid too.</h4>
              <p>Everything above is free forever. For the price of a coffee a day, you become a Sponsor — the reason couples get their honeymoon money. And every purchase through your links earns you trackable commission from day one.</p>
            </div>
            <Link href="/dashboard/earnings" className="nudge-btn">Become a Sponsor →</Link>
          </div>
        )}

        {/* ===== TABS ===== */}
        <div className="tabs-bar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TAB: OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="tab-content">

            {/* What we built */}
            <div className="content-card dark-card">
              <div className="dark-badge">🎁 OUR GIFT TO YOU</div>
              <h2 className="dark-title">A custom landing page. An AI assistant. An entire marketing system. Free.</h2>
              <p className="dark-text">
                We built this for {vendor.business_name || 'your business'} because that's how we believe business should work — you lead with generosity and everything else follows.
                Your page showcases your work, captures leads, and works as your <strong>universal landing page</strong> — Instagram bio, business cards, email signature. Everywhere.
              </p>
              <p className="dark-text" style={{ marginBottom: 0 }}>
                It felt good receiving this, right? That's the feeling. Now you can give that same feeling to every couple, every client, every person in your life — and put real money in their pockets while you're at it.
              </p>
              <a href={pageLink} target="_blank" rel="noopener" className="dark-link">
                See your page live →
              </a>
            </div>

            {/* The hook — honeymoon money */}
            <div className="content-card hook-card">
              <div className="card-header-row">
                <span className="card-icon">✈️</span>
                <h2>You're giving couples their honeymoon. Literally.</h2>
              </div>
              <p>
                When you give a couple your registry link, their guests buy gifts at already-discounted prices — great deals.
                But the couple gets 25% of every purchase back as cash. A $150 gift gives them the gift PLUS $37.50 in cash.
                Every guest amplifies their gift. It adds up fast:
              </p>
              <div className="registry-math" style={{ margin: '16px 0' }}>
                <div className="registry-numbers" style={{ flexDirection: 'column', gap: '6px' }}>
                  <span>100 guests × $150 avg gift → couple could get up to <strong>$3,750 cash back</strong> ✈️</span>
                  <span>150 guests × $150 avg gift → couple could get up to <strong>$5,625 cash back</strong> 🏨</span>
                  <span>200 guests × $150 avg gift → couple could get up to <strong>$7,500 cash back</strong> 🌴</span>
                </div>
              </div>
              <p>
                That's not a coupon. That's real, spendable honeymoon money —
                because <strong>you</strong> were generous enough to set it up for them.
              </p>
              <p style={{ marginBottom: 0 }}>
                And every guest who buys a gift sees <strong>"Gift from {firstName}"</strong> — linked right back to your page. One registry = hundreds of people discovering you, attached to your generosity.
              </p>
            </div>

            {/* Claude CTA */}
            <div className="content-card claude-card">
              <div className="claude-header-row">
                <span className="claude-sparkle">✨</span>
                <div>
                  <h3>Questions? Claude knows everything.</h3>
                  <p>Need a message written? Strategy ideas? Confused about anything? Claude is your personal marketing assistant.</p>
                </div>
              </div>
              <Link href="/dashboard/assistant" className="claude-btn">Talk to Claude →</Link>
            </div>

          </div>
        )}

        {/* ===== TAB: HOW IT WORKS ===== */}
        {activeTab === 'how' && (
          <div className="tab-content">

            {/* Cold leads reactivation */}
            <div className="content-card">
              <div className="card-header-row">
                <span className="card-icon">💡</span>
                <h2>All those cold leads? Now you have a gift to bring them.</h2>
              </div>
              <p>
                Think about everyone who contacted you in the past few months and went quiet.
                How do you reach back out without it being awkward?
              </p>
              <div className="compare-grid">
                <div className="compare-bad">
                  <div className="compare-label">❌ Before</div>
                  <p>"Hey, just checking in..." / "I have new availability..." / "I learned a new song..."</p>
                  <span className="compare-verdict">No reason. Nothing to give. Feels desperate.</span>
                </div>
                <div className="compare-good">
                  <div className="compare-label">✅ Now</div>
                  <p>"I just got access to something amazing and I wanted you to be one of the first to know."</p>
                  <span className="compare-verdict">A genuine gift. You feel good sending it.</span>
                </div>
              </div>
              <p style={{ marginBottom: 0 }}>
                You're not selling. You're <strong>giving</strong> — something that puts real money in people's pockets.
                That's not a sales pitch. That's generosity. And it opens every door.
              </p>
            </div>

            {/* Network effect */}
            <div className="content-card network-card">
              <div className="card-header-row">
                <span className="card-icon">🌐</span>
                <h2>Generosity compounds. Your name travels with every gift.</h2>
              </div>
              <p>
                Every time you give someone your link, a chain starts — and your name is attached to generosity at every step.
              </p>

              <div className="network-steps">
                <div className="net-step">
                  <div className="net-num">1</div>
                  <div>
                    <strong>You give a couple the registry link.</strong>
                    <p>They set it up. Now every guest — 100, 150, 200 people — sees <em className="accent-gold">"Gift from {firstName}"</em> on every purchase. And the couple could be getting thousands back in cash for their honeymoon.</p>
                  </div>
                </div>
                <div className="net-step">
                  <div className="net-num">2</div>
                  <div>
                    <strong>Those guests click your name.</strong>
                    <p>They land on your page. They see your work. They reach out. And they just got a great deal on their gift — because of you.</p>
                  </div>
                </div>
                <div className="net-step">
                  <div className="net-num">3</div>
                  <div>
                    <strong>They pay it forward.</strong>
                    <p>"My wedding vendor gave us 25% cashback on everything." They tell friends. They text the link. Your name goes with it. The chain continues.</p>
                  </div>
                </div>
                <div className="net-step">
                  <div className="net-num">4</div>
                  <div>
                    <strong>It compounds.</strong>
                    <p>One couple's registry = 150+ people seeing your brand. The couple got their honeymoon money, every guest got a great deal, and your name is on all of it. That's not marketing. That's a legacy.</p>
                  </div>
                </div>
              </div>

              <div className="flow-bar">
                <span className="flow-step">You give</span>
                <span className="flow-arrow">→</span>
                <span className="flow-step">They receive</span>
                <span className="flow-arrow">→</span>
                <span className="flow-step">They share</span>
                <span className="flow-arrow">→</span>
                <span className="flow-step">Others receive</span>
                <span className="flow-arrow">→</span>
                <span className="flow-step highlight">Generosity compounds</span>
              </div>
            </div>

          </div>
        )}

        {/* ===== TAB: EARN COMMISSION ===== */}
        {activeTab === 'earn' && (
          <div className="tab-content">

            {/* Free first */}
            <div className="content-card free-card">
              <div className="card-header-row">
                <span className="card-icon">✨</span>
                <h2>The gift-giving is free. The honeymoon money is free. No catch.</h2>
              </div>
              <p>
                Right now, for $0, you could be putting thousands of dollars in a couple's pocket for their honeymoon.
                You can gift every client, every friend, every person in your life exclusive 25% cashback on thousands of products.
                <strong className="accent-purple"> You're already the most generous {category} in your market.</strong>
              </p>
              <p style={{ marginBottom: 0 }}>
                You only pay if you want to <strong>earn commission</strong> and become a Sponsor.
                But the power to give? That's yours right now.
              </p>
            </div>

            {/* The payback card */}
            <div className="content-card payback-card">
              <div className="card-header-row">
                <span className="card-icon">💰</span>
                <h2>Become a Sponsor. Fund honeymoons. Get paid.</h2>
              </div>
              <p>
                When you upgrade, you become a <strong>Sponsor</strong> — listed on the WeTwo store as the reason couples get their honeymoon money.
                Your sponsorship funds the cashback. That's a powerful identity: you're not paying a subscription. You're funding generosity.
              </p>
              <p className="callout-text">
                And for the price of a cup of coffee a day, every purchase through your links earns you trackable commission — while the system generates leads, reactivates contacts, and puts your name in front of hundreds of new people.
              </p>

              <div className="real-value-callout">
                <div className="callout-icon">💎</div>
                <div>
                  <strong>The real ROI isn't the commission — it's who you become.</strong>
                  <p>You become the vendor who gives couples their honeymoon. The one brides tell their friends about. One booking from that reputation is worth $2,000–$10,000+. The commission is just the cherry on top.</p>
                </div>
              </div>

              <div className="pricing-box">
                <div className="pricing-label">The commission math (per The Knot's 2024 study: avg wedding gift = $150)</div>
                <div className="pricing-grid">
                  <div className="pricing-tier">
                    <div className="tier-name">Starter</div>
                    <div className="tier-price">$97/mo</div>
                    <div className="tier-daily">$3.23/day</div>
                    <div className="tier-rate">10% commission</div>
                    <div className="tier-per">$15 per sale</div>
                    <div className="tier-break"><strong>7 sales</strong> covers your plan</div>
                  </div>
                  <div className="pricing-tier featured">
                    <div className="tier-badge">Sweet Spot</div>
                    <div className="tier-name">Growth</div>
                    <div className="tier-price">$197/mo</div>
                    <div className="tier-daily">$6.57/day</div>
                    <div className="tier-rate">15% commission</div>
                    <div className="tier-per">$22.50 per sale</div>
                    <div className="tier-break"><strong>9 sales</strong> covers your plan</div>
                  </div>
                  <div className="pricing-tier">
                    <div className="tier-name">Pro</div>
                    <div className="tier-price">$297/mo</div>
                    <div className="tier-daily">$9.90/day</div>
                    <div className="tier-rate">20% commission</div>
                    <div className="tier-per">$30 per sale</div>
                    <div className="tier-break"><strong>10 sales</strong> covers your plan</div>
                  </div>
                </div>
              </div>

              <div className="registry-math">
                <div className="registry-label">📋 The registry math — what you give AND what you earn</div>
                <p>
                  One couple. 150 guests. $150 average gift. That's <strong>$22,500 in total purchases</strong>.
                </p>
                <p style={{ fontSize: '13px', color: '#6b5e52', margin: '0 0 12px' }}>
                  <strong style={{ color: '#c9944a' }}>What the couple gets:</strong> Up to $5,625 cash back — their honeymoon, courtesy of you.
                </p>
                <div className="registry-numbers">
                  <span><strong style={{ color: '#c9944a' }}>What you earn:</strong></span>
                  <span>At 10% = <strong>$2,250</strong></span>
                  <span>At 15% = <strong>$3,375</strong></span>
                  <span>At 20% = <strong>$4,500</strong></span>
                </div>
                <p className="registry-kicker">
                  Everyone wins. The couple gets honeymoon money. You get commission. From <strong>one couple</strong>.
                </p>
              </div>

              <p className="payback-closer">
                "Give, and it shall be given unto you." That's not a strategy. That's a law.
              </p>
            </div>

            {isFree && (
              <div className="bottom-upgrade">
                <h4>You're already giving. Become a Sponsor and get paid too.</h4>
                <p>
                  Your page, your links, your AI assistant — all free, forever. You're already putting thousands in couples' pockets.
                  Upgrade to become a <strong>Sponsor</strong> — the reason brides get their honeymoon money —
                  and every purchase your network makes earns you <strong>trackable commission</strong>.
                </p>
                <Link href="/dashboard/earnings" className="upgrade-btn">Become a Sponsor →</Link>
              </div>
            )}

          </div>
        )}

        {/* ===== TAB: YOUR PLAYBOOK ===== */}
        {activeTab === 'playbook' && (
          <div className="tab-content">

            <div className="playbook-intro">
              <h2>Pay It Forward — Here's How</h2>
              <p>We gave to you. Now give to them. Here's exactly how to start.</p>
            </div>

            <div className="playbook">
              <div className="play">
                <div className="play-number">1</div>
                <div className="play-content">
                  <h4>Experience the gift yourself first</h4>
                  <p>Use your own link, buy something, and feel the 25% cashback hit. That feeling? That's what you're giving to every person you share this with. Once you feel it, you'll talk about it completely differently.</p>
                  <a href={shopLink} target="_blank" rel="noopener" className="play-link">Browse the store →</a>
                </div>
              </div>

              <div className="play">
                <div className="play-number">2</div>
                <div className="play-content">
                  <h4>Start giving</h4>
                  <p>Text past clients, cold leads, current couples: "I have something incredible I want to give you — can I send you the details?" Gauge interest. Get the "yes!" replies flowing. You're bearing gifts — this part feels great.</p>
                  <Link href="/dashboard/assistant" className="play-link">Have Claude write the message →</Link>
                </div>
              </div>

              <div className="play highlight">
                <div className="play-number upgrade">⚡</div>
                <div className="play-content">
                  <h4>Become a Sponsor before you send a single link</h4>
                  <p>You've got people saying yes. Before you send links, become a Sponsor — so every purchase from day one earns you commission AND you're listed on the store as the reason couples get honeymoon money. The outreach was free — <strong>now get paid for your generosity.</strong></p>
                  <Link href="/dashboard/earnings" className="play-link upgrade-link">Become a Sponsor →</Link>
                </div>
              </div>

              <div className="play">
                <div className="play-number">3</div>
                <div className="play-content">
                  <h4>Send the gift to everyone who said yes</h4>
                  <p>Now share your cashback link and registry link with everyone who's interested. Shoppers get great deals. Couples get honeymoon money. You earn commission. Everyone wins from day one.</p>
                  <Link href="/dashboard/links" className="play-link">Get your links →</Link>
                </div>
              </div>

              <div className="play">
                <div className="play-number">4</div>
                <div className="play-content">
                  <h4>Post it on Instagram</h4>
                  <p><em>"I have a gift for you 🎁 DM me GIFT for exclusive access to 25% cashback on thousands of products."</em> Every DM is a warm lead who came to you — because you offered to give.</p>
                  <Link href="/dashboard/links" className="play-link">Get an Instagram caption →</Link>
                </div>
              </div>

              <div className="play">
                <div className="play-number">5</div>
                <div className="play-content">
                  <h4>Give every couple their honeymoon</h4>
                  <p>"I want to give you something. Through my membership, I can set you up with a registry where every gift is amplified — guests get great prices, and you get 25% of every purchase back as cash. 150 guests? That could mean $5,000+ back in your pocket for your honeymoon." Watch their face.</p>
                </div>
              </div>

              <div className="play">
                <div className="play-number">6</div>
                <div className="play-content">
                  <h4>Give everywhere you go</h4>
                  <p>Your link goes on your website, business cards, email signature, every ad. One line: <em>"🎁 Ask me how I can put thousands back in your pocket."</em> You wake up every morning with something real to give everyone you meet.</p>
                </div>
              </div>
            </div>

            {/* Claude CTA */}
            <div className="content-card claude-card">
              <div className="claude-header-row">
                <span className="claude-sparkle">✨</span>
                <div>
                  <h3>Need help with any of these steps?</h3>
                  <p>Claude can write your outreach messages, Instagram captions, email templates — whatever you need.</p>
                </div>
              </div>
              <Link href="/dashboard/assistant" className="claude-btn">Talk to Claude →</Link>
            </div>

          </div>
        )}

      </div>

      <style jsx>{`
        /* ===== LAYOUT ===== */
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

        /* ===== SPONSOR BANNER ===== */
        .sponsor-banner {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; border-radius: 12px;
          margin-bottom: 20px; text-decoration: none;
          transition: all 0.2s ease;
        }
        .sponsor-banner.live {
          background: linear-gradient(135deg, rgba(201,148,74,0.08), rgba(201,148,74,0.03));
          border: 1px solid rgba(201,148,74,0.35);
        }
        .sponsor-banner.live:hover {
          border-color: rgba(201,148,74,0.6);
          box-shadow: 0 4px 16px rgba(201,148,74,0.12);
        }
        .sponsor-banner.expired {
          background: rgba(107,94,82,0.04);
          border: 1px solid rgba(107,94,82,0.2);
        }
        .sponsor-icon { font-size: 24px; flex-shrink: 0; }
        .sponsor-text { flex: 1; }
        .sponsor-text strong { display: block; font-size: 14px; color: #2c2420; margin-bottom: 2px; }
        .sponsor-banner.live .sponsor-text strong { color: #c9944a; }
        .sponsor-text span { font-size: 13px; color: #6b5e52; line-height: 1.4; }
        .sponsor-cta { font-size: 13px; color: #c9944a; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
        .sponsor-cta-btn {
          padding: 8px 16px; background: #c9944a; color: #fff;
          border: none; border-radius: 8px; font-size: 13px;
          font-weight: 700; text-decoration: none; white-space: nowrap;
          flex-shrink: 0; transition: all 0.2s;
        }
        .sponsor-cta-btn:hover { filter: brightness(1.1); }

        /* ===== HERO BLOCK ===== */
        .hero-block {
          margin-bottom: 24px;
        }
        .hero-top {
          margin-bottom: 20px;
        }
        .hero-headline {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; color: #2c2420;
          margin: 0 0 8px; line-height: 1.2;
        }
        .hero-sub {
          font-size: 15px; color: #6b5e52; margin: 0; line-height: 1.6;
          max-width: 580px;
        }

        /* ===== TOOLKIT GRID ===== */
        .toolkit-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
        }
        .tool-card {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 14px;
          padding: 20px 16px; text-align: center; cursor: pointer;
          text-decoration: none; color: inherit;
          transition: all 0.2s ease;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .tool-card:hover {
          border-color: #c9944a; box-shadow: 0 4px 16px rgba(201,148,74,0.1);
          transform: translateY(-2px);
        }
        .tool-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .tool-icon-wrap.page-icon { background: rgba(201,148,74,0.1); color: #c9944a; }
        .tool-icon-wrap.links-icon { background: rgba(34,197,94,0.1); color: #22c55e; }
        .tool-icon-wrap.claude-icon-wrap { background: rgba(124,107,196,0.1); color: #7c6bc4; }
        .tool-icon-wrap.contacts-icon { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .tool-label { font-size: 13px; font-weight: 700; color: #2c2420; }
        .tool-status { font-size: 12px; color: #c9944a; font-weight: 600; }

        /* ===== STATS ===== */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: #fff; border: 1px solid #e4ddd4; border-radius: 12px; padding: 18px; text-align: center; }
        .stat-value { font-size: 26px; font-weight: 700; }
        .stat-value.green { color: #22c55e; }
        .stat-value.brand { color: #c9944a; }
        .stat-value.gold { color: #d4a76a; }
        .stat-value.muted { color: #6b5e52; }
        .stat-label { font-size: 11px; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

        /* ===== LINKS SECTION ===== */
        .links-section { margin-bottom: 24px; }
        .section-heading { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .section-intro { font-size: 14px; color: #6b5e52; margin: 0 0 16px; line-height: 1.5; }
        .links-grid { display: flex; flex-direction: column; gap: 12px; }
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

        /* ===== UPGRADE NUDGE ===== */
        .upgrade-nudge {
          display: flex; gap: 20px; align-items: center;
          background: linear-gradient(135deg, rgba(34,197,94,0.04), rgba(201,148,74,0.04));
          border: 1px solid rgba(201,148,74,0.25); border-radius: 14px;
          padding: 24px; margin-bottom: 28px;
        }
        .nudge-content { flex: 1; }
        .nudge-badge {
          display: inline-block; background: rgba(201,148,74,0.12); color: #c9944a;
          font-size: 11px; font-weight: 800; letter-spacing: 0.06em;
          padding: 3px 10px; border-radius: 4px; margin-bottom: 8px;
          text-transform: uppercase;
        }
        .upgrade-nudge h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .upgrade-nudge p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .nudge-btn {
          padding: 12px 24px; background: #c9944a; color: #fff; border: none; border-radius: 8px;
          font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap;
          flex-shrink: 0; transition: all 0.2s;
        }
        .nudge-btn:hover { filter: brightness(1.1); }

        /* ===== TABS ===== */
        .tabs-bar {
          display: flex; gap: 4px; margin-bottom: 24px;
          border-bottom: 1px solid #e4ddd4; padding-bottom: 0;
        }
        .tab-btn {
          padding: 10px 20px; background: none; border: none;
          border-bottom: 2px solid transparent;
          font-size: 14px; font-weight: 600; color: #9a8d80;
          cursor: pointer; transition: all 0.2s;
          font-family: inherit;
        }
        .tab-btn:hover { color: #6b5e52; }
        .tab-btn.active {
          color: #c9944a; border-bottom-color: #c9944a;
        }
        .tab-content {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ===== CONTENT CARDS ===== */
        .content-card {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 16px;
          padding: 28px; margin-bottom: 16px;
        }
        .content-card p {
          font-size: 15px; color: #6b5e52; line-height: 1.7; margin: 0 0 12px;
        }
        .content-card p strong { color: #2c2420; }
        .card-header-row {
          display: flex; gap: 14px; align-items: center; margin-bottom: 16px;
        }
        .card-icon { font-size: 28px; flex-shrink: 0; }
        .card-header-row h2 {
          font-family: 'Playfair Display', serif; font-size: 19px;
          color: #2c2420; margin: 0; line-height: 1.3;
        }

        /* Dark card */
        .dark-card {
          background: linear-gradient(135deg, #2c2420, #1a1614);
          border: none; text-align: center;
        }
        .dark-badge {
          display: inline-block; background: rgba(201,148,74,0.2); border: 1px solid rgba(201,148,74,0.4);
          color: #c9944a; padding: 4px 16px; border-radius: 20px; font-size: 11px;
          font-weight: 800; letter-spacing: 0.1em; margin-bottom: 16px;
        }
        .dark-title {
          font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600;
          color: #fff; line-height: 1.3; margin: 0 0 16px;
        }
        .dark-text {
          font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0 0 12px;
          max-width: 640px; margin-left: auto; margin-right: auto;
        }
        .dark-text strong { color: #c9944a; }
        .dark-link {
          display: inline-block; margin-top: 16px; padding: 10px 24px;
          background: rgba(201,148,74,0.2); border: 1px solid rgba(201,148,74,0.4);
          border-radius: 8px; color: #c9944a; text-decoration: none; font-size: 14px;
          font-weight: 600; transition: all 0.2s;
        }
        .dark-link:hover { background: rgba(201,148,74,0.35); }

        /* Hook card */
        .hook-card { border-color: rgba(201,148,74,0.25); }

        /* Compare grid */
        .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .compare-bad { background: rgba(239,68,68,0.04); border: 1px solid rgba(239,68,68,0.15); border-radius: 12px; padding: 16px; }
        .compare-good { background: rgba(34,197,94,0.04); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; padding: 16px; }
        .compare-label { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
        .compare-bad .compare-label { color: #ef4444; }
        .compare-good .compare-label { color: #22c55e; }
        .compare-bad p, .compare-good p { font-size: 14px; color: #6b5e52; margin: 0 0 6px; line-height: 1.5; font-style: italic; }
        .compare-verdict { font-size: 12px; font-weight: 600; }
        .compare-bad .compare-verdict { color: #ef4444; }
        .compare-good .compare-verdict { color: #22c55e; }

        /* Network card */
        .network-card { border-color: rgba(59,130,246,0.2); }
        .accent-blue { color: #3b82f6; font-style: normal; font-weight: 600; }
        .accent-gold { color: #c9944a; font-style: normal; font-weight: 600; }
        .network-steps { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
        .net-step { display: flex; gap: 14px; align-items: flex-start; }
        .net-num {
          width: 28px; height: 28px; background: #3b82f6; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: #fff;
          font-size: 13px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .net-step strong { font-size: 14px; color: #2c2420; display: block; margin-bottom: 2px; }
        .net-step p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .flow-bar {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          justify-content: center; background: rgba(59,130,246,0.04);
          border-radius: 12px; padding: 16px;
        }
        .flow-step {
          padding: 6px 12px; background: #fff; border: 1px solid #e4ddd4;
          border-radius: 8px; font-size: 12px; font-weight: 600; color: #2c2420;
        }
        .flow-step.highlight { background: #3b82f6; color: #fff; border-color: #3b82f6; }
        .flow-arrow { color: #9a8d80; font-size: 14px; }

        /* Free card */
        .free-card {
          background: linear-gradient(135deg, rgba(147,130,220,0.06), rgba(201,148,74,0.04));
          border-color: rgba(147,130,220,0.2);
        }
        .accent-purple { color: #7c6bc4; }

        /* Payback card */
        .payback-card { border-color: rgba(34,197,94,0.2); }
        .callout-text { font-weight: 600; color: #2c2420 !important; }
        .real-value-callout {
          display: flex; gap: 14px; align-items: flex-start;
          background: rgba(201,148,74,0.06); border: 1px solid rgba(201,148,74,0.2);
          border-radius: 12px; padding: 18px; margin-bottom: 20px;
        }
        .callout-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .real-value-callout strong { font-size: 14px; color: #2c2420; display: block; margin-bottom: 4px; }
        .real-value-callout p { font-size: 13px; color: #6b5e52; line-height: 1.5; margin: 0; }

        .pricing-box {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 12px;
          padding: 24px; margin: 20px 0;
        }
        .pricing-label { font-size: 12px; color: #9a8d80; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 16px; text-align: center; }
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .pricing-tier {
          text-align: center; padding: 16px 12px; border: 1px solid #e4ddd4;
          border-radius: 10px; position: relative;
        }
        .pricing-tier.featured { border-color: #22c55e; background: rgba(34,197,94,0.03); }
        .tier-badge {
          position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
          background: #22c55e; color: #fff; font-size: 10px; font-weight: 700;
          padding: 2px 10px; border-radius: 10px;
        }
        .tier-name { font-size: 16px; font-weight: 700; color: #2c2420; margin-bottom: 2px; }
        .tier-price { font-size: 13px; color: #9a8d80; margin-bottom: 4px; }
        .tier-daily { font-size: 11px; color: #c9944a; font-weight: 600; font-style: italic; margin-bottom: 8px; }
        .tier-rate { font-size: 13px; color: #22c55e; font-weight: 600; margin-bottom: 4px; }
        .tier-per { font-size: 14px; color: #6b5e52; margin-bottom: 8px; }
        .tier-break { font-size: 13px; color: #2c2420; }
        .tier-break strong { color: #22c55e; }

        .registry-math {
          background: rgba(201,148,74,0.06); border: 1px solid rgba(201,148,74,0.2);
          border-radius: 12px; padding: 20px; margin: 16px 0;
        }
        .registry-label { font-size: 14px; font-weight: 700; color: #2c2420; margin-bottom: 8px; }
        .registry-math p { font-size: 14px; color: #6b5e52; line-height: 1.6; margin: 0 0 12px; }
        .registry-math p strong { color: #c9944a; }
        .registry-numbers { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
        .registry-numbers span { font-size: 14px; color: #6b5e52; }
        .registry-numbers strong { color: #22c55e; font-size: 16px; }
        .registry-kicker { font-size: 14px; color: #2c2420; font-weight: 600; margin: 0 !important; }
        .payback-closer {
          font-family: 'Playfair Display', serif; font-size: 18px; color: #2c2420;
          font-weight: 600; text-align: center; margin: 20px 0 0; line-height: 1.4;
        }

        /* Bottom upgrade */
        .bottom-upgrade {
          background: linear-gradient(135deg, rgba(34,197,94,0.06), rgba(201,148,74,0.04));
          border: 1px solid rgba(34,197,94,0.2); border-radius: 14px;
          padding: 28px; text-align: center;
        }
        .bottom-upgrade h4 { font-family: 'Playfair Display', serif; font-size: 18px; color: #2c2420; margin: 0 0 10px; }
        .bottom-upgrade p { font-size: 14px; color: #6b5e52; line-height: 1.7; margin: 0 0 16px; max-width: 640px; margin-left: auto; margin-right: auto; }
        .bottom-upgrade strong { color: #22c55e; }
        .upgrade-btn {
          display: inline-block; padding: 14px 28px; background: #22c55e; color: #fff;
          border: none; border-radius: 8px; font-size: 15px; font-weight: 700;
          text-decoration: none; transition: all 0.2s;
        }
        .upgrade-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

        /* Claude card */
        .claude-card {
          background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06));
          border-color: rgba(147,130,220,0.25);
        }
        .claude-header-row { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
        .claude-sparkle { font-size: 32px; flex-shrink: 0; }
        .claude-card h3 { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 6px; line-height: 1.3; }
        .claude-card > .claude-header-row p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .claude-btn {
          display: inline-block; padding: 14px 28px; background: #7c6bc4; color: #fff;
          border: none; border-radius: 10px; font-size: 15px; font-weight: 700;
          text-decoration: none; transition: all 0.2s;
        }
        .claude-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

        /* ===== PLAYBOOK ===== */
        .playbook-intro {
          margin-bottom: 20px;
        }
        .playbook-intro h2 {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #2c2420; margin: 0 0 4px;
        }
        .playbook-intro p {
          font-size: 14px; color: #6b5e52; margin: 0;
        }
        .playbook { display: flex; flex-direction: column; margin-bottom: 28px; }
        .play { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #e4ddd4; }
        .play:last-child { border-bottom: none; }
        .play-number {
          width: 32px; height: 32px; background: #c9944a; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: #fff;
          font-size: 14px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .play-content { flex: 1; }
        .play-content h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .play-content p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .play-content em { color: #c9944a; font-style: italic; }
        .play.highlight {
          background: linear-gradient(135deg, rgba(201,148,74,0.08), rgba(34,197,94,0.06));
          border: 1px solid rgba(201,148,74,0.3); border-radius: 12px;
          padding: 20px; margin: 8px 0; border-bottom: none;
        }
        .play-number.upgrade {
          background: linear-gradient(135deg, #c9944a, #22c55e);
          font-size: 16px; width: 36px; height: 36px;
        }
        .upgrade-link { color: #22c55e !important; font-weight: 700; }
        .play-link { display: inline-block; margin-top: 8px; font-size: 13px; color: #c9944a; text-decoration: none; font-weight: 600; }
        .play-link:hover { text-decoration: underline; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .page-header { padding: 16px 20px; flex-direction: column; gap: 12px; align-items: flex-start; }
          .page-content { padding: 20px; }
          .toolkit-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .tabs-bar { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .tab-btn { padding: 10px 14px; font-size: 13px; white-space: nowrap; }
          .content-card { padding: 20px; }
          .dark-card { padding: 24px 20px; }
          .upgrade-nudge { flex-direction: column; }
          .claude-header-row { flex-direction: column; }
          .sponsor-banner { flex-wrap: wrap; }
          .sponsor-cta, .sponsor-cta-btn { margin-top: 8px; }
          .flow-bar { flex-direction: column; gap: 4px; }
          .flow-arrow { transform: rotate(90deg); }
          .pricing-grid { grid-template-columns: 1fr; }
          .compare-grid { grid-template-columns: 1fr; }
          .registry-numbers { flex-direction: column; gap: 4px; }
          .hero-headline { font-size: 24px; }
        }
      `}</style>
    </div>
  )
}
