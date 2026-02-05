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

  // Compute grid columns and detect orphan
  const hasLargeFirst = images.length >= 4;
  const gridCols = images.length <= 2 ? images.length : images.length <= 4 ? 2 : 4;

  // Figure out which images are "normal" sized in the grid (after the large first one)
  // Large first image takes 2 cols x 2 rows = effectively occupies 4 cells
  // Remaining images each take 1 cell
  // We need to figure out if the last image would be orphaned (alone in its row)
  const effectiveCols = gridCols;
  let orphanIndex = -1;

  if (hasLargeFirst && images.length > 1) {
    // After the large image (which spans 2 cols, 2 rows), remaining images fill normally
    // The large image occupies columns 1-2, rows 1-2
    // Images 1-onwards fill starting at col 3 (row 1), col 4 (row 1), col 3 (row 2), col 4 (row 2), then new rows of 4
    const remainingAfterLarge = images.length - 1;
    // First 4 slots fill the right side of the large image (2 cols x 2 rows = 4 slots)
    const slotsInLargeRows = Math.min(remainingAfterLarge, effectiveCols - 2 + effectiveCols - 2);
    const afterLargeRows = remainingAfterLarge - slotsInLargeRows;
    if (afterLargeRows > 0 && afterLargeRows % effectiveCols === 1) {
      orphanIndex = images.length - 1;
    }
  } else if (!hasLargeFirst) {
    // Simple grid — check if last row has only 1 image
    if (images.length % gridCols === 1 && images.length > 1) {
      orphanIndex = images.length - 1;
    }
  }

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
          {images.map((img, i) => {
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
