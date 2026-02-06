'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function ServicesSection({ vendor }: Props) {
  const raw = Array.isArray(vendor.services_included) ? vendor.services_included : [];
  if (raw.length === 0) return null;

  // Normalize: support both string[] and ServiceItem[]
  const services = raw.map((s: any) => {
    if (typeof s === 'string') return { icon: '✨', name: s, description: '' };
    return { icon: s.icon || '✨', name: s.name || '', description: s.description || '' };
  }).filter(s => s.name.trim() !== '');

  if (services.length === 0) return null;

  // Adapt grid columns
  const colClass = services.length <= 3
    ? `repeat(${services.length}, 1fr)`
    : 'repeat(3, 1fr)';

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

        <div className="services-grid" style={{ gridTemplateColumns: colClass }}>
          {services.map((service, i) => (
            <div key={i} className="service-card">
              <div className="service-icon">
                {service.icon}
              </div>
              <h3>{service.name}</h3>
              {service.description && <p>{service.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
