'use client';

import type { Vendor } from '@/lib/types';

interface BannerProps {
  vendor: Vendor;
  links: { affiliateLink: string };
}

export function CashbackBanner({ vendor, links }: BannerProps) {
  return (
    <div className="cashback-banner">
      <div className="cashback-banner-inner">
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎁</div>
        <h3>
          Earn <span style={{ color: 'var(--primary)' }}>25% Cashback</span> on Your Wedding
        </h3>
        <p>
          Shop through our WeTwo link and get cashback on wedding essentials.
        </p>
        <a
          href={links.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ padding: '14px 32px', borderRadius: '10px', fontSize: '15px' }}
        >
          Start Earning Cashback
        </a>
      </div>
    </div>
  );
}
