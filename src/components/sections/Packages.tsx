'use client';

import { useState } from 'react';
import type { Vendor, SectionId, PricingPackage } from '@/lib/types';

interface Props {
  vendor: Vendor;
  variant?: SectionId;
}

const DEFAULT_ICONS = ['📋', '💍', '🎵', '👑', '🌟', '💎'];

export function PackagesSection({ vendor, variant }: Props) {
  const packages: PricingPackage[] = Array.isArray(vendor.pricing_packages) ? vendor.pricing_packages : [];
  if (!packages.length) return null;

  // Enrich with defaults
  const enriched = packages.map((pkg, i) => ({
    ...pkg,
    icon: pkg.icon || DEFAULT_ICONS[i % DEFAULT_ICONS.length],
    featured: pkg.featured ?? (packages.length >= 3 ? i === 1 : i === packages.length - 1),
  }));

  const mainPackages = enriched.slice(0, 3);
  const extraPackages = enriched.slice(3);

  const colsClass =
    mainPackages.length === 1 ? 'cols-1' : mainPackages.length === 2 ? 'cols-2' : 'cols-3';

  return (
    <section id="packages" className="vendor-section section-alt">
      <h2 className="section-title">Packages</h2>
      <div className={`packages-grid ${colsClass}`}>
        {mainPackages.map((pkg, i) => (
          <PackageCard key={pkg.id || i} pkg={pkg} />
        ))}
      </div>
      {extraPackages.length > 0 && (
        <>
          <h3 style={{ textAlign: 'center', margin: '2rem 0 1rem', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
            Additional Options
          </h3>
          <div className={`packages-grid ${extraPackages.length === 1 ? 'cols-1' : extraPackages.length === 2 ? 'cols-2' : 'cols-3'}`}>
            {extraPackages.map((pkg, i) => (
              <PackageCard key={pkg.id || i} pkg={pkg} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function PackageCard({ pkg }: { pkg: PricingPackage }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_FEATURES = 4;
  const hasLongDesc = (pkg.description?.length || 0) > 120;
  const hasFeatureOverflow = pkg.features && pkg.features.length > MAX_FEATURES;
  const visibleFeatures = expanded ? pkg.features : (pkg.features || []).slice(0, MAX_FEATURES);

  const fmtPrice = (p: string) => {
    if (!p) return 'Custom';
    const n = parseFloat(p.replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return p;
    if (p.startsWith('$')) return `$${n.toLocaleString()}`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className={`package-card${pkg.featured ? ' featured' : ''}`}>
      <div className="package-header">
        <span className="package-icon">{pkg.icon}</span>
        <h3 className="package-name">{pkg.name}</h3>
        <div className="package-price">
          {fmtPrice(pkg.price)}
          {pkg.priceNote && <span className="package-price-note">{pkg.priceNote}</span>}
        </div>
      </div>
      {pkg.description && (
        <p className="package-desc">
          {pkg.description.length > 120 && !expanded
            ? pkg.description.slice(0, 120) + '…'
            : pkg.description}
        </p>
      )}
      {visibleFeatures.length > 0 && (
        <ul className="package-features">
          {visibleFeatures.map((f, j) => (
            <li key={j}>{f}</li>
          ))}
        </ul>
      )}
      {(hasLongDesc || hasFeatureOverflow) && (
        <button
          className="package-expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '← Show less' : hasFeatureOverflow ? `See all ${pkg.features.length} features →` : 'Read more →'}
        </button>
      )}
      <a
        href="#contact"
        className={`package-cta${pkg.featured ? ' featured' : ''}`}
      >
        {pkg.featured ? 'Inquire Now' : 'Book Now'}
      </a>
    </div>
  );
}
