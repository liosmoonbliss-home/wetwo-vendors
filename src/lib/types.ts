export type ThemePreset = string; // Accepts any theme name from THEME_LIBRARY (100+ themes)

export type ThemeMode = 'dark' | 'light';

export interface ThemeConfig {
  bg: string;
  bgCard: string;
  bgHover: string;
  primary: string;
  primaryDim: string;
  secondary: string;
  text: string;
  textMuted: string;
  textDim: string;
  border: string;
  mode: ThemeMode;
}

export type SectionId =
  | 'hero' | 'gallery' | 'gallery_masonry' | 'packages'
  | 'menu_accordion' | 'services_list' | 'event_types'
  | 'testimonials' | 'video_showcase' | 'before_after'
  | 'faq' | 'team_spotlight' | 'venue_details'
  | 'fleet_showcase' | 'features_grid' | 'inventory_grid'
  | 'designers_list' | 'instagram_feed' | 'contact' | 'dashboard';

export type VendorCategory =
  | 'Caterer' | 'Venue' | 'Photographer' | 'Videographer'
  | 'Hair & Makeup' | 'DJ' | 'Band' | 'Florist'
  | 'Planner' | 'Day-of Coordinator' | 'Photo Booth'
  | 'Transportation' | 'Decor' | 'Bakery' | 'Rentals'
  | 'Officiant' | 'Jeweler' | 'Bridal Salon'
  | 'Bar Service' | 'Event Planner' | string;

export interface PricingPackage {
  id: number;
  icon: string;
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  featured?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  date?: string;
  rating: number;
  text: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface EventType {
  icon: string;
  name: string;
}

export interface ServiceItem {
  icon: string;
  name: string;
  description?: string;
}

export interface MenuCategory {
  id: number;
  icon: string;
  name: string;
  subtitle?: string;
  items?: MenuItem[];
  imageUrl?: string;
}

export interface MenuItem {
  name: string;
  description?: string;
  price?: string;
}

export interface VenueInfo {
  capacity?: string;
  sqft?: string;
  amenities?: string[];
}

export interface HeroConfig {
  headline: string;
  subheadline?: string;
  badge?: string;
  backgroundImage?: string;
  buttons?: HeroButton[];
  infoItems?: HeroInfoItem[];
  // Freestyle hero fields (set by Claude creative engine)
  heroStyle?: string;
  accentWord?: string;
  heroTypography?: string;
  heroMood?: string;
  about_photo?: string;
  about_title?: string;
}

export interface HeroButton {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
}

export interface HeroInfoItem {
  icon: string;
  text: string;
}

export interface Vendor {
  id: string;
  ref: string;
  business_name: string;
  category: VendorCategory;
  bio?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  instagram_handle?: string;
  city?: string;
  state?: string;
  service_states?: string[];
  portfolio_images?: string[];
  photo_url?: string;
  pricing_packages?: PricingPackage[];
  goaffpro_referral_code?: string;
  affiliate_link?: string;
  goaffpro_affiliate_id?: string;
  page_password?: string;
  page_active?: boolean;
  account_status?: string;
  theme_preset?: ThemePreset;
  brand_color?: string;
  brand_color_secondary?: string;
  active_sections?: SectionId[];
  section_order?: SectionId[];
  hero_config?: HeroConfig;
  services_included?: ServiceItem[];
  event_types?: EventType[];
  testimonials?: Testimonial[];
  video_urls?: string[];
  faqs?: FAQItem[];
  team_members?: TeamMember[];
  venue_info?: VenueInfo;
  trust_badges?: Array<{ icon: string; text: string }>;
  menu_categories?: MenuCategory[];
  created_at?: string;
  updated_at?: string;
  // Tier & pool (v4.0+)
  boost_tier?: 'free' | 'pro' | 'elite';
  current_pool?: string;
  trial_start?: string;
  // Branding
  white_label_name?: string;
  white_label_tagline?: string;
  subdomain_slug?: string;
  has_branded_store?: boolean;
  show_powered_by_footer?: boolean;
  has_brand_colors?: boolean;
  // Referral & tracking
  referral_slug?: string;
  referral_count?: number;
  subscription_active?: boolean;
}

export interface Lead {
  id?: string;
  vendor_id?: string;
  vendor_ref?: string;
  vendor_name?: string;
  name: string;
  email: string;
  phone?: string;
  event_date?: string;
  interest?: string;
  message?: string;
  source?: string;
  status?: string;
  created_at?: string;
}

export interface Shopper {
  id?: string;
  vendor_id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  created_at?: string;
}

export interface Couple {
  id?: string;
  vendor_id: string;
  name: string;
  email?: string;
  partner_name?: string;
  wedding_date?: string;
  created_at?: string;
}
