'use client'

import { useState, useEffect } from 'react'

export default function PageEditorPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) {
      const v = JSON.parse(stored)
      setVendor(v)
      // Load past requests
      fetch(`/api/vendor-requests?ref=${v.ref}`)
        .then(r => r.json())
        .then(d => setRequests(d.requests || []))
        .catch(() => {})
        .finally(() => setLoadingRequests(false))
    }
  }, [])

  const submitRequest = async () => {
    if (!message.trim() || !vendor || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/vendor-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_ref: vendor.ref,
          vendor_name: vendor.business_name || vendor.contact_name || '',
          message: message.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        setMessage('')
        setRequests(prev => [data.request, ...prev])
        setTimeout(() => setSent(false), 4000)
      }
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setSending(false)
    }
  }

  if (!vendor) return null

  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`

  const statusLabel = (status: string) => {
    switch (status) {
      case 'new': return { text: 'Pending', color: '#c9944a', bg: 'rgba(201,148,74,0.1)' }
      case 'in_progress': return { text: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }
      case 'done': return { text: 'Done', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }
      case 'dismissed': return { text: 'Closed', color: '#9a8d80', bg: 'rgba(154,141,128,0.1)' }
      default: return { text: status, color: '#9a8d80', bg: 'rgba(154,141,128,0.1)' }
    }
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Your Page</h1>
          <p className="page-subtitle">View your landing page and request changes</p>
        </div>
        <a href={pageLink} target="_blank" rel="noopener" className="header-btn">
          View Live Page →
        </a>
      </header>

      <div className="page-content">
        {/* Page Preview */}
        <div className="preview-card">
          <div className="preview-header">
            <h3>📱 Live Preview</h3>
            <a href={pageLink} target="_blank" rel="noopener" className="preview-link">Open in new tab →</a>
          </div>
          <div className="preview-frame">
            <iframe src={pageLink} title="Vendor Page Preview" className="preview-iframe" />
          </div>
        </div>

        {/* Page Info */}
        <div className="info-card">
          <h3>Page Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Business Name</label>
              <div>{vendor.business_name}</div>
            </div>
            <div className="info-item">
              <label>Category</label>
              <div>{vendor.category || '—'}</div>
            </div>
            <div className="info-item">
              <label>Location</label>
              <div>{[vendor.city, vendor.state].filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div className="info-item">
              <label>Page URL</label>
              <div className="url-text">{pageLink}</div>
            </div>
          </div>
        </div>

        {/* ===== REQUEST A CHANGE ===== */}
        <div className="request-card">
          <div className="request-header">
            <span className="request-icon">✏️</span>
            <div>
              <h3>Request a Change</h3>
              <p>Tell us what you'd like updated — your bio, photos, headline, packages, theme, anything. We'll take care of it.</p>
            </div>
          </div>

          <div className="request-form">
            <textarea
              className="request-input"
              placeholder="Example: Update my bio to mention that I specialize in outdoor weddings. Also, can you add my new logo?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <div className="request-actions">
              <span className="request-hint">We typically apply changes within 24 hours.</span>
              <button
                className={`request-btn ${sent ? 'sent' : ''}`}
                onClick={submitRequest}
                disabled={!message.trim() || sending || sent}
              >
                {sent ? '✓ Sent!' : sending ? 'Sending...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>

        {/* ===== PAST REQUESTS ===== */}
        {!loadingRequests && requests.length > 0 && (
          <div className="history-card">
            <h3>Your Requests</h3>
            <div className="history-list">
              {requests.map((r) => {
                const s = statusLabel(r.status)
                return (
                  <div key={r.id} className="history-item">
                    <div className="history-top">
                      <span className="history-status" style={{ color: s.color, background: s.bg }}>
                        {s.text}
                      </span>
                      <span className="history-date">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="history-message">{r.message}</p>
                    {r.admin_notes && (
                      <div className="history-notes">
                        <strong>Response:</strong> {r.admin_notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-header {
          background: #fff; border-bottom: 1px solid #e4ddd4; padding: 20px 32px;
          position: sticky; top: 0; z-index: 50;
          display: flex; justify-content: space-between; align-items: center;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .header-btn {
          padding: 8px 16px; background: transparent; border: 1px solid #e4ddd4; border-radius: 8px;
          color: #6b5e52; text-decoration: none; font-size: 13px; font-weight: 600; transition: all 0.2s;
        }
        .header-btn:hover { border-color: #c9944a; color: #c9944a; }
        .page-content { padding: 28px 32px; max-width: 900px; }

        .preview-card {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 14px;
          overflow: hidden; margin-bottom: 20px;
        }
        .preview-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; border-bottom: 1px solid #e4ddd4;
        }
        .preview-header h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0; }
        .preview-link { font-size: 13px; color: #c9944a; text-decoration: none; }
        .preview-frame { background: #f3efe9; padding: 12px; }
        .preview-iframe {
          width: 100%; height: 500px; border: 1px solid #e4ddd4;
          border-radius: 8px; background: #fff;
        }

        .info-card {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 14px;
          padding: 24px; margin-bottom: 20px;
        }
        .info-card h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .info-item label {
          font-size: 11px; font-weight: 600; color: #9a8d80;
          text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;
        }
        .info-item div { font-size: 14px; color: #2c2420; }
        .url-text { font-size: 12px; color: #c9944a; word-break: break-all; }

        /* ===== REQUEST CARD ===== */
        .request-card {
          background: #fff; border: 2px solid rgba(201,148,74,0.25); border-radius: 14px;
          padding: 24px; margin-bottom: 20px;
        }
        .request-header {
          display: flex; gap: 14px; align-items: flex-start; margin-bottom: 20px;
        }
        .request-icon { font-size: 28px; flex-shrink: 0; }
        .request-header h3 { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .request-header p { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .request-form { display: flex; flex-direction: column; gap: 12px; }
        .request-input {
          width: 100%; padding: 14px 16px; border: 1px solid #e4ddd4; border-radius: 10px;
          font-size: 14px; color: #2c2420; font-family: inherit; line-height: 1.6;
          resize: vertical; background: #faf8f5; transition: border-color 0.2s;
        }
        .request-input:focus {
          outline: none; border-color: #c9944a;
          box-shadow: 0 0 0 3px rgba(201,148,74,0.1);
        }
        .request-input::placeholder { color: #b5aa9e; }
        .request-actions {
          display: flex; justify-content: space-between; align-items: center;
        }
        .request-hint { font-size: 12px; color: #9a8d80; }
        .request-btn {
          padding: 10px 24px; background: #c9944a; color: #fff; border: none;
          border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .request-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .request-btn:disabled { opacity: 0.6; cursor: default; }
        .request-btn.sent { background: #22c55e; }

        /* ===== HISTORY ===== */
        .history-card {
          background: #fff; border: 1px solid #e4ddd4; border-radius: 14px;
          padding: 24px;
        }
        .history-card h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .history-list { display: flex; flex-direction: column; gap: 12px; }
        .history-item {
          padding: 14px 16px; background: #faf8f5; border-radius: 10px;
          border: 1px solid #ede8e1;
        }
        .history-top {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
        }
        .history-status {
          font-size: 11px; font-weight: 700; padding: 3px 10px;
          border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .history-date { font-size: 12px; color: #9a8d80; }
        .history-message { font-size: 14px; color: #4a3f35; margin: 0; line-height: 1.6; }
        .history-notes {
          margin-top: 10px; padding: 10px 12px; background: rgba(34,197,94,0.05);
          border: 1px solid rgba(34,197,94,0.15); border-radius: 8px;
          font-size: 13px; color: #4a3f35; line-height: 1.5;
        }
        .history-notes strong { color: #22c55e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px; }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 12px; align-items: flex-start; padding: 16px 20px; }
          .page-content { padding: 20px; }
          .info-grid { grid-template-columns: 1fr; }
          .request-header { flex-direction: column; }
          .request-actions { flex-direction: column; gap: 8px; align-items: stretch; }
          .request-hint { text-align: center; }
        }
      `}</style>
    </div>
  )
}
