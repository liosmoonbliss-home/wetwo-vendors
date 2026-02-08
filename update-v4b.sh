#!/bin/bash
echo "🔑 Updating to v4 — Network Effect + Floating Claude Widget..."
echo ""

# Create directories if needed
mkdir -p src/app/dashboard/components
mkdir -p src/app/dashboard/links
mkdir -p src/app/dashboard/assistant
mkdir -p src/app/api/vendor-assistant
cat > src/app/dashboard/page.tsx << 'EOF_DASH'
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

        {/* THE NETWORK EFFECT — NEW */}
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
                <p>They land on your page — the beautiful page we built for you. It's the ultimate conversion tool. Your bio, your work, your contact form, your links. They see what you do. They reach out.</p>
              </div>
            </div>
            <div className="net-step">
              <div className="net-num">3</div>
              <div>
                <strong>They share with their people.</strong>
                <p>"My wedding vendor got me 25% cashback on everything." They tell their friends. They text the link. Your name is on it. Every person who receives that link sees your name again.</p>
              </div>
            </div>
            <div className="net-step">
              <div className="net-num">4</div>
              <div>
                <strong>It compounds.</strong>
                <p>50 people sharing your link = hundreds of impressions. One couple's registry = 150 guests who see your brand. One Instagram post = dozens of DMs. And every single person who clicks your link lands on <em>your</em> page.</p>
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
            <p className="net-bottom-text">
              The more you put your link out there, the more it multiplies. Every person becomes a node in your network. Your name, your page, your brand — everywhere.
            </p>
          </div>
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
                <p className="link-desc">Registry link — their guests buy real gifts, couple gets 25% cash back. Every guest sees your name. This registry doesn't exist without you.</p>
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
                <p className="link-desc">Clients. Friends. Followers. Expo visitors. Everyone who clicks sees your name and page. Everyone they share with sees you too.</p>
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
        <p className="section-intro">You hold the key. Now use it. Every person you reach grows your network.</p>

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
              <p>Even couples from last year. <em>"I was invited into the WeTwo Wedding Buyers Club — I can now give you exclusive access to 25% cashback. You can't get this anywhere else."</em> Every couple who uses the registry puts your name in front of all their guests.</p>
              <Link href="/dashboard/links" className="play-link">Get the copy-paste message →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">3</div>
            <div className="play-content">
              <h4>Email every client from the past 5 years</h4>
              <p>One email to everyone. This is the big one. Every person who clicks your link lands on your page. Every person who shares it spreads your name further. One email, massive reach.</p>
              <Link href="/dashboard/assistant" className="play-link">Have Claude write it for you →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">4</div>
            <div className="play-content">
              <h4>Post it on Instagram</h4>
              <p><em>"I'm now a member of the WeTwo Wedding Buyers Club 🔑 DM me for exclusive access."</em> Every DM is a warm lead. Every person who gets your link sees your name and page. They share it. It compounds.</p>
              <Link href="/dashboard/links" className="play-link">Get an Instagram caption →</Link>
            </div>
          </div>

          <div className="play">
            <div className="play-number">5</div>
            <div className="play-content">
              <h4>Print it for your next expo</h4>
              <p><em>"Exclusive Access — 25% cashback on everything. Only through {firstName}."</em> Everyone else hands out business cards. You hand out a key to something nobody else can offer. Every person who scans that QR code sees your page.</p>
            </div>
          </div>

          <div className="play">
            <div className="play-number">6</div>
            <div className="play-content">
              <h4>Add it to everything</h4>
              <p>Website. Business cards. Email signature. Every ad. One line: <em>"My clients get exclusive 25% cashback — ask me how."</em> No other vendor in your category can say this. Every click = your page = your network grows.</p>
            </div>
          </div>

          <div className="play">
            <div className="play-number">7</div>
            <div className="play-content">
              <h4>Make it part of every close</h4>
              <p>When someone books you: <em>"One more thing — through my membership, you get 25% cashback on thousands of products. Nobody else can give you this."</em> They tell their friends. Their friends see your name. Your network grows.</p>
            </div>
          </div>
        </div>

        {/* Claude CTA — UPGRADED */}
        <div className="claude-card">
          <div className="claude-header">
            <span className="claude-icon">✨</span>
            <div>
              <h3>Claude knows everything about your Buyers Club membership.</h3>
              <p>Need a message written? Want to understand how something works? Have a marketing question? Claude is your personal advisor — not just a copywriter. Ask anything.</p>
            </div>
          </div>
          <div className="claude-examples">
            <span className="claude-chip" onClick={() => {}}>✍️ "Write an email to my list"</span>
            <span className="claude-chip" onClick={() => {}}>🔑 "How does the network effect work?"</span>
            <span className="claude-chip" onClick={() => {}}>💰 "Should I upgrade before sharing?"</span>
            <span className="claude-chip" onClick={() => {}}>💡 "Give me 5 marketing ideas"</span>
          </div>
          <Link href="/dashboard/assistant" className="claude-btn">Talk to Claude →</Link>
        </div>

        {isFree && (
          <div className="bottom-upgrade">
            <h4>The key is yours. The commission is optional.</h4>
            <p>
              Everything above works free — your exclusive links, your page, Claude, the contact form, the network effect.
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
          padding: 32px; margin-bottom: 20px;
        }
        .key-header { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
        .key-icon { font-size: 32px; }
        .key-header h2 { font-family: 'Playfair Display', serif; font-size: 20px; color: #2c2420; margin: 0; }
        .key-text { font-size: 15px; color: #6b5e52; line-height: 1.7; margin: 0 0 12px; }
        .key-text strong { color: #2c2420; }
        .key-text em { color: #c9944a; font-style: normal; font-weight: 600; }

        /* NETWORK EFFECT CARD */
        .network-card {
          background: #fff; border: 2px solid rgba(59,130,246,0.2); border-radius: 16px;
          padding: 32px; margin-bottom: 24px;
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

        .network-bottom {
          background: rgba(59,130,246,0.04); border-radius: 12px; padding: 20px;
        }
        .net-flow {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          justify-content: center; margin-bottom: 12px;
        }
        .flow-step {
          padding: 6px 12px; background: #fff; border: 1px solid #e4ddd4;
          border-radius: 8px; font-size: 12px; font-weight: 600; color: #2c2420;
        }
        .flow-step.highlight { background: #3b82f6; color: #fff; border-color: #3b82f6; }
        .flow-arrow { color: #9a8d80; font-size: 14px; }
        .net-bottom-text {
          font-size: 14px; color: #6b5e52; text-align: center; line-height: 1.6; margin: 0;
        }

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

        /* CLAUDE CARD — UPGRADED */
        .claude-card {
          background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06));
          border: 2px solid rgba(147,130,220,0.25); border-radius: 16px; padding: 28px; margin-bottom: 28px;
        }
        .claude-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
        .claude-icon { font-size: 36px; flex-shrink: 0; }
        .claude-card h3 { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 6px; line-height: 1.3; }
        .claude-card p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.6; }
        .claude-examples { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .claude-chip {
          padding: 8px 14px; background: rgba(255,255,255,0.7); border: 1px solid rgba(147,130,220,0.2);
          border-radius: 20px; font-size: 12px; color: #6b5e52; cursor: default;
        }
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
          .club-card { padding: 28px 20px; }
          .key-card { padding: 24px 20px; }
          .network-card { padding: 24px 20px; }
          .upgrade-nudge { flex-direction: column; }
          .claude-header { flex-direction: column; }
          .net-flow { flex-direction: column; gap: 4px; }
          .flow-arrow { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  )
}

EOF_DASH
echo "  ✅ Dashboard — network effect + Claude card"
cat > src/app/dashboard/links/page.tsx << 'EOF_LINKS'
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

EOF_LINKS
echo "  ✅ Links — exclusivity messaging"
cat > src/app/api/vendor-assistant/route.ts << 'EOF_API'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function buildSystemPrompt(vendor: any) {
  const biz = vendor.business_name || 'the vendor\'s business'
  const name = vendor.contact_name || ''
  const firstName = name.split(' ')[0] || 'the vendor'
  const cat = vendor.category || 'wedding services'
  const city = vendor.city || ''
  const state = vendor.state || ''
  const location = [city, state].filter(Boolean).join(', ')
  const shopLink = `https://wetwo.love?ref=vendor-${vendor.ref}`
  const registryLink = `https://wetwo.love/couple/signup?ref=vendor-${vendor.ref}`
  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`

  return `You are Claude — the AI assistant inside the WeTwo Wedding Buyers Club vendor dashboard.
You work for ${biz}${name ? ` (run by ${firstName})` : ''}, a ${cat} vendor${location ? ` in ${location}` : ''}.

You have TWO roles:

## ROLE 1: COPYWRITER
Write emails, texts, Instagram captions, follow-ups, and marketing messages in ${firstName}'s voice.
- Write as ${firstName}, not as AI
- Always include the correct link (registry for couples, shop for everyone else)
- Be warm, genuine, human — not corporate or salesy
- Never oversell or use hype language

## ROLE 2: SYSTEM EXPERT & BUSINESS ADVISOR
Answer any question about the WeTwo Wedding Buyers Club, how the links work, marketing strategy, business ideas, and more.
If someone asks "what is a reactivation campaign" or "how does commission work" or "what should I do first" — you know the answer.

---

## THE WETWO WEDDING BUYERS CLUB — COMPLETE GUIDE

### What It Is
The WeTwo Wedding Buyers Club is an INVITATION-ONLY network of wedding professionals. ${firstName} was personally selected as a member vendor. The door is closed to vendors who weren't invited.

### The Core Power
${firstName} holds the ONLY way for anyone to get 25% cashback on the WeTwo store. There is:
- NO public link anywhere
- NO way to find it on Google, Instagram, or the WeTwo website
- NO access without a member vendor's link
The 25% cashback literally does not exist for anyone unless they get it through a member like ${firstName}.

### What People Get
Access to a store with thousands of real products — furniture, kitchen, bedroom, fashion, outdoor gear — at good prices, plus 25% cashback on every purchase, forever. Not a one-time deal. Every purchase, every time, forever.

### How the Branding Works
When someone shops through ${firstName}'s link, the store says "Gift from ${firstName}" — linked right back to their vendor page (${pageLink}). ${firstName} gets the credit. The customer remembers them.

### The Viral Network Effect (THIS IS HUGE)
This is not just one-to-one sharing. Every person ${firstName} gives the link to becomes a node that spreads their name:
- **Couples' registries:** Every wedding guest who visits the registry sees "${firstName}" and can click through to their page. A wedding with 150 guests = 150 people who see ${firstName}'s name and link.
- **Social sharing:** When someone gets a great deal, they tell people. "My wedding vendor got me 25% cashback on everything." Word spreads.
- **The vendor page:** Every person who clicks a link lands on or can find ${firstName}'s page — the ultimate conversion tool. Beautiful, professional, with a contact form.
- **Compounding reach:** The more people ${firstName} shares with → the more people see their name → the more people visit their page → the more leads, bookings, and network growth.
- ${firstName}'s name and link live on every page, every purchase confirmation, every registry. It's everywhere.

### The 3 Links
1. **Personal shopping** (${shopLink}) — For ${firstName} personally, or for anyone who just wants to shop with 25% cashback
2. **Couples registry** (${registryLink}) — For couples to set up a wedding registry where guests buy gifts and the couple gets 25% cashback
3. **The vendor page** (${pageLink}) — ${firstName}'s beautiful landing page that converts visitors into leads and clients

### Commission & Plans
- **Free plan:** Links work, page is live, AI assistant works. But ${firstName} earns $0 on purchases.
- **Starter ($97/mo):** 10% commission on every purchase through their links
- **Growth ($197/mo):** 15% commission — most popular
- **Pro ($297/mo):** 20% commission
The 25% cashback is always paid by WeTwo, never by ${firstName}. Commission is on top of that — it's ${firstName}'s cut for being the one who brought the customer.

### The Math
Average couple spends ~$5,000+ on home products in the first year. At 10% commission = $500 per couple. 2-3 couples per year = $1,000-$1,500 in commission. Plus every non-couple client who shops. The $97/month plan costs $1,164/year — 2-3 couples covers it.

### Marketing Strategies You Should Know About

**Reactivation Campaign:** Sending a single email or text to every past client and lead from the past 5 years. Not selling anything — just giving them access to the exclusive 25% cashback. This "wakes up" people who forgot about ${firstName} and gives them a reason to think about them again. It's one of the most powerful moves because it costs nothing, takes 5 minutes, and reaches everyone at once.

**Closing Gift Strategy:** When ${firstName} books a new client, they hand them the link as the last thing before they leave: "One more thing — as my client, you get exclusive access to 25% cashback on thousands of products. Nobody else can give you this." It's the last thing the client remembers. It's a gift. It costs nothing.

**Instagram DM Strategy:** Post that you have exclusive access, say "DM me LINK for access." This forces followers to reach out — turning passive followers into warm leads who are actively engaging.

**Expo/Event Strategy:** Print cards with the link and a QR code. "Exclusive Access — 25% cashback on everything. Only through ${firstName}." Everyone else at the expo is handing out business cards. ${firstName} is handing out something people actually want and can't get anywhere else.

**Email Signature Play:** Add one line to your email signature: "🔑 WeTwo Wedding Buyers Club Member — Ask me about exclusive 25% cashback." Every email ${firstName} sends becomes a passive marketing touch.

**The Compounding Play:** The more people who have ${firstName}'s link → the more people see their name → the more people visit their page → the more leads come in. This compounds over time. 50 people sharing = hundreds of impressions. A wedding registry with 150 guests = 150 people who see ${firstName}'s brand.

### What ${firstName} Should NOT Say
- Never imply they pay the 25% cashback (WeTwo pays it)
- Never call it a discount on their own services
- Never make it sound like a pyramid scheme or MLM — it's a simple cashback program
- Never say the link is available to the public (it's not)

### Important Context
- ${firstName}'s services, pricing, and business are completely separate from this
- This is an additional value they can offer clients at zero cost
- The vendor page (${pageLink}) was custom-designed for them
- The contact form on their page sends leads directly to their dashboard

---

## ${firstName}'s Info
- Business: ${biz}
- Category: ${cat}
- Location: ${location || 'not specified'}
- Instagram: ${vendor.instagram_handle || 'not provided'}
- Plan: ${vendor.plan || 'free'}
- Shop link: ${shopLink}
- Registry link: ${registryLink}
- Page: ${pageLink}

## How To Respond
- If they ask for copy/messages → write it in their voice, include correct links
- If they ask how something works → explain clearly using the guide above
- If they ask for ideas → give specific, actionable marketing strategies
- If they ask about commission/plans → explain the math honestly
- If they seem confused → simplify, use examples, be patient
- Always be concise. Vendors are busy people, not marketers.
- Use plain language. No jargon unless they ask for it.
- When explaining marketing concepts (like "reactivation"), define them simply first.`
}

export async function POST(req: NextRequest) {
  try {
    const { messages, vendor } = await req.json()

    if (!messages || !vendor) {
      return NextResponse.json({ error: 'Messages and vendor data required' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(vendor)

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }))

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: formattedMessages,
    })

    const textContent = response.content.find((c: any) => c.type === 'text')
    const text = textContent ? (textContent as any).text : 'Sorry, I couldn\'t generate a response.'

    return NextResponse.json({ response: text })
  } catch (err) {
    console.error('Vendor assistant error:', err)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}

EOF_API
echo "  ✅ Claude API — full system knowledge"
cat > src/app/dashboard/assistant/page.tsx << 'EOF_ASST'
'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WRITE_PROMPTS = [
  { label: '📩 Email to a new couple', prompt: 'Write a warm email to a new engaged couple introducing the WeTwo Wedding Buyers Club registry and 25% cashback. Make the exclusivity clear.' },
  { label: '💬 Text a past client', prompt: 'Write a text message to a past client I haven\'t spoken to in a while, sharing my exclusive WeTwo cashback link as a gift.' },
  { label: '📧 Email my entire list', prompt: 'Write a reactivation email I can send to my entire contact list from the past 5 years, introducing the WeTwo Wedding Buyers Club and my exclusive cashback link.' },
  { label: '📸 Instagram caption', prompt: 'Write an Instagram caption announcing that I\'m a member of the WeTwo Wedding Buyers Club and my followers can DM me for exclusive access to 25% cashback.' },
  { label: '📱 Instagram story', prompt: 'Write short punchy text for an Instagram story about being a WeTwo Wedding Buyers Club member.' },
  { label: '🤝 What to say when I close', prompt: 'Write the exact words I should say to a new client at the end of a meeting to introduce the 25% cashback as a gift only I can give them.' },
]

const LEARN_PROMPTS = [
  { label: '🔑 How does the Buyers Club work?', prompt: 'Explain how the WeTwo Wedding Buyers Club works in simple terms. What am I actually giving people?' },
  { label: '📈 How does the viral effect work?', prompt: 'Explain how sharing my link creates a network effect. How does my reach grow when couples use the registry? How do more people see my name?' },
  { label: '💰 How does commission work?', prompt: 'Explain how commission works. What are the plans, what do I earn, and what\'s the math on making it worthwhile?' },
  { label: '🔄 What is a reactivation campaign?', prompt: 'What is a reactivation campaign and how do I do one? Give me a step-by-step plan.' },
  { label: '💡 Give me 5 marketing ideas', prompt: 'Give me 5 specific, actionable things I can do this week to share my WeTwo link and grow my network. Keep it simple — I\'m not a marketer.' },
  { label: '⚠️ Should I upgrade before sharing?', prompt: 'Should I upgrade to a paid plan before I start sharing my links? What happens if I don\'t?' },
]

export default function AssistantPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/vendor-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          vendor
        })
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  const copyMessage = (index: number, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!vendor) return null

  const firstName = (vendor.contact_name || vendor.business_name || '').split(' ')[0]

  return (
    <div className="assistant-container">
      {/* Chat Area */}
      <div className="chat-area">
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-icon">✨</div>
            <h2>Hey {firstName} — I'm Claude.</h2>
            <p className="welcome-sub">
              I know everything about the WeTwo Wedding Buyers Club. I can write messages for you, 
              explain how things work, give you marketing ideas, or answer any question you have. 
              Just ask.
            </p>

            <div className="prompt-section">
              <h4 className="prompt-section-title">✍️ Write something for me</h4>
              <div className="prompts-grid">
                {WRITE_PROMPTS.map((p, i) => (
                  <button key={i} className="prompt-btn" onClick={() => sendMessage(p.prompt)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="prompt-section">
              <h4 className="prompt-section-title">🔑 Help me understand</h4>
              <div className="prompts-grid">
                {LEARN_PROMPTS.map((p, i) => (
                  <button key={i} className="prompt-btn learn" onClick={() => sendMessage(p.prompt)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <div className="message-avatar">
                  {m.role === 'user' ? '👤' : '✨'}
                </div>
                <div className="message-content">
                  <div className="message-text">{m.content}</div>
                  {m.role === 'assistant' && (
                    <button
                      className={`copy-msg-btn ${copied === i ? 'copied' : ''}`}
                      onClick={() => copyMessage(i, m.content)}
                    >
                      {copied === i ? '✓ Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">✨</div>
                <div className="message-content">
                  <div className="typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick prompts when in conversation */}
      {messages.length > 0 && (
        <div className="quick-bar">
          {[...WRITE_PROMPTS.slice(0, 3), ...LEARN_PROMPTS.slice(0, 2)].map((p, i) => (
            <button key={i} className="quick-btn" onClick={() => sendMessage(p.prompt)} disabled={loading}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything — write a message, explain how something works, give me ideas..."
          rows={2}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          {loading ? '...' : '→'}
        </button>
      </div>

      <style jsx>{`
        .assistant-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #faf8f5;
        }
        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
        }

        /* Welcome */
        .welcome {
          max-width: 680px;
          margin: 0 auto;
          padding-top: 24px;
        }
        .welcome-icon { font-size: 48px; margin-bottom: 12px; }
        .welcome h2 {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          color: #2c2420;
          margin: 0 0 8px;
        }
        .welcome-sub {
          font-size: 15px;
          color: #6b5e52;
          line-height: 1.6;
          margin: 0 0 32px;
          max-width: 520px;
        }

        .prompt-section { margin-bottom: 24px; }
        .prompt-section-title {
          font-size: 13px;
          font-weight: 700;
          color: #9a8d80;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 12px;
        }
        .prompts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 8px;
        }
        .prompt-btn {
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 10px;
          font-size: 13px;
          color: #2c2420;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .prompt-btn:hover { border-color: #c9944a; background: rgba(201,148,74,0.04); }
        .prompt-btn.learn { border-left: 3px solid #c9944a; }
        .prompt-btn.learn:hover { background: rgba(201,148,74,0.06); }

        /* Messages */
        .messages { max-width: 720px; margin: 0 auto; }
        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: flex-start;
        }
        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          background: #f3efe9;
        }
        .message.assistant .message-avatar { background: linear-gradient(135deg, #c9944a, #d4a76a); }
        .message-content { flex: 1; min-width: 0; }
        .message-text {
          font-size: 14px;
          line-height: 1.7;
          color: #2c2420;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .message.user .message-text {
          background: #2c2420;
          color: #fff;
          padding: 12px 16px;
          border-radius: 12px 12px 12px 2px;
        }
        .message.assistant .message-text {
          background: #fff;
          border: 1px solid #e4ddd4;
          padding: 16px;
          border-radius: 2px 12px 12px 12px;
        }
        .copy-msg-btn {
          margin-top: 6px;
          padding: 4px 12px;
          background: transparent;
          border: 1px solid #e4ddd4;
          border-radius: 6px;
          font-size: 11px;
          color: #9a8d80;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .copy-msg-btn:hover { border-color: #c9944a; color: #c9944a; }
        .copy-msg-btn.copied { background: #22c55e; color: #fff; border-color: #22c55e; }

        /* Typing indicator */
        .typing { display: flex; gap: 4px; padding: 12px 16px; }
        .typing span {
          width: 8px; height: 8px; background: #c9944a; border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.15s; }
        .typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Quick bar */
        .quick-bar {
          display: flex;
          gap: 6px;
          padding: 8px 32px;
          overflow-x: auto;
          border-top: 1px solid #e4ddd4;
          background: #fff;
        }
        .quick-btn {
          padding: 6px 12px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 16px;
          font-size: 11px;
          color: #6b5e52;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
          transition: all 0.15s;
        }
        .quick-btn:hover { border-color: #c9944a; }
        .quick-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Input */
        .input-area {
          display: flex;
          gap: 8px;
          padding: 16px 32px 24px;
          background: #fff;
          border-top: 1px solid #e4ddd4;
        }
        .input-area textarea {
          flex: 1;
          padding: 12px 16px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          font-size: 14px;
          color: #2c2420;
          font-family: inherit;
          resize: none;
          line-height: 1.5;
        }
        .input-area textarea:focus { outline: none; border-color: #c9944a; }
        .input-area textarea::placeholder { color: #9a8d80; }
        .send-btn {
          width: 48px;
          height: 48px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
          align-self: flex-end;
        }
        .send-btn:hover { filter: brightness(1.1); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .chat-area { padding: 16px; }
          .input-area { padding: 12px 16px 20px; }
          .quick-bar { padding: 8px 16px; }
          .prompts-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

EOF_ASST
echo "  ✅ Claude page — advisor + copywriter"
cat > src/app/dashboard/components/ClaudeWidget.tsx << 'EOF_WIDGET'
'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTER_QUESTIONS = [
  { label: '🔑 How does this work?', prompt: 'I\'m new here. Can you explain how the WeTwo Wedding Buyers Club works in simple terms? What am I giving people and how does it all work?' },
  { label: '💰 What does it cost?', prompt: 'What does this cost me? How does pricing and commission work? Break it down simply.' },
  { label: '🚀 What should I do first?', prompt: 'I just got access to my dashboard. What should I do first? Give me a simple step-by-step.' },
  { label: '📈 How do I make money?', prompt: 'How do I actually make money with this? Explain the commission and give me the math.' },
]

export default function ClaudeWidget() {
  const [open, setOpen] = useState(false)
  const [vendor, setVendor] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setHasInteracted(true)
    const userMsg: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/vendor-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          vendor
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }

    setLoading(false)
  }

  const copyText = (index: number, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!vendor) return null

  const firstName = (vendor.contact_name || vendor.business_name || '').split(' ')[0]

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button className="widget-trigger" onClick={() => setOpen(true)}>
          <span className="trigger-icon">✨</span>
          <span className="trigger-text">Ask Claude</span>
          {!hasInteracted && <span className="trigger-pulse" />}
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="widget-panel">
          {/* Header */}
          <div className="widget-header">
            <div className="widget-header-left">
              <span className="widget-avatar">✨</span>
              <div>
                <div className="widget-title">Claude</div>
                <div className="widget-status">Your WeTwo advisor — ask anything</div>
              </div>
            </div>
            <button className="widget-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="widget-messages">
            {messages.length === 0 ? (
              <div className="widget-welcome">
                <p className="welcome-text">
                  Hey {firstName}! 👋 I know everything about the WeTwo Wedding Buyers Club.
                  Ask me anything — how it works, what to do, ideas, or I can write messages for you.
                </p>
                <div className="starter-grid">
                  {STARTER_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      className="starter-btn"
                      onClick={() => sendMessage(q.prompt)}
                      disabled={loading}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    {m.role === 'assistant' && <span className="msg-avatar">✨</span>}
                    <div className="msg-bubble">
                      <div className="msg-text">{m.content}</div>
                      {m.role === 'assistant' && (
                        <button
                          className={`msg-copy ${copied === i ? 'copied' : ''}`}
                          onClick={() => copyText(i, m.content)}
                        >
                          {copied === i ? '✓' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="msg assistant">
                    <span className="msg-avatar">✨</span>
                    <div className="msg-bubble">
                      <div className="typing"><span /><span /><span /></div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts when in conversation */}
          {messages.length > 0 && messages.length < 6 && (
            <div className="widget-quick">
              {STARTER_QUESTIONS.filter((_, i) => i < 3).map((q, i) => (
                <button key={i} className="quick-chip" onClick={() => sendMessage(q.prompt)} disabled={loading}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="widget-input">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              disabled={loading}
            />
            <button
              className="widget-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              →
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Trigger Button */
        .widget-trigger {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 22px;
          background: linear-gradient(135deg, #7c6bc4, #9382dc);
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(124,107,196,0.4), 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s;
          z-index: 1000;
          font-family: inherit;
        }
        .widget-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(124,107,196,0.5), 0 4px 12px rgba(0,0,0,0.15);
        }
        .trigger-icon { font-size: 20px; }
        .trigger-text { font-size: 14px; }
        .trigger-pulse {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #fff;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }

        /* Panel */
        .widget-panel {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 400px;
          max-height: 600px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15), 0 2px 12px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          animation: slideUp 0.25s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #7c6bc4, #9382dc);
          color: #fff;
        }
        .widget-header-left { display: flex; gap: 12px; align-items: center; }
        .widget-avatar {
          width: 36px; height: 36px; background: rgba(255,255,255,0.2);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .widget-title { font-size: 15px; font-weight: 700; }
        .widget-status { font-size: 11px; opacity: 0.8; }
        .widget-close {
          background: rgba(255,255,255,0.15); border: none; color: #fff;
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          font-size: 14px; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .widget-close:hover { background: rgba(255,255,255,0.3); }

        /* Messages */
        .widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          min-height: 300px;
          max-height: 400px;
        }

        /* Welcome */
        .widget-welcome { padding: 8px 0; }
        .welcome-text {
          font-size: 14px; color: #6b5e52; line-height: 1.6;
          margin: 0 0 16px; padding: 12px 16px;
          background: #f9f7f4; border-radius: 12px;
        }
        .starter-grid { display: flex; flex-direction: column; gap: 8px; }
        .starter-btn {
          padding: 12px 16px; background: #fff; border: 1px solid #e4ddd4;
          border-radius: 10px; font-size: 14px; color: #2c2420;
          text-align: left; cursor: pointer; transition: all 0.15s;
          font-family: inherit; font-weight: 500;
        }
        .starter-btn:hover { border-color: #7c6bc4; background: rgba(124,107,196,0.04); }
        .starter-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Messages */
        .msg { display: flex; gap: 8px; margin-bottom: 12px; align-items: flex-start; }
        .msg.user { justify-content: flex-end; }
        .msg-avatar {
          width: 28px; height: 28px; background: linear-gradient(135deg, #7c6bc4, #9382dc);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .msg-bubble { max-width: 85%; }
        .msg-text {
          font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;
        }
        .msg.user .msg-text {
          background: #2c2420; color: #fff; padding: 10px 14px;
          border-radius: 12px 12px 2px 12px;
        }
        .msg.assistant .msg-text {
          background: #f3efe9; color: #2c2420; padding: 10px 14px;
          border-radius: 2px 12px 12px 12px;
        }
        .msg-copy {
          margin-top: 4px; padding: 2px 10px; background: transparent;
          border: 1px solid #e4ddd4; border-radius: 4px; font-size: 10px;
          color: #9a8d80; cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .msg-copy:hover { border-color: #7c6bc4; color: #7c6bc4; }
        .msg-copy.copied { background: #22c55e; color: #fff; border-color: #22c55e; }

        /* Typing */
        .typing { display: flex; gap: 4px; padding: 8px 14px; }
        .typing span {
          width: 6px; height: 6px; background: #7c6bc4; border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.15s; }
        .typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Quick chips */
        .widget-quick {
          display: flex; gap: 6px; padding: 8px 16px;
          overflow-x: auto; border-top: 1px solid #f3efe9;
        }
        .quick-chip {
          padding: 5px 10px; background: #f3efe9; border: 1px solid #e4ddd4;
          border-radius: 14px; font-size: 11px; color: #6b5e52;
          cursor: pointer; white-space: nowrap; font-family: inherit;
          transition: all 0.15s;
        }
        .quick-chip:hover { border-color: #7c6bc4; }
        .quick-chip:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Input */
        .widget-input {
          display: flex; gap: 8px; padding: 12px 16px;
          border-top: 1px solid #e4ddd4; background: #fff;
        }
        .widget-input textarea {
          flex: 1; padding: 10px 14px; background: #f3efe9; border: 1px solid #e4ddd4;
          border-radius: 10px; font-size: 14px; color: #2c2420; font-family: inherit;
          resize: none; line-height: 1.4;
        }
        .widget-input textarea:focus { outline: none; border-color: #7c6bc4; }
        .widget-input textarea::placeholder { color: #9a8d80; }
        .widget-send {
          width: 40px; height: 40px; background: #7c6bc4; color: #fff;
          border: none; border-radius: 10px; font-size: 18px; cursor: pointer;
          transition: all 0.15s; flex-shrink: 0;
        }
        .widget-send:hover { filter: brightness(1.1); }
        .widget-send:disabled { opacity: 0.4; cursor: not-allowed; }

        @media (max-width: 480px) {
          .widget-panel { width: calc(100vw - 16px); right: 8px; bottom: 8px; max-height: 80vh; }
          .widget-trigger { bottom: 16px; right: 16px; padding: 12px 18px; }
        }
      `}</style>
    </>
  )
}

EOF_WIDGET
echo "  ✅ Claude widget — floating chat"
cat > src/app/dashboard/layout.tsx << 'EOF_LAYOUT'
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import ClaudeWidget from './components/ClaudeWidget'

const NAV_SECTIONS = [
  {
    title: 'Command Center',
    items: [
      { label: 'Home', icon: '🏠', href: '/dashboard' },
      { label: 'Your Links', icon: '🔗', href: '/dashboard/links' },
    ]
  },
  {
    title: 'Your Network',
    items: [
      { label: 'Couples', icon: '💍', href: '/dashboard/clients?type=couple' },
      { label: 'Clients', icon: '🛒', href: '/dashboard/clients?type=shopper' },
      { label: 'Leads', icon: '📬', href: '/dashboard/leads' },
    ]
  },
  {
    title: 'AI Assistant',
    items: [
      { label: 'Ask Claude', icon: '✨', href: '/dashboard/assistant' },
    ]
  },
  {
    title: 'Your Page',
    items: [
      { label: 'Edit Page', icon: '⚡', href: '/dashboard/page-editor' },
    ]
  },
  {
    title: 'Earnings',
    items: [
      { label: 'Commission', icon: '💰', href: '/dashboard/earnings' },
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', icon: '⚙️', href: '/dashboard/settings' },
    ]
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [vendor, setVendor] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      const session = JSON.parse(stored)
      setVendor(session)
    } catch {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('wetwo_vendor_session')
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark, #faf8f5)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <div style={{ color: '#6b5e52', fontSize: 14 }}>Loading your command center...</div>
        </div>
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href.split('?')[0])
  }

  return (
    <div className="dashboard-shell">
      {/* Mobile header */}
      <header className="dashboard-mobile-header">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <span className="mobile-brand">✨ {vendor?.business_name || 'WeTwo'}</span>
        <Link href={`/vendor/${vendor?.ref}`} target="_blank" className="mobile-view-page">
          View Page →
        </Link>
      </header>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-name">✨ {vendor?.business_name || 'WeTwo Vendor'}</div>
          <div className="sidebar-brand-url">{vendor?.ref ? `wetwo-vendors.vercel.app/vendor/${vendor.ref}` : ''}</div>
        </div>

        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}

          <div className="nav-section">
            <button className="nav-link logout-link" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span>Log Out</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link href={`/vendor/${vendor?.ref}`} target="_blank" className="sidebar-view-page">
            <div className="sidebar-avatar">
              {(vendor?.contact_name || vendor?.business_name || 'V')[0].toUpperCase()}
            </div>
            <div>
              <div className="sidebar-user-name">{vendor?.contact_name || vendor?.business_name}</div>
              <div className="sidebar-user-plan">
                {vendor?.plan === 'free' ? 'Free Plan' : 
                 vendor?.plan === 'starter' ? 'Starter — 10%' :
                 vendor?.plan === 'growth' ? 'Growth — 15%' : 'Pro — 20%'}
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {children}
      </main>

      {/* Claude Widget — floating on every page */}
      <ClaudeWidget />

      <style jsx>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: var(--bg-dark, #faf8f5);
        }
        .dashboard-mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 60;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border, #e4ddd4);
          padding: 12px 16px;
          align-items: center;
          justify-content: space-between;
        }
        .sidebar-toggle {
          background: none;
          border: 1px solid var(--border, #e4ddd4);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 18px;
          cursor: pointer;
          color: var(--text, #2c2420);
        }
        .mobile-brand {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--brand, #c9944a);
        }
        .mobile-view-page {
          font-size: 12px;
          color: var(--brand, #c9944a);
          text-decoration: none;
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 90;
        }
        .dashboard-sidebar {
          width: 260px;
          background: #fff;
          border-right: 1px solid var(--border, #e4ddd4);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        .sidebar-header {
          padding: 24px 20px 16px;
          border-bottom: 1px solid var(--border, #e4ddd4);
        }
        .sidebar-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--brand, #c9944a);
          margin-bottom: 4px;
        }
        .sidebar-brand-url {
          font-size: 11px;
          color: #9a8d80;
          word-break: break-all;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
        }
        .nav-section {
          margin-bottom: 20px;
        }
        .nav-section-title {
          font-size: 10px;
          font-weight: 700;
          color: #9a8d80;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 6px 12px;
        }
        .nav-link, .logout-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #6b5e52;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .nav-link:hover, .logout-link:hover {
          background: #f0ece6;
          color: #2c2420;
        }
        .nav-link.active {
          background: rgba(201,148,74,0.12);
          color: #c9944a;
          font-weight: 600;
        }
        .nav-icon {
          font-size: 16px;
          width: 22px;
          text-align: center;
        }
        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border, #e4ddd4);
        }
        .sidebar-view-page {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s;
        }
        .sidebar-view-page:hover {
          background: #f0ece6;
        }
        .sidebar-avatar {
          width: 34px;
          height: 34px;
          background: var(--brand, #c9944a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #faf8f5;
          font-size: 14px;
          flex-shrink: 0;
        }
        .sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #2c2420;
        }
        .sidebar-user-plan {
          font-size: 11px;
          color: var(--brand, #c9944a);
        }
        .dashboard-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
        }
        @media (max-width: 768px) {
          .dashboard-mobile-header {
            display: flex;
          }
          .sidebar-overlay {
            display: block;
          }
          .dashboard-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
          .dashboard-main {
            margin-left: 0;
            padding-top: 56px;
          }
        }
      `}</style>
    </div>
  )
}

EOF_LAYOUT
echo "  ✅ Layout — widget integrated"

echo ""
echo "🎉 All 6 files updated!"
echo ""
echo "Now run: npm run dev"
echo ""
echo "What's new:"
echo "  • ✨ Floating Claude widget (bottom-right, every page)"
echo "  •    Pre-loaded: 'How does this work?' + 'What does it cost?'"
echo "  • 🌐 Network effect section on dashboard"
echo "  • 🧠 Claude API: full system knowledge (not just copywriting)"
echo "  • 📝 Claude page: Write for me + Help me understand"
echo "  • 🔑 All messages: Wedding Buyers Club exclusivity"
