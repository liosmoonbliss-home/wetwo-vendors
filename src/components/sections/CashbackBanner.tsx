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
          Visit the <strong>WeTwo Store</strong> and earn <strong>25% cashback</strong> on wedding registries, home décor, fashion &amp; more —{' '}
          <a href={links.affiliateLink} target="_blank" rel="noopener noreferrer">
            Shop the Store →
          </a>
        </span>
      </div>
    </div>
  );
}
