'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function AboutSection({ vendor }: Props) {
  const name = vendor.contact_name || vendor.business_name;
  const photo = vendor.photo_url;
  const bio = vendor.bio || '';
  const services = vendor.services_included || [];

  // Get first name for "Meet [Name]"
  const firstName = name.split(' ')[0];

  // Determine role based on category
  const roleTitle = getRoleTitle(vendor.category);

  // Service highlights (up to 4)
  const highlights = services.slice(0, 4).map(s => ({
    icon: s.icon || '✨',
    name: s.name,
  }));

  // If no photo and no meaningful bio beyond what hero shows, skip
  if (!photo && bio.length < 80) return null;

  return (
    <section id="about" style={{
      padding: '100px 40px',
      background: 'var(--bg)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: photo ? '380px 1fr' : '1fr',
        gap: '60px',
        alignItems: 'center',
      }}>
        {/* Photo */}
        {photo && (
          <div style={{
            position: 'relative',
          }}>
            {/* Decorative border frame */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '-12px',
              right: '12px',
              bottom: '12px',
              border: '2px solid var(--primary)',
              borderRadius: '20px',
              opacity: 0.3,
            }} />
            <img
              src={photo}
              alt={`${name}, owner of ${vendor.business_name}`}
              style={{
                width: '100%',
                height: '480px',
                objectFit: 'cover',
                borderRadius: '20px',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        )}

        {/* Content */}
        <div>
          <span className="section-label">
            Meet {firstName}
          </span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '28px',
            fontWeight: 500,
            marginBottom: '24px',
            lineHeight: 1.3,
            color: 'var(--text-muted)',
          }}>
            {roleTitle}
          </h2>

          <div style={{
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--text-muted)',
            marginBottom: '32px',
          }}>
            {bio.split('\n').map((paragraph, i) => (
              <p key={i} style={{ marginBottom: '16px' }}>{paragraph}</p>
            ))}
          </div>

          {/* Service Highlights */}
          {highlights.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {highlights.map((h, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: 'var(--primary-dim)',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}>
                  <span>{h.icon}</span>
                  <span>{h.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function getRoleTitle(category?: string): string {
  const titles: Record<string, string> = {
    'Planner': 'Event Planner, Coordinator & Visionary',
    'Day-of Coordinator': 'Event Planner, Coordinator & Visionary',
    'Event Planner': 'Event Planner, Coordinator & Visionary',
    'Photographer': 'Photographer & Visual Storyteller',
    'Videographer': 'Cinematographer & Visual Artist',
    'DJ': 'DJ, MC & Entertainment Specialist',
    'Band': 'Musician & Entertainment Director',
    'Caterer': 'Chef & Culinary Artist',
    'Florist': 'Floral Designer & Botanical Artist',
    'Venue': 'Venue Director & Host',
    'Hair & Makeup': 'Beauty Artist & Stylist',
    'Photo Booth': 'Photo Experience Specialist',
    'Decor': 'Décor Designer & Stylist',
    'Bakery': 'Pastry Chef & Cake Artist',
    'Transportation': 'Luxury Transportation Specialist',
    'Rentals': 'Event Rentals & Design Specialist',
    'Officiant': 'Wedding Officiant & Ceremony Designer',
    'Jeweler': 'Fine Jewelry Artisan',
    'Bridal Salon': 'Bridal Fashion Consultant',
    'Bar Service': 'Mixologist & Bar Service Specialist',
  };
  return titles[category || ''] || 'Owner & Creative Director';
}
