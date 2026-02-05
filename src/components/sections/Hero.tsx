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
    ? `linear-gradient(180deg, rgba(10,10,21,0.2) 0%, rgba(10,10,21,0.45) 40%, rgba(10,10,21,0.75) 70%, ${theme.bg} 100%)`
    : `linear-gradient(180deg, rgba(30,25,20,0.15) 0%, rgba(30,25,20,0.4) 40%, rgba(30,25,20,0.7) 70%, ${theme.bg} 100%)`;

  const primaryRgb = hexToRgb(theme.primary);

  // Truncate subheadline to ~2 clean lines without mid-word cut
  const truncatedSub = truncateCleanly(subheadline, 160);

  return (
    <section id="hero" className="hero">
      {/* Background Image */}
      {bgImage && (
        <div
          className="hero-bg-image"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="hero-overlay" style={{ background: overlayGradient }} />

      {/* Grain Texture */}
      <div className="hero-grain" />

      {/* Content */}
      <div className="hero-content">
        {/* Badge */}
        <div
          className="hero-badge animate-fade-in-up"
          style={{
            background: `rgba(${primaryRgb}, 0.2)`,
            border: `1px solid rgba(${primaryRgb}, 0.5)`,
          }}
        >
          {badge}
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-1">
          {renderHeadline(headline)}
        </h1>

        {/* Subheadline — cleanly truncated, no mid-word ellipsis */}
        {truncatedSub && (
          <p className="hero-subheadline animate-fade-in-up delay-2">
            {truncatedSub}
          </p>
        )}

        {/* Buttons */}
        <div className="hero-buttons animate-fade-in-up delay-3">
          {heroConfig?.buttons ? (
            heroConfig.buttons.map((btn, i) => (
              <a
                key={i}
                href={btn.href}
                style={{
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
                    boxShadow: `0 4px 20px rgba(${primaryRgb}, 0.4)`,
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
                }}
              >
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
                boxShadow: `0 4px 20px rgba(${primaryRgb}, 0.4)`,
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
        <div className="hero-info animate-fade-in-up delay-4">
          {heroConfig?.infoItems ? (
            heroConfig.infoItems.map((item, i) => (
              <div key={i} className="hero-info-item">
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))
          ) : (
            <>
              {location && (
                <div className="hero-info-item">
                  <span>📍</span> {location}
                </div>
              )}
              {vendor.phone && (
                <div className="hero-info-item">
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
  const parts = text.split(/(\*[^*]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

/** Truncate to maxLen, cutting at the last full word, adding ellipsis only if actually truncated */
function truncateCleanly(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace < 0) return truncated + '…';
  return truncated.slice(0, lastSpace) + '…';
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
