// ============================================================
// SITE ANALYZER — Extract vendor data from a website's HTML
// ============================================================

import type { Vendor, VendorCategory, SectionId, PricingPackage, ServiceItem, EventType, Testimonial, FAQItem, MenuCategory, HeroConfig } from './types';
import { findClosestTheme, findTopThemes, THEME_LIBRARY } from './themes';

// ── MAIN ANALYZER ─────────────────────────────────────────────

export interface AnalysisResult {
  vendor: Partial<Vendor>;
  confidence: Record<string, number>; // field → 0-1 confidence
  themeMatch: { name: string; distance: number }[];
  suggestedSections: SectionId[];
  suggestedOrder: SectionId[];
  rawColors: string[];
  warnings: string[];
}

export function analyzeHTML(html: string, sourceUrl: string): AnalysisResult {
  const warnings: string[] = [];
  const confidence: Record<string, number> = {};

  // Parse
  const title = extractMeta(html, 'og:title') || extractTag(html, 'title') || '';
  const description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';
  const themeColor = extractMeta(html, 'theme-color') || '';
  const ogImage = extractMeta(html, 'og:image') || '';

  // Business name
  const businessName = cleanBusinessName(title);
  confidence['business_name'] = businessName ? 0.9 : 0.3;

  // Category
  const category = detectCategory(html, title, description);
  confidence['category'] = category !== 'Event Planner' ? 0.8 : 0.4;

  // Colors
  const rawColors = extractColors(html);
  const brandColor = themeColor || rawColors[0] || '#c9a050';
  const brandColorSecondary = rawColors[1] || '';
  confidence['brand_color'] = themeColor ? 0.95 : rawColors.length > 0 ? 0.7 : 0.3;

  // Theme matching
  const isDarkSite = detectDarkMode(html);
  const themeMatch = findTopThemes(brandColor, 5, isDarkSite ? 'dark' : 'light');

  // Contact info
  const email = extractEmail(html);
  const phone = extractPhone(html);
  const instagram = extractInstagram(html);
  const address = extractAddress(html);

  // Content
  const bio = description || extractBio(html);
  const contactName = extractContactName(html, businessName);
  const images = extractImages(html, sourceUrl);
  const packages = extractPackages(html);
  const services = extractServices(html);
  const testimonials = extractTestimonials(html);
  const faqs = extractFAQs(html);
  const eventTypes = extractEventTypes(html, category);
  const menuCategories = extractMenuCategories(html);
  const videoUrls = extractVideoUrls(html);

  // Section selection
  const { sections, order } = selectSections(category, {
    hasImages: images.length >= 3,
    hasPackages: packages.length > 0,
    hasServices: services.length > 0,
    hasTestimonials: testimonials.length > 0,
    hasFAQs: faqs.length > 0,
    hasMenu: menuCategories.length > 0,
    hasVideos: videoUrls.length > 0,
    hasEventTypes: eventTypes.length > 0,
  });

  // Build ref
  const ref = generateRef(businessName);

  // Build hero config
  const heroConfig = buildHeroConfig(businessName, category, address.city, address.state, images[0] || ogImage);

  const vendor: Partial<Vendor> = {
    ref,
    business_name: businessName,
    category,
    bio,
    contact_name: contactName,
    email,
    phone,
    website: sourceUrl,
    instagram_handle: instagram,
    city: address.city,
    state: address.state,
    service_states: address.state ? [address.state] : [],
    photo_url: ogImage || images[0] || '',
    portfolio_images: images.slice(0, 12),
    theme_preset: themeMatch[0]?.name || 'light-elegant',
    brand_color: brandColor,
    brand_color_secondary: brandColorSecondary,
    active_sections: sections,
    section_order: order,
    hero_config: heroConfig,
    pricing_packages: packages,
    services_included: services,
    event_types: eventTypes,
    testimonials,
    faqs,
    menu_categories: menuCategories,
    video_urls: videoUrls,
    page_active: true,
    account_status: 'active',
  };

  return { vendor, confidence, themeMatch, suggestedSections: sections, suggestedOrder: order, rawColors, warnings };
}

// ── EXTRACTION HELPERS ────────────────────────────────────────

function extractMeta(html: string, name: string): string {
  // og: tags
  const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${name.replace('og:', '')}["'][^>]*content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${name.replace('og:', '')}["']`, 'i'));
  if (ogMatch) return ogMatch[1];

  // name= tags
  const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["']`, 'i'));
  if (nameMatch) return nameMatch[1];

  return '';
}

function extractTag(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function cleanBusinessName(title: string): string {
  return title
    .replace(/\s*[\|–—·•]\s*.*/g, '')  // Remove "| tagline" suffixes
    .replace(/\s*-\s*(Home|About|Welcome|Official).*$/i, '')
    .replace(/^(Home|Welcome to)\s*/i, '')
    .trim()
    .slice(0, 60);
}

function detectCategory(html: string, title: string, description: string): VendorCategory {
  const text = (title + ' ' + description + ' ' + html.slice(0, 5000)).toLowerCase();

  const patterns: Array<[VendorCategory, string[]]> = [
    ['Photographer', ['photographer', 'photography', 'photo session', 'portrait', 'capture your']],
    ['Videographer', ['videograph', 'cinematograph', 'wedding film', 'video production']],
    ['Caterer', ['catering', 'caterer', 'cuisine', 'chef', 'food service']],
    ['Venue', ['venue', 'ballroom', 'estate', 'event space', 'banquet']],
    ['DJ', ['dj ', 'disc jockey', 'wedding dj', 'entertainment']],
    ['Florist', ['florist', 'floral', 'flowers', 'bouquet', 'arrangement']],
    ['Planner', ['wedding planner', 'event planner', 'coordinator', 'planning service']],
    ['Hair & Makeup', ['makeup', 'hair stylist', 'bridal beauty', 'glam', 'mua']],
    ['Photo Booth', ['photo booth', 'selfie booth', 'booth rental']],
    ['Transportation', ['limousine', 'limo', 'car service', 'transportation', 'fleet']],
    ['Bakery', ['cake', 'bakery', 'pastry', 'cupcake', 'dessert table']],
    ['Band', ['live band', 'wedding band', 'ensemble', 'live music']],
    ['Decor', ['decor', 'decoration', 'centerpiece', 'styling', 'design']],
    ['Bar Service', ['bartend', 'bar service', 'cocktail', 'mixolog']],
    ['Officiant', ['officiant', 'ceremony', 'ordained', 'minister']],
    ['Rentals', ['rental', 'tent rental', 'chair rental', 'table rental', 'linen']],
    ['Jeweler', ['jewel', 'diamond', 'engagement ring', 'wedding band', 'custom ring']],
    ['Bridal Salon', ['bridal salon', 'wedding dress', 'bridal gown', 'bridal boutique']],
  ];

  let bestCategory: VendorCategory = 'Event Planner';
  let bestScore = 0;

  for (const [cat, keywords] of patterns) {
    const score = keywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  return bestCategory;
}

function extractColors(html: string): string[] {
  const hexPattern = /#[0-9a-fA-F]{6}/g;
  const allHex = html.match(hexPattern) || [];

  // Filter out common non-brand colors
  const skipColors = new Set([
    '#ffffff', '#000000', '#333333', '#666666', '#999999', '#cccccc',
    '#eeeeee', '#f5f5f5', '#fafafa', '#111111', '#222222', '#444444',
    '#555555', '#777777', '#888888', '#aaaaaa', '#bbbbbb', '#dddddd',
    '#f0f0f0', '#e0e0e0', '#d0d0d0',
  ]);

  const colorCounts = new Map<string, number>();
  for (const hex of allHex) {
    const lower = hex.toLowerCase();
    if (skipColors.has(lower)) continue;
    colorCounts.set(lower, (colorCounts.get(lower) || 0) + 1);
  }

  // Sort by frequency
  return Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);
}

function detectDarkMode(html: string): boolean {
  const bodyMatch = html.match(/<body[^>]*style=["'][^"']*background[^"']*["']/i);
  if (bodyMatch) {
    const bgColor = bodyMatch[0].match(/#[0-9a-fA-F]{6}/);
    if (bgColor) {
      const r = parseInt(bgColor[0].slice(1, 3), 16);
      const g = parseInt(bgColor[0].slice(3, 5), 16);
      const b = parseInt(bgColor[0].slice(5, 7), 16);
      return (r + g + b) / 3 < 128;
    }
  }
  // Check for common dark mode indicators
  const darkIndicators = ['dark-mode', 'dark-theme', 'bg-dark', 'bg-black', 'theme-dark'];
  return darkIndicators.some(indicator => html.toLowerCase().includes(indicator));
}

function extractEmail(html: string): string {
  const mailto = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (mailto) return mailto[1];
  const emailPattern = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailPattern ? emailPattern[0] : '';
}

function extractPhone(html: string): string {
  const tel = html.match(/tel:([+\d().\s-]+)/i);
  if (tel) return tel[1].trim();
  const phonePattern = html.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  return phonePattern ? phonePattern[0] : '';
}

function extractInstagram(html: string): string {
  const igLink = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
  if (igLink) return igLink[1];
  const atHandle = html.match(/@([a-zA-Z0-9_.]{2,30})/);
  return atHandle ? atHandle[1] : '';
}

function extractAddress(html: string): { city: string; state: string } {
  // Try common state patterns
  const stateAbbrevs = 'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY';
  const cityState = html.match(new RegExp(`([A-Z][a-z]+(?:\\s[A-Z][a-z]+)*),?\\s*(${stateAbbrevs})\\b`));
  if (cityState) return { city: cityState[1], state: cityState[2] };
  return { city: '', state: '' };
}

function extractBio(html: string): string {
  // Look for about section content
  const aboutSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*about[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/i);
  if (aboutSection) {
    const paragraphs = aboutSection[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (paragraphs && paragraphs.length > 0) {
      return paragraphs.map(p => p.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ').slice(0, 500);
    }
  }
  return '';
}

function extractContactName(html: string, businessName: string): string {
  const meetPattern = html.match(/(?:Meet|Hi,?\s*I'?m|About)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
  if (meetPattern) return meetPattern[1];
  return '';
}

function extractImages(html: string, baseUrl: string): string[] {
  const imgPattern = /<img[^>]*src=["']([^"']+)["']/gi;
  const images: string[] = [];
  let match;
  while ((match = imgPattern.exec(html)) !== null) {
    let src = match[1];
    // Skip tiny images, icons, tracking pixels
    if (src.includes('1x1') || src.includes('pixel') || src.includes('favicon') || src.includes('.svg') || src.includes('data:image')) continue;
    // Resolve relative URLs
    if (src.startsWith('/') && !src.startsWith('//')) {
      try { src = new URL(src, baseUrl).href; } catch {}
    }
    if (src.startsWith('//')) src = 'https:' + src;
    images.push(src);
  }
  // Also check background-image
  const bgPattern = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgPattern.exec(html)) !== null) {
    let src = match[1];
    if (src.startsWith('/') && !src.startsWith('//')) {
      try { src = new URL(src, baseUrl).href; } catch {}
    }
    if (src.startsWith('//')) src = 'https:' + src;
    images.push(src);
  }
  return Array.from(new Set(images)).slice(0, 20);
}

function extractPackages(html: string): PricingPackage[] {
  const packages: PricingPackage[] = [];
  const defaultIcons = ['📋', '💍', '🎵', '👑', '🌟', '💎'];

  // Look for pricing sections
  const pricingSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:pric|package|plan)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/gi);
  if (!pricingSection) return packages;

  for (const section of pricingSection) {
    // Find individual cards
    const cards = section.match(/<(?:div|article)[^>]*(?:class)=["'][^"']*(?:card|package|plan|tier)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article)>/gi);
    if (!cards) continue;

    for (let i = 0; i < cards.length && packages.length < 6; i++) {
      const card = cards[i];
      const nameMatch = card.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
      const priceMatch = card.match(/\$[\d,]+(?:\.\d{2})?/);
      const features = [...card.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

      if (nameMatch) {
        packages.push({
          id: i + 1,
          icon: defaultIcons[i % defaultIcons.length],
          name: nameMatch[1].replace(/<[^>]+>/g, '').trim(),
          price: priceMatch ? priceMatch[0] : 'Custom',
          description: '',
          features: features.slice(0, 10),
          featured: false,
        });
      }
    }
  }

  // Mark middle package as featured
  if (packages.length >= 3) packages[1].featured = true;
  else if (packages.length > 0) packages[packages.length - 1].featured = true;

  return packages;
}

function extractServices(html: string): ServiceItem[] {
  const services: ServiceItem[] = [];
  const serviceIcons = ['✨', '🎯', '💫', '🌟', '⭐', '💎', '🎨', '🎭', '📸', '🎵'];

  const serviceSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:service|offering|what-we|specialt)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/gi);
  if (!serviceSection) return services;

  for (const section of serviceSection) {
    const items = section.match(/<(?:li|h[3-5]|dt)[^>]*>([\s\S]*?)<\/(?:li|h[3-5]|dt)>/gi);
    if (!items) continue;

    for (let i = 0; i < items.length && services.length < 10; i++) {
      const text = items[i].replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 2 && text.length < 100) {
        services.push({
          icon: serviceIcons[services.length % serviceIcons.length],
          name: text,
        });
      }
    }
  }

  return services;
}

function extractTestimonials(html: string): Testimonial[] {
  const testimonials: Testimonial[] = [];

  const testimonialSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:testimonial|review|feedback)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/gi);
  if (!testimonialSection) return testimonials;

  for (const section of testimonialSection) {
    const blocks = section.match(/<(?:div|blockquote|article)[^>]*>([\s\S]*?)<\/(?:div|blockquote|article)>/gi);
    if (!blocks) continue;

    for (let i = 0; i < blocks.length && testimonials.length < 6; i++) {
      const block = blocks[i];
      const textMatch = block.match(/<(?:p|blockquote)[^>]*>([\s\S]*?)<\/(?:p|blockquote)>/i);
      const nameMatch = block.match(/(?:—|–|-)\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
      const text = textMatch ? textMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      if (text && text.length > 20) {
        testimonials.push({
          id: i + 1,
          name: nameMatch ? nameMatch[1] : 'Happy Client',
          rating: 5,
          text: text.slice(0, 300),
        });
      }
    }
  }

  return testimonials;
}

function extractFAQs(html: string): FAQItem[] {
  const faqs: FAQItem[] = [];

  const faqSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:faq|question|accordion)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/gi);
  if (!faqSection) return faqs;

  for (const section of faqSection) {
    // Look for question/answer pairs
    const questions = [...section.matchAll(/<(?:h[3-5]|dt|summary|button)[^>]*>([\s\S]*?)<\/(?:h[3-5]|dt|summary|button)>/gi)];
    const answers = [...section.matchAll(/<(?:p|dd|div)[^>]*class=["'][^"']*(?:answer|content|body)[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|dd|div)>/gi)];

    for (let i = 0; i < Math.min(questions.length, answers.length) && faqs.length < 8; i++) {
      const q = questions[i][1].replace(/<[^>]+>/g, '').trim();
      const a = answers[i][1].replace(/<[^>]+>/g, '').trim();
      if (q && a) {
        faqs.push({ id: i + 1, question: q, answer: a });
      }
    }
  }

  return faqs;
}

function extractEventTypes(html: string, category: VendorCategory): EventType[] {
  const text = html.toLowerCase();
  const eventMap: Array<[string, string, string[]]> = [
    ['💒', 'Weddings', ['wedding']],
    ['🎂', 'Birthdays', ['birthday', 'birthday party']],
    ['🏢', 'Corporate', ['corporate', 'business event']],
    ['🎓', 'Sweet 16s', ['sweet 16', 'sweet sixteen', 'quince']],
    ['🎉', 'Private Parties', ['private party', 'private event']],
    ['👶', 'Baby Showers', ['baby shower']],
    ['💍', 'Engagements', ['engagement', 'proposal']],
    ['🎓', 'Graduations', ['graduation']],
    ['🥂', 'Galas', ['gala', 'fundraiser', 'charity']],
    ['🕺', 'Proms', ['prom']],
    ['🌃', 'Night Out', ['night out', 'bachelor', 'bachelorette']],
    ['🍽️', 'Rehearsal Dinners', ['rehearsal dinner']],
    ['🎄', 'Holiday Parties', ['holiday party', 'christmas', 'new year']],
  ];

  const found: EventType[] = [];
  for (const [icon, name, keywords] of eventMap) {
    if (keywords.some(kw => text.includes(kw))) {
      found.push({ icon, name });
    }
  }

  // If nothing found, use defaults for category
  if (found.length === 0) {
    const defaults: Record<string, EventType[]> = {
      'DJ':              [{ icon: '💒', name: 'Weddings' }, { icon: '🎂', name: 'Birthdays' }, { icon: '🏢', name: 'Corporate' }, { icon: '🎓', name: 'Sweet 16s' }, { icon: '🎉', name: 'Private Parties' }],
      'Photographer':    [{ icon: '💒', name: 'Weddings' }, { icon: '👶', name: 'Maternity' }, { icon: '👨‍👩‍👧', name: 'Family' }, { icon: '🏢', name: 'Corporate' }, { icon: '💍', name: 'Engagements' }],
      'Caterer':         [{ icon: '💒', name: 'Weddings' }, { icon: '🏢', name: 'Corporate' }, { icon: '🎉', name: 'Private Events' }, { icon: '🎂', name: 'Celebrations' }],
      'default':         [{ icon: '💒', name: 'Weddings' }, { icon: '🏢', name: 'Corporate' }, { icon: '🎉', name: 'Private Events' }],
    };
    return defaults[category] || defaults['default'];
  }

  return found;
}

function extractMenuCategories(html: string): MenuCategory[] {
  // Primarily for caterers and bakeries
  const menus: MenuCategory[] = [];
  const menuSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:menu|food|cuisine)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/gi);
  if (!menuSection) return menus;

  // Simplified extraction — returns category headings
  for (const section of menuSection) {
    const headings = [...section.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi)];
    const menuIcons = ['🥗', '🥩', '🍝', '🍰', '🥂', '🍣', '🌮', '🍗'];

    for (let i = 0; i < headings.length && menus.length < 8; i++) {
      const name = headings[i][1].replace(/<[^>]+>/g, '').trim();
      if (name && name.length > 1 && name.length < 50) {
        menus.push({
          id: i + 1,
          icon: menuIcons[i % menuIcons.length],
          name,
        });
      }
    }
  }

  return menus;
}

function extractVideoUrls(html: string): string[] {
  const videos: string[] = [];
  const youtubePattern = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/gi;
  const vimeoPattern = /vimeo\.com\/(\d+)/gi;

  let match;
  while ((match = youtubePattern.exec(html)) !== null) {
    videos.push(`https://www.youtube.com/watch?v=${match[1]}`);
  }
  while ((match = vimeoPattern.exec(html)) !== null) {
    videos.push(`https://vimeo.com/${match[1]}`);
  }

  return Array.from(new Set(videos)).slice(0, 5);
}

// ── SECTION SELECTOR ──────────────────────────────────────────

interface ContentFlags {
  hasImages: boolean;
  hasPackages: boolean;
  hasServices: boolean;
  hasTestimonials: boolean;
  hasFAQs: boolean;
  hasMenu: boolean;
  hasVideos: boolean;
  hasEventTypes: boolean;
}

function selectSections(category: VendorCategory, flags: ContentFlags): { sections: SectionId[]; order: SectionId[] } {
  const order: SectionId[] = ['hero'];

  if (flags.hasImages) order.push('gallery');
  if (flags.hasVideos) order.push('video_showcase');
  if (flags.hasServices) order.push('services_list');
  if (flags.hasMenu) order.push('menu_accordion');
  if (flags.hasPackages) order.push('packages');
  if (flags.hasEventTypes) order.push('event_types');
  if (flags.hasTestimonials) order.push('testimonials');
  if (flags.hasFAQs) order.push('faq');
  order.push('contact');

  return { sections: order, order };
}

// ── UTILITIES ─────────────────────────────────────────────────

function generateRef(businessName: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}

function buildHeroConfig(businessName: string, category: VendorCategory, city: string, state: string, bgImage: string): HeroConfig {
  const location = [city, state].filter(Boolean).join(', ');
  return {
    headline: businessName,
    subheadline: `Premium ${category} Services${location ? ` · ${location}` : ''}`,
    badge: `✦ ${category}`,
    backgroundImage: bgImage,
    buttons: [
      { label: 'View Packages', href: '#packages', variant: 'primary' },
      { label: 'Get in Touch', href: '#contact', variant: 'secondary' },
    ],
    infoItems: [
      ...(location ? [{ icon: '📍', text: location }] : []),
      { icon: '⭐', text: '5.0 Rating' },
    ],
  };
}
