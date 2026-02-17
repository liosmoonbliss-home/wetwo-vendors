'use client'

import DashboardTracker from '@/components/dashboard/DashboardTracker';
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import ClaudeWidget from './components/ClaudeWidget'

interface NavItem {
  label: string
  icon: string
  href: string
  countKey?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Command Center',
    items: [
      { label: 'Home', icon: '🏠', href: '/dashboard' },
      { label: 'Outreach Kit', icon: '🎁', href: '/dashboard/links' },
    ]
  },
  {
    title: 'Your Network',
    items: [
      { label: 'Couples', icon: '💍', href: '/dashboard/couples', countKey: 'couples' },
      { label: 'Shoppers', icon: '🛒', href: '/dashboard/shoppers', countKey: 'clients' },
      { label: 'Leads', icon: '📬', href: '/dashboard/leads', countKey: 'leads' },
    ]
  },
  {
    title: 'AI Assistant',
    items: [
      { label: 'Ask Claude', icon: '✨', href: '/dashboard/assistant' },
    ]
  },
  {
    title: 'Your Page',
    items: [
      { label: 'Edit Page', icon: '⚡', href: '/dashboard/page-editor' },
    ]
  },
  {
    title: 'Earnings',
    items: [
      { label: 'Commission', icon: '💰', href: '/dashboard/earnings' },
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', icon: '⚙️', href: '/dashboard/settings' },
    ]
  },
]

interface Counts {
  couples: number
  clients: number
  leads: number
  newCouples: number
  newClients: number
  newLeads: number
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [vendor, setVendor] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Counts>({ couples: 0, clients: 0, leads: 0, newCouples: 0, newClients: 0, newLeads: 0 })

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      const session = JSON.parse(stored)
      setVendor(session)
    } catch {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [router])

  // Log vendor session (debounced server-side to once per 2 hours)
  useEffect(() => {
    if (!vendor?.ref) return
    fetch('/api/vendor-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: vendor.ref,
        business_name: vendor.business_name,
        email: vendor.email,
        plan: vendor.plan,
      }),
    }).catch(() => {})
  }, [vendor])

  // Fetch counts for sidebar
  useEffect(() => {
    if (!vendor?.ref) return
    fetch(`/api/vendor-counts?ref=${vendor.ref}`)
      .then(r => r.json())
      .then(data => setCounts(data))
      .catch(() => {})
  }, [vendor])

  const handleLogout = () => {
    localStorage.removeItem('wetwo_vendor_session')
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark, #faf8f5)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <div style={{ color: '#6b5e52', fontSize: 14 }}>Loading your command center...</div>
        </div>
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href.split('?')[0])
  }

  // Map countKey to count and new status
  const getCountInfo = (countKey?: string): { count: number; isNew: boolean } | null => {
    if (!countKey) return null
    switch (countKey) {
      case 'couples': return { count: counts.couples, isNew: counts.newCouples > 0 }
      case 'clients': return { count: counts.clients, isNew: counts.newClients > 0 }
      case 'leads': return { count: counts.leads, isNew: counts.newLeads > 0 }
      default: return null
    }
  }

  // Tier display for sidebar footer
  const getTierLabel = () => {
    const tier = vendor?.boost_tier || vendor?.plan || 'free'
    switch (tier) {
      case 'elite': return 'Elite Plan'
      case 'pro': return 'Pro Plan'
      default: return 'Free Plan'
    }
  }

  return (
    <div className="dashboard-shell">
      {/* Mobile header */}
      <header className="dashboard-mobile-header">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <span className="mobile-brand">✨ {vendor?.business_name || 'WeTwo'}</span>
        <Link href={`/vendor/${vendor?.ref}`} target="_blank" className="mobile-view-page">
          View Page →
        </Link>
      </header>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-name">✨ {vendor?.business_name || 'WeTwo Vendor'}</div>
          <div className="sidebar-brand-url">{vendor?.ref ? `wetwo-vendors.vercel.app/vendor/${vendor.ref}` : ''}</div>
        </div>

        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => {
                const countInfo = getCountInfo(item.countKey)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {countInfo && (
                      <span className="nav-count-group">
                        <span className="nav-count">{countInfo.count}</span>
                        {countInfo.isNew && <span className="nav-new-dot" title="New in last 48 hours" />}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}

          <div className="nav-section">
            <button className="nav-link logout-link" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span>Log Out</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link href={`/vendor/${vendor?.ref}`} target="_blank" className="sidebar-view-page">
            <div className="sidebar-avatar">
              {(vendor?.contact_name || vendor?.business_name || 'V')[0].toUpperCase()}
            </div>
            <div>
              <div className="sidebar-user-name">{vendor?.contact_name || vendor?.business_name}</div>
              <div className="sidebar-user-plan">{getTierLabel()}</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <DashboardTracker />
        {children}
      </main>

      {/* Claude Widget — floating on every page */}
      <ClaudeWidget />

      <style jsx>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: var(--bg-dark, #faf8f5);
        }
        .dashboard-mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 60;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border, #e4ddd4);
          padding: 12px 16px;
          align-items: center;
          justify-content: space-between;
        }
        .sidebar-toggle {
          background: none;
          border: 1px solid var(--border, #e4ddd4);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 18px;
          cursor: pointer;
          color: var(--text, #2c2420);
        }
        .mobile-brand {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--brand, #c9944a);
        }
        .mobile-view-page {
          font-size: 12px;
          color: var(--brand, #c9944a);
          text-decoration: none;
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 90;
        }
        .dashboard-sidebar {
          width: 260px;
          background: #fff;
          border-right: 1px solid var(--border, #e4ddd4);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        .sidebar-header {
          padding: 24px 20px 16px;
          border-bottom: 1px solid var(--border, #e4ddd4);
        }
        .sidebar-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--brand, #c9944a);
          margin-bottom: 4px;
        }
        .sidebar-brand-url {
          font-size: 11px;
          color: #9a8d80;
          word-break: break-all;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
        }
        .nav-section {
          margin-bottom: 20px;
        }
        .nav-section-title {
          font-size: 10px;
          font-weight: 700;
          color: #9a8d80;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 6px 12px;
        }
        .nav-link, .logout-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #6b5e52;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .nav-link:hover, .logout-link:hover {
          background: #f0ece6;
          color: #2c2420;
        }
        .nav-link.active {
          background: rgba(201,148,74,0.12);
          color: #c9944a;
          font-weight: 600;
        }
        .nav-icon {
          font-size: 16px;
          width: 22px;
          text-align: center;
          flex-shrink: 0;
        }
        .nav-label {
          flex: 1;
        }
        .nav-count-group {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
        }
        .nav-count {
          font-size: 12px;
          font-weight: 600;
          color: #9a8d80;
          background: #f0ece6;
          padding: 1px 8px;
          border-radius: 10px;
          min-width: 22px;
          text-align: center;
        }
        .nav-link.active .nav-count {
          color: #c9944a;
          background: rgba(201,148,74,0.15);
        }
        .nav-new-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border, #e4ddd4);
        }
        .sidebar-view-page {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s;
        }
        .sidebar-view-page:hover {
          background: #f0ece6;
        }
        .sidebar-avatar {
          width: 34px;
          height: 34px;
          background: var(--brand, #c9944a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #faf8f5;
          font-size: 14px;
          flex-shrink: 0;
        }
        .sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #2c2420;
        }
        .sidebar-user-plan {
          font-size: 11px;
          color: var(--brand, #c9944a);
        }
        .dashboard-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
        }
        @media (max-width: 768px) {
          .dashboard-mobile-header {
            display: flex;
          }
          .sidebar-overlay {
            display: block;
          }
          .dashboard-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
          .dashboard-main {
            margin-left: 0;
            padding-top: 56px;
          }
        }
      `}</style>
    </div>
  )
}
