#!/bin/bash
echo "🔑 Updating to v3 — WeTwo Wedding Buyers Club..."
cat > src/app/dashboard/page.tsx << 'ENDOFFILE_dash_v3'
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

        {/* The Club */}
        <div className="club-card">
          <div className="club-badge">🔑 MEMBER VENDOR</div>
          <h2 className="club-title">You are now a member of the WeTwo Wedding Buyers Club.</h2>
          <p className="club-text">
            This is an <strong>invitation-only</strong> network of wedding professionals. You were personally selected.
            The door is closed to vendors who weren't invited — and the cashback is closed to anyone who doesn't have a member's link.
          </p>
        </div>

        {/* The Key */}
        <div className="key-card">
          <div className="key-header">
            <span className="key-icon">🔐</span>
            <h2>You are the only way in.</h2>
          </div>
          <p className="key-text">
            There is <strong>no public link</strong>. There is no way to find this on Google, on Instagram, or on the WeTwo website.
            The 25% cashback <strong>does not exist</strong> for anyone unless they get it from a member vendor like you.
          </p>
          <p className="key-text">
            Every couple you work with. Every client you've ever had. Every person in your network.
            The <em>only way</em> they get access to 25% cashback on thousands of products is through you.
          </p>
          <p className="key-text" style={{ marginBottom: 0 }}>
            When someone shops through your link, the store says <strong>"Gift from {firstName}"</strong> — linked right back to your page.
            You're not sharing a coupon. You're handing someone a key that nobody else can give them.
          </p>
        </div>

        {/* What is it */}
        <div className="what-card">
          <h3>What are you giving them?</h3>
          <p>
            Access to a store with thousands of real products — furniture, kitchen, bedroom, fashion, outdoor — 
            plus <strong>25% cashback on everything</strong>. Every purchase. Every time. Forever.
          </p>
          <div className="what-callouts">
            <div className="callout">
              <span className="callout-icon">🎁</span>
              <div>
                <strong>It's a gift only you can give.</strong>
                <p>You're not selling anything. You're giving people exclusive access that they literally cannot get anywhere else. Not online. Not in stores. Only through you.</p>
              </div>
            </div>
            <div className="callout">
              <span className="callout-icon">💰</span>
              <div>
                <strong>It costs you nothing.</strong>
                <p>The 25% comes from WeTwo, not from you. Your services, your pricing — nothing changes. This is a completely separate program that lives outside your business.</p>
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
                <p className="link-desc">Registry link — their guests buy real gifts, couple gets 25% cash back. This registry doesn't exist for anyone who doesn't get your link.</p>
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
                <p className="link-desc">Clients. Friends. Followers. Expo visitors. You're giving them something exclusive that they cannot get anywhere else.</p>
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
            <div className="nudge-icon">⚠️</div>
            <div>
              <h4>Before you start sharing — read this.</h4>
              <p>
                Your links work right now. Anyone you share them with gets 25% cashback immediately.
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

        {/* What To Do */}
        <h3 className="section-heading">Here's Exactly What To Do</h3>
        <p className="section-intro">You hold the key. Now use it. Here's where to start — today.</p>

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
              <h4>Text your last 5 couples</h4>
              <p>Even couples from last year. Tell them: <em>"I was invited into the WeTwo Wedding Buyers Club — I can now give you exclusive access to 25% cashback on thousands of products. You can't get this anywhere else. Here's your link."</em></p>
              <Link href="/dashboard/links" className="play-link">Get the copy-paste message →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">3</div>
            <div className="play-content">
              <h4>Email every client from the past 5 years</h4>
              <p>One email to everyone. This is the big one: <em>"I'm now a member of an invitation-only program where I can give all my clients exclusive access to 25% cashback. This isn't available to the public — here's your link."</em> People who forgot about you now have a reason to think about you again.</p>
              <Link href="/dashboard/assistant" className="play-link">Have Claude write it for you →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">4</div>
            <div className="play-content">
              <h4>Post it on Instagram</h4>
              <p><em>"I'm now a member of the WeTwo Wedding Buyers Club 🔑 Everyone in my world gets exclusive access to 25% cashback on furniture, kitchen, and more. You can't find this anywhere — DM me for the link."</em> When they have to DM you, that's a warm lead walking through your door.</p>
              <Link href="/dashboard/links" className="play-link">Get an Instagram caption →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">5</div>
            <div className="play-content">
              <h4>Print it for your next expo</h4>
              <p>Card on your table: <em>"Exclusive Access — 25% cashback on everything. Only through {firstName}."</em> Everyone else is handing out business cards. You're handing out something nobody else in the room can offer.</p>
            </div>
          </div>

          <div className="play">
            <div className="play-number">6</div>
            <div className="play-content">
              <h4>Add it to everything</h4>
              <p>Website. Business cards. Email signature. Ads. One line: <em>"My clients get exclusive access to 25% cashback — ask me how."</em> No other vendor in your category can say this.</p>
            </div>
          </div>

          <div className="play">
            <div className="play-number">7</div>
            <div className="play-content">
              <h4>Make it part of every close</h4>
              <p>When someone books: <em>"One more thing — I'm a member of something exclusive. Through me, you get 25% cashback on thousands of products. Nobody else can give you this. Here's your link — it works forever."</em></p>
            </div>
          </div>
        </div>

        {/* AI */}
        <div className="ai-card">
          <span className="ai-icon">✨</span>
          <div>
            <h4>Not sure what to say? Claude will write it for you.</h4>
            <p>Tell Claude who you're writing to and it'll write the message in your voice, with your exclusive links baked in.</p>
          </div>
          <Link href="/dashboard/assistant" className="ai-btn">Ask Claude →</Link>
        </div>

        {isFree && (
          <div className="bottom-upgrade">
            <h4>The key is yours. The commission is optional.</h4>
            <p>
              Everything above works free — your exclusive links, your page, Claude, the contact form.
              To <strong>earn money</strong> on purchases your network makes, upgrade to a paid plan.
              $97/month earns you 10% on every purchase. A few couples a year pays for itself many times over.
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

        .club-card {
          background: linear-gradient(135deg, #2c2420, #1a1614); border-radius: 16px;
          padding: 36px 32px; margin-bottom: 20px; text-align: center;
        }
        .club-badge {
          display: inline-block; background: rgba(201,148,74,0.2); border: 1px solid rgba(201,148,74,0.4);
          color: #c9944a; padding: 4px 16px; border-radius: 20px; font-size: 11px;
          font-weight: 800; letter-spacing: 0.12em; margin-bottom: 16px;
        }
        .club-title {
          font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600;
          color: #fff; line-height: 1.3; margin: 0 0 12px;
        }
        .club-text {
          font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0;
          max-width: 600px; margin-left: auto; margin-right: auto;
        }
        .club-text strong { color: #c9944a; }

        .key-card {
          background: linear-gradient(135deg, rgba(201,148,74,0.08), rgba(201,148,74,0.02));
          border: 1px solid rgba(201,148,74,0.25); border-radius: 16px;
          padding: 32px; margin-bottom: 24px;
        }
        .key-header { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
        .key-icon { font-size: 32px; }
        .key-header h2 { font-family: 'Playfair Display', serif; font-size: 20px; color: #2c2420; margin: 0; }
        .key-text { font-size: 15px; color: #6b5e52; line-height: 1.7; margin: 0 0 12px; }
        .key-text strong { color: #2c2420; }
        .key-text em { color: #c9944a; font-style: normal; font-weight: 600; }

        .what-card { background: #fff; border: 1px solid #e4ddd4; border-radius: 14px; padding: 28px; margin-bottom: 28px; }
        .what-card h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .what-card > p { font-size: 14px; color: #6b5e52; line-height: 1.7; margin: 0 0 20px; }
        .what-card > p strong { color: #22c55e; }
        .what-callouts { display: flex; flex-direction: column; gap: 16px; }
        .callout { display: flex; gap: 14px; align-items: flex-start; }
        .callout-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .callout strong { font-size: 14px; color: #2c2420; display: block; margin-bottom: 2px; }
        .callout p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }

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

        .upgrade-nudge { display: flex; gap: 16px; align-items: flex-start; background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.3); border-radius: 14px; padding: 24px; margin-bottom: 32px; }
        .nudge-icon { font-size: 28px; flex-shrink: 0; }
        .upgrade-nudge h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .upgrade-nudge p { font-size: 14px; color: #6b5e52; margin: 0 0 6px; line-height: 1.6; }
        .upgrade-nudge p strong { color: #2c2420; }
        .nudge-btn { padding: 12px 24px; background: #c9944a; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; flex-shrink: 0; align-self: center; transition: all 0.2s; }
        .nudge-btn:hover { filter: brightness(1.1); }

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

        .ai-card { display: flex; gap: 16px; align-items: center; background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06)); border: 1px solid rgba(147,130,220,0.25); border-radius: 14px; padding: 24px; margin-bottom: 28px; }
        .ai-icon { font-size: 32px; flex-shrink: 0; }
        .ai-card h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .ai-card p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .ai-btn { padding: 12px 24px; background: #c9944a; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; flex-shrink: 0; transition: all 0.2s; }
        .ai-btn:hover { filter: brightness(1.1); }

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
          .club-card { padding: 28px 20px; }
          .key-card { padding: 24px 20px; }
          .upgrade-nudge { flex-direction: column; }
          .ai-card { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_dash_v3
cat > src/app/dashboard/links/page.tsx << 'ENDOFFILE_links_v3'
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

  // ---- MESSAGES ----

  const textToRecentCouple = `Hey! I have some exciting news 🎉

I was just invited to join the WeTwo Wedding Buyers Club — it's an invitation-only program for wedding professionals. What it means for you is I can now give you access to something nobody else can.

Through my membership, you can set up a wedding registry where you get 25% cashback on every gift your guests buy. Real stuff — furniture, kitchen, bedding, fashion, outdoor. And 25% of all of it comes back to you as cash.

This isn't available to the public. You can't Google it. The only way to get access is through a member like me.

Here's your exclusive link: ${registryLink}

Even after the wedding, the link works forever — you can shop anytime and still get 25% back. Congrats again! 💕

${firstName}`

  const textToPastCouple = `Hi! It's ${firstName} from ${biz} — hope you're doing amazing! 💕

I wanted to reach out because something exciting just happened. I was invited to join the WeTwo Wedding Buyers Club — it's an invitation-only program, and now I can give everyone in my world access to 25% cashback on thousands of products. Furniture, kitchen, bedding, clothing, outdoor — you name it.

Here's the thing — this is not available anywhere else. Not online, not in stores. The only way to get it is through a member, and that's me.

Here's your link: ${shopLink}

Use it anytime. It works forever. Think of it as my gift to you. 🎁`

  const emailToPastClients = `Subject: Something exclusive from ${firstName} — invitation only

Hi there,

I hope you're doing well! I'm reaching out because I was recently invited to join the WeTwo Wedding Buyers Club — an invitation-only program for select wedding professionals.

Here's what it means for you: through my membership, I can now give you exclusive access to 25% cashback on thousands of products. Furniture, kitchen essentials, bedding, clothing, fashion, outdoor items — real things you'd actually want to buy.

This is not available to the public. It's not on their website. You can't find it on Google or Instagram. The ONLY way to get 25% cashback is through a link from a member like me.

Here's your exclusive link: ${shopLink}

It works every time you shop. Not once — forever. No strings, no catches.

Getting married or know someone who is? I also have a link for a wedding registry where the couple gets 25% cashback on every single gift: ${registryLink}

Feel free to share either link with anyone you care about. The more people in your life who benefit, the better.

Warmly,
${firstName}
${biz}
WeTwo Wedding Buyers Club — Member Vendor`

  const emailToNewCouple = `Subject: You're invited — exclusive 25% cashback on your entire registry

Hi!

It was so great meeting you! I'm excited about your celebration and I wanted to give you something special.

I'm a member of the WeTwo Wedding Buyers Club — an invitation-only program for select wedding professionals. Through my membership, I can give you exclusive access to a wedding registry where you get 25% cashback on every gift your guests buy. Furniture, kitchen, bedding, fashion — real things for your new life together. And 25% of everything comes back to you as cash.

This isn't something you can find on your own. It's only available through a member, and I'm one of them.

Here's your exclusive link: ${registryLink}

You can use it alongside any other registry. And even after the wedding, the link works forever — shop anytime with 25% cashback.

Can't wait to help make your day beautiful!

${firstName}
${biz}
WeTwo Wedding Buyers Club`

  const igCaption = `🔑 I have some exciting news.

I was just invited to join the WeTwo Wedding Buyers Club — an invitation-only program for select wedding professionals.

What does it mean for you? Through my membership, everyone in my world now gets exclusive access to 25% cashback on EVERYTHING. Furniture. Kitchen. Bedroom. Fashion. Outdoor. Thousands of real products.

Here's the thing — this is NOT available to the public. You won't find it anywhere online. The only way to get 25% cashback is through a member's link. And I'm one of them.

Getting married? There's a registry where your guests buy real gifts and YOU get 25% back in cash 💍

DM me "LINK" for your exclusive access.

You can't get this anywhere else. This is my gift to you. 🎁

#WeTwoWeddingBuyersClub #ExclusiveAccess #WeddingVendor #25Cashback`

  const igStory = `🔑 BIG NEWS

I just joined the WeTwo Wedding Buyers Club
(invitation-only for wedding professionals)

What it means for YOU:
→ 25% cashback on EVERYTHING
→ Furniture, kitchen, fashion, bedroom
→ NOT available to the public
→ You can ONLY get it through a member like me

DM me "LINK" for exclusive access 🎁`

  const expoCard = `🔑 Exclusive Access from ${firstName}
━━━━━━━━━━━━━━━━━━━

25% cashback on everything.
Furniture. Kitchen. Fashion. Bedroom.

Not available to the public.
Only through a WeTwo Wedding Buyers Club member.

Shop: ${shopLink}
Registry: ${registryLink}

Scan for exclusive access →
[QR CODE HERE]

━━━━━━━━━━━━━━━━━━━
${biz} — WeTwo Wedding Buyers Club`

  const emailSignature = `—
${firstName} | ${biz}
🔑 WeTwo Wedding Buyers Club Member — Ask me about exclusive 25% cashback → ${shopLink}`

  const closingScript = `"One more thing before you go — I'm a member of the WeTwo Wedding Buyers Club. It's an invitation-only program for wedding professionals, and through my membership I can give you something nobody else can. You get 25% cashback on thousands of products — furniture, kitchen, bedroom, fashion, everything. This isn't available to the public. You literally cannot get this deal anywhere else. Let me text you the link right now — it's my gift to you, and it works forever."`

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Your Links & Messages</h1>
          <p className="page-subtitle">Copy, paste, send. Exclusivity built into every word.</p>
        </div>
      </header>

      <div className="page-content">

        <div className="key-banner">
          <div className="key-icon">🔑</div>
          <div>
            <strong>You are the key.</strong> There is no public link. There is no way to find this anywhere.
            The only way anyone gets 25% cashback is through a WeTwo Wedding Buyers Club member like you. Every message below makes that clear.
          </div>
        </div>

        {/* RECENT COUPLES */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">💍</span>
            <div>
              <h3>Couples You're Talking To Now</h3>
              <p>Anyone you've met recently, are in talks with, or just booked. They can't get this deal without you.</p>
            </div>
          </div>
          <div className="link-row">
            <input type="text" value={registryLink} readOnly className="link-input" />
            <button className={`copy-btn ${copied === 'reg' ? 'copied' : ''}`} onClick={() => copy(registryLink, 'reg')}>
              {copied === 'reg' ? '✓' : 'Copy Link'}
            </button>
          </div>
          <div className="msg-toggle" onClick={() => toggle('recent-couple')}>
            <span>📱 Text message to a current couple</span>
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
            <span>✉️ Email to a new couple</span>
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

        {/* PAST COUPLES */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">💌</span>
            <div>
              <h3>Couples From the Past</h3>
              <p>Even couples who got married years ago. They're still buying things for their home. You now have the perfect reason to reach back out — and they'll thank you.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('past-couple')}>
            <span>📱 Text to a past couple</span>
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

        {/* EMAIL LIST — THE BIG ONE */}
        <div className="scenario highlight">
          <div className="scenario-header">
            <span className="scenario-num">📧</span>
            <div>
              <h3>Your Entire Contact List — Past 5 Years</h3>
              <p>This is the big one. Every person who ever inquired, every client, every cold lead. One email. You're not selling — you're giving them exclusive access to something they can't get anywhere else. People who forgot about you suddenly have a reason to reach back out.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('email-blast')}>
            <span>✉️ The email to send your entire list</span>
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
            💡 <strong>This is your reactivation play.</strong> Even people who never booked you will appreciate this. You're giving them a gift only you can give.
            And if you're on a paid plan, every person who shops earns you commission.
          </div>
        </div>

        {/* INSTAGRAM */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">📸</span>
            <div>
              <h3>Instagram — Post & Story</h3>
              <p>The exclusivity does the work. "DM me for the link" turns followers into warm leads reaching out to YOU.</p>
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

        {/* EXPOS */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">🎪</span>
            <div>
              <h3>Bridal Expos & Events</h3>
              <p>Everyone else hands out business cards. You hand out exclusive access. Nobody else in the room can offer this.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('expo')}>
            <span>🪧 Card / flyer text for your table</span>
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

        {/* CLOSING */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">🤝</span>
            <div>
              <h3>When You Close a New Client</h3>
              <p>Make this part of every booking. It's the last thing they hear — a gift only you can give. They'll remember that.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('close')}>
            <span>🗣️ What to say in person (word for word)</span>
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

        {/* ADVERTISING */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">📣</span>
            <div>
              <h3>Your Advertising & Online Presence</h3>
              <p>No other vendor in your category can offer this. Put it everywhere.</p>
            </div>
          </div>
          <div className="msg-toggle" onClick={() => toggle('sig')}>
            <span>✍️ Email signature</span>
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
            <h4>Put your link everywhere:</h4>
            <div className="where-grid">
              {['Your website', 'Instagram bio', 'Business cards', 'Google listing', 'Email signature', 'Directory profiles', 'Every ad you run', 'Voicemail greeting'].map(s => (
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
            <p>Tell Claude who you're writing to. It'll write the message in your voice with your exclusive links and Members Club positioning baked in.</p>
          </div>
          <Link href="/dashboard/assistant" className="ai-btn">Ask Claude →</Link>
        </div>

      </div>

      <style jsx>{`
        .page-header { background: #fff; border-bottom: 1px solid #e4ddd4; padding: 20px 32px; position: sticky; top: 0; z-index: 50; }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .page-content { padding: 28px 32px; max-width: 800px; }

        .key-banner { display: flex; gap: 16px; align-items: flex-start; background: linear-gradient(135deg, #2c2420, #3d332c); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; }
        .key-icon { font-size: 28px; flex-shrink: 0; }
        .key-banner strong { color: #c9944a; }

        .scenario { background: #fff; border: 1px solid #e4ddd4; border-radius: 14px; padding: 24px; margin-bottom: 16px; }
        .scenario.highlight { border-color: rgba(201,148,74,0.4); background: linear-gradient(135deg, rgba(201,148,74,0.03), #fff); }
        .scenario-header { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; }
        .scenario-num { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
        .scenario-header h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .scenario-header p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .scenario-tip { margin-top: 12px; padding: 12px 16px; background: rgba(201,148,74,0.06); border-radius: 8px; font-size: 13px; color: #6b5e52; line-height: 1.6; }
        .scenario-tip strong { color: #2c2420; }

        .link-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .link-input { flex: 1; padding: 10px 12px; background: #f3efe9; border: 1px solid #e4ddd4; border-radius: 8px; font-size: 12px; color: #4a3f35; font-family: inherit; }
        .copy-btn { padding: 10px 18px; background: #c9944a; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap; }
        .copy-btn:hover { filter: brightness(1.1); }
        .copy-btn.copied { background: #22c55e; }

        .msg-toggle { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f3efe9; border-radius: 8px; font-size: 13px; color: #6b5e52; cursor: pointer; transition: all 0.15s; margin-top: 8px; }
        .msg-toggle:hover { background: #ebe5dc; }
        .msg-block { margin-top: 8px; }
        .msg-text { background: #f9f7f4; border: 1px solid #e4ddd4; border-radius: 8px; padding: 16px; font-size: 13px; color: #4a3f35; line-height: 1.7; white-space: pre-wrap; font-family: inherit; margin: 0; }
        .copy-msg-btn { margin-top: 8px; padding: 8px 16px; background: #e8e0d5; color: #2c2420; border: 1px solid #e4ddd4; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .copy-msg-btn.copied { background: #22c55e; color: #fff; border-color: #22c55e; }

        .where-list { margin-top: 16px; }
        .where-list h4 { font-size: 13px; font-weight: 700; color: #2c2420; margin: 0 0 10px; }
        .where-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .where-chip { padding: 6px 14px; background: #f3efe9; border: 1px solid #e4ddd4; border-radius: 20px; font-size: 13px; color: #6b5e52; }

        .ai-card { display: flex; gap: 16px; align-items: center; background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06)); border: 1px solid rgba(147,130,220,0.25); border-radius: 14px; padding: 24px; margin-top: 8px; }
        .ai-icon { font-size: 32px; flex-shrink: 0; }
        .ai-card h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .ai-card p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .ai-btn { padding: 12px 24px; background: #c9944a; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; flex-shrink: 0; transition: all 0.2s; }
        .ai-btn:hover { filter: brightness(1.1); }

        @media (max-width: 768px) {
          .page-content { padding: 20px; }
          .link-row { flex-wrap: wrap; }
          .ai-card { flex-direction: column; text-align: center; }
          .key-banner { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_links_v3
echo "✅ Updated! Refresh your browser."
echo "   Dashboard: Wedding Buyers Club + velvet rope positioning"
echo "   Links: All messages rewritten with exclusivity built in"
