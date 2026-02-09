'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin/overview', icon: '◉' },
  { label: 'Activity', href: '/admin/activity', icon: '◈' },
  { label: 'Vendors', href: '/admin/vendors', icon: '◆' },
  { label: 'Couples', href: '/admin/couples', icon: '♥' },
  { label: 'Shoppers', href: '/admin/shoppers', icon: '◇' },
  { label: 'Leads', href: '/admin/leads', icon: '✉' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Login page doesn't use this layout's auth check
  const isLoginPage = pathname === '/admin';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      setAuthed(false);
      return;
    }
    // Quick auth check by hitting the stats endpoint
    fetch('/api/admin/stats')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/admin');
        } else {
          setAuthed(true);
        }
      })
      .catch(() => router.replace('/admin'))
      .finally(() => setChecking(false));
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f1419',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c9a96e',
        fontFamily: "'Georgia', serif",
        fontSize: '14px',
        letterSpacing: '4px',
      }}>
        LOADING...
      </div>
    );
  }

  if (!authed) return null;

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/admin');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0f1419',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}>
        <div style={{
          padding: '0 24px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '16px',
        }}>
          <div style={{
            fontSize: '12px',
            letterSpacing: '5px',
            color: '#c9a96e',
            textTransform: 'uppercase',
          }}>WETWO</div>
          <div style={{
            fontSize: '16px',
            color: '#7a7570',
            fontWeight: 300,
            marginTop: '2px',
          }}>Admin</div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 24px',
                  color: active ? '#c9a96e' : '#7a7570',
                  textDecoration: 'none',
                  fontSize: '14px',
                  background: active ? 'rgba(201,169,110,0.08)' : 'transparent',
                  borderRight: active ? '2px solid #c9a96e' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '12px', opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#5a5550',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: '220px',
        padding: '32px 40px',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  );
}
