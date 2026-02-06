interface ClaudeOutput {
  business_name: string;
  tagline: string;
  accent_word: string;
  hero_style: string;
  description: string;
  vendor_category: string;
  vendor_category_icon: string;
  recommended_theme: string;
  custom_brand_color: string | null;
  trust_badges: Array<{ icon: string; text: string }>;
  about_title: string;
  about_bio: string;
  about_highlights: Array<{ icon: string; name: string; description: string }>;
  services: Array<{ icon: string; name: string; description: string }>;
  packages: Array<{ name: string; price: string; description: string; features: string[] }>;
  event_types: Array<{ icon: string; name: string }>;
  contact_info: Record<string, string | null>;
  suggested_hero_image: string;
  suggested_about_image: string;
  suggested_gallery_images: string[];
  menu_categories: Array<{ name: string; subtitle: string; items: unknown[] }>;
  creative_notes: string;
}

export function mapOnboardToVendor(claude: ClaudeOutput) {
  // Build portfolio_images array (what the builder expects)
  const portfolio_images: string[] = [];
  if (claude.suggested_hero_image) portfolio_images.push(claude.suggested_hero_image);
  if (claude.suggested_about_image && !portfolio_images.includes(claude.suggested_about_image)) {
    portfolio_images.push(claude.suggested_about_image);
  }
  if (claude.suggested_gallery_images) {
    for (const img of claude.suggested_gallery_images) {
      if (!portfolio_images.includes(img)) portfolio_images.push(img);
    }
  }

  const contact = claude.contact_info || {};

  // Normalize services → services_included (builder field name)
  const services_included = (claude.services || []).map((s) => ({
    icon: s.icon || '✦',
    name: s.name || '',
    description: s.description || '',
  }));

  // Normalize packages → pricing_packages (builder field name)
  const pricing_packages = (claude.packages || []).map((p, i) => ({
    name: p.name || '',
    id: `pkg-${i}`,
    icon: '📦',
    price: p.price || 'Contact for Pricing',
    description: p.description || '',
    features: Array.isArray(p.features) ? p.features.filter((f: string) => f?.trim()) : [],
  }));

  const about_highlights = (claude.about_highlights || []).map((h) => ({
    icon: h.icon || '✦',
    name: h.name || '',
    description: h.description || '',
  }));

  const event_types = (claude.event_types || []).map((e) => ({
    icon: e.icon || '🎉',
    name: e.name || '',
  }));

  const menu_categories = (claude.menu_categories || []).map((m) => ({
    name: m.name || '',
    subtitle: m.subtitle || '',
    icon: '📋',
    imageUrl: '',
    items: Array.isArray(m.items) ? m.items : [],
  }));

  const trust_badges = (claude.trust_badges || []).map((b) => ({
    icon: b.icon || '✦',
    text: b.text || '',
  }));

  return {
    // Core identity — using BUILDER field names
    business_name: claude.business_name || '',
    category: claude.vendor_category || '',
    bio: claude.about_bio || '',

    // Hero config — headline, subheadline, badge are what the builder reads
    hero_config: {
      backgroundImage: claude.suggested_hero_image || portfolio_images[0] || '',
      about_photo: claude.suggested_about_image || portfolio_images[1] || '',
      about_title: claude.about_title || '',
      headline: claude.tagline || '',
      subheadline: claude.description || '',
      badge: `${claude.vendor_category_icon || '✨'} ${claude.vendor_category || ''}`.trim(),
      heroStyle: claude.hero_style || 'classic',
      accentWord: claude.accent_word || '',
    },

    // Images — builder uses portfolio_images
    portfolio_images,
    photo_url: claude.suggested_hero_image || '',

    // Content sections — builder field names
    services_included,
    pricing_packages,
    about_highlights,
    event_types,
    menu_categories,
    trust_badges,

    // Contact — builder field names
    phone: contact.phone || '',
    email: contact.email || '',
    instagram_handle: (contact.instagram || '').replace('@', ''),
    contact_name: '',

    // Meta (not saved to vendor, used by handler)
    _recommended_theme: claude.recommended_theme || 'light-elegant',
    _custom_brand_color: claude.custom_brand_color || null,
    _creative_notes: claude.creative_notes || '',
  };
}
