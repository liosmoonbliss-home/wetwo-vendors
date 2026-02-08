#!/bin/bash
echo "🔄 Updating dashboard pages with v2 copy..."
cat > src/app/dashboard/page.tsx << 'ENDOFFILE_dash_1770478954'
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
  const baseUrl = 'https://wetwo.love'
  const shopLink = `${baseUrl}?ref=vendor-${vendor.ref}`
  const registryLink = `${baseUrl}/couple/signup?ref=vendor-${vendor.ref}`
  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`
  const isFree = vendor.plan === 'free'

  return (
    <div>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Welcome, {firstName} 👋</h1>
          <p className="page-subtitle">Your gift engine is live. Here's how to use it.</p>
        </div>
        <Link href={`/vendor/${vendor.ref}`} target="_blank" className="header-btn">
          View Your Page →
        </Link>
      </header>

      <div className="page-content">

        {/* The Big Idea — simple, human */}
        <div className="hero-card">
          <h2 className="hero-title">You can now give everyone in your world 25% cashback on thousands of products — and it doesn't cost you a penny.</h2>
          <p className="hero-text">
            Furniture. Kitchen. Bedroom. Fashion. Outdoor. Thousands of real products people actually want.
            When someone shops through <strong>your link</strong>, they get 25% back. Every time.
          </p>
          <div className="hero-callouts">
            <div className="callout">
              <span className="callout-icon">🎁</span>
              <div>
                <strong>It's a gift from you.</strong>
                <p>When someone uses your link, the store says <em>"Gift from {firstName}"</em> — linked right back to your page.</p>
              </div>
            </div>
            <div className="callout">
              <span className="callout-icon">💰</span>
              <div>
                <strong>You don't pay anything.</strong>
                <p>The 25% comes from WeTwo, not from you. Your services, your pricing — nothing changes.</p>
              </div>
            </div>
            <div className="callout">
              <span className="callout-icon">📈</span>
              <div>
                <strong>You can earn on every purchase.</strong>
                <p>On a paid plan, you earn 10–20% commission every time someone buys through your links. {isFree ? 'More on that below.' : `You're earning ${vendor.commission_rate}% right now.`}</p>
              </div>
            </div>
          </div>
        </div>

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
        <h3 className="section-heading">Your 3 Links</h3>
        <p className="section-intro">Everything runs on these three links. Copy them. Share them. That's it.</p>

        <div className="links-grid">
          {/* Personal */}
          <div className="link-card you">
            <div className="link-card-header">
              <span className="link-emoji">🛍️</span>
              <div>
                <h4 className="link-title">For You, Personally</h4>
                <p className="link-desc">Want something for yourself? Buying a gift for someone? Use this link and get 25% cashback.</p>
              </div>
            </div>
            <div className="link-row">
              <input type="text" value={shopLink} readOnly className="link-input" />
              <button className={`copy-btn ${copied === 'you' ? 'copied' : ''}`} onClick={() => copyLink(shopLink, 'you')}>
                {copied === 'you' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Couples */}
          <div className="link-card couples">
            <div className="link-card-header">
              <span className="link-emoji">💍</span>
              <div>
                <h4 className="link-title">For Your Couples</h4>
                <p className="link-desc">Tell them: "Set up a registry and your guests get you real gifts — furniture, kitchen, bedroom — and you get 25% back in cash." Or skip the registry and just shop. It works either way.</p>
              </div>
            </div>
            <div className="link-row">
              <input type="text" value={registryLink} readOnly className="link-input" />
              <button className={`copy-btn ${copied === 'couples' ? 'copied' : ''}`} onClick={() => copyLink(registryLink, 'couples')}>
                {copied === 'couples' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Everyone */}
          <div className="link-card everyone">
            <div className="link-card-header">
              <span className="link-emoji">🎁</span>
              <div>
                <h4 className="link-title">For Everyone Else</h4>
                <p className="link-desc">Every client. Every friend. Every follower. Every person at the next expo. Give them this link and say: "Here — 25% cashback on everything. It's a gift from me."</p>
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

        {/* Upgrade Nudge — BEFORE they start sharing */}
        {isFree && (
          <div className="upgrade-nudge">
            <div className="nudge-icon">⚠️</div>
            <div>
              <h4>Before you start sharing — read this.</h4>
              <p>
                Right now, your links work perfectly. Anyone you share them with gets 25% cashback.
                But <strong>you won't earn anything on their purchases</strong> until you're on a paid plan.
              </p>
              <p>
                If you share your links with 50 people this week and they start buying — that's money
                you could have earned but didn't. <strong>Upgrade first, then do your push.</strong>
                Even the $97/month Starter plan earns you 10% on every single purchase.
              </p>
            </div>
            <Link href="/dashboard/earnings" className="nudge-btn">
              See Plans →
            </Link>
          </div>
        )}

        {/* What To Do Right Now */}
        <h3 className="section-heading">Here's Exactly What To Do</h3>
        <p className="section-intro">You don't need a marketing degree. You just need to share your links. Here's where to start — today.</p>

        <div className="playbook">
          <div className="play">
            <div className="play-number">1</div>
            <div className="play-content">
              <h4>Shop for yourself first</h4>
              <p>Try it. Use your personal shopping link, buy something you actually want, and see the 25% cashback hit. Once you've experienced it, you'll talk about it differently.</p>
              <a href={shopLink} target="_blank" rel="noopener" className="play-link">Browse the store →</a>
            </div>
          </div>

          <div className="play">
            <div className="play-number">2</div>
            <div className="play-content">
              <h4>Text your last 5 couples</h4>
              <p>Even couples you've already worked with. Even couples who got married last year. Text them: <em>"Hey! I partnered with a store that gives you 25% cashback on everything — furniture, kitchen, bedroom, fashion. Here's your link."</em> They'll love you for it.</p>
              <Link href="/dashboard/links" className="play-link">Get the copy-paste message →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">3</div>
            <div className="play-content">
              <h4>Send one email to your past clients</h4>
              <p>Everyone you've worked with in the past 5 years. Send them one email: <em>"I wanted to share something special with you — through my link, you get 25% cashback on thousands of products. It's completely free and it's my gift to you."</em> That's it. One email. Massive reach.</p>
              <Link href="/dashboard/assistant" className="play-link">Have Claude write it for you →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">4</div>
            <div className="play-content">
              <h4>Post it on Instagram</h4>
              <p>One post. One story. Say: <em>"I partnered with @wetwo.love so all my clients get 25% cashback on furniture, kitchen essentials, and more. DM me for the link."</em> Put your page link in your bio.</p>
              <Link href="/dashboard/links" className="play-link">Get an Instagram caption →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">5</div>
            <div className="play-content">
              <h4>Print it for your next event or expo</h4>
              <p>Put a card on your table at the next bridal expo: <em>"Gift from {firstName} — 25% cashback on everything. Scan to shop."</em> You can even put a QR code on it. People remember the vendor who gave them something.</p>
            </div>
          </div>

          <div className="play">
            <div className="play-number">6</div>
            <div className="play-content">
              <h4>Add it to all your advertising</h4>
              <p>Website. Business cards. Email signature. Every ad you run. Add one line: <em>"All my clients get 25% cashback on home, kitchen & more — ask me how."</em> It makes you different from every other vendor in your category.</p>
            </div>
          </div>

          <div className="play">
            <div className="play-number">7</div>
            <div className="play-content">
              <h4>Tell every new client from now on</h4>
              <p>Make it part of how you close. When someone books you, hand them the link: <em>"One more thing — all my clients get access to 25% cashback on thousands of products. Here's your link. It works forever."</em></p>
            </div>
          </div>
        </div>

        {/* AI Assistant CTA */}
        <div className="ai-card">
          <span className="ai-icon">✨</span>
          <div>
            <h4>Not sure what to say? Claude will write it for you.</h4>
            <p>Tell Claude who you're writing to — a past couple, your email list, Instagram — and it'll write the message in your voice, with your links baked in. Copy, paste, send.</p>
          </div>
          <Link href="/dashboard/assistant" className="ai-btn">Ask Claude →</Link>
        </div>

        {/* Bottom upgrade */}
        {isFree && (
          <div className="bottom-upgrade">
            <h4>The gift engine is free. The money engine is $97/month.</h4>
            <p>
              Everything above works on the free plan — your links, your page, the AI assistant, the contact form.
              But if you want to <strong>earn money</strong> every time someone buys through your links, you need a paid plan.
              Start at $97/month and earn 10% on every purchase. With just a few couples a year, it pays for itself many times over.
            </p>
            <Link href="/dashboard/earnings" className="upgrade-btn">See the math →</Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-header {
          background: #fff;
          border-bottom: 1px solid #e4ddd4;
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .header-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          color: #6b5e52;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .header-btn:hover { border-color: #c9944a; color: #c9944a; }
        .page-content { padding: 28px 32px; max-width: 880px; }

        /* Hero */
        .hero-card {
          background: linear-gradient(135deg, rgba(201,148,74,0.06), rgba(201,148,74,0.02));
          border: 1px solid rgba(201,148,74,0.2);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 28px;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #2c2420;
          line-height: 1.4;
          margin: 0 0 12px;
        }
        .hero-text {
          font-size: 15px;
          color: #6b5e52;
          line-height: 1.7;
          margin: 0 0 24px;
        }
        .hero-text strong { color: #c9944a; }
        .hero-callouts { display: flex; flex-direction: column; gap: 16px; }
        .callout {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .callout-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .callout strong { font-size: 14px; color: #2c2420; display: block; margin-bottom: 2px; }
        .callout p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .callout em { color: #c9944a; font-style: normal; font-weight: 600; }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
        }
        .stat-value { font-size: 26px; font-weight: 700; }
        .stat-value.green { color: #22c55e; }
        .stat-value.brand { color: #c9944a; }
        .stat-value.gold { color: #d4a76a; }
        .stat-value.muted { color: #6b5e52; }
        .stat-label { font-size: 11px; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

        /* Section headings */
        .section-heading { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .section-intro { font-size: 14px; color: #6b5e52; margin: 0 0 16px; line-height: 1.5; }

        /* Links */
        .links-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .link-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          padding: 20px;
        }
        .link-card.you { border-left: 3px solid #c9944a; }
        .link-card.couples { border-left: 3px solid #22c55e; }
        .link-card.everyone { border-left: 3px solid #3b82f6; }
        .link-card-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
        .link-emoji { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .link-title { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .link-desc { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .link-row { display: flex; gap: 8px; }
        .link-input {
          flex: 1;
          padding: 10px 12px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 12px;
          color: #4a3f35;
          font-family: inherit;
        }
        .copy-btn {
          padding: 10px 18px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }
        .copy-btn:hover { filter: brightness(1.1); }
        .copy-btn.copied { background: #22c55e; }

        /* Upgrade Nudge */
        .upgrade-nudge {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          background: rgba(251,191,36,0.06);
          border: 1px solid rgba(251,191,36,0.3);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 32px;
        }
        .nudge-icon { font-size: 28px; flex-shrink: 0; }
        .upgrade-nudge h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .upgrade-nudge p { font-size: 14px; color: #6b5e52; margin: 0 0 6px; line-height: 1.6; }
        .upgrade-nudge p strong { color: #2c2420; }
        .nudge-btn {
          padding: 12px 24px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          align-self: center;
          transition: all 0.2s;
        }
        .nudge-btn:hover { filter: brightness(1.1); }

        /* Playbook */
        .playbook { display: flex; flex-direction: column; gap: 0; margin-bottom: 28px; }
        .play {
          display: flex;
          gap: 16px;
          padding: 20px 0;
          border-bottom: 1px solid #e4ddd4;
        }
        .play:last-child { border-bottom: none; }
        .play-number {
          width: 32px;
          height: 32px;
          background: #c9944a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .play-content { flex: 1; }
        .play-content h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .play-content p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .play-content em { color: #c9944a; font-style: italic; }
        .play-link {
          display: inline-block;
          margin-top: 8px;
          font-size: 13px;
          color: #c9944a;
          text-decoration: none;
          font-weight: 600;
        }
        .play-link:hover { text-decoration: underline; }

        /* AI Card */
        .ai-card {
          display: flex;
          gap: 16px;
          align-items: center;
          background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06));
          border: 1px solid rgba(147,130,220,0.25);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 28px;
        }
        .ai-icon { font-size: 32px; flex-shrink: 0; }
        .ai-card h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .ai-card p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .ai-btn {
          padding: 12px 24px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .ai-btn:hover { filter: brightness(1.1); }

        /* Bottom Upgrade */
        .bottom-upgrade {
          background: linear-gradient(135deg, rgba(34,197,94,0.06), rgba(201,148,74,0.04));
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 14px;
          padding: 28px;
          text-align: center;
        }
        .bottom-upgrade h4 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #2c2420;
          margin: 0 0 10px;
        }
        .bottom-upgrade p {
          font-size: 14px;
          color: #6b5e52;
          line-height: 1.7;
          margin: 0 0 16px;
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }
        .bottom-upgrade strong { color: #22c55e; }
        .upgrade-btn {
          display: inline-block;
          padding: 14px 28px;
          background: #22c55e;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }
        .upgrade-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

        @media (max-width: 768px) {
          .page-header { padding: 16px 20px; flex-direction: column; gap: 12px; align-items: flex-start; }
          .page-content { padding: 20px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-card { padding: 24px 20px; }
          .upgrade-nudge { flex-direction: column; }
          .ai-card { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_dash_1770478954
cat > src/app/dashboard/links/page.tsx << 'ENDOFFILE_links_1770478954'
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LinksPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggle = (id: string) => setExpandedMsg(expandedMsg === id ? null : id)

  if (!vendor) return null

  const firstName = (vendor.contact_name || vendor.business_name || '').split(' ')[0]
  const biz = vendor.business_name || 'My Business'
  const baseUrl = 'https://wetwo.love'
  const shopLink = `${baseUrl}?ref=vendor-${vendor.ref}`
  const registryLink = `${baseUrl}/couple/signup?ref=vendor-${vendor.ref}`
  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`

  // ---- All the copy-paste messages ----

  const textToRecentCouple = `Hey! I just wanted to share something with you — I partnered with a store called WeTwo where you can set up a wedding registry and get 25% cashback on every gift your guests buy. Real stuff — furniture, kitchen, bedding, fashion. And you get 25% of it all back in cash.

It's completely free to set up: ${registryLink}

Even if you already have a registry somewhere else, you can use this one too. Or just use it to shop for yourselves — the cashback works on everything. Congrats again! 🎉

${firstName}`

  const textToPastCouple = `Hi! It's ${firstName} from ${biz}. Hope you're doing amazing! 💕

I wanted to share something new — I partnered with a store that gives you 25% cashback on everything you buy. Furniture, kitchen stuff, bedding, clothing, outdoor — thousands of products. 

No catch, nothing to sign up for, just shop through this link and you automatically get 25% back: ${shopLink}

It's my way of saying thanks for being a client. The cashback is real and it works forever. Enjoy!`

  const emailToPastClients = `Subject: A gift from ${firstName} — 25% cashback on everything

Hi there,

I hope you're doing well! I wanted to reach out with something I'm really excited about.

I recently partnered with a company called WeTwo, and through my link, you now get 25% cashback on thousands of products — furniture, kitchen essentials, bedding, clothing, fashion, outdoor items, and more.

It's completely free. There's nothing to sign up for. Just shop through my link and you automatically get 25% back on everything you buy:

${shopLink}

This isn't a sale or a limited-time thing — it works every time you shop, forever. Think of it as my gift to you for being part of my world.

If you know anyone who's getting married, I also have a link for wedding registries where couples get 25% cashback on every gift: ${registryLink}

Feel free to share either link with anyone — the more the merrier!

Warmly,
${firstName}
${biz}`

  const emailToNewCouple = `Subject: Something special for your wedding — 25% cashback on your entire registry

Hi!

It was so great meeting you! I'm excited about your upcoming celebration and wanted to share something that I think you'll love.

I partnered with a wedding registry called WeTwo where you get 25% cashback on every single gift your guests buy. Real furniture, kitchen items, bedding, fashion — things you'll actually use in your new life together. And 25% of it all comes back to you as cash.

Here's your link to set up your free registry: ${registryLink}

You can use it alongside any other registry you have. Even after the wedding, the link works forever — you can use it to shop for yourselves anytime and still get 25% back.

Can't wait to help make your day beautiful!

${firstName}
${biz}`

  const igCaption = `Something I'm really excited to share with all of you ✨

I partnered with @wetwo.love and now ALL of my clients — past, present, and future — get 25% cashback on everything they buy. Furniture. Kitchen. Bedroom. Fashion. Outdoor. Thousands of real products.

No catch. No strings. Just shop through my link and get 25% back. Every time.

Getting married? There's a registry option too where your guests buy you real gifts and YOU get 25% back in cash 💍

DM me for the link or tap the link in my bio.

This is my gift to you. 🎁

#SmallBusiness #WeddingVendor #ClientLove #WeTwo #25Cashback`

  const igStory = `🎁 NEW: All my clients now get 25% cashback on EVERYTHING

Furniture, kitchen, fashion, bedroom, outdoor — thousands of products

No catch. No strings. Just a gift from me to you.

DM me "LINK" and I'll send it right over 💕`

  const expoCard = `🎁 Gift from ${firstName}
━━━━━━━━━━━━━━━━━━━

25% cashback on everything.
Furniture. Kitchen. Fashion. Bedroom.

Shop: ${shopLink}
Registry: ${registryLink}

Scan to start shopping →
[QR CODE HERE]

━━━━━━━━━━━━━━━━━━━
${biz} • ${pageLink}`

  const emailSignature = `—
${firstName} | ${biz}
🎁 My clients get 25% cashback on thousands of products → ${shopLink}`

  const closingScript = `"One more thing before you go — all of my clients get access to something special. Through my link, you get 25% cashback on thousands of products — furniture, kitchen, bedroom, fashion, everything. It's completely free, there's no catch, and it works forever. Here, let me text you the link right now. It's my gift to you."`

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Your Links & Messages</h1>
          <p className="page-subtitle">Copy-paste messages for every situation. Ready to send.</p>
        </div>
      </header>

      <div className="page-content">

        <div className="clarity-banner">
          <strong>Remember:</strong> You are not paying the 25%. WeTwo pays it. Your services and pricing don't change. 
          You are giving people a gift — access to 25% cashback on thousands of products. When they shop, it says <em>"Gift from {firstName}"</em> right on the page.
        </div>

        {/* =================== */}
        {/* SCENARIO: RECENT COUPLES */}
        {/* =================== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">💍</span>
            <div>
              <h3>Couples You're Talking To Now</h3>
              <p>Any couple you've met recently, are in talks with, or just booked. Send them the registry link.</p>
            </div>
          </div>
          <div className="link-row">
            <input type="text" value={registryLink} readOnly className="link-input" />
            <button className={`copy-btn ${copied === 'reg' ? 'copied' : ''}`} onClick={() => copy(registryLink, 'reg')}>
              {copied === 'reg' ? '✓' : 'Copy Link'}
            </button>
          </div>
          <div className="msg-toggle" onClick={() => toggle('recent-couple')}>
            <span>📱 Copy-paste text message</span>
            <span>{expandedMsg === 'recent-couple' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'recent-couple' && (
            <div className="msg-block">
              <pre className="msg-text">{textToRecentCouple}</pre>
              <button className={`copy-msg-btn ${copied === 'rc-msg' ? 'copied' : ''}`} onClick={() => copy(textToRecentCouple, 'rc-msg')}>
                {copied === 'rc-msg' ? '✓ Copied' : 'Copy Message'}
              </button>
            </div>
          )}
          <div className="msg-toggle" onClick={() => toggle('new-couple-email')}>
            <span>✉️ Copy-paste email to a new couple</span>
            <span>{expandedMsg === 'new-couple-email' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'new-couple-email' && (
            <div className="msg-block">
              <pre className="msg-text">{emailToNewCouple}</pre>
              <button className={`copy-msg-btn ${copied === 'nce-msg' ? 'copied' : ''}`} onClick={() => copy(emailToNewCouple, 'nce-msg')}>
                {copied === 'nce-msg' ? '✓ Copied' : 'Copy Message'}
              </button>
            </div>
          )}
        </div>

        {/* =================== */}
        {/* SCENARIO: PAST COUPLES */}
        {/* =================== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">💌</span>
            <div>
              <h3>Couples From the Past</h3>
              <p>Even couples who got married years ago. They're still buying things for their home. This is your excuse to reach back out — and they'll thank you for it.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('past-couple')}>
            <span>📱 Text message to a past couple</span>
            <span>{expandedMsg === 'past-couple' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'past-couple' && (
            <div className="msg-block">
              <pre className="msg-text">{textToPastCouple}</pre>
              <button className={`copy-msg-btn ${copied === 'pc-msg' ? 'copied' : ''}`} onClick={() => copy(textToPastCouple, 'pc-msg')}>
                {copied === 'pc-msg' ? '✓ Copied' : 'Copy Message'}
              </button>
            </div>
          )}
        </div>

        {/* =================== */}
        {/* SCENARIO: ENTIRE EMAIL LIST */}
        {/* =================== */}
        <div className="scenario highlight">
          <div className="scenario-header">
            <span className="scenario-num">📧</span>
            <div>
              <h3>Your Entire Email List From the Past 5 Years</h3>
              <p>This is the big one. Every person who ever inquired, every client you ever worked with, every lead that went cold. One email to all of them. This alone can change your month.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('email-blast')}>
            <span>✉️ The email to send to your entire list</span>
            <span>{expandedMsg === 'email-blast' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'email-blast' && (
            <div className="msg-block">
              <pre className="msg-text">{emailToPastClients}</pre>
              <button className={`copy-msg-btn ${copied === 'eb-msg' ? 'copied' : ''}`} onClick={() => copy(emailToPastClients, 'eb-msg')}>
                {copied === 'eb-msg' ? '✓ Copied' : 'Copy Message'}
              </button>
            </div>
          )}
          <div className="scenario-tip">
            💡 <strong>Pro tip:</strong> Even people who never booked you will appreciate this email. You're not selling — you're giving them a gift. 
            And every one of them who shops through your link earns you commission if you're on a paid plan.
          </div>
        </div>

        {/* =================== */}
        {/* SCENARIO: INSTAGRAM */}
        {/* =================== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">📸</span>
            <div>
              <h3>Instagram — Post & Story</h3>
              <p>One post, one story. Put your page link in your bio. People will DM you for the shopping link. That's a warm lead.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('ig-post')}>
            <span>📸 Instagram post caption</span>
            <span>{expandedMsg === 'ig-post' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'ig-post' && (
            <div className="msg-block">
              <pre className="msg-text">{igCaption}</pre>
              <button className={`copy-msg-btn ${copied === 'ig-msg' ? 'copied' : ''}`} onClick={() => copy(igCaption, 'ig-msg')}>
                {copied === 'ig-msg' ? '✓ Copied' : 'Copy Caption'}
              </button>
            </div>
          )}
          <div className="msg-toggle" onClick={() => toggle('ig-story')}>
            <span>📱 Instagram story text</span>
            <span>{expandedMsg === 'ig-story' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'ig-story' && (
            <div className="msg-block">
              <pre className="msg-text">{igStory}</pre>
              <button className={`copy-msg-btn ${copied === 'igs-msg' ? 'copied' : ''}`} onClick={() => copy(igStory, 'igs-msg')}>
                {copied === 'igs-msg' ? '✓ Copied' : 'Copy Text'}
              </button>
            </div>
          )}
        </div>

        {/* =================== */}
        {/* SCENARIO: EXPOS & EVENTS */}
        {/* =================== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">🎪</span>
            <div>
              <h3>Bridal Expos & Events</h3>
              <p>Print a card for your table. People remember the vendor who gave them something. Everyone else is handing out business cards — you're handing out 25% cashback.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('expo')}>
            <span>🪧 Card / flyer text</span>
            <span>{expandedMsg === 'expo' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'expo' && (
            <div className="msg-block">
              <pre className="msg-text">{expoCard}</pre>
              <button className={`copy-msg-btn ${copied === 'expo-msg' ? 'copied' : ''}`} onClick={() => copy(expoCard, 'expo-msg')}>
                {copied === 'expo-msg' ? '✓ Copied' : 'Copy Text'}
              </button>
            </div>
          )}
        </div>

        {/* =================== */}
        {/* SCENARIO: WHEN YOU CLOSE A CLIENT */}
        {/* =================== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">🤝</span>
            <div>
              <h3>When You Close a New Client</h3>
              <p>Make this part of how you do business from now on. Right before they leave, hand them the link. It's the last thing they remember about you — and it's a gift.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('close')}>
            <span>🗣️ What to say in person</span>
            <span>{expandedMsg === 'close' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'close' && (
            <div className="msg-block">
              <pre className="msg-text">{closingScript}</pre>
              <button className={`copy-msg-btn ${copied === 'close-msg' ? 'copied' : ''}`} onClick={() => copy(closingScript, 'close-msg')}>
                {copied === 'close-msg' ? '✓ Copied' : 'Copy Script'}
              </button>
            </div>
          )}
        </div>

        {/* =================== */}
        {/* SCENARIO: YOUR ADVERTISING */}
        {/* =================== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">📣</span>
            <div>
              <h3>Your Advertising & Online Presence</h3>
              <p>Add this to everything. It makes you different from every other vendor in your category.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('sig')}>
            <span>✍️ Email signature line</span>
            <span>{expandedMsg === 'sig' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'sig' && (
            <div className="msg-block">
              <pre className="msg-text">{emailSignature}</pre>
              <button className={`copy-msg-btn ${copied === 'sig-msg' ? 'copied' : ''}`} onClick={() => copy(emailSignature, 'sig-msg')}>
                {copied === 'sig-msg' ? '✓ Copied' : 'Copy Signature'}
              </button>
            </div>
          )}
          <div className="where-list">
            <h4>Put your link on:</h4>
            <div className="where-grid">
              {['Your website', 'Your Instagram bio', 'Your business cards', 'Your Google listing', 
                'Your email signature', 'Any directory you\'re on', 'Any ad you run', 'Your voicemail greeting'].map(s => (
                <span key={s} className="where-chip">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* AI CTA */}
        <div className="ai-card">
          <span className="ai-icon">✨</span>
          <div>
            <h4>Need something custom?</h4>
            <p>Tell Claude who you're writing to and what the situation is. It'll write the message for you — in your voice, with your links, ready to send.</p>
          </div>
          <Link href="/dashboard/assistant" className="ai-btn">Ask Claude →</Link>
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
        .page-content { padding: 28px 32px; max-width: 800px; }
        .clarity-banner {
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 10px;
          padding: 16px 20px;
          font-size: 13px;
          color: #6b5e52;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .clarity-banner strong { color: #2c2420; }
        .clarity-banner em { color: #c9944a; font-style: normal; font-weight: 600; }

        /* Scenarios */
        .scenario {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 16px;
        }
        .scenario.highlight {
          border-color: rgba(201,148,74,0.4);
          background: linear-gradient(135deg, rgba(201,148,74,0.03), #fff);
        }
        .scenario-header {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .scenario-num { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
        .scenario-header h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .scenario-header p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .scenario-tip {
          margin-top: 12px;
          padding: 12px 16px;
          background: rgba(201,148,74,0.06);
          border-radius: 8px;
          font-size: 13px;
          color: #6b5e52;
          line-height: 1.6;
        }
        .scenario-tip strong { color: #2c2420; }

        /* Links */
        .link-row {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .link-input {
          flex: 1;
          padding: 10px 12px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 12px;
          color: #4a3f35;
          font-family: inherit;
        }
        .copy-btn {
          padding: 10px 18px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }
        .copy-btn:hover { filter: brightness(1.1); }
        .copy-btn.copied { background: #22c55e; }

        /* Message toggles */
        .msg-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f3efe9;
          border-radius: 8px;
          font-size: 13px;
          color: #6b5e52;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 8px;
        }
        .msg-toggle:hover { background: #ebe5dc; }
        .msg-block { margin-top: 8px; }
        .msg-text {
          background: #f9f7f4;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          padding: 16px;
          font-size: 13px;
          color: #4a3f35;
          line-height: 1.7;
          white-space: pre-wrap;
          font-family: inherit;
          margin: 0;
        }
        .copy-msg-btn {
          margin-top: 8px;
          padding: 8px 16px;
          background: #e8e0d5;
          color: #2c2420;
          border: 1px solid #e4ddd4;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .copy-msg-btn.copied { background: #22c55e; color: #fff; border-color: #22c55e; }

        /* Where list */
        .where-list { margin-top: 16px; }
        .where-list h4 { font-size: 13px; font-weight: 700; color: #2c2420; margin: 0 0 10px; }
        .where-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .where-chip {
          padding: 6px 14px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 20px;
          font-size: 13px;
          color: #6b5e52;
        }

        /* AI Card */
        .ai-card {
          display: flex;
          gap: 16px;
          align-items: center;
          background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06));
          border: 1px solid rgba(147,130,220,0.25);
          border-radius: 14px;
          padding: 24px;
          margin-top: 8px;
        }
        .ai-icon { font-size: 32px; flex-shrink: 0; }
        .ai-card h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .ai-card p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .ai-btn {
          padding: 12px 24px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .ai-btn:hover { filter: brightness(1.1); }

        @media (max-width: 768px) {
          .page-content { padding: 20px; }
          .link-row { flex-wrap: wrap; }
          .ai-card { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_links_1770478954

echo "✅ Dashboard home and links pages updated!"
echo "Refresh your browser to see changes."
