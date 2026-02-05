// ============================================================
// SITE ANALYZER — Extract vendor data from a website's HTML
// v2: HTML entity decoding, better name/image extraction
// ============================================================

import type { Vendor, VendorCategory, SectionId, PricingPackage, ServiceItem, EventType, Testimonial, FAQItem, MenuCategory, HeroConfig } from './types';
import { findClosestTheme, findTopThemes, THEME_LIBRARY } from './themes';

// ── HTML ENTITY DECODER ───────────────────────────────────────

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_: string, n: string) => {
      const code = parseInt(n, 10);
      return code > 31 && code < 127 ? String.fromCharCode(code) : '';
    });
}

// ── MAIN ANALYZER ─────────────────────────────────────────────

export interface AnalysisResult {
  vendor: Partial<Vendor>;
  confidence: Record<string, number>;
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

  // Business name — decode entities, clean up WordPress cruft
  const businessName = cleanBusinessName(title);
  confidence['business_name'] = businessName ? 0.9 : 0.3;

  // Category
  const category = detectCategory(html, title, description);
  confidence['category'] = category !== 'Event Planner' ? 0.8 : 0.4;

  // Colors — skip very dark grays that aren't real brand colors
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
  const bio = decodeEntities(description || extractBio(html));
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

  // Build ref from CLEAN decoded name
  const ref = generateRef(businessName);

  // Build hero config — use ogImage preferentially since extracted images may be admin assets
  const heroImage = ogImage || images.find(img => !img.includes('admin') && !img.includes('revslider')) || images[0] || '';
  const heroConfig = buildHeroConfig(businessName, category, address.city, address.state, heroImage);

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
    // NOTE: page_active and account_status removed — let Supabase defaults handle them
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

function cleanBusinessName(rawTitle: string): string {
  // Step 1: Decode HTML entities first
  let title = decodeEntities(rawTitle);

  // Step 2: Split on common separators and take the FIRST meaningful segment
  //   "LJDJs Event Design & Entertainment – LJDJs is a full..." → "LJDJs Event Design & Entertainment"
  //   "Joe's Catering | Best NYC Caterer" → "Joe's Catering"
  const separators = /\s*(?:\||–|—|·|•)\s*/;
  const parts = title.split(separators);
  title = parts[0] || title;

  // Step 3: Remove trailing "- Home", "- About", etc.
  title = title.replace(/\s*-\s*(Home|About|Welcome|Official|Contact|Services|Portfolio|Blog).*$/i, '');

  // Step 4: Remove leading "Home", "Welcome to"
  title = title.replace(/^(Home\s*[-–—|]?\s*|Welcome to\s*)/i, '');

  // Step 5: Clean up extra whitespace
  title = title.replace(/\s+/g, ' ').trim();

  return title.slice(0, 80);
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

  // Filter out common non-brand colors (whites, blacks, grays)
  const skipColors = new Set([
    '#ffffff', '#000000', '#333333', '#666666', '#999999', '#cccccc',
    '#eeeeee', '#f5f5f5', '#fafafa', '#111111', '#222222', '#444444',
    '#555555', '#777777', '#888888', '#aaaaaa', '#bbbbbb', '#dddddd',
    '#f0f0f0', '#e0e0e0', '#d0d0d0', '#313131', '#1a1a1a', '#2c2c2c',
    '#3c3c3c', '#4a4a4a', '#767676', '#808080', '#b3b3b3', '#c0c0c0',
    '#f8f8f8', '#fefefe', '#fbfbfb',
  ]);

  const colorCounts = new Map<string, number>();
  for (const hex of allHex) {
    const lower = hex.toLowerCase();
    if (skipColors.has(lower)) continue;
    // Also skip if all channels are within 20 of each other (near-gray)
    const r = parseInt(lower.slice(1, 3), 16);
    const g = parseInt(lower.slice(3, 5), 16);
    const b = parseInt(lower.slice(5, 7), 16);
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (spread < 25) continue; // skip near-grays
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
  const stateAbbrevs = 'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY';
  const cityState = html.match(new RegExp(`([A-Z][a-z]+(?:\\s[A-Z][a-z]+)*),?\\s*(${stateAbbrevs})\\b`));
  if (cityState) return { city: cityState[1], state: cityState[2] };
  return { city: '', state: '' };
}

function extractBio(html: string): string {
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
    // Skip junk images
    if (
      src.includes('1x1') || src.includes('pixel') || src.includes('favicon') ||
      src.includes('.svg') || src.includes('data:image') ||
      src.includes('logo') || src.includes('icon') || src.includes('badge') ||
      src.includes('widget') || src.includes('button') || src.includes('arrow') ||
      src.includes('spinner') || src.includes('loading') || src.includes('placeholder') ||
      src.includes('gravatar') || src.includes('avatar') || src.includes('emoji') ||
      src.includes('smilies') || src.includes('admin/assets') || src.includes('wp-includes') ||
      src.includes('revslider/admin') || src.includes('wp-content/plugins') ||
      /\.(gif|ico)$/i.test(src)
    ) continue;

    // Resolve relative URLs
    if (src.startsWith('/') && !src.startsWith('//')) {
      try { src = new URL(src, baseUrl).href; } catch { continue; }
    }
    if (src.startsWith('//')) src = 'https:' + src;

    // Must be a full URL now
    if (!src.startsWith('http')) continue;

    images.push(src);
  }

  // Also check background-image in CSS
  const bgPattern = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgPattern.exec(html)) !== null) {
    let src = match[1];
    if (src.includes('admin') || src.includes('revslider') || src.includes('wp-includes')) continue;
    if (src.startsWith('/') && !src.startsWith('//')) {
      try { src = new URL(src, baseUrl).href; } catch { continue; }
    }
    if (src.startsWith('//')) src = 'https:' + src;
    if (!src.startsWith('http')) continue;
    images.push(src);
  }

  // Also grab data-src and data-lazy (common in WordPress themes)
  const lazySrcPattern = /<img[^>]*data-(?:src|lazy|original)=["']([^"']+)["']/gi;
  while ((match = lazySrcPattern.exec(html)) !== null) {
    let src = match[1];
    if (src.includes('admin') || src.includes('revslider') || src.includes('wp-includes') || src.includes('logo') || src.includes('icon')) continue;
    if (src.startsWith('/') && !src.startsWith('//')) {
      try { src = new URL(src, baseUrl).href; } catch { continue; }
    }
    if (src.startsWith('//')) src = 'https:' + src;
    if (!src.startsWith('http')) continue;
    images.push(src);
  }

  return Array.from(new Set(images)).slice(0, 20);
}

function extractPackages(html: string): PricingPackage[] {
  const packages: PricingPackage[] = [];
  const defaultIcons = ['\uD83D\uDCCB', '\uD83D\uDC8D', '\uD83C\uDFB5', '\uD83D\uDC51', '\uD83C\uDF1F', '\uD83D\uDC8E'];

  const pricingSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:pric|package|plan)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/gi);
  if (!pricingSection) return packages;

  for (const section of pricingSection) {
    const cards = section.match(/<(?:div|article)[^>]*(?:class)=["'][^"']*(?:card|package|plan|tier)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article)>/gi);
    if (!cards) continue;

    for (let i = 0; i < cards.length && packages.length < 6; i++) {
      const card = cards[i];
      const nameMatch = card.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
      const priceMatch = card.match(/\$[\d,]+(?:\.\d{2})?/);
      const featureMatches = Array.from(card.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi));
      const features = featureMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim());

      if (nameMatch) {
        packages.push({
          id: i + 1,
          icon: defaultIcons[i % defaultIcons.length],
          name: decodeEntities(nameMatch[1].replace(/<[^>]+>/g, '').trim()),
          price: priceMatch ? priceMatch[0] : 'Custom',
          description: '',
          features: features.slice(0, 10),
          featured: false,
        });
      }
    }
  }

  if (packages.length >= 3) packages[1].featured = true;
  else if (packages.length > 0) packages[packages.length - 1].featured = true;

  return packages;
}

function extractServices(html: string): ServiceItem[] {
  const services: ServiceItem[] = [];
  const serviceIcons = ['\u2728', '\uD83C\uDFAF', '\uD83D\uDCAB', '\uD83C\uDF1F', '\u2B50', '\uD83D\uDC8E', '\uD83C\uDFA8', '\uD83C\uDFAD', '\uD83D\uDCF8', '\uD83C\uDFB5'];

  const serviceSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:service|offering|what-we|specialt)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/gi);
  if (!serviceSection) return services;

  for (const section of serviceSection) {
    const items = section.match(/<(?:li|h[3-5]|dt)[^>]*>([\s\S]*?)<\/(?:li|h[3-5]|dt)>/gi);
    if (!items) continue;

    for (let i = 0; i < items.length && services.length < 10; i++) {
      const text = decodeEntities(items[i].replace(/<[^>]+>/g, '').trim());
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
      const nameMatch = block.match(/(?:\u2014|\u2013|-)\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
      const text = textMatch ? decodeEntities(textMatch[1].replace(/<[^>]+>/g, '').trim()) : '';
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
    const questions = Array.from(section.matchAll(/<(?:h[3-5]|dt|summary|button)[^>]*>([\s\S]*?)<\/(?:h[3-5]|dt|summary|button)>/gi));
    const answers = Array.from(section.matchAll(/<(?:p|dd|div)[^>]*class=["'][^"']*(?:answer|content|body)[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|dd|div)>/gi));

    for (let i = 0; i < Math.min(questions.length, answers.length) && faqs.length < 8; i++) {
      const q = decodeEntities(questions[i][1].replace(/<[^>]+>/g, '').trim());
      const a = decodeEntities(answers[i][1].replace(/<[^>]+>/g, '').trim());
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
    ['\uD83D\uDC92', 'Weddings', ['wedding']],
    ['\uD83C\uDF82', 'Birthdays', ['birthday', 'birthday party']],
    ['\uD83C\uDFE2', 'Corporate', ['corporate', 'business event']],
    ['\uD83C\uDF93', 'Sweet 16s', ['sweet 16', 'sweet sixteen', 'quince']],
    ['\uD83C\uDF89', 'Private Parties', ['private party', 'private event']],
    ['\uD83D\uDC76', 'Baby Showers', ['baby shower']],
    ['\uD83D\uDC8D', 'Engagements', ['engagement', 'proposal']],
    ['\uD83C\uDF93', 'Graduations', ['graduation']],
    ['\uD83E\uDD42', 'Galas', ['gala', 'fundraiser', 'charity']],
    ['\uD83D\uDD7A', 'Proms', ['prom']],
    ['\uD83C\uDF03', 'Night Out', ['night out', 'bachelor', 'bachelorette']],
    ['\uD83C\uDF7D\uFE0F', 'Rehearsal Dinners', ['rehearsal dinner']],
    ['\uD83C\uDF84', 'Holiday Parties', ['holiday party', 'christmas', 'new year']],
  ];

  const found: EventType[] = [];
  for (const [icon, name, keywords] of eventMap) {
    if (keywords.some(kw => text.includes(kw))) {
      found.push({ icon, name });
    }
  }

  if (found.length === 0) {
    const defaults: Record<string, EventType[]> = {
      'DJ':              [{ icon: '\uD83D\uDC92', name: 'Weddings' }, { icon: '\uD83C\uDF82', name: 'Birthdays' }, { icon: '\uD83C\uDFE2', name: 'Corporate' }, { icon: '\uD83C\uDF93', name: 'Sweet 16s' }, { icon: '\uD83C\uDF89', name: 'Private Parties' }],
      'Photographer':    [{ icon: '\uD83D\uDC92', name: 'Weddings' }, { icon: '\uD83D\uDC76', name: 'Maternity' }, { icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', name: 'Family' }, { icon: '\uD83C\uDFE2', name: 'Corporate' }, { icon: '\uD83D\uDC8D', name: 'Engagements' }],
      'Caterer':         [{ icon: '\uD83D\uDC92', name: 'Weddings' }, { icon: '\uD83C\uDFE2', name: 'Corporate' }, { icon: '\uD83C\uDF89', name: 'Private Events' }, { icon: '\uD83C\uDF82', name: 'Celebrations' }],
      'default':         [{ icon: '\uD83D\uDC92', name: 'Weddings' }, { icon: '\uD83C\uDFE2', name: 'Corporate' }, { icon: '\uD83C\uDF89', name: 'Private Events' }],
    };
    return defaults[category] || defaults['default'];
  }

  return found;
}

function extractMenuCategories(html: string): MenuCategory[] {
  const menus: MenuCategory[] = [];
  const menuSection = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:menu|food|cuisine)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/gi);
  if (!menuSection) return menus;

  const menuIcons = ['\uD83E\uDD57', '\uD83E\uDD69', '\uD83C\uDF5D', '\uD83C\uDF70', '\uD83E\uDD42', '\uD83C\uDF63', '\uD83C\uDF2E', '\uD83C\uDF57'];

  for (const section of menuSection) {
    const headings = Array.from(section.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi));

    for (let i = 0; i < headings.length && menus.length < 8; i++) {
      const name = decodeEntities(headings[i][1].replace(/<[^>]+>/g, '').trim());
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
  const slug = decodeEntities(businessName)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}

function buildHeroConfig(businessName: string, category: VendorCategory, city: string, state: string, bgImage: string): HeroConfig {
  const name = decodeEntities(businessName);
  const location = [city, state].filter(Boolean).join(', ');
  return {
    headline: name,
    subheadline: `Premium ${category} Services${location ? ` \u00B7 ${location}` : ''}`,
    badge: `\u2726 ${category}`,
    backgroundImage: bgImage,
    buttons: [
      { label: 'View Packages', href: '#packages', variant: 'primary' },
      { label: 'Get in Touch', href: '#contact', variant: 'secondary' },
    ],
    infoItems: [
      ...(location ? [{ icon: '\uD83D\uDCCD', text: location }] : []),
      { icon: '\u2B50', text: '5.0 Rating' },
    ],
  };
}
