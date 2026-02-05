'use client';

import type { Vendor } from '@/lib/types';

interface BannerProps {
  vendor: Vendor;
  links: { affiliateLink: string };
}

export function CashbackBanner({ vendor, links }: BannerProps) {
  return (
    <div style={{
      background: 'var(--bg-hover)',
      padding: '48px 40px',
      textAlign: 'center',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎁</div>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '28px',
          fontWeight: 500,
          marginBottom: '12px',
        }}>
          Earn <span style={{ color: 'var(--primary)' }}>25% Cashback</span> on Your Wedding
        </h3>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: '24px',
        }}>
          Shop through our WeTwo link and get cashback on wedding essentials.
        </p>
        <a
          href={links.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            padding: '14px 32px',
            borderRadius: '10px',
            fontSize: '15px',
          }}
        >
          Start Earning Cashback
        </a>
      </div>
    </div>
  );
}
