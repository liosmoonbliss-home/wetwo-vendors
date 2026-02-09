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

export default function AdminShoppers() {
  const [shoppers, setShoppers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/shoppers')
      .then((r) => r.json())
      .then((data) => setShoppers(data.shoppers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#7a7570', padding: '40px 0' }}>Loading shoppers...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', color: '#e8e0d4', fontWeight: 300, margin: 0 }}>Shoppers</h1>
        <p style={{ color: '#5a5550', fontSize: '13px', margin: '4px 0 0' }}>{shoppers.length} registered shoppers</p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1fr 1fr',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11px', color: '#5a5550', letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>
          <span>Name</span>
          <span>Email</span>
          <span>Referred By</span>
          <span>Signed Up</span>
        </div>

        {shoppers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>
            No shoppers have signed up yet.
          </div>
        )}

        {shoppers.map((s: any, i: number) => (
          <div key={s.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr',
            padding: '14px 20px',
            borderBottom: i < shoppers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            alignItems: 'center',
          }}>
            <div style={{ color: '#e8e0d4', fontSize: '14px' }}>{s.name || '—'}</div>
            <div style={{ color: '#7a7570', fontSize: '12px' }}>{s.email || '—'}</div>
            <div>
              {s.vendor_ref ? (
                <a href={`/admin/vendors/${s.vendor_ref}`} style={{
                  color: '#c9a96e', fontSize: '12px', textDecoration: 'none',
                }}>{s.vendor_ref}</a>
              ) : <span style={{ color: '#5a5550', fontSize: '12px' }}>—</span>}
            </div>
            <div style={{ color: '#5a5550', fontSize: '12px' }}>{timeAgo(s.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
