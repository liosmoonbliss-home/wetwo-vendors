'use client';
import type { Vendor } from '@/lib/types';
interface Props {
  vendor: Vendor;
}
export function AboutSection({ vendor }: Props) {
  const name = vendor.contact_name || vendor.business_name;
  const heroConfig = vendor.hero_config as Record<string, unknown> | undefined;
  const photo = (heroConfig?.about_photo as string) || vendor.photo_url;
  const bio = vendor.bio || '';
  const services = vendor.services_included || [];
  const firstName = name.split(' ')[0];
  const customTitle = heroConfig?.about_title as string | undefined;
  const roleTitle = customTitle || getRoleTitle(vendor.category);

  const highlights = services.slice(0, 4).map((s: any) => {
    let parsed = s;
    if (typeof s === 'string') { try { parsed = JSON.parse(s); } catch { /* plain string */ } }
    return {
      icon: (typeof parsed === 'string' ? '✨' : parsed.icon) || '✨',
      name: typeof parsed === 'string' ? parsed : parsed.name,
    };
  }).filter(h => h.name && h.name.trim() !== '');

  if (!photo && bio.length < 80) return null;
  return (
    <section id="about" className="section" style={{ background: 'var(--bg)' }}>
      <div className={`about-grid${!photo ? ' no-photo' : ''}`}>
        {photo && (
          <div className="about-image-wrapper">
            <div className="about-image-frame" />
            <img
              src={photo}
              alt={`${name}, owner of ${vendor.business_name}`}
              className="about-image"
            />
          </div>
        )}
        <div className="about-content">
          <span className="section-label">Meet {firstName}</span>
          <h2>{roleTitle}</h2>
          {bio.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {highlights.length > 0 && (
            <div className="about-features">
              {highlights.map((h, i) => (
                <div key={i} className="about-feature">
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
