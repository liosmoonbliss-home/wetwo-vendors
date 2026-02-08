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
