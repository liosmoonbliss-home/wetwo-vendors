'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
  masonry?: boolean;
  onImageClick: (index: number) => void;
}

export function GallerySection({ vendor, masonry = false, onImageClick }: Props) {
  const images = Array.isArray(vendor.portfolio_images) ? vendor.portfolio_images : [];
  if (images.length === 0) return null;

  return (
    <section id="gallery" className="section" style={{ background: 'var(--bg-hover)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Our Work</span>
          <h2 className="section-title">
            {vendor.category === 'Caterer' ? 'Culinary Creations' :
             vendor.category === 'Florist' ? 'Floral Designs' :
             vendor.category === 'Photographer' ? 'Featured Moments' :
             "Events We've Brought to Life"}
          </h2>
          <p className="section-subtitle">
            {vendor.category === 'Photographer'
              ? 'Every image tells a story. Here are some of our favorites.'
              : 'Weddings, celebrations, and corporate events — each one crafted with care and attention to every detail.'}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: images.length <= 2
            ? `repeat(${images.length}, 1fr)`
            : images.length <= 4
              ? 'repeat(2, 1fr)'
              : 'repeat(4, 1fr)',
          gridAutoRows: '280px',
          gap: '12px',
        }}>
          {images.map((img, i) => (
            <div
              key={i}
              className="gallery-image-wrapper"
              onClick={() => onImageClick(i)}
              style={{
                gridColumn: (images.length >= 4 && i === 0) ? 'span 2' : undefined,
                gridRow: (images.length >= 4 && i === 0) ? 'span 2' : undefined,
              }}
            >
              <img
                src={img}
                alt={`${vendor.business_name} portfolio ${i + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
