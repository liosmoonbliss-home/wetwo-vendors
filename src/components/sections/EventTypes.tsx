'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function EventTypesSection({ vendor }: Props) {
  const events = Array.isArray(vendor.event_types) ? vendor.event_types : [];
  if (events.length === 0) return null;

  const title = vendor.category === 'Caterer' ? 'Events We Cater'
    : vendor.category === 'Venue' ? 'Events We Host'
    : 'Celebrations of Every Kind';

  return (
    <section id="event_types" className="section section-alt">
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <span className="section-label">Events We Serve</span>
        <h2 className="section-title" style={{ marginBottom: '40px' }}>
          {title}
        </h2>

        <div className="event-types-grid">
          {events.map((event, i) => (
            <div key={i} className="event-pill">
              <span>{event.icon || '🎉'}</span>
              <span>{event.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
