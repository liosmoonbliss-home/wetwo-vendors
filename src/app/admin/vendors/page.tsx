'use client';

import { useEffect, useState } from 'react';

export default function AdminVendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We'll query the vendors table directly via a small API
    fetch('/api/admin/events?type=_vendors_list')
      .then(() => {
        // Fallback: use the directory API but we need all vendors, not just active
        // Let's fetch from the stats endpoint vendors list
      })
      .catch(console.error);

    // Actually, let's just fetch vendors via a dedicated call
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/admin/vendors');
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#7a7570', fontSize: '14px', padding: '40px 0' }}>Loading vendors...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', color: '#e8e0d4', fontWeight: 300, margin: 0 }}>Vendors</h1>
        <p style={{ color: '#5a5550', fontSize: '13px', margin: '4px 0 0' }}>{vendors.length} total vendors</p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11px',
          color: '#5a5550',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          <span>Vendor</span>
          <span>Category</span>
          <span>Location</span>
          <span>Status</span>
          <span></span>
        </div>

        {vendors.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>
            No vendors found.
          </div>
        )}

        {vendors.map((v: any, i: number) => (
          <div key={v.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
            padding: '14px 20px',
            borderBottom: i < vendors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ color: '#e8e0d4', fontSize: '14px' }}>{v.business_name || v.ref}</div>
              <div style={{ color: '#5a5550', fontSize: '11px', marginTop: '2px' }}>{v.email || ''}</div>
            </div>
            <div style={{ color: '#7a7570', fontSize: '12px' }}>{v.category || '—'}</div>
            <div style={{ color: '#7a7570', fontSize: '12px' }}>
              {v.state ? `${v.city || ''} ${v.state}`.trim() : '—'}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {v.page_active && (
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                  background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                }}>Active</span>
              )}
              {v.subscription_active && (
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                  background: 'rgba(201,169,110,0.15)', color: '#c9a96e',
                }}>Sponsor</span>
              )}
              {!v.page_active && !v.subscription_active && (
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                  background: 'rgba(255,255,255,0.04)', color: '#5a5550',
                }}>Inactive</span>
              )}
            </div>
            <a href={`/admin/vendors/${v.ref}`} style={{
              color: '#c9a96e', fontSize: '12px', textDecoration: 'none', textAlign: 'right',
            }}>
              View →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
