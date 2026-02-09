'use client';

import { useEffect, useState } from 'react';

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

export default function AdminCouples() {
  const [couples, setCouples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/couples')
      .then((r) => r.json())
      .then((data) => setCouples(data.couples || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#7a7570', padding: '40px 0' }}>Loading couples...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', color: '#e8e0d4', fontWeight: 300, margin: 0 }}>Couples</h1>
        <p style={{ color: '#5a5550', fontSize: '13px', margin: '4px 0 0' }}>{couples.length} registered couples</p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11px', color: '#5a5550', letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>
          <span>Couple</span>
          <span>Email</span>
          <span>Wedding</span>
          <span>Referred By</span>
          <span></span>
        </div>

        {couples.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>
            No couples have signed up yet.
          </div>
        )}

        {couples.map((c: any, i: number) => (
          <div key={c.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px',
            padding: '14px 20px',
            borderBottom: i < couples.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ color: '#e8e0d4', fontSize: '14px' }}>{c.partner_a} & {c.partner_b}</div>
              <div style={{ color: '#5a5550', fontSize: '10px', marginTop: '2px' }}>slug: {c.slug}</div>
            </div>
            <div style={{ color: '#7a7570', fontSize: '12px' }}>{c.email || '—'}</div>
            <div style={{ color: '#7a7570', fontSize: '12px' }}>{c.wedding_date || '—'}</div>
            <div>
              {c.referred_by_vendor ? (
                <a href={`/admin/vendors/${c.vendor_ref || ''}`} style={{
                  color: '#c9a96e', fontSize: '12px', textDecoration: 'none',
                }}>{c.referred_by_vendor}</a>
              ) : (
                <span style={{ color: '#5a5550', fontSize: '12px' }}>—</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <a href={`/sanctuary/celebrate/couple/${c.slug}/dashboard`} target="_blank" style={{
                color: '#c9a96e', fontSize: '11px', textDecoration: 'none',
              }}>View ↗</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
