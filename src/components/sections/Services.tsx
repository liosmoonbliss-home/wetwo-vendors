'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function ServicesSection({ vendor }: Props) {
  const raw = Array.isArray(vendor.services_included) ? vendor.services_included : [];
  if (raw.length === 0) return null;

  // Robustly normalize: handle string, object, or stringified JSON
  const services = raw.map((s: any) => {
    if (typeof s === 'string') {
      // Try parsing stringified JSON
      try {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed === 'object') {
          return { icon: parsed.icon || '✨', name: parsed.name || '', description: parsed.description || '' };
        }
      } catch { /* not JSON, treat as plain name */ }
      return { icon: '✨', name: s, description: '' };
    }
    if (s && typeof s === 'object') {
      return { icon: s.icon || '✨', name: s.name || '', description: s.description || '' };
    }
    return { icon: '✨', name: String(s || ''), description: '' };
  }).filter(s => s.name.trim() !== '');

  if (services.length === 0) return null;

  const colCount = Math.min(services.length, 3);

  return (
    <section id="services_list" className="section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">Our Services</h2>
        </div>

        <div className="services-grid" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
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
