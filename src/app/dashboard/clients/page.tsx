'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CouplesPanel from '@/components/dashboard/CouplesPanel'

function ClientsContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') || 'couple'
  const [vendor, setVendor] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState(typeParam)

  // Sync tab state with URL when searchParams change (fixes sidebar nav)
  useEffect(() => {
    setType(typeParam)
  }, [typeParam])

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) {
      const v = JSON.parse(stored)
      setVendor(v)
      fetchClients(v.ref)
    }
  }, [])

  const fetchClients = async (ref: string) => {
    try {
      const res = await fetch(`/api/dashboard/clients?ref=${ref}`)
      const data = await res.json()
      setClients(data.clients || [])
    } catch {}
    setLoading(false)
  }

  const couples = clients.filter(c => c.type === 'couple')
  const shoppers = clients.filter(c => c.type === 'shopper')

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">{type === 'couple' ? '💍 Couples' : '🛒 Clients'}</h1>
          <p className="page-subtitle">
            {type === 'couple' 
              ? 'Couples you\'ve shared the registry link with'
              : 'Everyone else you\'ve shared your cashback link with'
            }
          </p>
        </div>
        <div className="tab-row">
          <button className={`tab-btn ${type === 'couple' ? 'active' : ''}`} onClick={() => setType('couple')}>
            💍 Couples <span className="tab-count">{couples.length}</span>
          </button>
          <button className={`tab-btn ${type === 'shopper' ? 'active' : ''}`} onClick={() => setType('shopper')}>
            🛒 Clients <span className="tab-count">{shoppers.length}</span>
          </button>
        </div>
      </header>

      <div className="page-content">
        {/* COUPLES TAB — Rich CouplesPanel */}
        {type === 'couple' && vendor && (
          <CouplesPanel vendorId={vendor.id} vendorRef={vendor.ref} />
        )}

        {/* SHOPPERS TAB — Original client cards */}
        {type === 'shopper' && (
          <>
            {loading ? (
              <div className="empty-state">Loading...</div>
            ) : shoppers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <h3>No clients yet</h3>
                <p>When people shop through your cashback link, they'll appear here.</p>
                <a href="/dashboard/links" className="empty-cta">Go to Your Links →</a>
              </div>
            ) : (
              <div className="client-list">
                {shoppers.map(client => (
                  <div key={client.id} className="client-card">
                    <div className="client-avatar">
                      {(client.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="client-info">
                      <h4>{client.name || 'Unknown'}</h4>
                      <div className="client-meta">
                        {client.email && <span>✉️ {client.email}</span>}
                        {client.registered && <span className="badge green">Registered</span>}
                        {client.total_purchases > 0 && <span className="badge gold">${client.total_purchases.toFixed(0)} purchased</span>}
                      </div>
                    </div>
                    {client.commission_earned > 0 && (
                      <div className="client-earned">${client.commission_earned.toFixed(2)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
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
        .tab-row { display: flex; gap: 8px; margin-top: 14px; }
        .tab-btn {
          padding: 8px 16px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 13px;
          color: #6b5e52;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s;
        }
        .tab-btn:hover { border-color: #c9944a; }
        .tab-btn.active { background: rgba(201,148,74,0.12); border-color: #c9944a; color: #c9944a; font-weight: 600; }
        .tab-count { font-size: 12px; opacity: 0.7; }
        .page-content { padding: 28px 32px; max-width: 800px; }
        .empty-state { text-align: center; padding: 48px 20px; color: #6b5e52; }
        .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
        .empty-state h3 { font-size: 18px; font-weight: 700; color: #2c2420; margin: 0 0 6px; }
        .empty-state p { font-size: 14px; max-width: 400px; margin: 0 auto 16px; line-height: 1.5; }
        .empty-cta {
          display: inline-block;
          padding: 10px 20px;
          background: #c9944a;
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }
        .client-list { display: flex; flex-direction: column; gap: 10px; }
        .client-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          padding: 16px 20px;
          transition: border-color 0.2s;
        }
        .client-card:hover { border-color: #c9944a; }
        .client-avatar {
          width: 38px;
          height: 38px;
          background: #c9944a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          font-size: 14px;
          flex-shrink: 0;
        }
        .client-info { flex: 1; }
        .client-info h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .client-meta { display: flex; gap: 12px; font-size: 13px; color: #6b5e52; flex-wrap: wrap; align-items: center; }
        .badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }
        .badge.green { background: rgba(34,197,94,0.1); color: #22c55e; }
        .badge.gold { background: rgba(201,148,74,0.1); color: #c9944a; }
        .client-earned {
          font-size: 18px;
          font-weight: 700;
          color: #22c55e;
        }
        @media (max-width: 768px) {
          .page-header { padding: 16px 20px; }
          .page-content { padding: 20px; }
        }
      `}</style>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#6b5e52" }}>Loading...</div>}>
      <ClientsContent />
    </Suspense>
  )
}
