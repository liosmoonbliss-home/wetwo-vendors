#!/bin/bash
# WeTwo Vendor Command Center — Installer
# Run from your project root: /workspaces/wetwo-vendors

set -e
echo "🚀 Installing WeTwo Vendor Command Center..."
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p src/app/login
mkdir -p src/app/dashboard/links
mkdir -p src/app/dashboard/leads
mkdir -p src/app/dashboard/clients
mkdir -p src/app/dashboard/assistant
mkdir -p src/app/dashboard/earnings
mkdir -p src/app/dashboard/settings
mkdir -p src/app/dashboard/page-editor
mkdir -p src/app/api/auth/login
mkdir -p src/app/api/auth/create-account
mkdir -p src/app/api/auth/change-password
mkdir -p src/app/api/vendor-assistant
mkdir -p src/app/api/dashboard/leads
mkdir -p src/app/api/dashboard/clients
mkdir -p src/app/api/dashboard/stats
mkdir -p src/app/api/submit-lead
mkdir -p src/components
mkdir -p sql

echo "✅ Directories created"
echo ""

echo "📝 Creating src/app/login/page.tsx..."
cat > src/app/login/page.tsx << 'ENDOFFILE_3660b470'
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Store session
      localStorage.setItem('wetwo_vendor_session', JSON.stringify(data.vendor))
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">✨ WeTwo Vendors</div>
        <p className="login-tagline">Your command center</p>

        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to manage your page, links, and clients</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <a href="mailto:hello@wetwo.love">Contact us</a>
        </p>
      </div>

      <style jsx>{`
        .login-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #faf8f5, #f0ece6);
        }
        .login-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 16px;
          padding: 48px 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .login-logo {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          color: #c9944a;
          margin-bottom: 2px;
        }
        .login-tagline {
          font-size: 12px;
          color: #9a8d80;
          margin-bottom: 32px;
        }
        .login-title {
          font-size: 20px;
          font-weight: 700;
          color: #2c2420;
          margin-bottom: 6px;
        }
        .login-subtitle {
          font-size: 14px;
          color: #6b5e52;
          margin-bottom: 28px;
        }
        .login-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .form-group {
          text-align: left;
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #6b5e52;
          margin-bottom: 6px;
        }
        .form-group input {
          width: 100%;
          padding: 12px 14px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 15px;
          color: #2c2420;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #c9944a;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          font-family: inherit;
        }
        .login-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-footer {
          margin-top: 24px;
          font-size: 13px;
          color: #9a8d80;
        }
        .login-footer a {
          color: #c9944a;
          text-decoration: none;
        }
        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_3660b470

echo "📝 Creating src/app/dashboard/layout.tsx..."
cat > src/app/dashboard/layout.tsx << 'ENDOFFILE_9529ff67'
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_SECTIONS = [
  {
    title: 'Command Center',
    items: [
      { label: 'Home', icon: '🏠', href: '/dashboard' },
      { label: 'Your Links', icon: '🔗', href: '/dashboard/links' },
    ]
  },
  {
    title: 'Your Network',
    items: [
      { label: 'Couples', icon: '💍', href: '/dashboard/clients?type=couple' },
      { label: 'Clients', icon: '🛒', href: '/dashboard/clients?type=shopper' },
      { label: 'Leads', icon: '📬', href: '/dashboard/leads' },
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [vendor, setVendor] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
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
              <div className="sidebar-user-plan">
                {vendor?.plan === 'free' ? 'Free Plan' : 
                 vendor?.plan === 'starter' ? 'Starter — 10%' :
                 vendor?.plan === 'growth' ? 'Growth — 15%' : 'Pro — 20%'}
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {children}
      </main>

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

ENDOFFILE_9529ff67

echo "📝 Creating src/app/dashboard/page.tsx..."
cat > src/app/dashboard/page.tsx << 'ENDOFFILE_74f8dfad'
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardHome() {
  const [vendor, setVendor] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [stats, setStats] = useState({ leads: 0, couples: 0, shoppers: 0, totalCommission: 0 })

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) {
      const v = JSON.parse(stored)
      setVendor(v)
      // Fetch live stats
      fetch(`/api/dashboard/stats?ref=${v.ref}`)
        .then(r => r.json())
        .then(d => { if (d.stats) setStats(d.stats) })
        .catch(() => {})
    }
  }, [])

  const copyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!vendor) return null

  const baseUrl = 'https://wetwo.love'
  const shopLink = `${baseUrl}?ref=vendor-${vendor.ref}`
  const registryLink = `${baseUrl}/couple/signup?ref=vendor-${vendor.ref}`
  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`

  return (
    <div>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {vendor.contact_name || vendor.business_name} 👋</h1>
          <p className="page-subtitle">Your client acquisition & loyalty system</p>
        </div>
        <Link href={`/vendor/${vendor.ref}`} target="_blank" className="header-btn">
          View Your Page →
        </Link>
      </header>

      <div className="page-content">
        {/* Value Statement */}
        <div className="value-card">
          <div className="value-icon">🎁</div>
          <div>
            <h2 className="value-title">A loyalty system that costs you nothing and never discounts your prices.</h2>
            <p className="value-text">
              Your WeTwo links give anyone you share them with <strong>25% cashback</strong> on thousands of products — 
              home, fashion, kitchen, bedroom, registry. You don't pay a cent of that 25%. You don't discount your services. 
              This is a standalone gift you hand to your clients, couples, and anyone in your network.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value green">{vendor.plan === 'free' ? '—' : `$${stats.totalCommission.toFixed(0)}`}</div>
            <div className="stat-label">Commission</div>
          </div>
          <div className="stat-card">
            <div className="stat-value brand">{stats.couples}</div>
            <div className="stat-label">Couples</div>
          </div>
          <div className="stat-card">
            <div className="stat-value gold">{stats.shoppers}</div>
            <div className="stat-label">Clients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value muted">{stats.leads}</div>
            <div className="stat-label">Leads</div>
          </div>
        </div>

        {/* Quick Links */}
        <h3 className="section-heading">Your Links</h3>
        <div className="links-grid">
          {/* For You */}
          <div className="link-card you">
            <div className="link-card-header">
              <span className="link-emoji">🛍️</span>
              <div>
                <h4 className="link-title">For You</h4>
                <p className="link-desc">Shop for yourself with 25% cashback</p>
              </div>
            </div>
            <div className="link-row">
              <input type="text" value={shopLink} readOnly className="link-input" />
              <button 
                className={`copy-btn ${copied === 'you' ? 'copied' : ''}`}
                onClick={() => copyLink(shopLink, 'you')}
              >
                {copied === 'you' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* For Couples */}
          <div className="link-card couples">
            <div className="link-card-header">
              <span className="link-emoji">💍</span>
              <div>
                <h4 className="link-title">For Couples</h4>
                <p className="link-desc">Registry + 25% cashback on every gift</p>
              </div>
            </div>
            <div className="link-row">
              <input type="text" value={registryLink} readOnly className="link-input" />
              <button 
                className={`copy-btn ${copied === 'couples' ? 'copied' : ''}`}
                onClick={() => copyLink(registryLink, 'couples')}
              >
                {copied === 'couples' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* For Everyone */}
          <div className="link-card everyone">
            <div className="link-card-header">
              <span className="link-emoji">🎁</span>
              <div>
                <h4 className="link-title">For Everyone Else</h4>
                <p className="link-desc">A gift from you — 25% cashback on everything</p>
              </div>
            </div>
            <div className="link-row">
              <input type="text" value={shopLink} readOnly className="link-input" />
              <button 
                className={`copy-btn ${copied === 'everyone' ? 'copied' : ''}`}
                onClick={() => copyLink(shopLink, 'everyone')}
              >
                {copied === 'everyone' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Clarity Callout */}
        <div className="clarity-card">
          <strong>Just to be clear:</strong> The 25% cashback comes from WeTwo, not from you. 
          You never pay it. Your services and pricing stay exactly the same. 
          This is a separate program that works alongside your business — a gift you hand to anyone in your world.
        </div>

        {/* Quick Actions */}
        <h3 className="section-heading">Quick Actions</h3>
        <div className="actions-grid">
          <Link href="/dashboard/assistant" className="action-card">
            <span className="action-icon">✨</span>
            <h4>Ask Claude</h4>
            <p>Write emails, social posts, or follow-up messages with AI</p>
          </Link>
          <Link href="/dashboard/links" className="action-card">
            <span className="action-icon">🔗</span>
            <h4>Your Links</h4>
            <p>Copy-paste messages for couples, clients, and social media</p>
          </Link>
          <Link href="/dashboard/earnings" className="action-card">
            <span className="action-icon">💰</span>
            <h4>Earnings</h4>
            <p>See the math on commissions and upgrade to start earning</p>
          </Link>
          <Link href="/dashboard/page-editor" className="action-card">
            <span className="action-icon">⚡</span>
            <h4>Edit Your Page</h4>
            <p>Update your gallery, packages, bio, and theme</p>
          </Link>
        </div>

        {/* Upgrade CTA (only for free) */}
        {vendor.plan === 'free' && (
          <div className="upgrade-banner">
            <div>
              <h4 className="upgrade-title">Start earning on every purchase your network makes</h4>
              <p className="upgrade-text">
                Everything above is free. Upgrade to earn 10–20% commission on every purchase made through your links.
              </p>
            </div>
            <Link href="/dashboard/earnings" className="upgrade-btn">
              See Plans →
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-header {
          background: #fff;
          border-bottom: 1px solid #e4ddd4;
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: #2c2420;
          margin: 0;
        }
        .page-subtitle {
          font-size: 13px;
          color: #9a8d80;
          margin: 2px 0 0;
        }
        .header-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          color: #6b5e52;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .header-btn:hover {
          border-color: #c9944a;
          color: #c9944a;
        }
        .page-content {
          padding: 28px 32px;
          max-width: 960px;
        }
        .value-card {
          display: flex;
          gap: 20px;
          background: linear-gradient(135deg, rgba(201,148,74,0.08), rgba(201,148,74,0.02));
          border: 1px solid rgba(201,148,74,0.25);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 28px;
          align-items: flex-start;
        }
        .value-icon {
          font-size: 32px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .value-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          color: #2c2420;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .value-text {
          font-size: 14px;
          color: #6b5e52;
          line-height: 1.7;
          margin: 0;
        }
        .value-text strong {
          color: #22c55e;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
        }
        .stat-value.green { color: #22c55e; }
        .stat-value.brand { color: #c9944a; }
        .stat-value.gold { color: #d4a76a; }
        .stat-value.muted { color: #6b5e52; }
        .stat-label {
          font-size: 11px;
          color: #9a8d80;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 4px;
        }
        .section-heading {
          font-size: 15px;
          font-weight: 700;
          color: #2c2420;
          margin: 0 0 14px;
        }
        .links-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .link-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          padding: 18px 20px;
        }
        .link-card.you { border-left: 3px solid #c9944a; }
        .link-card.couples { border-left: 3px solid #22c55e; }
        .link-card.everyone { border-left: 3px solid #3b82f6; }
        .link-card-header {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }
        .link-emoji {
          font-size: 24px;
        }
        .link-title {
          font-size: 15px;
          font-weight: 700;
          color: #2c2420;
          margin: 0;
        }
        .link-desc {
          font-size: 13px;
          color: #6b5e52;
          margin: 1px 0 0;
        }
        .link-row {
          display: flex;
          gap: 8px;
        }
        .link-input {
          flex: 1;
          padding: 10px 12px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 12px;
          color: #4a3f35;
          font-family: inherit;
        }
        .copy-btn {
          padding: 10px 18px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }
        .copy-btn:hover { filter: brightness(1.1); }
        .copy-btn.copied { background: #22c55e; }
        .clarity-card {
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 10px;
          padding: 16px 20px;
          font-size: 13px;
          color: #6b5e52;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .clarity-card strong {
          color: #2c2420;
        }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }
        .action-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        .action-card:hover {
          border-color: #c9944a;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .action-icon {
          font-size: 24px;
          display: block;
          margin-bottom: 8px;
        }
        .action-card h4 {
          font-size: 15px;
          font-weight: 700;
          color: #2c2420;
          margin: 0 0 4px;
        }
        .action-card p {
          font-size: 13px;
          color: #6b5e52;
          margin: 0;
          line-height: 1.4;
        }
        .upgrade-banner {
          background: linear-gradient(135deg, rgba(34,197,94,0.08), rgba(201,148,74,0.06));
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .upgrade-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          color: #22c55e;
          margin: 0 0 6px;
        }
        .upgrade-text {
          font-size: 14px;
          color: #6b5e52;
          margin: 0;
          line-height: 1.5;
        }
        .upgrade-btn {
          padding: 12px 24px;
          background: #22c55e;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .upgrade-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .page-header { padding: 16px 20px; flex-direction: column; gap: 12px; align-items: flex-start; }
          .page-content { padding: 20px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .actions-grid { grid-template-columns: 1fr; }
          .value-card { flex-direction: column; gap: 12px; }
          .upgrade-banner { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_74f8dfad

echo "📝 Creating src/app/dashboard/links/page.tsx..."
cat > src/app/dashboard/links/page.tsx << 'ENDOFFILE_c789192b'
'use client'

import { useState, useEffect } from 'react'

export default function LinksPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!vendor) return null

  const biz = vendor.business_name || 'Your Business'
  const name = vendor.contact_name || 'Your Name'
  const baseUrl = 'https://wetwo.love'
  const shopLink = `${baseUrl}?ref=vendor-${vendor.ref}`
  const registryLink = `${baseUrl}/couple/signup?ref=vendor-${vendor.ref}`
  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`

  const coupleMsg = `Hi! 👋

Congrats on the engagement! I wanted to share something special — WeTwo is a wedding registry where you get 25% cashback on every gift your guests buy. Real furniture, kitchen items, bedding — things you'll actually use — and 25% back in cash for your honeymoon or whatever you want.

Create your free registry here: ${registryLink}

${name}, ${biz}`

  const clientMsg = `Hi! 👋

I partnered with a store called WeTwo and wanted to share something with you — through my link, you get 25% cashback on everything you buy. Furniture, kitchen items, bedding, fashion, outdoor — thousands of products at great prices, plus 25% back.

Here's your access: ${shopLink}

${name}, ${biz}`

  const pastLeadMsg = `Hi!

It was great connecting with you. I hope everything is going well! 🎉

I recently partnered with a registry platform called WeTwo that I think you'd love. It's a wedding registry where you get 25% cashback on everything — furniture, kitchen, clothing, bedding.

No catch, completely free to sign up: ${registryLink}

Wishing you the best!
${name}`

  const igCaption = `✨ Something special for my clients! ✨

I've partnered with @wetwo.love — a store where you get 25% cashback on EVERYTHING. Furniture, kitchen essentials, clothing, bedroom sets — real items you'll actually want.

You buy → you get 25% back. It's that simple. 💍

DM me for the link or visit my page (link in bio)!

#SmallBusiness #WeddingRegistry #ClientLove #WeTwo`

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Your Links</h1>
          <p className="page-subtitle">Three links. Three use cases. Copy, paste, share.</p>
        </div>
      </header>

      <div className="page-content">

        {/* Clarity Banner */}
        <div className="clarity-banner">
          <strong>You don't pay the 25%.</strong> WeTwo pays it. Your services and pricing don't change. 
          These links are a gift you give to people — and they work alongside your business, not inside it.
        </div>

        {/* LINK 1: For You */}
        <div className="link-section you-section">
          <div className="link-section-header">
            <span className="link-section-icon">🛍️</span>
            <div>
              <h2 className="link-section-title">For You</h2>
              <p className="link-section-desc">
                Want something for yourself or buying a gift? Use this link and get 25% cashback.
              </p>
            </div>
          </div>
          <div className="link-row">
            <input type="text" value={shopLink} readOnly className="link-input" />
            <button className={`copy-btn ${copied === 'you' ? 'copied' : ''}`} onClick={() => copy(shopLink, 'you')}>
              {copied === 'you' ? '✓ Copied' : 'Copy'}
            </button>
            <a href={shopLink} target="_blank" rel="noopener" className="browse-btn">Browse Store →</a>
          </div>
        </div>

        {/* LINK 2: For Couples */}
        <div className="link-section couples-section">
          <div className="link-section-header">
            <span className="link-section-icon">💍</span>
            <div>
              <h2 className="link-section-title">For Couples</h2>
              <p className="link-section-desc">
                Tell your couples: set up a registry, or skip the registry and just buy nice things for themselves — forever — with 25% cashback.
              </p>
            </div>
          </div>
          <div className="link-row">
            <input type="text" value={registryLink} readOnly className="link-input" />
            <button className={`copy-btn ${copied === 'couples' ? 'copied' : ''}`} onClick={() => copy(registryLink, 'couples')}>
              {copied === 'couples' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="msg-toggle" onClick={() => setExpandedMsg(expandedMsg === 'couples' ? null : 'couples')}>
            <span>📋 Copy-paste message for couples</span>
            <span>{expandedMsg === 'couples' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'couples' && (
            <div className="msg-block">
              <pre className="msg-text">{coupleMsg}</pre>
              <button className={`copy-msg-btn ${copied === 'couples-msg' ? 'copied' : ''}`} onClick={() => copy(coupleMsg, 'couples-msg')}>
                {copied === 'couples-msg' ? '✓ Copied' : 'Copy Message'}
              </button>
            </div>
          )}
        </div>

        {/* LINK 3: For Everyone */}
        <div className="link-section everyone-section">
          <div className="link-section-header">
            <span className="link-section-icon">🎁</span>
            <div>
              <h2 className="link-section-title">For Everyone Else</h2>
              <p className="link-section-desc">
                Pass this to every client, friend, family member, follower. They get 25% cashback as a gift from you. Post it on Instagram. Put it on a card at the register. Text it to your regulars.
              </p>
            </div>
          </div>
          <div className="link-row">
            <input type="text" value={shopLink} readOnly className="link-input" />
            <button className={`copy-btn ${copied === 'everyone' ? 'copied' : ''}`} onClick={() => copy(shopLink, 'everyone')}>
              {copied === 'everyone' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="msg-toggle" onClick={() => setExpandedMsg(expandedMsg === 'client' ? null : 'client')}>
            <span>📋 Copy-paste message for clients</span>
            <span>{expandedMsg === 'client' ? '▲' : '▼'}</span>
          </div>
          {expandedMsg === 'client' && (
            <div className="msg-block">
              <pre className="msg-text">{clientMsg}</pre>
              <button className={`copy-msg-btn ${copied === 'client-msg' ? 'copied' : ''}`} onClick={() => copy(clientMsg, 'client-msg')}>
                {copied === 'client-msg' ? '✓ Copied' : 'Copy Message'}
              </button>
            </div>
          )}
        </div>

        {/* More Templates */}
        <h3 className="section-heading" style={{ marginTop: 32 }}>More Templates</h3>

        <div className="template-grid">
          <div className="template-card">
            <div className="msg-toggle" onClick={() => setExpandedMsg(expandedMsg === 'past' ? null : 'past')}>
              <span>📩 Re-engage past leads</span>
              <span>{expandedMsg === 'past' ? '▲' : '▼'}</span>
            </div>
            {expandedMsg === 'past' && (
              <div className="msg-block">
                <pre className="msg-text">{pastLeadMsg}</pre>
                <button className={`copy-msg-btn ${copied === 'past-msg' ? 'copied' : ''}`} onClick={() => copy(pastLeadMsg, 'past-msg')}>
                  {copied === 'past-msg' ? '✓ Copied' : 'Copy Message'}
                </button>
              </div>
            )}
          </div>

          <div className="template-card">
            <div className="msg-toggle" onClick={() => setExpandedMsg(expandedMsg === 'ig' ? null : 'ig')}>
              <span>📸 Instagram caption</span>
              <span>{expandedMsg === 'ig' ? '▲' : '▼'}</span>
            </div>
            {expandedMsg === 'ig' && (
              <div className="msg-block">
                <pre className="msg-text">{igCaption}</pre>
                <button className={`copy-msg-btn ${copied === 'ig-msg' ? 'copied' : ''}`} onClick={() => copy(igCaption, 'ig-msg')}>
                  {copied === 'ig-msg' ? '✓ Copied' : 'Copy Message'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Where to share */}
        <div className="share-ideas">
          <h4>Where to put your links</h4>
          <div className="share-grid">
            {['📱 Instagram bio', '✉️ Email signature', '🪪 Business cards', '📋 Directory profiles', 
              '⭐ Google listing', '💒 Bridal show handouts', '💬 Text to regulars', '🖥️ Your website'].map(s => (
              <span key={s} className="share-chip">{s}</span>
            ))}
          </div>
        </div>

        {/* AI CTA */}
        <div className="ai-cta">
          <span className="ai-cta-icon">✨</span>
          <div>
            <h4>Need a custom message?</h4>
            <p>Ask Claude to write personalized emails, follow-ups, or social posts for your specific audience.</p>
          </div>
          <a href="/dashboard/assistant" className="ai-cta-btn">Ask Claude →</a>
        </div>

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
        .clarity-banner {
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 13px;
          color: #6b5e52;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .clarity-banner strong { color: #2c2420; }
        .link-section {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 16px;
        }
        .you-section { border-left: 4px solid #c9944a; }
        .couples-section { border-left: 4px solid #22c55e; }
        .everyone-section { border-left: 4px solid #3b82f6; }
        .link-section-header {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .link-section-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
        .link-section-title { font-size: 17px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .link-section-desc { font-size: 14px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .link-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .link-input {
          flex: 1;
          padding: 10px 12px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 12px;
          color: #4a3f35;
          font-family: inherit;
        }
        .copy-btn {
          padding: 10px 18px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }
        .copy-btn:hover { filter: brightness(1.1); }
        .copy-btn.copied { background: #22c55e; }
        .browse-btn {
          padding: 10px 16px;
          background: transparent;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 13px;
          color: #6b5e52;
          text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .browse-btn:hover { border-color: #c9944a; color: #c9944a; }
        .msg-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f3efe9;
          border-radius: 8px;
          font-size: 13px;
          color: #6b5e52;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 8px;
        }
        .msg-toggle:hover { background: #ebe5dc; }
        .msg-block {
          margin-top: 8px;
          position: relative;
        }
        .msg-text {
          background: #f9f7f4;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          padding: 16px;
          font-size: 13px;
          color: #4a3f35;
          line-height: 1.7;
          white-space: pre-wrap;
          font-family: inherit;
          margin: 0;
        }
        .copy-msg-btn {
          margin-top: 8px;
          padding: 8px 16px;
          background: #e8e0d5;
          color: #2c2420;
          border: 1px solid #e4ddd4;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .copy-msg-btn.copied { background: #22c55e; color: #fff; border-color: #22c55e; }
        .section-heading { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 14px; }
        .template-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .template-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          overflow: hidden;
        }
        .template-card .msg-toggle { margin: 0; border-radius: 12px; padding: 16px; }
        .template-card .msg-block { padding: 0 16px 16px; }
        .share-ideas {
          background: rgba(201,148,74,0.06);
          border: 1px solid rgba(201,148,74,0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .share-ideas h4 { font-size: 14px; font-weight: 700; color: #2c2420; margin: 0 0 12px; }
        .share-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .share-chip {
          padding: 6px 14px;
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 20px;
          font-size: 13px;
          color: #6b5e52;
        }
        .ai-cta {
          display: flex;
          gap: 16px;
          align-items: center;
          background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06));
          border: 1px solid rgba(147,130,220,0.25);
          border-radius: 12px;
          padding: 20px;
        }
        .ai-cta-icon { font-size: 28px; flex-shrink: 0; }
        .ai-cta h4 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .ai-cta p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.4; }
        .ai-cta-btn {
          padding: 10px 20px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .ai-cta-btn:hover { filter: brightness(1.1); }
        @media (max-width: 768px) {
          .page-content { padding: 20px; }
          .link-row { flex-wrap: wrap; }
          .ai-cta { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_c789192b

echo "📝 Creating src/app/dashboard/leads/page.tsx..."
cat > src/app/dashboard/leads/page.tsx << 'ENDOFFILE_8d8b3e08'
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

ENDOFFILE_8d8b3e08

echo "📝 Creating src/app/dashboard/clients/page.tsx..."
cat > src/app/dashboard/clients/page.tsx << 'ENDOFFILE_9f775060'
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ClientsContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') || 'couple'
  const [vendor, setVendor] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState(typeParam)

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

  const filtered = clients.filter(c => c.type === type)
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
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{type === 'couple' ? '💍' : '🛒'}</div>
            <h3>No {type === 'couple' ? 'couples' : 'clients'} yet</h3>
            <p>
              {type === 'couple' 
                ? 'When couples sign up through your registry link, they\'ll appear here.'
                : 'When people shop through your cashback link, they\'ll appear here.'
              }
            </p>
            <a href="/dashboard/links" className="empty-cta">Go to Your Links →</a>
          </div>
        ) : (
          <div className="client-list">
            {filtered.map(client => (
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

ENDOFFILE_9f775060

echo "📝 Creating src/app/dashboard/assistant/page.tsx..."
cat > src/app/dashboard/assistant/page.tsx << 'ENDOFFILE_524f6751'
'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  { label: '📩 Email to a new couple', prompt: 'Write a warm email to a new engaged couple I just met, introducing the WeTwo registry and 25% cashback offer.' },
  { label: '📸 Instagram caption', prompt: 'Write an Instagram caption announcing that my clients can get 25% cashback on everything through my WeTwo link.' },
  { label: '💬 Text to a past client', prompt: 'Write a short, friendly text message to a past client sharing my WeTwo cashback link.' },
  { label: '📧 Follow-up email', prompt: 'Write a follow-up email to a couple who inquired but hasn\'t booked yet, sharing the WeTwo registry as a value-add.' },
  { label: '✏️ Update my page bio', prompt: 'Help me rewrite my vendor page bio to be more compelling and client-focused.' },
  { label: '📋 Holiday promo message', prompt: 'Write a holiday message I can send to all my clients sharing the WeTwo 25% cashback link as a gift.' },
]

export default function AssistantPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/vendor-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          vendor
        })
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  const copyMessage = (index: number, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!vendor) return null

  return (
    <div className="assistant-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">✨ Ask Claude</h1>
          <p className="page-subtitle">Your AI copywriter — emails, social posts, page edits, anything</p>
        </div>
      </header>

      <div className="chat-container">
        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon">✨</div>
              <h2>Hi {vendor.contact_name || 'there'}!</h2>
              <p>I'm your AI assistant. I can write emails, social posts, follow-up messages, or help you update your vendor page. What do you need?</p>
              
              <div className="quick-prompts">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button key={i} className="quick-prompt" onClick={() => sendMessage(qp.prompt)}>
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' 
                  ? (vendor.contact_name || vendor.business_name || 'V')[0].toUpperCase()
                  : '✨'}
              </div>
              <div className="message-body">
                <div className="message-name">
                  {msg.role === 'user' ? 'You' : 'Claude'}
                </div>
                <div className="message-content">
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>{line}<br /></span>
                  ))}
                </div>
                {msg.role === 'assistant' && (
                  <button 
                    className={`copy-response ${copied === i ? 'copied' : ''}`}
                    onClick={() => copyMessage(i, msg.content)}
                  >
                    {copied === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="message-avatar">✨</div>
              <div className="message-body">
                <div className="message-name">Claude</div>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts when in conversation */}
        {messages.length > 0 && !loading && (
          <div className="inline-prompts">
            {QUICK_PROMPTS.slice(0, 4).map((qp, i) => (
              <button key={i} className="inline-prompt" onClick={() => sendMessage(qp.prompt)}>
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude to write an email, social post, or anything..."
            rows={2}
          />
          <button 
            className="send-btn" 
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        .assistant-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .page-header {
          background: #fff;
          border-bottom: 1px solid #e4ddd4;
          padding: 16px 32px;
          flex-shrink: 0;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
        }
        .welcome {
          text-align: center;
          padding: 40px 0;
          max-width: 560px;
          margin: 0 auto;
        }
        .welcome-icon { font-size: 48px; margin-bottom: 12px; }
        .welcome h2 { font-size: 22px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .welcome p { font-size: 15px; color: #6b5e52; line-height: 1.6; margin: 0 0 28px; }
        .quick-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .quick-prompt {
          padding: 10px 16px;
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 20px;
          font-size: 13px;
          color: #6b5e52;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .quick-prompt:hover {
          border-color: #c9944a;
          color: #c9944a;
          background: rgba(201,148,74,0.04);
        }
        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          max-width: 720px;
        }
        .message-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .message.user .message-avatar {
          background: #c9944a;
          color: #fff;
        }
        .message.assistant .message-avatar {
          background: linear-gradient(135deg, rgba(147,130,220,0.15), rgba(201,148,74,0.15));
          font-size: 18px;
        }
        .message-body { flex: 1; min-width: 0; }
        .message-name {
          font-size: 12px;
          font-weight: 700;
          color: #9a8d80;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .message-content {
          font-size: 14px;
          color: #2c2420;
          line-height: 1.7;
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          padding: 14px 18px;
        }
        .message.user .message-content {
          background: rgba(201,148,74,0.06);
          border-color: rgba(201,148,74,0.2);
        }
        .copy-response {
          margin-top: 6px;
          padding: 4px 12px;
          background: none;
          border: 1px solid #e4ddd4;
          border-radius: 6px;
          font-size: 12px;
          color: #9a8d80;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .copy-response:hover { border-color: #c9944a; color: #c9944a; }
        .copy-response.copied { border-color: #22c55e; color: #22c55e; }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 14px 18px;
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #c9944a;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .inline-prompts {
          display: flex;
          gap: 6px;
          padding: 8px 32px;
          overflow-x: auto;
          flex-shrink: 0;
        }
        .inline-prompt {
          padding: 6px 14px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 16px;
          font-size: 12px;
          color: #6b5e52;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .inline-prompt:hover { border-color: #c9944a; color: #c9944a; }
        .input-area {
          padding: 12px 32px 20px;
          display: flex;
          gap: 10px;
          background: #faf8f5;
          border-top: 1px solid #e4ddd4;
          flex-shrink: 0;
        }
        .chat-input {
          flex: 1;
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 12px;
          font-size: 14px;
          color: #2c2420;
          font-family: inherit;
          resize: none;
          line-height: 1.5;
        }
        .chat-input:focus { outline: none; border-color: #c9944a; }
        .send-btn {
          padding: 12px 24px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
          align-self: flex-end;
        }
        .send-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .messages-area { padding: 16px; }
          .input-area { padding: 12px 16px 16px; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_524f6751

echo "📝 Creating src/app/dashboard/earnings/page.tsx..."
cat > src/app/dashboard/earnings/page.tsx << 'ENDOFFILE_8b117fc5'
'use client'

import { useState, useEffect } from 'react'

export default function EarningsPage() {
  const [vendor, setVendor] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  if (!vendor) return null

  const isFree = vendor.plan === 'free'

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Commission & Earnings</h1>
          <p className="page-subtitle">
            {isFree ? 'You\'re on the free plan — everything works, you just don\'t earn commission yet' : `${vendor.plan.charAt(0).toUpperCase() + vendor.plan.slice(1)} Plan — ${vendor.commission_rate}% commission`}
          </p>
        </div>
      </header>

      <div className="page-content">
        {/* Current Earnings */}
        <div className="earnings-hero">
          <div className="earnings-total">{isFree ? '—' : '$0.00'}</div>
          <div className="earnings-label">Total Commission Earned</div>
          {!isFree && (
            <div className="rate-badge">✓ Earning {vendor.commission_rate}% on every purchase</div>
          )}
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h3>How commission works</h3>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <div>
                <strong>You share your link</strong>
                <p>Anyone who gets your link — couples, clients, friends — can shop with 25% cashback.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <div>
                <strong>They buy something</strong>
                <p>Could be a registry gift, furniture, clothing — anything in the store.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <div>
                <strong>You earn a percentage</strong>
                <p>On a paid plan, you earn 10–20% of every cart purchase made through your links.</p>
              </div>
            </div>
          </div>
          <div className="clarity-note">
            You don't pay the 25% cashback. You don't discount your services. 
            The commission is separate revenue that comes to you — before you wake up in the morning.
          </div>
        </div>

        {/* Upgrade Tiers */}
        <h3 className="section-heading">Choose Your Plan</h3>
        <div className="tiers-grid">
          <div className={`tier-card ${vendor.plan === 'free' ? 'current' : ''}`}>
            <div className="tier-name">Free</div>
            <div className="tier-rate">0%</div>
            <div className="tier-price">$0/month</div>
            <ul className="tier-features">
              <li>✓ Premium vendor page</li>
              <li>✓ Cashback links for clients</li>
              <li>✓ Contact form & leads</li>
              <li>✓ AI assistant</li>
              <li className="dim">✗ No commission on purchases</li>
            </ul>
            {vendor.plan === 'free' && <div className="current-badge">Current Plan</div>}
          </div>

          <div className={`tier-card ${vendor.plan === 'starter' ? 'current' : ''}`}>
            <div className="tier-name">Starter</div>
            <div className="tier-rate green">10%</div>
            <div className="tier-price">$97/month</div>
            <ul className="tier-features">
              <li>✓ Everything in Free</li>
              <li className="highlight">✓ 10% commission on every cart</li>
              <li>✓ Break even with ~10 purchases/mo</li>
            </ul>
            {vendor.plan === 'starter' 
              ? <div className="current-badge">Current Plan</div>
              : <a href="https://wetwo.love/products/wetwo-vendor-subscription-starter-tier" target="_blank" rel="noopener" className="tier-btn outline">Choose Starter →</a>
            }
          </div>

          <div className={`tier-card featured ${vendor.plan === 'growth' ? 'current' : ''}`}>
            <div className="tier-popular">Most Popular</div>
            <div className="tier-name">Growth</div>
            <div className="tier-rate green">15%</div>
            <div className="tier-price">$197/month</div>
            <ul className="tier-features">
              <li>✓ Everything in Free</li>
              <li className="highlight">✓ 15% commission on every cart</li>
              <li>✓ Break even with ~10 purchases/mo</li>
            </ul>
            {vendor.plan === 'growth'
              ? <div className="current-badge">Current Plan</div>
              : <a href="https://wetwo.love/products/wetwo-vendor-subscription-growth-tier" target="_blank" rel="noopener" className="tier-btn primary">Choose Growth →</a>
            }
          </div>

          <div className={`tier-card ${vendor.plan === 'pro' ? 'current' : ''}`}>
            <div className="tier-name">Pro</div>
            <div className="tier-rate green">20%</div>
            <div className="tier-price">$297/month</div>
            <ul className="tier-features">
              <li>✓ Everything in Free</li>
              <li className="highlight">✓ 20% commission on every cart</li>
              <li>✓ Break even with ~10 purchases/mo</li>
            </ul>
            {vendor.plan === 'pro'
              ? <div className="current-badge">Current Plan</div>
              : <a href="https://wetwo.love/products/wetwo-vendor-subscription-pro-tier" target="_blank" rel="noopener" className="tier-btn outline">Choose Pro →</a>
            }
          </div>
        </div>

        {/* The Math */}
        <div className="math-card">
          <h3>📊 The math that matters</h3>
          <p>Average wedding: 150 guests. ~75 buy registry gifts at ~$130 each = <strong>$5,000–$10,000 in purchases per couple</strong>.</p>
          <div className="math-grid">
            <div className="math-item">
              <div className="math-value">2–3</div>
              <div className="math-label">couples to break even on Starter</div>
            </div>
            <div className="math-item">
              <div className="math-value">3–4</div>
              <div className="math-label">couples to break even on Growth</div>
            </div>
            <div className="math-item">
              <div className="math-value">∞</div>
              <div className="math-label">non-wedding shoppers add to the total</div>
            </div>
          </div>
          <p className="math-footer">
            The wedding math pays for itself with a few couples. But everyone in your network shops year-round. 
            That's the real ceiling — and it has none.
          </p>
        </div>
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
        .page-content { padding: 28px 32px; max-width: 900px; }
        .earnings-hero {
          background: linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02));
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          margin-bottom: 28px;
        }
        .earnings-total { font-size: 44px; font-weight: 700; color: #22c55e; margin-bottom: 4px; }
        .earnings-label { font-size: 14px; color: #6b5e52; }
        .rate-badge {
          display: inline-block;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          color: #22c55e;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-top: 12px;
        }
        .how-it-works {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 28px;
        }
        .how-it-works h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .steps { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
        .step {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .step-num {
          width: 28px;
          height: 28px;
          background: #c9944a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .step strong { font-size: 14px; color: #2c2420; }
        .step p { font-size: 13px; color: #6b5e52; margin: 2px 0 0; line-height: 1.5; }
        .clarity-note {
          background: #f3efe9;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 13px;
          color: #6b5e52;
          line-height: 1.6;
        }
        .section-heading { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 14px; }
        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }
        .tier-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px 20px;
          text-align: center;
          position: relative;
          transition: all 0.2s;
        }
        .tier-card:hover { transform: translateY(-2px); border-color: #c9944a; }
        .tier-card.featured { border-color: #c9944a; border-width: 2px; }
        .tier-card.current { background: rgba(34,197,94,0.03); border-color: rgba(34,197,94,0.3); }
        .tier-popular {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #c9944a;
          color: #fff;
          padding: 2px 14px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .tier-name {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #9a8d80;
          margin-bottom: 8px;
        }
        .tier-rate { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
        .tier-rate.green { color: #22c55e; }
        .tier-price { font-size: 14px; color: #6b5e52; margin-bottom: 16px; }
        .tier-features {
          list-style: none;
          padding: 0;
          margin: 0 0 16px;
          text-align: left;
        }
        .tier-features li {
          font-size: 12px;
          color: #6b5e52;
          padding: 4px 0;
          line-height: 1.4;
        }
        .tier-features li.highlight { color: #22c55e; font-weight: 600; }
        .tier-features li.dim { color: #9a8d80; }
        .tier-btn {
          display: block;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
        }
        .tier-btn.primary { background: #c9944a; color: #fff; }
        .tier-btn.primary:hover { filter: brightness(1.1); }
        .tier-btn.outline { background: transparent; border: 1px solid #e4ddd4; color: #6b5e52; }
        .tier-btn.outline:hover { border-color: #c9944a; color: #c9944a; }
        .current-badge {
          padding: 8px;
          background: rgba(34,197,94,0.1);
          color: #22c55e;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }
        .math-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
        }
        .math-card h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 8px; }
        .math-card > p { font-size: 14px; color: #6b5e52; line-height: 1.6; margin: 0 0 16px; }
        .math-card > p strong { color: #22c55e; }
        .math-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .math-item {
          background: #f3efe9;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
        }
        .math-value { font-size: 28px; font-weight: 700; color: #c9944a; margin-bottom: 4px; }
        .math-label { font-size: 12px; color: #6b5e52; }
        .math-footer { font-size: 13px; color: #6b5e52; line-height: 1.6; margin: 0; }
        @media (max-width: 768px) {
          .page-content { padding: 20px; }
          .tiers-grid { grid-template-columns: 1fr 1fr; }
          .math-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .tiers-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_8b117fc5

echo "📝 Creating src/app/dashboard/settings/page.tsx..."
cat > src/app/dashboard/settings/page.tsx << 'ENDOFFILE_4db2c9de'
'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: vendor.email, newPassword })
      })
      if (res.ok) {
        setMessage('Password updated successfully')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage('Failed to update password')
      }
    } catch {
      setMessage('Something went wrong')
    }
    setSaving(false)
  }

  if (!vendor) return null

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
      </header>

      <div className="page-content">
        {/* Account Info */}
        <div className="settings-card">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Business Name</label>
              <div className="info-value">{vendor.business_name}</div>
            </div>
            <div className="info-item">
              <label>Email</label>
              <div className="info-value">{vendor.email}</div>
            </div>
            <div className="info-item">
              <label>Plan</label>
              <div className="info-value">
                {vendor.plan === 'free' ? 'Free' : `${vendor.plan.charAt(0).toUpperCase() + vendor.plan.slice(1)} — ${vendor.commission_rate}%`}
              </div>
            </div>
            <div className="info-item">
              <label>Vendor Page</label>
              <a href={`/vendor/${vendor.ref}`} target="_blank" className="info-link">
                wetwo-vendors.vercel.app/vendor/{vendor.ref}
              </a>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="settings-card">
          <h3>Change Password</h3>
          {message && (
            <div className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Support */}
        <div className="settings-card">
          <h3>Need Help?</h3>
          <p className="help-text">
            For page updates, technical support, or account changes, reach out to us directly.
          </p>
          <div className="help-links">
            <a href="mailto:hello@wetwo.love" className="help-link">✉️ hello@wetwo.love</a>
            <a href="/dashboard/assistant" className="help-link">✨ Ask Claude</a>
          </div>
        </div>
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
        .page-content { padding: 28px 32px; max-width: 640px; }
        .settings-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .settings-card h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .info-grid { display: flex; flex-direction: column; gap: 14px; }
        .info-item label { font-size: 12px; font-weight: 600; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
        .info-value { font-size: 15px; color: #2c2420; }
        .info-link { font-size: 14px; color: #c9944a; text-decoration: none; }
        .info-link:hover { text-decoration: underline; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 13px; font-weight: 600; color: #6b5e52; margin-bottom: 6px; }
        .form-group input {
          width: 100%;
          padding: 12px 14px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 15px;
          color: #2c2420;
          font-family: inherit;
        }
        .form-group input:focus { outline: none; border-color: #c9944a; }
        .save-btn {
          padding: 12px 24px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .save-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .save-btn:disabled { opacity: 0.7; }
        .settings-message {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .settings-message.success { background: rgba(34,197,94,0.08); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .settings-message.error { background: rgba(239,68,68,0.08); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .help-text { font-size: 14px; color: #6b5e52; line-height: 1.5; margin: 0 0 14px; }
        .help-links { display: flex; gap: 12px; }
        .help-link {
          padding: 10px 18px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 13px;
          color: #6b5e52;
          text-decoration: none;
          transition: all 0.15s;
        }
        .help-link:hover { border-color: #c9944a; color: #c9944a; }
        @media (max-width: 768px) { .page-content { padding: 20px; } }
      `}</style>
    </div>
  )
}

ENDOFFILE_4db2c9de

echo "📝 Creating src/app/dashboard/page-editor/page.tsx..."
cat > src/app/dashboard/page-editor/page.tsx << 'ENDOFFILE_75e4b4f7'
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PageEditorPage() {
  const [vendor, setVendor] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  if (!vendor) return null

  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Your Page</h1>
          <p className="page-subtitle">View and manage your vendor landing page</p>
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

        {/* Request Changes */}
        <div className="changes-card">
          <div className="changes-icon">✨</div>
          <div>
            <h3>Want to update your page?</h3>
            <p>Tell Claude what you'd like to change — your bio, photos, packages, theme, anything. Claude will write the copy and our team will apply it.</p>
          </div>
          <Link href="/dashboard/assistant" className="changes-btn">
            Ask Claude →
          </Link>
        </div>

        {/* What's on your page */}
        <div className="sections-card">
          <h3>What's on your page</h3>
          <div className="sections-grid">
            {[
              { icon: '🎬', label: 'Hero', desc: 'Your headline, badge, and call-to-action' },
              { icon: '💬', label: 'About', desc: 'Your story, experience, and specialties' },
              { icon: '📸', label: 'Gallery', desc: 'Your best work, front and center' },
              { icon: '🎯', label: 'Services', desc: 'What you offer, clear and organized' },
              { icon: '📦', label: 'Packages', desc: 'Pricing tiers with features' },
              { icon: '📬', label: 'Contact Form', desc: 'Leads come directly to your dashboard' },
              { icon: '🎁', label: 'Cashback Banner', desc: '25% cashback link — always visible' },
            ].map((s) => (
              <div key={s.label} className="section-item">
                <span className="section-icon">{s.icon}</span>
                <div>
                  <strong>{s.label}</strong>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-header {
          background: #fff;
          border-bottom: 1px solid #e4ddd4;
          padding: 20px 32px;
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .header-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          color: #6b5e52;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .header-btn:hover { border-color: #c9944a; color: #c9944a; }
        .page-content { padding: 28px 32px; max-width: 900px; }
        .preview-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e4ddd4;
        }
        .preview-header h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0; }
        .preview-link { font-size: 13px; color: #c9944a; text-decoration: none; }
        .preview-frame { background: #f3efe9; padding: 12px; }
        .preview-iframe {
          width: 100%;
          height: 500px;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          background: #fff;
        }
        .info-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .info-card h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .info-item label { font-size: 11px; font-weight: 600; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
        .info-item div { font-size: 14px; color: #2c2420; }
        .url-text { font-size: 12px; color: #c9944a; word-break: break-all; }
        .changes-card {
          display: flex;
          gap: 16px;
          align-items: center;
          background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06));
          border: 1px solid rgba(147,130,220,0.25);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .changes-icon { font-size: 32px; flex-shrink: 0; }
        .changes-card h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .changes-card p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .changes-btn {
          padding: 12px 24px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .changes-btn:hover { filter: brightness(1.1); }
        .sections-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
        }
        .sections-card h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .sections-grid { display: flex; flex-direction: column; gap: 10px; }
        .section-item {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 10px 14px;
          background: #f3efe9;
          border-radius: 8px;
        }
        .section-icon { font-size: 20px; flex-shrink: 0; }
        .section-item strong { font-size: 14px; color: #2c2420; display: block; }
        .section-item p { font-size: 12px; color: #6b5e52; margin: 2px 0 0; }
        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 12px; align-items: flex-start; padding: 16px 20px; }
          .page-content { padding: 20px; }
          .info-grid { grid-template-columns: 1fr; }
          .changes-card { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

ENDOFFILE_75e4b4f7

echo "📝 Creating src/app/api/auth/login/route.ts..."
cat > src/app/api/auth/login/route.ts << 'ENDOFFILE_ab79b8d8'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find vendor account
    const { data: account, error: accountError } = await supabase
      .from('vendor_accounts')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check password
    const hashedInput = hashPassword(password)
    if (account.password_hash !== hashedInput) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Get vendor data
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('ref', account.vendor_ref)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor record not found' }, { status: 404 })
    }

    // Update last login
    await supabase
      .from('vendor_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('id', account.id)

    // Return session data (vendor info + account info)
    return NextResponse.json({
      vendor: {
        ref: vendor.ref,
        business_name: vendor.business_name,
        contact_name: vendor.contact_name,
        email: account.email,
        plan: account.plan,
        commission_rate: account.commission_rate,
        category: vendor.category,
        city: vendor.city,
        state: vendor.state,
        phone: vendor.phone,
        website: vendor.website,
        instagram_handle: vendor.instagram_handle,
        photo_url: vendor.photo_url,
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

ENDOFFILE_ab79b8d8

echo "📝 Creating src/app/api/auth/create-account/route.ts..."
cat > src/app/api/auth/create-account/route.ts << 'ENDOFFILE_d5748ca9'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// POST: Create a vendor account
export async function POST(req: NextRequest) {
  try {
    const { vendor_ref, email, password, name, plan } = await req.json()

    if (!vendor_ref || !email || !password) {
      return NextResponse.json({ error: 'vendor_ref, email, and password are required' }, { status: 400 })
    }

    // Verify vendor exists
    const { data: vendor } = await supabase
      .from('vendors')
      .select('ref, business_name')
      .eq('ref', vendor_ref)
      .single()

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('vendor_accounts')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // Create account
    const { data: account, error } = await supabase
      .from('vendor_accounts')
      .insert({
        vendor_ref,
        email: email.toLowerCase().trim(),
        password_hash: hashPassword(password),
        name: name || vendor.business_name,
        plan: plan || 'free',
        commission_rate: plan === 'starter' ? 10 : plan === 'growth' ? 15 : plan === 'pro' ? 20 : 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Create account error:', error)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      account: { id: account.id, email: account.email, vendor_ref, plan: account.plan }
    })

  } catch (err) {
    console.error('Create account error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

ENDOFFILE_d5748ca9

echo "📝 Creating src/app/api/auth/change-password/route.ts..."
cat > src/app/api/auth/change-password/route.ts << 'ENDOFFILE_a3f7db4f'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const hash = crypto.createHash('sha256').update(newPassword).digest('hex')

    const { error } = await supabase
      .from('vendor_accounts')
      .update({ password_hash: hash, updated_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

ENDOFFILE_a3f7db4f

echo "📝 Creating src/app/api/vendor-assistant/route.ts..."
cat > src/app/api/vendor-assistant/route.ts << 'ENDOFFILE_0ea2f49a'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function buildSystemPrompt(vendor: any) {
  const biz = vendor.business_name || 'the vendor\'s business'
  const name = vendor.contact_name || ''
  const cat = vendor.category || 'wedding services'
  const city = vendor.city || ''
  const state = vendor.state || ''
  const location = [city, state].filter(Boolean).join(', ')
  const shopLink = `https://wetwo.love?ref=vendor-${vendor.ref}`
  const registryLink = `https://wetwo.love/couple/signup?ref=vendor-${vendor.ref}`
  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`

  return `You are Claude, the AI assistant for ${biz}${name ? ` (run by ${name})` : ''}, a ${cat} vendor${location ? ` in ${location}` : ''} on the WeTwo platform.

## Your Role
You help this vendor write compelling copy — emails, text messages, Instagram captions, follow-up messages, and marketing content. You also help with vendor page edits (bio, headlines, descriptions).

## About WeTwo (IMPORTANT - get this right every time)
WeTwo is a cashback shopping platform and wedding registry. Key facts:
- Anyone who shops through this vendor's link gets **25% cashback** on everything they buy
- The store sells furniture, kitchen items, bedding, clothing, fashion, home goods, outdoor items — thousands of products
- Couples can create a wedding registry where guests buy gifts and the couple gets 25% cashback
- **The vendor does NOT pay the 25%.** WeTwo pays it. This costs the vendor nothing.
- **The vendor does NOT discount their own services.** This is a completely separate program.
- This is essentially a loyalty and client acquisition tool that works alongside their business
- The vendor is giving people access to something valuable — not asking for a favor

## Vendor's Links
- Personal shopping link: ${shopLink}
- Couples registry signup: ${registryLink}  
- Vendor page: ${pageLink}

## Writing Style Guidelines
- Be warm, genuine, and human — not corporate or salesy
- Keep copy concise and natural
- When writing emails, texts, or DMs: write as if ${name || 'the vendor'} is writing, not as AI
- Include the appropriate link where relevant
- Never oversell or use hype language
- Never imply the vendor is paying for the cashback
- Always make clear the 25% is from WeTwo, not from the vendor

## Important Rules
1. Always write in the voice of ${name || 'the vendor'}, not as Claude
2. Always include the correct link (registry for couples, shop for everyone else)
3. If asked about page changes, describe what changes you'd recommend and tell them to contact support or use the page editor
4. Be concise. Vendors are busy.
5. If you're unsure about any specific detail about their business, ask — don't make things up.

## Vendor Info
- Business: ${biz}
- Category: ${cat}
- Location: ${location}
- Instagram: ${vendor.instagram_handle || 'not provided'}
- Plan: ${vendor.plan || 'free'} tier`
}

export async function POST(req: NextRequest) {
  try {
    const { messages, vendor } = await req.json()

    if (!messages || !vendor) {
      return NextResponse.json({ error: 'Messages and vendor data required' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(vendor)

    // Format messages for Claude
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }))

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: formattedMessages,
    })

    const textContent = response.content.find((c: any) => c.type === 'text')
    const text = textContent ? (textContent as any).text : 'Sorry, I couldn\'t generate a response.'

    return NextResponse.json({ response: text })
  } catch (err) {
    console.error('Vendor assistant error:', err)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}

ENDOFFILE_0ea2f49a

echo "📝 Creating src/app/api/dashboard/leads/route.ts..."
cat > src/app/api/dashboard/leads/route.ts << 'ENDOFFILE_0349439d'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch leads for a vendor
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 })

  const { data, error } = await supabase
    .from('vendor_leads')
    .select('*')
    .eq('vendor_ref', ref)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data })
}

// PATCH: Update lead status
export async function PATCH(req: NextRequest) {
  const { id, status, notes } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updates: any = { updated_at: new Date().toISOString() }
  if (status) updates.status = status
  if (notes !== undefined) updates.notes = notes

  const { error } = await supabase
    .from('vendor_leads')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

ENDOFFILE_0349439d

echo "📝 Creating src/app/api/dashboard/clients/route.ts..."
cat > src/app/api/dashboard/clients/route.ts << 'ENDOFFILE_020bf801'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 })

  const { data, error } = await supabase
    .from('vendor_clients')
    .select('*')
    .eq('vendor_ref', ref)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clients: data })
}

ENDOFFILE_020bf801

echo "📝 Creating src/app/api/dashboard/stats/route.ts..."
cat > src/app/api/dashboard/stats/route.ts << 'ENDOFFILE_9825878c'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 })

  try {
    // Count leads
    const { count: leadsCount } = await supabase
      .from('vendor_leads')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_ref', ref)

    // Count couples
    const { count: couplesCount } = await supabase
      .from('vendor_clients')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_ref', ref)
      .eq('type', 'couple')

    // Count shoppers
    const { count: shoppersCount } = await supabase
      .from('vendor_clients')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_ref', ref)
      .eq('type', 'shopper')

    // Total commission
    const { data: commData } = await supabase
      .from('vendor_clients')
      .select('commission_earned')
      .eq('vendor_ref', ref)

    const totalCommission = (commData || []).reduce((sum: number, c: any) => sum + (c.commission_earned || 0), 0)

    // Recent activity
    const { data: activity } = await supabase
      .from('vendor_activity')
      .select('*')
      .eq('vendor_ref', ref)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        leads: leadsCount || 0,
        couples: couplesCount || 0,
        shoppers: shoppersCount || 0,
        totalCommission: totalCommission || 0,
      },
      activity: activity || [],
    })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}

ENDOFFILE_9825878c

echo "📝 Creating src/app/api/submit-lead/route.ts..."
cat > src/app/api/submit-lead/route.ts << 'ENDOFFILE_248301b8'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { vendor_ref, name, email, phone, event_date, interest, message } = body

    if (!vendor_ref || !name) {
      return NextResponse.json({ error: 'vendor_ref and name required' }, { status: 400 })
    }

    // Insert lead
    const { data, error } = await supabase
      .from('vendor_leads')
      .insert({
        vendor_ref,
        name,
        email: email || null,
        phone: phone || null,
        event_date: event_date || null,
        interest: interest || null,
        message: message || null,
        source: 'contact_form',
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Lead submission error:', error)
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
    }

    // Log activity
    await supabase.from('vendor_activity').insert({
      vendor_ref,
      type: 'form_submit',
      description: `New inquiry from ${name}${interest ? ` about ${interest}` : ''}`,
      metadata: { lead_id: data.id, name, email, interest },
    })

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

ENDOFFILE_248301b8

echo "📝 Creating src/components/VendorContactForm.tsx..."
cat > src/components/VendorContactForm.tsx << 'ENDOFFILE_c17f6d7b'
'use client'

import { useState } from 'react'

interface ContactFormProps {
  vendorRef: string
  vendorName: string
  accentColor?: string
}

export default function VendorContactForm({ vendorRef, vendorName, accentColor }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event_date: '',
    interest: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_ref: vendorRef,
          ...formData,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div style={{
        background: 'var(--card-bg, #fff)',
        borderRadius: 16,
        padding: 40,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
        <h3 style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
          Message Sent!
        </h3>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Thanks for reaching out! {vendorName} will get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--card-bg, #fff)',
      borderRadius: 16,
      padding: 32,
    }}>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 13,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Your Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Full name"
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-dark, #f3efe9)',
              border: '1px solid var(--border, #e4ddd4)',
              borderRadius: 8,
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-dark, #f3efe9)',
              border: '1px solid var(--border, #e4ddd4)',
              borderRadius: 8,
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 555-1234"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-dark, #f3efe9)',
              border: '1px solid var(--border, #e4ddd4)',
              borderRadius: 8,
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Event Date
          </label>
          <input
            type="date"
            value={formData.event_date}
            onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-dark, #f3efe9)',
              border: '1px solid var(--border, #e4ddd4)',
              borderRadius: 8,
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
          I'm Interested In
        </label>
        <select
          value={formData.interest}
          onChange={(e) => setFormData(prev => ({ ...prev, interest: e.target.value }))}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--bg-dark, #f3efe9)',
            border: '1px solid var(--border, #e4ddd4)',
            borderRadius: 8,
            fontSize: 15,
            color: 'var(--text)',
            fontFamily: 'inherit',
          }}
        >
          <option value="">Select an option...</option>
          <option value="Wedding Planning">Wedding Planning</option>
          <option value="Day-of Coordination">Day-of Coordination</option>
          <option value="Full Event Planning">Full Event Planning</option>
          <option value="Photography">Photography</option>
          <option value="Videography">Videography</option>
          <option value="DJ / Music">DJ / Music</option>
          <option value="Catering">Catering</option>
          <option value="Florals">Florals</option>
          <option value="Venue">Venue</option>
          <option value="Decor">Decor</option>
          <option value="Other">Something Else</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
          Tell Us More
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Share details about your event — date, guest count, venue, special requests..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--bg-dark, #f3efe9)',
            border: '1px solid var(--border, #e4ddd4)',
            borderRadius: 8,
            fontSize: 15,
            color: 'var(--text)',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          padding: 14,
          background: accentColor || 'var(--brand, #c9944a)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          opacity: submitting ? 0.7 : 1,
          transition: 'all 0.2s',
        }}
      >
        {submitting ? 'Sending...' : 'Send Message ✨'}
      </button>
    </form>
  )
}

ENDOFFILE_c17f6d7b

echo "📝 Creating sql/001_dashboard_schema.sql..."
cat > sql/001_dashboard_schema.sql << 'ENDOFFILE_8b3ea48a'
-- ============================================
-- WeTwo Vendors Dashboard Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Vendor Accounts (links auth users to vendor records)
CREATE TABLE IF NOT EXISTS vendor_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'pro')),
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0,
  password_hash TEXT, -- for simple password auth (phase 1)
  magic_link_token TEXT,
  magic_link_expires TIMESTAMPTZ,
  onboarded_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_accounts_ref ON vendor_accounts(vendor_ref);
CREATE INDEX idx_vendor_accounts_email ON vendor_accounts(email);

-- 2. Leads / Inquiries (from contact forms on vendor pages)
CREATE TABLE IF NOT EXISTS vendor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  event_date DATE,
  interest TEXT,
  message TEXT,
  source TEXT DEFAULT 'contact_form', -- contact_form, referral, manual
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_leads_ref ON vendor_leads(vendor_ref);
CREATE INDEX idx_vendor_leads_status ON vendor_leads(status);

-- 3. Client Links (tracking who vendors share links with)
CREATE TABLE IF NOT EXISTS vendor_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('couple', 'shopper')),
  name TEXT,
  email TEXT,
  phone TEXT,
  link_clicked BOOLEAN DEFAULT FALSE,
  registered BOOLEAN DEFAULT FALSE,
  total_purchases NUMERIC(10,2) DEFAULT 0,
  commission_earned NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_clients_ref ON vendor_clients(vendor_ref);
CREATE INDEX idx_vendor_clients_type ON vendor_clients(type);

-- 4. Activity Log
CREATE TABLE IF NOT EXISTS vendor_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  type TEXT NOT NULL, -- page_view, link_click, form_submit, registration, purchase
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_activity_ref ON vendor_activity(vendor_ref);
CREATE INDEX idx_vendor_activity_type ON vendor_activity(type);
CREATE INDEX idx_vendor_activity_created ON vendor_activity(created_at DESC);

-- 5. AI Chat History (for vendor assistant)
CREATE TABLE IF NOT EXISTS vendor_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_chats_ref ON vendor_chats(vendor_ref);

-- 6. Enable RLS
ALTER TABLE vendor_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_chats ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (service role bypasses, anon can submit leads)
CREATE POLICY "Service role full access" ON vendor_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vendor_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vendor_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vendor_activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vendor_chats FOR ALL USING (true) WITH CHECK (true);

-- Allow anonymous lead submission via contact forms
CREATE POLICY "Anyone can submit leads" ON vendor_leads FOR INSERT WITH CHECK (true);

ENDOFFILE_8b3ea48a

echo ""
echo "✅ All 20 files created!"
echo ""
echo "📋 Next steps:"
echo "  1. Run the SQL in sql/001_dashboard_schema.sql in Supabase SQL Editor"
echo "  2. Start dev server: npm run dev"
echo "  3. Create a test account:"
echo '     curl -X POST http://localhost:3000/api/auth/create-account \'
echo '       -H "Content-Type: application/json" \'
echo '       -d '"'"'{"vendor_ref":"divine-events-creators-ih5k","email":"test@test.com","password":"test123","name":"Divine Events","plan":"free"}'"'"''
echo "  4. Go to http://localhost:3000/login"
echo "  5. Sign in with test@test.com / test123"
echo ""
echo "🎉 Command Center installed!"
