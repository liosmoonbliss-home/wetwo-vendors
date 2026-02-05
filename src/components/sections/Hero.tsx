'use client';

import type { Vendor } from '@/lib/types';
import type { ThemeConfig } from '@/lib/types';

interface Props {
  vendor: Vendor;
  theme: ThemeConfig;
  links: { affiliateLink: string };
}

export function HeroSection({ vendor, theme, links }: Props) {
  const heroConfig = vendor.hero_config;
  const headline = heroConfig?.headline || vendor.business_name;
  const subheadline = heroConfig?.subheadline || vendor.bio || '';
  const badge = heroConfig?.badge || `💍 ${vendor.category || 'Wedding Vendor'}`;
  const bgImage = heroConfig?.backgroundImage || vendor.portfolio_images?.[0] || '';

  const location = [vendor.city, vendor.state].filter(Boolean).join(', ');
  const isDark = theme.mode === 'dark';

  const overlayGradient = isDark
    ? `linear-gradient(180deg, rgba(10,10,21,0.3) 0%, rgba(10,10,21,0.6) 40%, rgba(10,10,21,0.85) 70%, ${theme.bg} 100%)`
    : `linear-gradient(180deg, rgba(30,25,20,0.25) 0%, rgba(30,25,20,0.5) 40%, rgba(30,25,20,0.75) 70%, ${theme.bg} 100%)`;

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '120px 40px 100px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Image */}
      {bgImage && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scale(1.05)',
        }} />
      )}

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: overlayGradient,
      }} />

      {/* Decorative grain texture */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        maxWidth: '850px',
        zIndex: 2,
      }}>
        {/* Badge */}
        <div className="animate-fade-in-up" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: `rgba(${hexToRgb(theme.primary)}, 0.2)`,
          border: `1px solid rgba(${hexToRgb(theme.primary)}, 0.5)`,
          color: '#f0e0c8',
          padding: '10px 24px',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '28px',
          backdropFilter: 'blur(10px)',
          letterSpacing: '0.02em',
        }}>
          {badge}
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-1" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(42px, 8vw, 72px)',
          fontWeight: 500,
          marginBottom: '24px',
          lineHeight: 1.05,
          color: '#fff',
          letterSpacing: '-0.02em',
        }}>
          {renderHeadline(headline)}
        </h1>

        {/* Subheadline */}
        {subheadline && (
          <p className="animate-fade-in-up delay-2" style={{
            fontSize: '18px',
            color: 'rgba(212, 207, 200, 0.9)',
            maxWidth: '620px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            {subheadline.length > 200
              ? subheadline.slice(0, 200) + '...'
              : subheadline}
          </p>
        )}

        {/* Buttons */}
        <div className="animate-fade-in-up delay-3" style={{
          display: 'flex', gap: '14px',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {heroConfig?.buttons ? (
            heroConfig.buttons.map((btn, i) => (
              <a key={i} href={btn.href} style={{
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                ...(btn.variant === 'primary' ? {
                  background: theme.primary,
                  color: '#fff',
                  boxShadow: `0 4px 20px rgba(${hexToRgb(theme.primary)}, 0.4)`,
                } : btn.variant === 'secondary' ? {
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                } : {
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.35)',
                }),
              }}>
                {btn.label}
              </a>
            ))
          ) : (
            <>
              <a href="#packages" style={{
                padding: '14px 28px', borderRadius: '10px',
                fontWeight: 600, fontSize: '14px',
                background: theme.primary, color: '#fff',
                textDecoration: 'none',
                boxShadow: `0 4px 20px rgba(${hexToRgb(theme.primary)}, 0.4)`,
                transition: 'all 0.3s ease',
              }}>
                💍 View Packages
              </a>
              <a href="#services_list" style={{
                padding: '14px 28px', borderRadius: '10px',
                fontWeight: 600, fontSize: '14px',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}>
                🎉 Our Services
              </a>
              <a href="#gallery" style={{
                padding: '14px 28px', borderRadius: '10px',
                fontWeight: 600, fontSize: '14px',
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}>
                View Gallery
              </a>
            </>
          )}
        </div>

        {/* Info Items */}
        <div className="animate-fade-in-up delay-4" style={{
          marginTop: '52px',
          display: 'flex', gap: '32px',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {heroConfig?.infoItems ? (
            heroConfig.infoItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 500,
              }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))
          ) : (
            <>
              {location && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 500,
                }}>
                  <span>📍</span> {location}
                </div>
              )}
              {vendor.phone && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 500,
                }}>
                  <span>📱</span> {vendor.phone}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function renderHeadline(text: string) {
  // Support *italic* in headline text
  const parts = text.split(/(\*[^*]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function hexToRgb(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  } catch {
    return '139, 115, 85';
  }
}
