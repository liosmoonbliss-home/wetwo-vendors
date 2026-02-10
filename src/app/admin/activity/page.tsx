'use client';

import { useEffect, useState } from 'react';

const EVENT_LABELS: Record<string, string> = {
  dashboard_visit: '🔵 Dashboard Visit',
  claude_chat: '🟣 Claude Chat',
  couple_signup: '💛 Couple Signup',
  shopper_signup: '🟢 Shopper Signup',
  lead_form: '✉️ Lead Form',
  vendor_created: '⭐ New Vendor',
  subscription_change: '💎 Subscription',
  page_view: '👁 Page View',
  vendor_request: '✏️ Page Change Request',
  vendor_login: '🔑 Vendor Login',
};

const EVENT_TYPES = [
  { value: '', label: 'All Events' },
  { value: 'dashboard_visit', label: 'Dashboard Visits' },
  { value: 'claude_chat', label: 'Claude Chats' },
  { value: 'vendor_request', label: 'Page Requests' },
  { value: 'vendor_login', label: 'Vendor Logins' },
  { value: 'couple_signup', label: 'Couple Signups' },
  { value: 'shopper_signup', label: 'Shopper Signups' },
  { value: 'lead_form', label: 'Lead Forms' },
  { value: 'vendor_created', label: 'New Vendors' },
  { value: 'subscription_change', label: 'Subscriptions' },
  { value: 'page_view', label: 'Page Views' },
];

const EVENT_COLORS: Record<string, string> = {
  dashboard_visit: '#4a9eff',
  claude_chat: '#a855f7',
  couple_signup: '#c9a96e',
  shopper_signup: '#22c55e',
  lead_form: '#f59e0b',
  vendor_created: '#ec4899',
  subscription_change: '#06b6d4',
  page_view: '#6b7280',
  vendor_request: '#f97316',
  vendor_login: '#14b8a6',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function AdminActivity() {
  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const limit = 50;

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const fetchEvents = (type: string, off: number) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String(off) });
    if (type) params.set('type', type);

    fetch(`/api/admin/events?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents(filter, offset);
  }, [filter, offset]);

  const isExpandable = (event: any) => {
    return (event.event_type === 'claude_chat' || event.event_type === 'vendor_request') &&
      event.metadata && Object.keys(event.metadata).length > 0;
  };

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#c8c0b4',
    padding: '8px 12px',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#e8e0d4', fontWeight: 300, margin: 0 }}>Activity Feed</h1>
          <p style={{ color: '#5a5550', fontSize: '13px', margin: '4px 0 0' }}>{total} total events</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setOffset(0); }} style={selectStyle}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button onClick={() => fetchEvents(filter, offset)} style={{
            ...selectStyle, cursor: 'pointer', background: 'rgba(201,169,110,0.15)', color: '#c9a96e',
            border: '1px solid rgba(201,169,110,0.2)',
          }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5a5550', fontSize: '13px' }}>Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>
            No events found. Activity will appear here as it happens.
          </div>
        ) : (
          events.map((event: any, i: number) => {
            const canExpand = isExpandable(event);
            const isOpen = expanded.has(event.id);

            return (
              <div key={event.id} style={{
                borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                {/* Main row */}
                <div
                  onClick={() => canExpand && toggleExpand(event.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '16px 20px',
                    cursor: canExpand ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                    background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (canExpand) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: EVENT_COLORS[event.event_type] || '#c9a96e',
                    flexShrink: 0, marginTop: '4px',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <span style={{ color: '#c8c0b4', fontSize: '13px' }}>
                          {event.summary || EVENT_LABELS[event.event_type] || event.event_type}
                        </span>
                        {canExpand && (
                          <span style={{
                            marginLeft: '8px', fontSize: '11px', color: '#5a5550',
                            transition: 'transform 0.2s',
                          }}>
                            {isOpen ? '▼' : '▶ click to view'}
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#5a5550', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                        background: `${EVENT_COLORS[event.event_type] || '#c9a96e'}20`,
                        color: EVENT_COLORS[event.event_type] || '#c9a96e',
                        letterSpacing: '0.3px',
                      }}>
                        {event.event_type}
                      </span>
                      {event.vendor_ref && (
                        <a
                          href={`/admin/vendors/${event.vendor_ref}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                            background: 'rgba(255,255,255,0.04)', color: '#7a7570',
                            textDecoration: 'none',
                          }}
                        >
                          {event.vendor_name || event.vendor_ref}
                        </a>
                      )}
                      {event.actor_email && (
                        <span style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.04)', color: '#5a5550',
                        }}>
                          {event.actor_email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded content for claude_chat */}
                {isOpen && event.event_type === 'claude_chat' && event.metadata && (
                  <div style={{
                    padding: '0 20px 20px 44px',
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    {/* Vendor's message */}
                    {event.metadata.user_message && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          fontSize: '10px', fontWeight: 700, color: '#c9a96e',
                          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
                        }}>
                          Vendor asked:
                        </div>
                        <div style={{
                          padding: '12px 14px', borderRadius: '8px',
                          background: 'rgba(201,169,110,0.06)',
                          border: '1px solid rgba(201,169,110,0.15)',
                          color: '#c8c0b4', fontSize: '13px', lineHeight: '1.6',
                        }}>
                          {event.metadata.user_message}
                        </div>
                      </div>
                    )}
                    {/* Claude's response */}
                    {event.metadata.claude_response && (
                      <div>
                        <div style={{
                          fontSize: '10px', fontWeight: 700, color: '#a855f7',
                          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
                        }}>
                          Claude responded:
                        </div>
                        <div style={{
                          padding: '12px 14px', borderRadius: '8px',
                          background: 'rgba(168,85,247,0.06)',
                          border: '1px solid rgba(168,85,247,0.15)',
                          color: '#c8c0b4', fontSize: '13px', lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {event.metadata.claude_response}
                        </div>
                      </div>
                    )}
                    {event.metadata.message_count && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#5a5550' }}>
                        {event.metadata.message_count} messages in conversation
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded content for vendor_request */}
                {isOpen && event.event_type === 'vendor_request' && event.metadata && (
                  <div style={{
                    padding: '0 20px 20px 44px',
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    {event.metadata.message && (
                      <div style={{
                        padding: '12px 14px', borderRadius: '8px',
                        background: 'rgba(249,115,22,0.06)',
                        border: '1px solid rgba(249,115,22,0.15)',
                        color: '#c8c0b4', fontSize: '13px', lineHeight: '1.6',
                      }}>
                        {event.metadata.message}
                      </div>
                    )}
                    {event.vendor_ref && (
                      <a
                        href={`/admin/vendors/${event.vendor_ref}`}
                        style={{
                          display: 'inline-block', marginTop: '10px',
                          fontSize: '12px', color: '#f97316', textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        View vendor & respond →
                      </a>
                    )}
                  </div>
                )}

                {/* Fallback metadata for other expandable types */}
                {isOpen && event.event_type !== 'claude_chat' && event.event_type !== 'vendor_request' && event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div style={{
                    padding: '0 20px 16px 44px',
                  }}>
                    <div style={{
                      fontSize: '11px', color: '#5a5550',
                      background: 'rgba(255,255,255,0.02)', padding: '8px 10px',
                      borderRadius: '4px', fontFamily: 'monospace',
                    }}>
                      {JSON.stringify(event.metadata, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            style={{
              ...selectStyle,
              opacity: offset === 0 ? 0.3 : 1,
              cursor: offset === 0 ? 'default' : 'pointer',
            }}
          >
            ← Previous
          </button>
          <span style={{ color: '#5a5550', fontSize: '12px', padding: '8px', alignSelf: 'center' }}>
            {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
            style={{
              ...selectStyle,
              opacity: offset + limit >= total ? 0.3 : 1,
              cursor: offset + limit >= total ? 'default' : 'pointer',
            }}
          >
            Next →
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
