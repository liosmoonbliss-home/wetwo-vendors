// ============================================================
// mapOnboardToVendor.ts
// ============================================================
// Translates Claude's creative output into builder state.
// Handles theme auto-apply + section auto-activation.
// ============================================================

import type { Vendor, SectionId } from './types';

const VALID_PRESETS = new Set([
  'midnight-gold', 'dark-royal', 'dark-luxury', 'dark-forest',
  'warm-copper', 'blush-romance', 'soft-sage', 'light-champagne',
  'light-clean', 'ocean-breeze', 'sunset-glow', 'earth-tone',
  'modern-mono', 'bright-coral', 'deep-plum', 'dusty-rose',
  'terracotta', 'lavender-haze', 'ice-blue', 'noir',
]);

export interface OnboardResult {
  vendor: Partial<Vendor>;
  images: { url: string; selected: boolean }[];
  theme: {
    preset: string;
    primaryColor: string;
    secondaryColor: string;
    mood: string;
  } | null;
  designNotes: string;
}

export function mapOnboardToVendor(claudeOutput: Record<string, unknown>): OnboardResult {
  const c = claudeOutput;

  // Hero Config
  const heroConfig = {
    headline: (c.tagline as string) || '',
    subheadline: (c.description as string) || '',
    badge: c.vendor_category_icon
      ? `${c.vendor_category_icon} ${c.vendor_category || ''}`
      : `\u2726 ${c.vendor_category || 'Vendor'}`,
    backgroundImage: (c.suggested_hero_image as string) || '',
    about_photo: (c.suggested_about_image as string) || '',
    about_title: (c.about_title as string) || '',
    heroStyle: (c.hero_style as string) || 'editorial',
    accentWord: (c.accent_word as string) || undefined,
    heroTypography: (c.hero_typography as string) || 'mixed',
    heroMood: (c.hero_mood as string) || '',
  };

  // Services
  const services = Array.isArray(c.services)
    ? (c.services as Array<Record<string, string>>).map(s => ({
        icon: s.icon || '\u2726',
        name: s.name || '',
        description: s.description || '',
      }))
    : [];

  // Packages
  const packages = Array.isArray(c.packages)
    ? (c.packages as Array<Record<string, unknown>>).map((p, i) => ({
        id: Number((p.id as string)?.replace(/\D/g, '')) || i + 1,
        icon: (p.icon as string) || '\u{1F4E6}',
        name: (p.name as string) || `Package ${i + 1}`,
        price: (p.price as string) || 'Contact for Pricing',
        description: (p.description as string) || '',
        features: Array.isArray(p.features) ? p.features as string[] : [],
      }))
    : [];

  // Contact info
  const contact = (c.contact_info || {}) as Record<string, string>;

  // Instagram cleanup
  let instagram = contact.instagram || '';
  if (instagram.startsWith('@')) instagram = instagram.slice(1);
  if (instagram.includes('instagram.com/')) {
    instagram = instagram.split('instagram.com/').pop()?.replace(/\/$/, '') || '';
  }

  // Gallery images
  const galleryImages = Array.isArray(c.suggested_gallery_images)
    ? (c.suggested_gallery_images as string[])
    : [];

  // Section activation
  const activeSections = buildActiveSections(c);
  const sectionOrder = Array.isArray(c.section_order)
    ? (c.section_order as string[])
    : activeSections;

  // Trust badges
  const trustBadges = Array.isArray(c.trust_badges) ? c.trust_badges : [];

  // Theme recommendation
  const themeRec = c.theme_recommendation as Record<string, string> | undefined;
  let theme: OnboardResult['theme'] = null;
  if (themeRec) {
    const preset = VALID_PRESETS.has(themeRec.preset) ? themeRec.preset : 'light-clean';
    theme = {
      preset,
      primaryColor: themeRec.primary_color || '',
      secondaryColor: themeRec.secondary_color || '',
      mood: themeRec.mood || 'light',
    };
  }

  // Event types
  const eventTypes = Array.isArray(c.event_types)
    ? (c.event_types as string[]).map(e => typeof e === 'string' ? { icon: '\u{1F48D}', name: e } : e)
    : [{ icon: '\u{1F48D}', name: 'Weddings' }];

  // Build vendor data
  const vendor: Partial<Vendor> = {
    business_name: (c.business_name as string) || '',
    contact_name: (c.contact_name as string) || '',
    category: (c.vendor_category as string) || '',
    bio: (c.about_bio as string) || '',
    email: contact.email || '',
    phone: contact.phone || '',
    website: contact.website || '',
    instagram_handle: instagram,
    city: contact.city || '',
    state: contact.state || '',
    photo_url: (c.suggested_hero_image as string) || '',
    portfolio_images: galleryImages,
    services_included: services,
    pricing_packages: packages,
    hero_config: heroConfig,
    active_sections: activeSections as SectionId[],
    section_order: sectionOrder as SectionId[],
    event_types: eventTypes,
    trust_badges: trustBadges as Array<{ icon: string; text: string }>,
    // Theme auto-apply
    theme_preset: theme?.preset || 'light-clean',
    brand_color: theme?.primaryColor || '',
    brand_color_secondary: theme?.secondaryColor || '',
  };

  // Image selections for builder image tab
  const allImages = new Set<string>();
  if (c.suggested_hero_image) allImages.add(c.suggested_hero_image as string);
  if (c.suggested_about_image) allImages.add(c.suggested_about_image as string);
  galleryImages.forEach(img => allImages.add(img));

  const images = [...allImages].map(url => ({ url, selected: true }));

  return { vendor, images, theme, designNotes: (c.design_notes as string) || '' };
}

function buildActiveSections(c: Record<string, unknown>): string[] {
  // If Claude provided them, use those
  if (Array.isArray(c.active_sections) && c.active_sections.length > 0) {
    return c.active_sections as string[];
  }
  // Auto-detect from content
  const sections: string[] = ['hero'];
  if (c.about_bio) sections.push('about');
  if (Array.isArray(c.services) && c.services.length > 0) sections.push('services_list');
  if (Array.isArray(c.suggested_gallery_images) && c.suggested_gallery_images.length > 0) sections.push('gallery');
  if (Array.isArray(c.packages) && c.packages.length > 0) sections.push('packages');
  sections.push('contact');
  return sections;
}