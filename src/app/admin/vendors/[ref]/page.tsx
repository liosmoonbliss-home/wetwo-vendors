'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const EVENT_COLORS: Record<string, string> = {
  dashboard_visit: '#4a9eff',
  claude_chat: '#a855f7',
  couple_signup: '#c9a96e',
  shopper_signup: '#22c55e',
  lead_form: '#f59e0b',
  vendor_created: '#ec4899',
  subscription_change: '#06b6d4',
  page_view: '#6b7280',
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#c9a96e' },
  { value: 'in_progress', label: 'In Progress', color: '#4a9eff' },
  { value: 'done', label: 'Done', color: '#22c55e' },
  { value: 'dismissed', label: 'Dismissed', color: '#7a7570' },
];

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminVendorDetail() {
  const params = useParams();
  const ref = params.ref as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'couples' | 'shoppers' | 'leads' | 'requests'>('activity');
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/vendors?ref=${ref}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch change requests for this vendor
    fetch(`/api/vendor-requests?ref=${ref}`)
      .then((r) => r.json())
      .then((d) => setRequests(d.requests || []))
      .catch(console.error)
      .finally(() => setRequestsLoading(false));
  }, [ref]);

  const updateRequest = async (id: string, status: string, admin_notes?: string) => {
    try {
      const body: any = { id, status };
      if (admin_notes !== undefined) body.admin_notes = admin_notes;
      const res = await fetch('/api/vendor-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.success) {
        setRequests(prev => prev.map(r => r.id === id ? d.request : r));
      }
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  if (loading) return <div style={{ color: '#7a7570', padding: '40px 0' }}>Loading vendor...</div>;
  if (!data?.vendor) return <div style={{ color: '#e74c3c' }}>Vendor not found</div>;

  const v = data.vendor;
  const couples = data.couples || [];
  const clients = data.clients || [];
  const leads = data.leads || [];
  const events = data.events || [];
  const newRequestCount = requests.filter(r => r.status === 'new').length;

  const tabs = [
    { key: 'activity', label: `Activity (${events.length})` },
    { key: 'requests', label: `Requests${newRequestCount > 0 ? ` (${newRequestCount} new)` : requests.length > 0 ? ` (${requests.length})` : ''}` },
    { key: 'couples', label: `Couples (${couples.length})` },
    { key: 'shoppers', label: `Shoppers (${clients.length})` },
    { key: 'leads', label: `Leads (${leads.length})` },
  ];

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '20px',
  };

  return (
    <div>
      {/* Back link */}
      <a href="/admin/vendors" style={{ color: '#7a7570', fontSize: '12px', textDecoration: 'none', letterSpacing: '0.5px' }}>
        ← ALL VENDORS
      </a>

      {/* Vendor Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', margin: '20px 0 28px' }}>
        {v.photo_url && (
          <img src={v.photo_url} alt="" style={{
            width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover',
            border: '1px solid rgba(255,255,255,0.08)',
          }} />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', color: '#e8e0d4', fontWeight: 300, margin: 0 }}>
            {v.business_name || v.ref}
          </h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            {v.page_active && <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '4px', background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Page Active</span>}
            {v.subscription_active && <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '4px', background: 'rgba(201,169,110,0.15)', color: '#c9a96e' }}>Sponsor</span>}
            {v.goaffpro_affiliate_id && <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '4px', background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>GoAffPro</span>}
            {v.category && <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: '#7a7570' }}>{v.category}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href={`/vendor/${v.ref}`} target="_blank" style={{
            padding: '8px 14px', fontSize: '12px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.05)', color: '#c8c0b4',
            textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)',
          }}>View Page ↗</a>
          <a href={`/dashboard?ref=${v.ref}`} target="_blank" style={{
            padding: '8px 14px', fontSize: '12px', borderRadius: '6px',
            background: 'rgba(201,169,110,0.15)', color: '#c9a96e',
            textDecoration: 'none', border: '1px solid rgba(201,169,110,0.2)',
          }}>Dashboard ↗</a>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={cardStyle}>
          <div style={{ color: '#5a5550', fontSize: '11px', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>Contact</div>
          <div style={{ color: '#c8c0b4', fontSize: '13px' }}>{v.email || '—'}</div>
          {v.phone && <div style={{ color: '#7a7570', fontSize: '12px', marginTop: '4px' }}>{v.phone}</div>}
          {v.state && <div style={{ color: '#7a7570', fontSize: '12px', marginTop: '4px' }}>{v.city ? `${v.city}, ` : ''}{v.state}</div>}
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#5a5550', fontSize: '11px', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>Tracking</div>
          <div style={{ color: '#7a7570', fontSize: '12px' }}>Ref: <span style={{ color: '#c8c0b4', fontFamily: 'monospace' }}>{v.ref}</span></div>
          {v.goaffpro_referral_code && <div style={{ color: '#7a7570', fontSize: '12px', marginTop: '4px' }}>GoAffPro: <span style={{ color: '#c8c0b4' }}>{v.goaffpro_referral_code}</span></div>}
          <div style={{ color: '#7a7570', fontSize: '12px', marginTop: '4px' }}>Created: {formatDate(v.created_at)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#5a5550', fontSize: '11px', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>Numbers</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ color: '#e8e0d4', fontSize: '24px', fontWeight: 300 }}>{couples.length}</div>
              <div style={{ color: '#5a5550', fontSize: '10px' }}>couples</div>
            </div>
            <div>
              <div style={{ color: '#e8e0d4', fontSize: '24px', fontWeight: 300 }}>{clients.length}</div>
              <div style={{ color: '#5a5550', fontSize: '10px' }}>shoppers</div>
            </div>
            <div>
              <div style={{ color: '#e8e0d4', fontSize: '24px', fontWeight: 300 }}>{leads.length}</div>
              <div style={{ color: '#5a5550', fontSize: '10px' }}>leads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '10px 20px', fontSize: '13px',
              color: activeTab === tab.key ? '#c9a96e' : '#5a5550',
              borderBottom: activeTab === tab.key ? '2px solid #c9a96e' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={cardStyle}>

        {/* ===== REQUESTS TAB ===== */}
        {activeTab === 'requests' && (
          <div>
            {requestsLoading ? (
              <div style={{ color: '#5a5550', fontSize: '13px' }}>Loading requests...</div>
            ) : requests.length === 0 ? (
              <div style={{ color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>No change requests from this vendor yet.</div>
            ) : requests.map((r: any, i: number) => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === r.status) || STATUS_OPTIONS[0];
              return (
                <div key={r.id} style={{
                  padding: '16px 0',
                  borderBottom: i < requests.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={r.status}
                        onChange={(e) => updateRequest(r.id, e.target.value)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${statusOpt.color}40`,
                          borderRadius: '4px',
                          color: statusOpt.color,
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <span style={{ color: '#5a5550', fontSize: '11px' }}>{timeAgo(r.created_at)}</span>
                  </div>

                  {/* Message */}
                  <div style={{
                    padding: '12px 14px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)', color: '#c8c0b4',
                    fontSize: '14px', lineHeight: '1.6', marginBottom: '10px',
                  }}>
                    {r.message}
                  </div>

                  {/* Admin notes - inline editable */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <input
                      type="text"
                      placeholder="Add a note (visible to vendor)..."
                      defaultValue={r.admin_notes || ''}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateRequest(r.id, r.status, (e.target as HTMLInputElement).value)
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value !== (r.admin_notes || '')) {
                          updateRequest(r.id, r.status, e.target.value)
                        }
                      }}
                      style={{
                        flex: 1, padding: '8px 12px', fontSize: '12px', color: '#c8c0b4',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px', fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            {events.length === 0 ? (
              <div style={{ color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>No activity recorded yet.</div>
            ) : events.map((e: any, i: number) => (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0',
                borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: EVENT_COLORS[e.event_type] || '#c9a96e', flexShrink: 0,
                }} />
                <div style={{ flex: 1, color: '#c8c0b4', fontSize: '13px' }}>
                  {e.summary || e.event_type}
                </div>
                <span style={{ color: '#5a5550', fontSize: '11px', whiteSpace: 'nowrap' }}>{timeAgo(e.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'couples' && (
          <div>
            {couples.length === 0 ? (
              <div style={{ color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>No couples signed up under this vendor yet.</div>
            ) : couples.map((c: any, i: number) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px 0',
                borderBottom: i < couples.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e8e0d4', fontSize: '14px' }}>{c.partner_a} & {c.partner_b}</div>
                  <div style={{ color: '#5a5550', fontSize: '11px', marginTop: '2px' }}>
                    {c.email} {c.wedding_date ? `· Wedding: ${c.wedding_date}` : ''} {c.state ? `· ${c.state}` : ''}
                  </div>
                </div>
                <a href={`/sanctuary/celebrate/couple/${c.slug}/dashboard`} target="_blank" style={{
                  color: '#c9a96e', fontSize: '11px', textDecoration: 'none',
                }}>Dashboard ↗</a>
                <span style={{ color: '#5a5550', fontSize: '11px' }}>{timeAgo(c.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shoppers' && (
          <div>
            {clients.length === 0 ? (
              <div style={{ color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>No shoppers signed up under this vendor yet.</div>
            ) : clients.map((c: any, i: number) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px 0',
                borderBottom: i < clients.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e8e0d4', fontSize: '14px' }}>{c.name || 'Unknown'}</div>
                  <div style={{ color: '#5a5550', fontSize: '11px', marginTop: '2px' }}>{c.email} {c.phone ? `· ${c.phone}` : ''}</div>
                </div>
                <span style={{ color: '#5a5550', fontSize: '11px' }}>{timeAgo(c.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leads' && (
          <div>
            {leads.length === 0 ? (
              <div style={{ color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>No leads submitted for this vendor yet.</div>
            ) : leads.map((l: any, i: number) => (
              <div key={l.id} style={{
                padding: '14px 0',
                borderBottom: i < leads.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#e8e0d4', fontSize: '14px' }}>{l.name || 'Unknown'}</div>
                    <div style={{ color: '#5a5550', fontSize: '11px', marginTop: '2px' }}>
                      {l.email} {l.phone ? `· ${l.phone}` : ''}
                    </div>
                  </div>
                  <span style={{ color: '#5a5550', fontSize: '11px' }}>{timeAgo(l.created_at)}</span>
                </div>
                {l.message && (
                  <div style={{
                    marginTop: '8px', padding: '10px 12px', borderRadius: '6px',
                    background: 'rgba(255,255,255,0.02)', color: '#9a9590', fontSize: '13px',
                    lineHeight: '1.5', fontStyle: 'italic',
                  }}>
                    "{l.message}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
