'use client';

import { useEffect, useState } from 'react';

interface Stats {
  counts: {
    vendors: number;
    activeVendors: number;
    couples: number;
    shoppers: number;
    leads: number;
    sponsors: number;
    todayEvents: number;
  };
  recentEvents: any[];
  eventBreakdown: Record<string, number>;
  dailyActivity: Record<string, number>;
}

const EVENT_LABELS: Record<string, string> = {
  dashboard_visit: '🔵 Dashboard Visit',
  claude_chat: '🟣 Claude Chat',
  couple_signup: '💛 Couple Signup',
  shopper_signup: '🟢 Shopper Signup',
  lead_form: '✉️ Lead Form',
  vendor_created: '⭐ New Vendor',
  subscription_change: '💎 Subscription',
  page_view: '👁 Page View',
  vendor_request: '✏️ Page Request',
  vendor_login: '🔑 Vendor Login',
};

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ color: '#7a7570', fontSize: '14px', padding: '40px 0' }}>
        Loading overview...
      </div>
    );
  }

  if (!stats) return <div style={{ color: '#e74c3c' }}>Failed to load stats</div>;

  const c = stats.counts;

  const statCards = [
    { label: 'Total Vendors', value: c.vendors, sub: `${c.activeVendors} active`, color: '#c9a96e' },
    { label: 'Sponsors', value: c.sponsors, sub: 'paid & active', color: '#06b6d4' },
    { label: 'Couples', value: c.couples, sub: 'registered', color: '#ec4899' },
    { label: 'Shoppers', value: c.shoppers, sub: 'signed up', color: '#22c55e' },
    { label: 'Leads', value: c.leads, sub: 'form submissions', color: '#f59e0b' },
    { label: 'Today', value: c.todayEvents, sub: 'events logged', color: '#a855f7' },
  ];

  // Build simple activity bars for last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({ key, label: dayLabel, count: stats.dailyActivity[key] || 0 });
  }
  const maxCount = Math.max(...days.map((d) => d.count), 1);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          color: '#e8e0d4',
          fontWeight: 300,
          margin: 0,
        }}>Overview</h1>
        <p style={{ color: '#5a5550', fontSize: '13px', margin: '6px 0 0', letterSpacing: '0.5px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
              background: card.color, borderRadius: '12px 0 0 12px',
            }} />
            <div style={{ color: '#7a7570', fontSize: '12px', letterSpacing: '0.5px', marginBottom: '8px' }}>
              {card.label}
            </div>
            <div style={{ color: '#e8e0d4', fontSize: '32px', fontWeight: 300, lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ color: '#5a5550', fontSize: '11px', marginTop: '4px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Weekly Activity */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{ color: '#e8e0d4', fontSize: '16px', fontWeight: 400, margin: '0 0 20px' }}>
            7-Day Activity
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
            {days.map((day) => (
              <div key={day.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ color: '#7a7570', fontSize: '10px', marginBottom: '4px' }}>{day.count || ''}</div>
                <div style={{
                  width: '100%',
                  height: `${Math.max((day.count / maxCount) * 100, 4)}%`,
                  background: day.count > 0
                    ? 'linear-gradient(180deg, #c9a96e, rgba(201,169,110,0.3))'
                    : 'rgba(255,255,255,0.04)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease',
                }} />
                <div style={{ color: '#5a5550', fontSize: '10px', marginTop: '6px' }}>{day.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Breakdown */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{ color: '#e8e0d4', fontSize: '16px', fontWeight: 400, margin: '0 0 20px' }}>
            This Week by Type
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(stats.eventBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const total = Object.values(stats.eventBreakdown).reduce((s, v) => s + v, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#9a9590', fontSize: '12px' }}>
                        {EVENT_LABELS[type] || type}
                      </span>
                      <span style={{ color: '#7a7570', fontSize: '12px' }}>{count}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: EVENT_COLORS[type] || '#c9a96e',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            {Object.keys(stats.eventBreakdown).length === 0 && (
              <div style={{ color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>
                No events this week yet. Events will appear here as vendors interact with the platform.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        marginTop: '24px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#e8e0d4', fontSize: '16px', fontWeight: 400, margin: 0 }}>
            Recent Activity
          </h2>
          <a href="/admin/activity" style={{ color: '#c9a96e', fontSize: '12px', textDecoration: 'none', letterSpacing: '0.5px' }}>
            VIEW ALL →
          </a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {stats.recentEvents.length === 0 && (
            <div style={{ color: '#5a5550', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>
              No events recorded yet. Activity will stream here in real time as vendors, couples, and shoppers interact with WeTwo.
            </div>
          )}
          {stats.recentEvents.map((event: any, i: number) => (
            <div key={event.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: i < stats.recentEvents.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: EVENT_COLORS[event.event_type] || '#c9a96e',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#c8c0b4', fontSize: '13px' }}>
                  {event.summary || `${event.event_type} — ${event.vendor_name || event.vendor_ref || 'system'}`}
                </div>
                {event.actor_name && (
                  <div style={{ color: '#5a5550', fontSize: '11px', marginTop: '2px' }}>
                    {event.actor_name} {event.actor_email ? `(${event.actor_email})` : ''}
                  </div>
                )}
              </div>
              {event.vendor_ref && (
                <a href={`/admin/vendors/${event.vendor_ref}`} style={{
                  color: '#7a7570', fontSize: '11px', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}>
                  {event.vendor_ref}
                </a>
              )}
              <div style={{ color: '#5a5550', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {timeAgo(event.created_at)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
