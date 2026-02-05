'use client';

import type { Vendor, SectionId } from '@/lib/types';

interface Props {
  vendor: Vendor;
  variant?: SectionId;
}

export function PackagesSection({ vendor, variant }: Props) {
  const packages = Array.isArray(vendor.pricing_packages) ? vendor.pricing_packages : [];
  if (packages.length === 0) return null;

  const sectionTitle = variant === 'fleet_showcase' ? 'Our Fleet'
    : variant === 'inventory_grid' ? 'Our Collection'
    : 'Planning Made Simple';

  const colsClass = packages.length === 1 ? 'cols-1'
    : packages.length === 2 ? 'cols-2'
    : '';

  return (
    <section id="packages" className="section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Our Packages</span>
          <h2 className="section-title">{sectionTitle}</h2>
          <p className="section-subtitle">
            From day-of coordination to complete event planning — choose the level of support that&apos;s right for you.
          </p>
        </div>

        <div className={`packages-grid ${colsClass}`}>
          {packages.map((pkg, i) => {
            const isFeatured = pkg.featured === true;
            const features = Array.isArray(pkg.features) ? pkg.features : [];

            return (
              <div
                key={pkg.id || i}
                className={`package-card${isFeatured ? ' featured' : ''}`}
              >
                <h3 className="package-name">{pkg.name}</h3>
                <div className="package-price">{pkg.price}</div>
                {pkg.priceNote && (
                  <div className="package-price-note">{pkg.priceNote}</div>
                )}

                {pkg.description && (
                  <p className="package-desc">
                    {pkg.description.length > 200
                      ? pkg.description.slice(0, 200) + '...'
                      : pkg.description}
                  </p>
                )}

                {features.length > 0 && (
                  <ul className="package-features">
                    {features.slice(0, 6).map((feat, fi) => (
                      <li key={fi}>{feat}</li>
                    ))}
                    {features.length > 6 && (
                      <li style={{ fontSize: '13px', color: 'var(--text-dim)', paddingTop: '4px', listStyle: 'none' }}>
                        + {features.length - 6} more included
                      </li>
                    )}
                  </ul>
                )}

                <a
                  href="#contact"
                  className="btn"
                  style={{
                    background: isFeatured ? 'var(--primary)' : 'transparent',
                    color: isFeatured ? '#fff' : 'var(--text)',
                    border: isFeatured ? 'none' : '1.5px solid var(--border)',
                    width: '100%',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    padding: '14px',
                    fontWeight: 600,
                    marginTop: 'auto',
                    textDecoration: 'none',
                  }}
                >
                  Book Now
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
