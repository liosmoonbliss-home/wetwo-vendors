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
  const [mode, setMode] = useState<'hero' | 'corner-closed' | 'corner-open'>('corner-closed')
  const [vendor, setVendor] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const heroInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))

    // Check if they've seen the hero intro before
    const introduced = localStorage.getItem('wetwo_claude_introduced')
    if (!introduced) {
      setMode('hero')
    } else {
      setMode('corner-closed')
    }
    setReady(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (mode === 'corner-open' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
    if (mode === 'hero' && heroInputRef.current) {
      setTimeout(() => heroInputRef.current?.focus(), 400)
    }
  }, [mode])

  const dismissHero = () => {
    localStorage.setItem('wetwo_claude_introduced', 'true')
    setMode('corner-closed')
  }

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    // If sending from hero, transition to corner-open with the conversation
    if (mode === 'hero') {
      localStorage.setItem('wetwo_claude_introduced', 'true')
      setMode('corner-open')
    }

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

  if (!vendor || !ready) return null

  const firstName = (vendor.contact_name || vendor.business_name || '').split(' ')[0]

  // ============================================
  // HERO MODE — First visit, full-width top banner
  // ============================================
  if (mode === 'hero') {
    return (
      <div className="hero-overlay">
        <div className="hero-banner">
          <button className="hero-dismiss" onClick={dismissHero}>✕ Skip for now</button>

          <div className="hero-avatar">✨</div>
          <h1 className="hero-title">Hey {firstName} — I'm Claude.</h1>
          <p className="hero-subtitle">
            I'm your personal advisor. I know everything about your WeTwo Wedding Buyers Club membership — 
            how it works, what to do, how to make money with it. Before you do anything else, ask me anything.
          </p>

          <div className="hero-questions">
            {STARTER_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="hero-q-btn"
                onClick={() => sendMessage(q.prompt)}
                disabled={loading}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="hero-input-row">
            <textarea
              ref={heroInputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Or type your own question..."
              rows={1}
              disabled={loading}
            />
            <button
              className="hero-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              →
            </button>
          </div>

          <p className="hero-footnote">
            I'll always be in the bottom-right corner if you need me later. ↘
          </p>
        </div>

        <style jsx>{`
          .hero-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 60px 20px 20px;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .hero-banner {
            background: linear-gradient(135deg, #2c2420, #1a1614);
            border-radius: 20px;
            padding: 48px 40px;
            max-width: 560px;
            width: 100%;
            text-align: center;
            position: relative;
            animation: slideDown 0.4s ease;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-dismiss {
            position: absolute;
            top: 16px;
            right: 20px;
            background: none;
            border: none;
            color: rgba(255,255,255,0.4);
            font-size: 12px;
            cursor: pointer;
            font-family: inherit;
            transition: color 0.15s;
          }
          .hero-dismiss:hover { color: rgba(255,255,255,0.7); }
          .hero-avatar { font-size: 48px; margin-bottom: 16px; }
          .hero-title {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #fff;
            margin: 0 0 12px;
            font-weight: 600;
          }
          .hero-subtitle {
            font-size: 15px;
            color: rgba(255,255,255,0.7);
            line-height: 1.7;
            margin: 0 0 28px;
          }
          .hero-questions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
          }
          .hero-q-btn {
            padding: 14px 16px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s;
            font-family: inherit;
            text-align: left;
          }
          .hero-q-btn:hover {
            background: rgba(201,148,74,0.2);
            border-color: rgba(201,148,74,0.4);
          }
          .hero-q-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .hero-input-row {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
          }
          .hero-input-row textarea {
            flex: 1;
            padding: 14px 16px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            font-family: inherit;
            resize: none;
          }
          .hero-input-row textarea:focus {
            outline: none;
            border-color: #c9944a;
          }
          .hero-input-row textarea::placeholder { color: rgba(255,255,255,0.4); }
          .hero-send {
            width: 48px;
            height: 48px;
            background: #c9944a;
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 20px;
            cursor: pointer;
            flex-shrink: 0;
          }
          .hero-send:disabled { opacity: 0.4; cursor: not-allowed; }
          .hero-send:hover { filter: brightness(1.1); }
          .hero-footnote {
            font-size: 12px;
            color: rgba(255,255,255,0.3);
            margin: 0;
          }
          @media (max-width: 600px) {
            .hero-overlay { padding: 20px 12px; }
            .hero-banner { padding: 32px 24px; }
            .hero-title { font-size: 22px; }
            .hero-questions { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // CORNER MODE — Floating button + chat panel
  // ============================================
  return (
    <>
      {/* Floating Button */}
      {mode === 'corner-closed' && (
        <button className="widget-trigger" onClick={() => setMode('corner-open')}>
          <span className="trigger-icon">✨</span>
          <span className="trigger-text">Ask Claude</span>
        </button>
      )}

      {/* Chat Window */}
      {mode === 'corner-open' && (
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
            <button className="widget-close" onClick={() => setMode('corner-closed')}>✕</button>
          </div>

          {/* Messages */}
          <div className="widget-messages">
            {messages.length === 0 ? (
              <div className="widget-welcome">
                <p className="welcome-text">
                  Hey {firstName}! Ask me anything — how it works, what to do, ideas, or I can write messages for you.
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

          {/* Quick prompts */}
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
