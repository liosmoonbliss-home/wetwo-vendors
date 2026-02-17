'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ============================================================
// WeTwo — Your Outreach Kit v4.2
// Pre-written messages for every scenario
// Updated: No more "Buyers Club" / "25% cashback" language
// Theme: marketing that pays you, not costs you
// ============================================================

export default function OutreachKitPage() {
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
  const tier = vendor.boost_tier || vendor.plan || 'free'
  const pool = tier === 'elite' ? 40 : tier === 'pro' ? 30 : 20
  // Max cashback the vendor can offer (up to 20% from pool)
  const maxCashback = Math.min(pool, 20)

  const shopLink = `https://wetwo.love/?ref=vendor-${vendor.ref}`
  const registryLink = `https://wetwo-vendors.vercel.app/wetwo/couple-signup?ref=vendor-${vendor.ref}`

  // ============================================================
  // MESSAGES — Updated for v4 positioning
  // ============================================================

  const textToRecentCouple = `Hey! I have something special for you 🎉

I just launched something new through my business — I can now give my couples access to a wedding registry where you get up to ${maxCashback}% cashback on every gift your guests buy. Real products — furniture, kitchen, bedding, fashion, outdoor gear. And up to ${maxCashback}% of everything comes back to you as cash toward your honeymoon or new home.

It's something I set up specifically for my clients. Your guests get great prices on things they'd buy anyway, and you get money back on all of it.

Here's your link to set it up: ${registryLink}

The best part? Even after the wedding, you can keep shopping and saving. It works forever.

Congrats again! I'm so excited for you 💕

${firstName}`

  const emailToNewCouple = `Subject: A gift from ${firstName} — cashback on your entire registry

Hi!

It was so great meeting you! I'm excited about your celebration, and I wanted to give you something special that I offer all my couples.

I've set up a program where you can create a wedding registry and get up to ${maxCashback}% cashback on every gift your guests buy. We're talking real products — furniture, kitchen essentials, bedding, fashion — things you'll actually want for your new life together. And up to ${maxCashback}% of everything comes back to you as cash.

Your guests get great prices on quality products, and you get honeymoon money in your pocket. Everyone wins.

Here's your link to get started: ${registryLink}

You can use it alongside any other registry. And even after the wedding, the link works forever — shop anytime and keep saving.

Can't wait to help make your day beautiful!

${firstName}
${biz}`

  const textToPastCouple = `Hi! It's ${firstName} from ${biz} — hope you're doing amazing! 💕

I wanted to reach out because I just launched something I think you'll love. Through my business, I can now give my clients access to savings of up to ${maxCashback}% on thousands of products — furniture, kitchen, bedding, clothing, outdoor, you name it.

I set this up for my couples and clients because I wanted to be able to give back beyond just the day itself. Think of it as a thank-you that keeps going.

Here's your link: ${shopLink}

Use it anytime. It works forever. My gift to you 🎁

${firstName}`

  const emailToPastClients = `Subject: Something new from ${firstName} — savings on thousands of products

Hi there,

I hope you're doing well! I'm reaching out because I've added something new to my business that I think you'll genuinely appreciate.

I have a program that gives my clients and their networks real savings — up to ${maxCashback}% back on thousands of products. Furniture, kitchen essentials, bedding, fashion, outdoor gear — quality items at great prices, with cashback on everything.

I set this up because I believe in giving my clients value beyond just the event itself. This is my way of saying thank you — and it never expires.

Here's your exclusive link: ${shopLink}

It works every time you shop. Not once — forever. No strings, no catches.

Getting married or know someone who is? I also have a wedding registry where the couple gets up to ${maxCashback}% cashback on every single gift: ${registryLink}

Feel free to share either link with anyone who could use it. The more people who benefit, the better.

Warmly,
${firstName}
${biz}`

  const igCaption = `I just added something to my business that I'm really excited about 🎁

I can now offer everyone in my world real savings on thousands of products — furniture, kitchen, bedroom, fashion, outdoor gear. Up to ${maxCashback}% back on everything.

I set this up because I wanted a way to give back to my clients and their people beyond just the big day. Now I can.

Getting married? There's a registry option where your guests buy real gifts and YOU get cashback toward your honeymoon 💍

DM me "GIFT" and I'll send you the link.

This is how I take care of my people. 🤝

#WeddingVendor #ClientAppreciation #WeddingRegistry #CashbackRegistry`

  const igStory = `🎁 NEW from ${biz}

I can now offer my clients + their people:
→ Up to ${maxCashback}% cashback on thousands of products
→ Furniture, kitchen, fashion, bedroom
→ A cashback wedding registry
→ Works forever, no strings

DM me "GIFT" for your link 🤝`

  const igDMReply = `Hey! Thanks for reaching out 🙌

Here's your link: ${shopLink}

You get up to ${maxCashback}% back on everything — furniture, kitchen, fashion, all of it. Use it anytime, it works forever.

Getting married or know someone who is? Here's the registry link too — the couple gets cashback on every gift: ${registryLink}

Enjoy! And send it to anyone you think could use it 🎁`

  const expoCard = `🎁 A Gift from ${firstName}
━━━━━━━━━━━━━━━━━━━

Up to ${maxCashback}% cashback on everything.
Furniture. Kitchen. Fashion. Bedroom.

Shop: ${shopLink}
Registry: ${registryLink}

Scan for access →
[QR CODE HERE]

━━━━━━━━━━━━━━━━━━━
${biz}`

  const emailSignature = `—
${firstName} | ${biz}
🎁 I give my clients up to ${maxCashback}% cashback on thousands of products → ${shopLink}`

  const closingScript = `"One more thing before you go — I set up something special for my clients. I can give you access to savings on thousands of products — furniture, kitchen, bedroom, fashion, everything — with up to ${maxCashback}% cashback. Your guests buy gifts, and you get honeymoon money back. This is something I do for every client because I want to take care of the people I work with — not just on the big day, but after. Let me text you the link right now."`


  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Your Outreach Kit</h1>
          <p className="page-subtitle">Copy, paste, send. Every message is written to convert.</p>
        </div>
      </header>

      <div className="page-content">

        {/* NEW HERO — theme reinforcement */}
        <div className="key-banner">
          <div className="key-icon">🎁</div>
          <div>
            <strong>These messages do the selling for you.</strong> Every one positions you as the person who gives gifts — not the person who asks for business.
            Your clients get real savings. You get commission, credibility, and a reason to stay in touch forever.
          </div>
        </div>

        {/* ===== CURRENT COUPLES ===== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">💍</span>
            <div>
              <h3>Couples You're Talking To Now</h3>
              <p>Active leads, recent bookings, anyone in your pipeline. Give them the registry link — you're putting honeymoon money in her pocket without taking a dollar from yours.</p>
            </div>
          </div>
          <div className="link-row">
            <input type="text" value={registryLink} readOnly className="link-input" />
            <button className={`copy-btn ${copied === 'reg' ? 'copied' : ''}`} onClick={() => copy(registryLink, 'reg')}>
              {copied === 'reg' ? '✓' : 'Copy Link'}
            </button>
          </div>
          <MsgToggle id="recent-text" label="📱 Text message to a current couple" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={textToRecentCouple} id="rc-msg" copied={copied} copy={copy} label="Copy Message" />
          </MsgToggle>
          <MsgToggle id="recent-email" label="✉️ Email to a new couple" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={emailToNewCouple} id="nce-msg" copied={copied} copy={copy} label="Copy Email" />
          </MsgToggle>
        </div>

        {/* ===== PAST COUPLES ===== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">💌</span>
            <div>
              <h3>Couples From the Past</h3>
              <p>Even couples who got married years ago are still furnishing their homes. This is the perfect reason to reach back out — you're not selling, you're giving.</p>
            </div>
          </div>
          <MsgToggle id="past-text" label="📱 Text to a past couple" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={textToPastCouple} id="pc-msg" copied={copied} copy={copy} label="Copy Message" />
          </MsgToggle>
        </div>

        {/* ===== CONTACT LIST — THE BIG ONE ===== */}
        <div className="scenario highlight">
          <div className="scenario-header">
            <span className="scenario-num">📧</span>
            <div>
              <h3>Your Entire Contact List</h3>
              <p>This is the big one. Every person who ever inquired, every past client, every cold lead. One email turns you from someone they forgot about into someone giving them a gift.</p>
            </div>
          </div>
          <MsgToggle id="email-blast" label="✉️ The email to send your entire list" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={emailToPastClients} id="eb-msg" copied={copied} copy={copy} label="Copy Email" />
          </MsgToggle>
          <div className="scenario-tip">
            💡 <strong>This is your reactivation play.</strong> People who never booked you will appreciate this — you're offering value with no strings attached.
            Every person who shops earns you commission. That's marketing that pays you instead of costing you.
          </div>
        </div>

        {/* ===== INSTAGRAM ===== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">📸</span>
            <div>
              <h3>Instagram — Posts, Stories & DMs</h3>
              <p>"DM me GIFT" turns followers into warm leads reaching out to you. No ad spend. No algorithms. Just generosity that converts.</p>
            </div>
          </div>
          <MsgToggle id="ig-post" label="📸 Instagram post caption" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={igCaption} id="ig-msg" copied={copied} copy={copy} label="Copy Caption" />
          </MsgToggle>
          <MsgToggle id="ig-story" label="📱 Instagram story text" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={igStory} id="igs-msg" copied={copied} copy={copy} label="Copy Text" />
          </MsgToggle>
          <MsgToggle id="ig-dm" label="💬 DM reply when someone messages you" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={igDMReply} id="igd-msg" copied={copied} copy={copy} label="Copy Reply" />
          </MsgToggle>
        </div>

        {/* ===== IN PERSON ===== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">🤝</span>
            <div>
              <h3>In Person — Closing & Conversations</h3>
              <p>Make the gift part of every interaction. It's the last thing they hear and the first thing they remember.</p>
            </div>
          </div>
          <MsgToggle id="close" label="🗣️ When you close a new client (word for word)" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={closingScript} id="close-msg" copied={copied} copy={copy} label="Copy Script" />
          </MsgToggle>
        </div>

        {/* ===== EXPOS ===== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">🎪</span>
            <div>
              <h3>Bridal Expos & Events</h3>
              <p>Everyone else hands out business cards. You hand out gifts. Nobody else in the room can do what you do.</p>
            </div>
          </div>
          <MsgToggle id="expo" label="🪧 Card / flyer text for your table" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={expoCard} id="expo-msg" copied={copied} copy={copy} label="Copy Text" />
          </MsgToggle>
        </div>

        {/* ===== EVERYWHERE ELSE ===== */}
        <div className="scenario">
          <div className="scenario-header">
            <span className="scenario-num">📣</span>
            <div>
              <h3>Put Your Link Everywhere</h3>
              <p>Every touchpoint is a chance to give someone a gift — and earn from it.</p>
            </div>
          </div>
          <MsgToggle id="sig" label="✍️ Email signature" expanded={expandedMsg} toggle={toggle}>
            <MsgBlock text={emailSignature} id="sig-msg" copied={copied} copy={copy} label="Copy Signature" />
          </MsgToggle>
          <div className="where-list">
            <h4>Your link should be on:</h4>
            <div className="where-grid">
              {['Your website', 'Instagram bio', 'Business cards', 'Google listing', 'Email signature', 'Directory profiles', 'TikTok bio', 'Voicemail greeting'].map(s => (
                <span key={s} className="where-chip">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== AI ASSIST ===== */}
        <div className="ai-card">
          <span className="ai-icon">✨</span>
          <div>
            <h4>Need something custom?</h4>
            <p>Tell Claude who you're writing to and what the situation is. It'll draft the message with your links, your voice, and the right positioning.</p>
          </div>
          <Link href="/dashboard/assistant" className="ai-btn">Ask Claude →</Link>
        </div>

      </div>

      <style jsx>{`
        .page-header { background: #fff; border-bottom: 1px solid #e4ddd4; padding: 20px 32px; position: sticky; top: 0; z-index: 50; }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .page-content { padding: 28px 32px; max-width: 800px; }

        .key-banner { display: flex; gap: 16px; align-items: flex-start; background: linear-gradient(135deg, #2c2420, #3d332c); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; color: rgba(255,255,255,0.75); font-size: 14px; line-height: 1.7; }
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

// ============================================================
// HELPER COMPONENTS
// ============================================================
function MsgToggle({ id, label, expanded, toggle, children }: {
  id: string; label: string; expanded: string | null; toggle: (id: string) => void; children: React.ReactNode;
}) {
  const isOpen = expanded === id
  return (
    <>
      <div onClick={() => toggle(id)} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', background: '#f3efe9', borderRadius: '8px',
        fontSize: '13px', color: '#6b5e52', cursor: 'pointer', transition: 'all 0.15s',
        marginTop: '8px',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#ebe5dc')}
      onMouseLeave={e => (e.currentTarget.style.background = '#f3efe9')}
      >
        <span>{label}</span>
        <span style={{ color: '#c9944a', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
      </div>
      {isOpen && children}
    </>
  )
}

function MsgBlock({ text, id, copied, copy, label }: {
  text: string; id: string; copied: string | null; copy: (text: string, id: string) => void; label: string;
}) {
  const isCopied = copied === id
  return (
    <div style={{ marginTop: '8px' }}>
      <pre style={{
        background: '#f9f7f4', border: '1px solid #e4ddd4', borderRadius: '8px',
        padding: '16px', fontSize: '13px', color: '#4a3f35', lineHeight: 1.7,
        whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0,
      }}>{text}</pre>
      <button onClick={() => copy(text, id)} style={{
        marginTop: '8px', padding: '8px 16px',
        background: isCopied ? '#22c55e' : '#e8e0d5',
        color: isCopied ? '#fff' : '#2c2420',
        border: `1px solid ${isCopied ? '#22c55e' : '#e4ddd4'}`,
        borderRadius: '6px', fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
      }}>{isCopied ? '✓ Copied' : label}</button>
    </div>
  )
}
