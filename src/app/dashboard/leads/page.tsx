'use client'

import { useState, useEffect } from 'react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  event_date: string
  interest: string
  message: string
  status: string
  created_at: string
}

export default function LeadsPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) {
      const v = JSON.parse(stored)
      setVendor(v)
      fetchLeads(v.ref)
    }
  }, [])

  const fetchLeads = async (ref: string) => {
    try {
      const res = await fetch(`/api/dashboard/leads?ref=${ref}`)
      const data = await res.json()
      setLeads(data.leads || [])
    } catch { /* empty for now */ }
    setLoading(false)
  }

  const updateStatus = async (leadId: string, status: string) => {
    try {
      await fetch('/api/dashboard/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status })
      })
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
    } catch {}
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Inquiries from your vendor page contact form</p>
        </div>
        <div className="filter-row">
          {['all', 'new', 'contacted', 'booked', 'lost'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && <span className="filter-count">{leads.filter(l => l.status === f).length}</span>}
            </button>
          ))}
        </div>
      </header>

      <div className="page-content">
        {loading ? (
          <div className="empty-state">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📬</div>
            <h3>No leads yet</h3>
            <p>When people submit the contact form on your vendor page, they'll appear here. Share your page link to start getting inquiries.</p>
          </div>
        ) : (
          <div className="leads-list">
            {filtered.map(lead => (
              <div key={lead.id} className={`lead-card ${lead.status === 'new' ? 'is-new' : ''}`}>
                <div className="lead-header">
                  <div>
                    <h4 className="lead-name">{lead.name}</h4>
                    <div className="lead-meta">
                      {lead.email && <span>✉️ {lead.email}</span>}
                      {lead.phone && <span>📱 {lead.phone}</span>}
                      {lead.event_date && <span>📅 {new Date(lead.event_date).toLocaleDateString()}</span>}
                      {lead.interest && <span>💍 {lead.interest}</span>}
                    </div>
                  </div>
                  <select
                    className="status-select"
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                  >
                    <option value="new">🟢 New</option>
                    <option value="contacted">🔵 Contacted</option>
                    <option value="booked">🟡 Booked</option>
                    <option value="lost">⚪ Lost</option>
                  </select>
                </div>
                {lead.message && (
                  <div className="lead-message">{lead.message}</div>
                )}
                <div className="lead-footer">
                  <span className="lead-date">{new Date(lead.created_at).toLocaleDateString()}</span>
                  <div className="lead-actions">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="action-btn">✉️ Email</a>
                    )}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="action-btn">📱 Call</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-header {
          background: #fff;
          border-bottom: 1px solid #e4ddd4;
          padding: 20px 32px;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .filter-row { display: flex; gap: 6px; margin-top: 14px; flex-wrap: wrap; }
        .filter-btn {
          padding: 6px 14px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 20px;
          font-size: 12px;
          color: #6b5e52;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .filter-btn:hover { border-color: #c9944a; }
        .filter-btn.active { background: rgba(201,148,74,0.12); border-color: #c9944a; color: #c9944a; font-weight: 600; }
        .filter-count {
          background: rgba(201,148,74,0.15);
          padding: 1px 7px;
          border-radius: 10px;
          font-size: 11px;
        }
        .page-content { padding: 28px 32px; max-width: 800px; }
        .empty-state {
          text-align: center;
          padding: 48px 20px;
          color: #6b5e52;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
        .empty-state h3 { font-size: 18px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .empty-state p { font-size: 14px; max-width: 400px; margin: 0 auto; line-height: 1.5; }
        .leads-list { display: flex; flex-direction: column; gap: 12px; }
        .lead-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          padding: 20px;
          transition: border-color 0.2s;
        }
        .lead-card:hover { border-color: #c9944a; }
        .lead-card.is-new { border-left: 3px solid #22c55e; }
        .lead-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 10px;
        }
        .lead-name { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .lead-meta {
          display: flex;
          gap: 14px;
          font-size: 13px;
          color: #6b5e52;
          flex-wrap: wrap;
        }
        .status-select {
          padding: 6px 10px;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          background: #fff;
          font-size: 12px;
          color: #2c2420;
          cursor: pointer;
          font-family: inherit;
        }
        .lead-message {
          font-size: 14px;
          color: #6b5e52;
          line-height: 1.6;
          padding: 12px;
          background: #f3efe9;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .lead-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .lead-date { font-size: 12px; color: #9a8d80; }
        .lead-actions { display: flex; gap: 8px; }
        .action-btn {
          padding: 6px 14px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 6px;
          font-size: 12px;
          color: #6b5e52;
          text-decoration: none;
          transition: all 0.15s;
        }
        .action-btn:hover { border-color: #c9944a; color: #c9944a; }
        @media (max-width: 768px) {
          .page-header { padding: 16px 20px; }
          .page-content { padding: 20px; }
          .lead-header { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}

