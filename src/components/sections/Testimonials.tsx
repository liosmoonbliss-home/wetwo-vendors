'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function TestimonialsSection({ vendor }: Props) {
  const testimonials = Array.isArray(vendor.testimonials) ? vendor.testimonials : [];
  if (testimonials.length === 0) return null;

  const colsClass = testimonials.length === 1 ? 'cols-1'
    : testimonials.length === 2 ? 'cols-2'
    : '';

  return (
    <section id="testimonials" className="section section-alt">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Client Love</span>
          <h2 className="section-title">What Our Clients Say</h2>
        </div>

        <div className={`testimonials-grid ${colsClass}`}>
          {testimonials.map((t, i) => (
            <div key={t.id || i} className="review-card">
              <div className="review-quote">&ldquo;</div>

              {/* Stars */}
              <div className="review-stars">
                {Array.from({ length: t.rating || 5 }).map((_, si) => (
                  <span key={si} className="star">★</span>
                ))}
              </div>

              <p className="review-text">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="review-footer">
                <div className="review-author">{t.name}</div>
                {t.date && <div className="review-date">{t.date}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
