import type { SectionId } from '@/lib/types';

/**
 * Normalize section IDs to canonical names.
 * The AI art director sometimes outputs shorthand like "services" instead of "services_list".
 * This catches all known aliases so phantom sections don't appear.
 */
const SECTION_ALIASES: Record<string, SectionId> = {
  services: 'services_list' as SectionId,
  features: 'features_grid' as SectionId,
  gallery_grid: 'gallery' as SectionId,
  menu: 'menu_accordion' as SectionId,
  reviews: 'testimonials' as SectionId,
  faqs: 'faq' as SectionId,
  video: 'video_showcase' as SectionId,
  team: 'team_spotlight' as SectionId,
  venue: 'venue_details' as SectionId,
};

export function normalizeSectionIds(sections: SectionId[]): SectionId[] {
  const seen = new Set<SectionId>();
  const result: SectionId[] = [];
  for (const s of sections) {
    const canonical = SECTION_ALIASES[s as string] || s;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      result.push(canonical);
    }
  }
  return result;
}
