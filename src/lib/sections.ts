import { SectionId, VendorCategory } from './types';
export const SECTION_DEFAULTS: Record<string, SectionId[]> = {
  'Caterer': ['hero','gallery','menu_accordion','packages','event_types','contact'],
  'Venue': ['hero','gallery','venue_details','packages','event_types','faq','contact'],
  'Photographer': ['hero','gallery_masonry','packages','testimonials','contact'],
  'Videographer': ['hero','video_showcase','gallery','packages','contact'],
  'Hair & Makeup': ['hero','before_after','gallery','services_list','packages','contact'],
  'DJ': ['hero','video_showcase','gallery','packages','event_types','contact'],
  'Band': ['hero','video_showcase','gallery','packages','event_types','contact'],
  'Florist': ['hero','gallery_masonry','packages','services_list','contact'],
  'Planner': ['hero','gallery','services_list','packages','testimonials','faq','contact'],
  'Event Planner': ['hero','gallery','services_list','packages','testimonials','faq','contact'],
  'Day-of Coordinator': ['hero','gallery','services_list','packages','faq','contact'],
  'Photo Booth': ['hero','gallery','packages','features_grid','contact'],
  'Transportation': ['hero','gallery','fleet_showcase','packages','contact'],
  'Decor': ['hero','gallery_masonry','services_list','event_types','packages','contact'],
  'Bakery': ['hero','gallery_masonry','menu_accordion','packages','contact'],
  'Rentals': ['hero','gallery','inventory_grid','packages','contact'],
  'Officiant': ['hero','gallery','services_list','testimonials','faq','contact'],
  'Bar Service': ['hero','gallery','menu_accordion','packages','contact'],
};
const DEFAULT_SECTIONS: SectionId[] = ['hero','gallery','packages','services_list','contact'];
export function getDefaultSections(category: VendorCategory): SectionId[] { return SECTION_DEFAULTS[category] || DEFAULT_SECTIONS; }
