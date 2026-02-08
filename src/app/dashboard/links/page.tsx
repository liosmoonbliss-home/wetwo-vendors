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
