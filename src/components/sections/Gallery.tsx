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

  // Cap to clean grid count: large first (2x2) + small fill rows of 4
  // Good counts: 5, 9, 13... or for fewer: 1, 2, 3, 4
  const cleanCount = (len: number): number => {
    if (len <= 4) return len;
    // With large first: 1 large + groups of 4 smalls look clean
    // So good totals are 5, 9, 13, 17...
    const afterLarge = len - 1;
    const fullRows = Math.floor(afterLarge / 4);
    const remainder = afterLarge % 4;
    // Allow 2-3 remainder (looks fine), trim if 1 (orphan)
    if (remainder === 1 && fullRows > 0) return 1 + (fullRows * 4);
    return len;
  };
  const displayImages = images.slice(0, cleanCount(images.length));

  const events = Array.isArray(vendor.event_types) ? vendor.event_types : [];

  const galleryTitle = vendor.category === 'Caterer' ? 'Culinary Creations'
    : vendor.category === 'Florist' ? 'Floral Designs'
    : vendor.category === 'Photographer' ? 'Featured Moments'
    : "Events We've Brought to Life";

  const hasLargeFirst = displayImages.length >= 4;
  const gridCols = displayImages.length <= 2 ? displayImages.length : displayImages.length <= 4 ? 2 : 4;
  const effectiveCols = gridCols;
  let orphanIndex = -1;

  if (hasLargeFirst && displayImages.length > 1) {
    const remainingAfterLarge = displayImages.length - 1;
    const slotsInLargeRows = Math.min(remainingAfterLarge, effectiveCols - 2 + effectiveCols - 2);
    const afterLargeRows = remainingAfterLarge - slotsInLargeRows;
    if (afterLargeRows > 0 && afterLargeRows % effectiveCols === 1) {
      orphanIndex = displayImages.length - 1;
    }
    if (images.length % gridCols === 1 && images.length > 1) {
      orphanIndex = images.length - 1;
    }
  }

  return (
    <section id="gallery" className="section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Our Work</span>
          <h2 className="section-title">{galleryTitle}</h2>
          {events.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
              {events.map((event: any, i: number) => (
                <span key={i} className="event-pill">{event.icon || '🎉'} {event.name}</span>
              ))}
            </div>
          )}
        </div>

        <div
          className="gallery-grid"
          style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
        >
          {displayImages.map((img, i) => {
            const isLarge = hasLargeFirst && i === 0;
            const isOrphan = i === orphanIndex;
            return (
              <div
                key={i}
                className={`gallery-image-wrapper${isLarge ? ' gallery-item-large' : ''}${isOrphan ? ' gallery-orphan-fill' : ''}`}
                onClick={() => onImageClick(i)}
              >
                <img
                  src={img}
                  alt={`${vendor.business_name} portfolio ${i + 1}`}
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
