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

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((r) => r.json())
      .then((data) => setLeads(data.leads || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#7a7570', padding: '40px 0' }}>Loading leads...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', color: '#e8e0d4', fontWeight: 300, margin: 0 }}>Leads & Messages</h1>
        <p style={{ color: '#5a5550', fontSize: '13px', margin: '4px 0 0' }}>{leads.length} form submissions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* List */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {leads.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#5a5550', fontSize: '13px', fontStyle: 'italic' }}>
              No leads submitted yet.
            </div>
          )}
          {leads.map((lead: any, i: number) => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              style={{
                padding: '16px 20px',
                borderBottom: i < leads.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: 'pointer',
                background: selectedLead?.id === lead.id ? 'rgba(201,169,110,0.06)' : 'transparent',
                borderLeft: selectedLead?.id === lead.id ? '3px solid #c9a96e' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#e8e0d4', fontSize: '14px' }}>{lead.name || 'Unknown'}</div>
                  <div style={{ color: '#5a5550', fontSize: '11px', marginTop: '2px' }}>{lead.email}</div>
                </div>
                <span style={{ color: '#5a5550', fontSize: '10px', whiteSpace: 'nowrap' }}>{timeAgo(lead.created_at)}</span>
              </div>
              {lead.vendor_ref && (
                <div style={{
                  marginTop: '6px', fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                  background: 'rgba(201,169,110,0.1)', color: '#c9a96e', display: 'inline-block',
                }}>
                  → {lead.vendor_ref}
                </div>
              )}
              {lead.message && (
                <div style={{
                  color: '#7a7570', fontSize: '12px', marginTop: '6px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {lead.message}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail pane */}
        {selectedLead && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '24px',
            position: 'sticky',
            top: '32px',
            alignSelf: 'flex-start',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ color: '#e8e0d4', fontSize: '20px', fontWeight: 300, margin: 0 }}>{selectedLead.name}</h2>
                <div style={{ color: '#7a7570', fontSize: '13px', marginTop: '4px' }}>{selectedLead.email}</div>
                {selectedLead.phone && <div style={{ color: '#7a7570', fontSize: '13px', marginTop: '2px' }}>{selectedLead.phone}</div>}
              </div>
              <button onClick={() => setSelectedLead(null)} style={{
                background: 'none', border: 'none', color: '#5a5550', cursor: 'pointer', fontSize: '18px',
              }}>×</button>
            </div>

            <div style={{
              padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
              marginBottom: '16px',
            }}>
              <div style={{ color: '#5a5550', fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Message
              </div>
              <div style={{ color: '#c8c0b4', fontSize: '14px', lineHeight: '1.6' }}>
                {selectedLead.message || <em style={{ color: '#5a5550' }}>No message</em>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#5a5550' }}>
              <div>
                <span style={{ color: '#7a7570' }}>Submitted: </span>{formatDate(selectedLead.created_at)}
              </div>
            </div>

            {selectedLead.vendor_ref && (
              <div style={{ marginTop: '16px' }}>
                <span style={{ color: '#5a5550', fontSize: '11px' }}>Submitted on vendor page: </span>
                <a href={`/admin/vendors/${selectedLead.vendor_ref}`} style={{
                  color: '#c9a96e', fontSize: '12px', textDecoration: 'none',
                }}>{selectedLead.vendor_ref} →</a>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
              <a href={`mailto:${selectedLead.email}`} style={{
                padding: '8px 16px', fontSize: '12px', borderRadius: '6px',
                background: 'rgba(201,169,110,0.15)', color: '#c9a96e',
                textDecoration: 'none', border: '1px solid rgba(201,169,110,0.2)',
              }}>Reply via Email</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
