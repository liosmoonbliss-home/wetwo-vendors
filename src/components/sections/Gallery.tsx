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

  const galleryTitle = vendor.category === 'Caterer' ? 'Culinary Creations'
    : vendor.category === 'Florist' ? 'Floral Designs'
    : vendor.category === 'Photographer' ? 'Featured Moments'
    : "Events We've Brought to Life";

  const gallerySubtitle = vendor.category === 'Photographer'
    ? 'Every image tells a story. Here are some of our favorites.'
    : 'Weddings, celebrations, and corporate events — each one crafted with care and attention to every detail.';

  // Adapt grid columns for small image counts
  const gridCols = images.length <= 2 ? images.length : images.length <= 4 ? 2 : 4;

  return (
    <section id="gallery" className="section section-alt">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Our Work</span>
          <h2 className="section-title">{galleryTitle}</h2>
          <p className="section-subtitle">{gallerySubtitle}</p>
        </div>

        <div
          className="gallery-grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={`gallery-image-wrapper${(images.length >= 4 && i === 0) ? ' gallery-item-large' : ''}`}
              onClick={() => onImageClick(i)}
            >
              <img
                src={img}
                alt={`${vendor.business_name} portfolio ${i + 1}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
