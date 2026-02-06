"use client";

import { useState } from "react";
import type { Vendor } from "@/lib/types";

interface Props {
  vendor: Vendor;
  masonry?: boolean;
  onImageClick: (index: number) => void;
}

const MAX_GALLERY = 9;

export function GallerySection({ vendor, masonry = false, onImageClick }: Props) {
  const images = Array.isArray(vendor.portfolio_images) ? vendor.portfolio_images : [];
  if (images.length === 0) return null;

  const displayImages = images.slice(0, MAX_GALLERY);
  const events = Array.isArray(vendor.event_types) ? vendor.event_types : [];

  const galleryTitle =
    vendor.category === "Caterer" ? "Culinary Creations"
    : vendor.category === "Florist" ? "Floral Designs"
    : vendor.category === "Photographer" ? "Featured Moments"
    : "Events We've Brought to Life";

  return (
    <section id="gallery" className="section">
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className="section-header">
          <span className="section-label">Our Work</span>
          <h2 className="section-title">{galleryTitle}</h2>
          {events.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginTop: "0.75rem" }}>
              {events.map((event: any, i: number) => (
                <span key={i} className="event-pill">{event.icon || "🎉"} {event.name}</span>
              ))}
            </div>
          )}
        </div>
        <GalleryGrid images={displayImages} businessName={vendor.business_name} onImageClick={onImageClick} />
      </div>
    </section>
  );
}

function GalleryGrid({ images, businessName, onImageClick }: { images: string[]; businessName: string; onImageClick: (i: number) => void }) {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const thumbs: { url: string; origIdx: number }[] = images
    .map((url, i) => ({ url, origIdx: i }))
    .filter((_, i) => i !== featuredIdx);

  const thumbCols = Math.min(thumbs.length, 4);

  return (
    <div>
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "12px",
        }}
      >
        <img
          src={images[featuredIdx]}
          alt={`${businessName} featured`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.3s" }}
        />
      </div>

      {thumbs.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${thumbCols}, 1fr)`,
            gap: "8px",
          }}
        >
          {thumbs.map(({ url, origIdx }) => (
            <div
              key={origIdx}
              onClick={() => setFeaturedIdx(origIdx)}
              style={{
                aspectRatio: "1",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <img
                src={url}
                alt={`${businessName} ${origIdx + 1}`}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
