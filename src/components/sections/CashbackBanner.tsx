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
        <span className="cashback-icon">✨</span>
        <span className="cashback-text">
          Shop with us and get <strong>25% cashback</strong> on everything — wedding registries, home, fashion &amp; more —{' '}
          <a href={links.affiliateLink} target="_blank" rel="noopener noreferrer">
            Unlock Cashback →
          </a>
        </span>
      </div>
    </div>
  );
}
