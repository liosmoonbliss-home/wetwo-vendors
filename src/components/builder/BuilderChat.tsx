'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Vendor } from '@/lib/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  changes?: Partial<Vendor> | null;
  applied?: boolean;
}

interface Props {
  vendor: Partial<Vendor>;
  onApplyChanges: (changes: Partial<Vendor>) => void;
}

const S = {
  wrap: {
    display: 'flex', flexDirection: 'column' as const, height: '100%',
    background: '#0a0a15',
  },
  messages: {
    flex: 1, overflow: 'auto', padding: '0.75rem',
    display: 'flex', flexDirection: 'column' as const, gap: '0.75rem',
  },
  userBubble: {
    alignSelf: 'flex-end' as const, maxWidth: '85%',
    background: '#1e3a5f', color: '#e0ecf8',
    padding: '0.6rem 0.85rem', borderRadius: '12px 12px 4px 12px',
    fontSize: '0.85rem', lineHeight: '1.5',
  },
  aiBubble: {
    alignSelf: 'flex-start' as const, maxWidth: '85%',
    background: '#141420', color: '#e0dcd6',
    padding: '0.6rem 0.85rem', borderRadius: '12px 12px 12px 4px',
    fontSize: '0.85rem', lineHeight: '1.5',
    border: '1px solid #1e1e30',
  },
  changesBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '0.5rem', marginTop: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(201,160,80,0.08)',
    border: '1px solid rgba(201,160,80,0.25)',
    borderRadius: '8px', fontSize: '0.75rem',
  },
  applyBtn: {
    padding: '0.3rem 0.75rem', background: '#c9a050', color: '#0a0a15',
    border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
  },
  appliedBadge: {
    padding: '0.3rem 0.75rem', background: 'rgba(34,197,94,0.15)',
    color: '#22c55e', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
  },
  inputArea: {
    borderTop: '1px solid #1e1e30', padding: '0.5rem',
    display: 'flex', gap: '0.4rem',
  },
  input: {
    flex: 1, padding: '0.6rem 0.75rem',
    background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: '8px',
    color: '#f0ece6', fontSize: '0.85rem', outline: 'none',
    fontFamily: 'inherit', resize: 'none' as const,
    minHeight: '38px', maxHeight: '120px',
  },
  sendBtn: {
    padding: '0.5rem 1rem', background: '#c9a050', color: '#0a0a15',
    border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
    cursor: 'pointer', alignSelf: 'flex-end' as const,
  },
  emptyState: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
    color: '#6b6058', padding: '2rem', textAlign: 'center' as const,
  },
  chip: {
    padding: '0.4rem 0.8rem', background: '#141420',
    border: '1px solid #2a2a3a', borderRadius: '20px',
    fontSize: '0.75rem', color: '#a09888', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  loading: {
    alignSelf: 'flex-start' as const, padding: '0.6rem 0.85rem',
    background: '#141420', borderRadius: '12px', border: '1px solid #1e1e30',
    fontSize: '0.8rem', color: '#6b6058',
  },
};

const QUICK_PROMPTS = [
  'Rewrite the headline — make it bolder',
  'Polish the bio — more editorial',
  'Suggest a better theme',
  'Make the packages more compelling',
  'What could be improved?',
];

export default function BuilderChat({ vendor, onApplyChanges }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build history for multi-turn (just role + content)
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/builder-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          vendorState: vendor,
          history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${data.error || 'Something went wrong'}`,
        }]);
        return;
      }

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.message || 'Done.',
        changes: data.changes || null,
        applied: false,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error — please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, vendor]);

  const applyChanges = (index: number) => {
    const msg = messages[index];
    if (!msg.changes) return;
    onApplyChanges(msg.changes);
    setMessages(prev => prev.map((m, i) =>
      i === index ? { ...m, applied: true } : m
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const changesSummary = (changes: Partial<Vendor>): string => {
    const keys = Object.keys(changes);
    const labels: Record<string, string> = {
      bio: 'Bio', hero_config: 'Hero', pricing_packages: 'Packages',
      services_included: 'Services', theme_preset: 'Theme', brand_color: 'Colors',
      brand_color_secondary: 'Colors', business_name: 'Name', contact_name: 'Contact',
      testimonials: 'Reviews', faqs: 'FAQ', trust_badges: 'Badges',
    };
    const named = keys.map(k => labels[k] || k).filter((v, i, a) => a.indexOf(v) === i);
    return named.slice(0, 4).join(', ') + (named.length > 4 ? ` +${named.length - 4} more` : '');
  };

  return (
    <div style={S.wrap}>
      {messages.length === 0 ? (
        <div style={S.emptyState}>
          <div style={{ fontSize: '2rem' }}>🎨</div>
          <div style={{ fontWeight: 600, color: '#a09888', fontSize: '0.9rem' }}>
            Creative Director
          </div>
          <div style={{ fontSize: '0.8rem', maxWidth: '280px' }}>
            Ask me to rewrite copy, change the theme, incorporate content you paste, 
            or review the page. I can make changes directly.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                style={S.chip}
                onClick={() => sendMessage(prompt)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a050'; e.currentTarget.style.color = '#c9a050'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.color = '#a09888'; }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={S.messages}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div style={msg.role === 'user' ? S.userBubble : S.aiBubble}>
                {msg.content}
              </div>
              {msg.role === 'assistant' && msg.changes && (
                <div style={S.changesBanner}>
                  <span style={{ color: '#c9a050' }}>
                    ✏️ Changes: {changesSummary(msg.changes)}
                  </span>
                  {msg.applied ? (
                    <span style={S.appliedBadge}>✓ Applied</span>
                  ) : (
                    <button style={S.applyBtn} onClick={() => applyChanges(i)}>
                      Apply Changes
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={S.loading}>
              <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>✨ Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div style={S.inputArea}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Claude to edit, review, or improve..."
          style={S.input}
          rows={1}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ ...S.sendBtn, opacity: loading || !input.trim() ? 0.4 : 1 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
