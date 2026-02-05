'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function TestimonialsSection({ vendor }: Props) {
  const testimonials = Array.isArray(vendor.testimonials) ? vendor.testimonials : [];
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="section" style={{ background: 'var(--bg-hover)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Client Love</span>
          <h2 className="section-title">What Our Clients Say</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: testimonials.length === 1 ? '1fr'
            : testimonials.length === 2 ? 'repeat(2, 1fr)'
            : 'repeat(3, 1fr)',
          gap: '24px',
        }}>
          {testimonials.map((t, i) => (
            <div key={t.id || i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '32px',
              position: 'relative',
            }}>
              {/* Quote mark */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                fontSize: '48px',
                fontFamily: 'Georgia, serif',
                color: 'var(--primary)',
                opacity: 0.2,
                lineHeight: 1,
              }}>
                &ldquo;
              </div>

              {/* Stars */}
              <div style={{ marginBottom: '16px', fontSize: '16px' }}>
                {Array.from({ length: t.rating || 5 }).map((_, si) => (
                  <span key={si} style={{ color: '#f5a623' }}>★</span>
                ))}
              </div>

              {/* Text */}
              <p style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'var(--text-muted)',
                marginBottom: '20px',
                fontStyle: 'italic',
              }}>
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                {t.date && (
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{t.date}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
