'use client';

import type { Vendor } from '@/lib/types';
import type { ThemeConfig } from '@/lib/types';
import { resolveHeroStyle, splitAccentWord, FONT_STACKS } from '@/lib/heroStyles';

interface Props {
  vendor: Vendor;
  theme: ThemeConfig;
  links: { affiliateLink: string };
}

export function HeroSection({ vendor, theme, links }: Props) {
  const heroConfig = vendor.hero_config;
  const style = resolveHeroStyle(heroConfig?.heroStyle);

  const headline = heroConfig?.headline || vendor.business_name || 'Welcome';
  const subheadline = heroConfig?.subheadline || vendor.bio || '';
  const badge = heroConfig?.badge || `\u{1F48D} ${vendor.category || 'Wedding Vendor'}`;
  const bgImage = heroConfig?.backgroundImage || vendor.portfolio_images?.[0] || '';
  const accentWord = heroConfig?.accentWord;
  const trustBadges = vendor.trust_badges || [];
  const location = [vendor.city, vendor.state].filter(Boolean).join(', ');
  const isDark = theme.mode === 'dark';

  const primaryRgb = hexToRgb(theme.primary);
  const truncatedSub = truncateCleanly(subheadline, 200);

  // Accent word segments
  const segments = splitAccentWord(headline, accentWord);

  // Font families based on style
  const headingFamily = FONT_STACKS[style.headingFont] || FONT_STACKS.serif;
  const accentFamily = style.accentFont
    ? FONT_STACKS[style.accentFont] || FONT_STACKS['serif-italic']
    : headingFamily;

  // Render headline with accent word support
  const renderStyledHeadline = () => {
    if (accentWord && segments.length > 1) {
      return segments.map((seg, i) =>
        seg.isAccent ? (
          <em key={i} style={{ fontFamily: accentFamily, color: theme.primary }}>{seg.text}</em>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      );
    }
    // Fallback: existing *word* italic syntax
    return renderLegacyHeadline(headline);
  };

  // Build info items
  const infoItems = heroConfig?.infoItems || [
    ...(location ? [{ icon: '\u{1F4CD}', text: location }] : []),
    ...(vendor.phone ? [{ icon: '\u{1F4F1}', text: vendor.phone }] : []),
  ];

  // Build buttons
  const buttons = heroConfig?.buttons || [
    { label: '\u{1F48D} View Packages', href: '#packages', variant: 'primary' as const },
    { label: '\u{1F389} Our Services', href: '#services_list', variant: 'secondary' as const },
    { label: 'View Gallery', href: '#gallery', variant: 'outline' as const },
  ];

  // ═══ SPLIT LAYOUT ═══
  if (style.layout === 'split') {
    return (
      <section id="hero" className={`hero-split-layout ${style.className}`}>
        <div className="hero-split-text" style={{ background: isDark ? '#0a0a15' : '#faf9f7', color: isDark ? '#fff' : '#1a1a2e' }}>
          <div className="hero-badge animate-fade-in-up" style={{ background: `rgba(${primaryRgb}, 0.15)`, border: `1px solid rgba(${primaryRgb}, 0.4)`, color: isDark ? '#f0e0c8' : theme.primary, alignSelf: 'flex-start' }}>
            {badge}
          </div>
          <h1 className="animate-fade-in-up delay-1" style={{ fontFamily: headingFamily }}>
            {renderStyledHeadline()}
          </h1>
          {truncatedSub && (
            <p className="hero-subheadline animate-fade-in-up delay-2" style={{ color: isDark ? '#d4cfc8' : '#6b6560' }}>
              {truncatedSub}
            </p>
          )}
          <div className="hero-buttons animate-fade-in-up delay-3">
            {buttons.map((btn, i) => (
              <a key={i} href={btn.href} style={getButtonStyle(btn.variant, theme, primaryRgb, isDark, false)}>{btn.label}</a>
            ))}
          </div>
          {trustBadges.length > 0 && (
            <div className="hero-trust-badges animate-fade-in-up delay-4">
              {trustBadges.map((b, i) => (
                <span key={i} className="trust-badge-pill">{b.icon} {b.text}</span>
              ))}
            </div>
          )}
          {trustBadges.length === 0 && infoItems.length > 0 && (
            <div className="hero-info animate-fade-in-up delay-4">
              {infoItems.map((item, i) => (
                <div key={i} className="hero-info-item" style={{ color: isDark ? '#fff' : '#6b6560' }}>
                  <span>{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="hero-split-image" style={{
          backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
          backgroundColor: isDark ? '#1a1a2e' : '#ddd',
        }} />
      </section>
    );
  }

  // ═══ STACKED LAYOUT ═══
  if (style.layout === 'stacked') {
    return (
      <section id="hero" className={`hero-stacked-layout ${style.className}`}>
        <div className="hero-stacked-image" style={{
          backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
          backgroundColor: isDark ? '#1a1a2e' : '#ddd',
        }} />
        <div className="hero-stacked-text" style={{ background: isDark ? '#0a0a15' : '#faf9f7', color: isDark ? '#fff' : '#1a1a2e' }}>
          <div className="hero-badge animate-fade-in-up" style={{ background: `rgba(${primaryRgb}, 0.15)`, border: `1px solid rgba(${primaryRgb}, 0.4)`, color: isDark ? '#f0e0c8' : theme.primary }}>
            {badge}
          </div>
          <h1 className="animate-fade-in-up delay-1" style={{ fontFamily: headingFamily }}>
            {renderStyledHeadline()}
          </h1>
          {truncatedSub && (
            <p className="hero-subheadline animate-fade-in-up delay-2" style={{ color: isDark ? '#d4cfc8' : '#6b6560' }}>
              {truncatedSub}
            </p>
          )}
          <div className="hero-buttons animate-fade-in-up delay-3">
            {buttons.map((btn, i) => (
              <a key={i} href={btn.href} style={getButtonStyle(btn.variant, theme, primaryRgb, isDark, false)}>{btn.label}</a>
            ))}
          </div>
          {trustBadges.length > 0 && (
            <div className="hero-trust-badges animate-fade-in-up delay-4">
              {trustBadges.map((b, i) => (
                <span key={i} className="trust-badge-pill">{b.icon} {b.text}</span>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ═══ CINEMATIC LAYOUT ═══
  if (style.layout === 'cinematic') {
    const overlayGradient = 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 100%)';
    return (
      <section id="hero" className={`hero hero-cinematic-layout ${style.className}`} style={{ alignItems: 'flex-end', minHeight: '100vh' }}>
        {bgImage && <div className="hero-bg-image" style={{ backgroundImage: `url('${bgImage}')` }} />}
        <div className="hero-overlay" style={{ background: overlayGradient }} />
        <div className="hero-grain" />
        <div className="hero-content animate-fade-in-up" style={{ textAlign: 'left', maxWidth: '900px', paddingBottom: '60px' }}>
          <div className="hero-badge" style={{ background: `rgba(${primaryRgb}, 0.2)`, border: `1px solid rgba(${primaryRgb}, 0.5)`, color: '#f0e0c8' }}>
            {badge}
          </div>
          <h1 className="delay-1" style={{ fontFamily: headingFamily, fontSize: 'clamp(40px, 7vw, 72px)' }}>
            {renderStyledHeadline()}
          </h1>
          {truncatedSub && (
            <p className="hero-subheadline delay-2" style={{ maxWidth: '550px', margin: '0 0 32px' }}>
              {truncatedSub}
            </p>
          )}
          <div className="hero-buttons delay-3" style={{ justifyContent: 'flex-start' }}>
            {buttons.map((btn, i) => (
              <a key={i} href={btn.href} style={getButtonStyle(btn.variant, theme, primaryRgb, true, true)}>{btn.label}</a>
            ))}
          </div>
          {trustBadges.length > 0 && (
            <div className="hero-trust-badges delay-4">
              {trustBadges.map((b, i) => (
                <span key={i} className="trust-badge-pill">{b.icon} {b.text}</span>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ═══ ASYMMETRIC LAYOUT ═══
  if (style.layout === 'asymmetric') {
    const overlayGradient = isDark
      ? `linear-gradient(180deg, rgba(10,10,21,0.2) 0%, rgba(10,10,21,0.5) 40%, rgba(10,10,21,0.75) 70%, ${theme.bg} 100%)`
      : `linear-gradient(180deg, rgba(30,25,20,0.15) 0%, rgba(30,25,20,0.45) 40%, rgba(30,25,20,0.7) 70%, ${theme.bg} 100%)`;
    return (
      <section id="hero" className={`hero hero-asymmetric-layout ${style.className}`}>
        {bgImage && <div className="hero-bg-image" style={{ backgroundImage: `url('${bgImage}')` }} />}
        <div className="hero-overlay" style={{ background: overlayGradient }} />
        <div className="hero-grain" />
        <div className="hero-content animate-fade-in-up" style={{ textAlign: 'left', maxWidth: '550px', alignSelf: 'center', marginRight: 'auto' }}>
          <div className="hero-badge" style={{ background: `rgba(${primaryRgb}, 0.2)`, border: `1px solid rgba(${primaryRgb}, 0.5)`, color: '#f0e0c8' }}>
            {badge}
          </div>
          <h1 className="delay-1" style={{ fontFamily: headingFamily, fontSize: 'clamp(36px, 6vw, 64px)' }}>
            {renderStyledHeadline()}
          </h1>
          {truncatedSub && (
            <p className="hero-subheadline delay-2" style={{ margin: '0 0 32px' }}>
              {truncatedSub}
            </p>
          )}
          <div className="hero-buttons delay-3" style={{ justifyContent: 'flex-start' }}>
            {buttons.map((btn, i) => (
              <a key={i} href={btn.href} style={getButtonStyle(btn.variant, theme, primaryRgb, true, true)}>{btn.label}</a>
            ))}
          </div>
          {trustBadges.length > 0 && (
            <div className="hero-trust-badges delay-4">
              {trustBadges.map((b, i) => (
                <span key={i} className="trust-badge-pill">{b.icon} {b.text}</span>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ═══ CENTERED LAYOUT (classic, editorial, grand, minimal) ═══
  const isMinimal = style.id === 'minimal';
  const isGrand = style.id === 'grand';

  const overlayGradient = isDark
    ? `linear-gradient(180deg, rgba(10,10,21,0.2) 0%, rgba(10,10,21,${style.overlayOpacity}) 40%, rgba(10,10,21,0.75) 70%, ${theme.bg} 100%)`
    : `linear-gradient(180deg, rgba(30,25,20,0.15) 0%, rgba(30,25,20,${style.overlayOpacity}) 40%, rgba(30,25,20,0.7) 70%, ${theme.bg} 100%)`;

  return (
    <section id="hero" className={`hero ${style.className}`}>
      {bgImage && <div className="hero-bg-image" style={{ backgroundImage: `url('${bgImage}')` }} />}
      <div className="hero-overlay" style={{ background: overlayGradient }} />
      <div className="hero-grain" />
      <div className="hero-content">
        <div className="hero-badge animate-fade-in-up" style={{
          background: `rgba(${primaryRgb}, 0.2)`,
          border: `1px solid rgba(${primaryRgb}, 0.5)`,
        }}>
          {badge}
        </div>
        <h1 className="animate-fade-in-up delay-1" style={{
          fontFamily: headingFamily,
          ...(isMinimal ? { fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontSize: 'clamp(28px, 5vw, 48px)' } : {}),
          ...(isGrand ? { letterSpacing: '0.02em', fontSize: 'clamp(44px, 8vw, 76px)' } : {}),
        }}>
          {renderStyledHeadline()}
        </h1>
        {!isMinimal && truncatedSub && (
          <p className="hero-subheadline animate-fade-in-up delay-2">
            {truncatedSub}
          </p>
        )}
        <div className="hero-buttons animate-fade-in-up delay-3">
          {buttons.map((btn, i) => (
            <a key={i} href={btn.href} style={getButtonStyle(btn.variant, theme, primaryRgb, true, true)}>{btn.label}</a>
          ))}
        </div>
        {trustBadges.length > 0 ? (
          <div className="hero-trust-badges animate-fade-in-up delay-4">
            {trustBadges.map((b, i) => (
              <span key={i} className="trust-badge-pill">{b.icon} {b.text}</span>
            ))}
          </div>
        ) : (
          <div className="hero-info animate-fade-in-up delay-4">
            {infoItems.map((item, i) => (
              <div key={i} className="hero-info-item">
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Button style helper ───
function getButtonStyle(
  variant: string,
  theme: ThemeConfig,
  primaryRgb: string,
  onImage: boolean,
  centered: boolean
): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '14px 28px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };

  if (variant === 'primary') {
    return { ...base, background: theme.primary, color: '#fff', boxShadow: `0 4px 20px rgba(${primaryRgb}, 0.4)` };
  }
  if (variant === 'secondary') {
    return { ...base, background: 'rgba(255,255,255,0.15)', color: onImage ? '#fff' : theme.text, border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' };
  }
  return { ...base, background: 'transparent', color: onImage ? '#fff' : theme.text, border: `1px solid ${onImage ? 'rgba(255,255,255,0.35)' : theme.border}` };
}

// ─── Legacy headline renderer (handles *accent* syntax) ───
function renderLegacyHeadline(text: string) {
  const parts = text.split(/(\*[^*]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function truncateCleanly(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace < 0) return truncated + '\u2026';
  return truncated.slice(0, lastSpace) + '\u2026';
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