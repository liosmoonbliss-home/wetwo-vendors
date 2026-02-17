'use client'

import { useState, useEffect } from 'react'

interface Shopper {
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
}

export default function ShoppersPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [shoppers, setShoppers] = useState<Shopper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) {
      const v = JSON.parse(stored)
      setVendor(v)
      fetchShoppers(v.ref)
    }
  }, [])

  const fetchShoppers = async (ref: string) => {
    try {
      const res = await fetch(`/api/dashboard/shoppers?ref=${ref}`)
      const data = await res.json()
      setShoppers(data.shoppers || [])
    } catch {}
    setLoading(false)
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Shoppers</h1>
          <p className="page-subtitle">People who signed up to shop through your store</p>
        </div>
      </header>

      <div className="page-content">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : shoppers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No shoppers yet</h3>
            <p>{"When people sign up to shop through your store, they'll appear here. Share your store link to start building your network."}</p>
            <a href="/dashboard/links" className="empty-cta">Go to Your Links →</a>
          </div>
        ) : (
          <div className="shopper-list">
            {shoppers.map(s => (
              <div key={s.id} className={`shopper-card ${s.status === 'new' ? 'is-new' : ''}`}>
                <div className="shopper-avatar">
                  {(s.name || '?')[0].toUpperCase()}
                </div>
                <div className="shopper-info">
                  <h4>{s.name || 'Unknown'}</h4>
                  <div className="shopper-meta">
                    {s.email && <span>✉️ {s.email}</span>}
                    {s.phone && <span>📱 {s.phone}</span>}
                  </div>
                </div>
                <div className="shopper-date">
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
                <div className="shopper-actions">
                  {s.email && (
                    <a href={`mailto:${s.email}`} className="action-btn">✉️ Email</a>
                  )}
                  {s.phone && (
                    <a href={`tel:${s.phone}`} className="action-btn">📱 Call</a>
                  )}
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
        .page-content { padding: 28px 32px; max-width: 800px; }
        .empty-state { text-align: center; padding: 48px 20px; color: #6b5e52; }
        .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
        .empty-state h3 { font-size: 18px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .empty-state p { font-size: 14px; max-width: 400px; margin: 0 auto 16px; line-height: 1.5; }
        .empty-cta {
          display: inline-block; padding: 10px 20px; background: #c9944a; color: #fff;
          border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700;
        }
        .shopper-list { display: flex; flex-direction: column; gap: 10px; }
        .shopper-card {
          display: flex; align-items: center; gap: 14px;
          background: #fff; border: 1px solid #e4ddd4; border-radius: 12px;
          padding: 16px 20px; transition: border-color 0.2s;
        }
        .shopper-card:hover { border-color: #c9944a; }
        .shopper-card.is-new { border-left: 3px solid #22c55e; }
        .shopper-avatar {
          width: 38px; height: 38px; background: #22c55e; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #fff; font-size: 14px; flex-shrink: 0;
        }
        .shopper-info { flex: 1; }
        .shopper-info h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .shopper-meta { display: flex; gap: 12px; font-size: 13px; color: #6b5e52; flex-wrap: wrap; }
        .shopper-date { font-size: 12px; color: #9a8d80; flex-shrink: 0; }
        .shopper-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .action-btn {
          padding: 6px 14px; background: #f3efe9; border: 1px solid #e4ddd4;
          border-radius: 6px; font-size: 12px; color: #6b5e52;
          text-decoration: none; transition: all 0.15s;
        }
        .action-btn:hover { border-color: #c9944a; color: #c9944a; }
        @media (max-width: 768px) {
          .page-header { padding: 16px 20px; }
          .page-content { padding: 20px; }
          .shopper-card { flex-wrap: wrap; }
          .shopper-actions { width: 100%; justify-content: flex-end; }
        }
      `}</style>
    </div>
  )
}
