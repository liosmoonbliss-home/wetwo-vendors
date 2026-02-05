'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function ServicesSection({ vendor }: Props) {
  const services = Array.isArray(vendor.services_included) ? vendor.services_included : [];
  if (services.length === 0) return null;

  return (
    <section id="services_list" className="section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">Full-Service Event Solutions</h2>
          <p className="section-subtitle">
            Everything you need for a flawless event, all under one roof.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: services.length <= 3
            ? `repeat(${services.length}, 1fr)`
            : 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {services.map((service, i) => (
            <div key={i} className="service-card">
              <div style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--primary-dim)',
                borderRadius: '16px',
                fontSize: '24px',
                margin: '0 auto 20px',
              }}>
                {service.icon || '✨'}
              </div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '12px',
              }}>
                {service.name}
              </h3>
              {service.description && (
                <p style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--text-muted)',
                }}>
                  {service.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
