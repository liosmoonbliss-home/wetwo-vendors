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

        <div style={{
          display: 'grid',
          gridTemplateColumns: packages.length === 1 ? '1fr'
            : packages.length === 2 ? 'repeat(2, 1fr)'
            : 'repeat(3, 1fr)',
          gap: '24px',
          alignItems: 'stretch',
        }}>
          {packages.map((pkg, i) => {
            const isFeatured = pkg.featured === true;
            const features = Array.isArray(pkg.features) ? pkg.features : [];

            return (
              <div
                key={pkg.id || i}
                className={`package-card ${isFeatured ? 'featured' : ''}`}
                style={isFeatured ? { paddingTop: '44px' } : undefined}
              >
                {/* Package Name */}
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}>
                  {pkg.name}
                </h3>

                {/* Price */}
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: '4px',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {pkg.price}
                </div>

                {pkg.priceNote && (
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-dim)',
                    marginBottom: '16px',
                  }}>
                    {pkg.priceNote}
                  </div>
                )}

                {/* Description */}
                {pkg.description && (
                  <p style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'var(--text-muted)',
                    marginBottom: '20px',
                    flex: 1,
                  }}>
                    {pkg.description.length > 200
                      ? pkg.description.slice(0, 200) + '...'
                      : pkg.description}
                  </p>
                )}

                {/* Features */}
                {features.length > 0 && (
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    marginBottom: '24px',
                    flex: 1,
                  }}>
                    {features.slice(0, 6).map((feat, fi) => (
                      <li key={fi} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '6px 0',
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                      }}>
                        <span style={{
                          color: 'var(--primary)',
                          fontSize: '14px',
                          marginTop: '2px',
                          flexShrink: 0,
                        }}>✓</span>
                        {feat}
                      </li>
                    ))}
                    {features.length > 6 && (
                      <li style={{
                        fontSize: '13px',
                        color: 'var(--text-dim)',
                        paddingTop: '4px',
                      }}>
                        + {features.length - 6} more included
                      </li>
                    )}
                  </ul>
                )}

                {/* CTA */}
                <a href="#contact" className="btn" style={{
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
                }}>
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
