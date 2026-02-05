'use client';

import { useState } from 'react';
import type { Vendor, SectionId, PricingPackage } from '@/lib/types';

interface Props {
  vendor: Vendor;
  variant?: SectionId;
}

export function PackagesSection({ vendor, variant }: Props) {
  const packages: PricingPackage[] = Array.isArray(vendor.pricing_packages) ? vendor.pricing_packages : [];
  if (packages.length === 0) return null;

  const sectionTitle = variant === 'fleet_showcase' ? 'Our Fleet'
    : variant === 'inventory_grid' ? 'Our Collection'
    : 'Planning Made Simple';

  return (
    <section id="packages" className="section section-alt">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Our Packages</span>
          <h2 className="section-title">{sectionTitle}</h2>
          <p className="section-subtitle">
            From day-of coordination to complete event planning — choose the level of support that&apos;s right for you.
          </p>
        </div>

        <div className="packages-grid">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id || i} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg }: { pkg: PricingPackage }) {
  const [expanded, setExpanded] = useState(false);
  const isFeatured = pkg.featured === true;

  // Extract features: prefer pkg.features array, fallback to parsing bullets from description
  let features: string[] = [];
  if (Array.isArray(pkg.features) && pkg.features.length > 0) {
    features = pkg.features;
  } else if (pkg.description) {
    features = extractBulletPoints(pkg.description);
  }

  // Get a clean short description (first sentence before bullet points)
  const shortDesc = getShortDescription(pkg.description || '', features.length > 0);

  // Parse price for display
  const { mainPrice, priceNote } = parsePrice(pkg.price, pkg.priceNote);

  // Determine if we need "See more" - show max 6 features when collapsed
  const MAX_FEATURES_COLLAPSED = 6;
  const hasMoreFeatures = features.length > MAX_FEATURES_COLLAPSED;
  const displayedFeatures = expanded ? features : features.slice(0, MAX_FEATURES_COLLAPSED);

  return (
    <div className={`package-card${isFeatured ? ' featured' : ''}`}>
      {/* Icon */}
      {pkg.icon && (
        <div className="package-icon">{pkg.icon}</div>
      )}

      <h3 className="package-name">{pkg.name}</h3>
      <div className="package-price">
        {mainPrice}
        {priceNote && <span> {priceNote}</span>}
      </div>

      {shortDesc && (
        <p className="package-desc">{shortDesc}</p>
      )}

      {displayedFeatures.length > 0 && (
        <ul className="package-features">
          {displayedFeatures.map((feat, fi) => (
            <li key={fi}>{feat}</li>
          ))}
        </ul>
      )}

      {/* See more / See less toggle */}
      {hasMoreFeatures && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="package-expand-btn"
        >
          {expanded ? '← See less' : `See all ${features.length} features →`}
        </button>
      )}

      <a
        href="#contact"
        className={`btn package-cta${isFeatured ? ' featured' : ''}`}
      >
        {isFeatured ? 'Inquire Now' : 'Book Now'}
      </a>
    </div>
  );
}

function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^[•\-\*]\s*(.+)/) || trimmed.match(/^\d+[.)]\s*(.+)/);
    if (match) {
      const clean = match[1].trim();
      if (clean.length > 5) {
        bullets.push(clean);
      }
    }
  }

  return bullets;
}

function getShortDescription(text: string, hasBullets: boolean): string {
  if (!text) return '';

  const bulletStart = text.search(/\n\s*[•\-\*]\s/);
  let desc = bulletStart > 0 ? text.slice(0, bulletStart).trim() : text.trim();

  // Keep descriptions shorter when we have bullet features
  const maxLen = hasBullets ? 150 : 180;
  
  if (desc.length > maxLen) {
    const lastPeriod = desc.lastIndexOf('.', maxLen);
    if (lastPeriod > 50) {
      desc = desc.slice(0, lastPeriod + 1);
    } else {
      const lastSpace = desc.lastIndexOf(' ', maxLen);
      desc = desc.slice(0, lastSpace > 0 ? lastSpace : maxLen) + '…';
    }
  }

  return desc;
}

function parsePrice(price: string, existingNote?: string): { mainPrice: string; priceNote: string } {
  if (existingNote) {
    return { mainPrice: formatPrice(price), priceNote: existingNote };
  }

  const rangeMatch = price.match(/^\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)$/);
  if (rangeMatch) {
    return {
      mainPrice: '$' + addCommas(rangeMatch[1]),
      priceNote: '– $' + addCommas(rangeMatch[2]),
    };
  }

  const plusMatch = price.match(/^\$?([\d,]+)\+$/);
  if (plusMatch) {
    return {
      mainPrice: '$' + addCommas(plusMatch[1]) + '+',
      priceNote: '',
    };
  }

  const slashMatch = price.match(/^\$?([\d,]+)\s*\/\s*(.+)$/);
  if (slashMatch) {
    return {
      mainPrice: '$' + addCommas(slashMatch[1]),
      priceNote: '/ ' + slashMatch[2],
    };
  }

  return { mainPrice: formatPrice(price), priceNote: '' };
}

function formatPrice(price: string): string {
  return price.replace(/\$?(\d+)/g, (match, num) => {
    return '$' + addCommas(num);
  }).replace(/\$\$/g, '$');
}

function addCommas(numStr: string): string {
  const num = numStr.replace(/,/g, '');
  return parseInt(num, 10).toLocaleString();
}
