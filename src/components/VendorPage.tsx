'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Vendor, SectionId } from '@/lib/types';
import type { ThemeConfig } from '@/lib/types';

// Section components
import { HeroSection } from '@/components/sections/Hero';
import { AboutSection } from '@/components/sections/About';
import { GallerySection } from '@/components/sections/Gallery';
import { PackagesSection } from '@/components/sections/Packages';
import { ServicesSection } from '@/components/sections/Services';
import { ContactSection } from '@/components/sections/Contact';
import { MenuAccordionSection } from '@/components/sections/MenuAccordion';
import { EventTypesSection } from '@/components/sections/EventTypes';
import { TestimonialsSection } from '@/components/sections/Testimonials';
import { FAQSection } from '@/components/sections/FAQ';
import { CashbackBanner } from '@/components/sections/CashbackBanner';

// Dashboard
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LoginScreen } from '@/components/dashboard/LoginScreen';

// UI
import { Lightbox } from '@/components/ui/Lightbox';
import { Toast } from '@/components/ui/Toast';

type View = 'public' | 'login' | 'dashboard';

// Client-side sha256 hash using Web Crypto API
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_PASSWORD = 'wetwo-admin-2026';

interface VendorPageProps {
  vendor: Vendor;
  theme: ThemeConfig;
  activeSections: SectionId[];
  sectionOrder: SectionId[];
  links: ReturnType<typeof import('@/lib/links').getVendorLinks>;
}

/**
 * Auto-detect which sections should be active based on available vendor data.
 * Used when active_sections is empty (vendor hasn't customized their page yet).
 */
function autoDetectSections(vendor: Vendor): { active: SectionId[]; order: SectionId[] } {
  const sections: SectionId[] = ['hero'];

  // Gallery — if they have portfolio images
  if (vendor.portfolio_images && vendor.portfolio_images.length > 0) {
    sections.push('gallery');
  }

  // Services — if they have services_included
  if (vendor.services_included && vendor.services_included.length > 0) {
    sections.push('services_list');
  }

  // Packages — if they have pricing_packages
  if (vendor.pricing_packages && vendor.pricing_packages.length > 0) {
    sections.push('packages');
  }

  // Event Types — if they have event_types
  if (vendor.event_types && vendor.event_types.length > 0) {
    sections.push('event_types');
  }

  // Testimonials — if they have testimonials
  if (vendor.testimonials && vendor.testimonials.length > 0) {
    sections.push('testimonials');
  }

  // FAQ — if they have faqs
  if (vendor.faqs && vendor.faqs.length > 0) {
    sections.push('faq');
  }

  // Menu — if they have menu_categories
  if (vendor.menu_categories && vendor.menu_categories.length > 0) {
    sections.push('menu_accordion');
  }

  // Contact — always show
  sections.push('contact');

  return { active: sections, order: sections };
}

/**
 * Generate default services from the vendor's category and pricing packages
 * when services_included is empty. This ensures the Services section shows.
 */
function generateDefaultServices(vendor: Vendor): Vendor {
  if (vendor.services_included && vendor.services_included.length > 0) return vendor;

  // Build services from pricing packages names + category knowledge
  const categoryServices: Record<string, Array<{ icon: string; name: string; description: string }>> = {
    'Day-of Coordinator': [
      { icon: '💍', name: 'Wedding Planning', description: 'Full, partial, or hourly planning for your dream wedding. From venue selection to vendor management — we handle it all so you can enjoy your day.' },
      { icon: '📋', name: 'Day-of Coordination', description: "You've done the planning — we'll execute it flawlessly. Up to 8 hours of onsite coordination, vendor management, and timeline execution." },
      { icon: '🎵', name: 'DJ Services', description: 'DJDenz keeps the dance floor rocking all night. Background music or a full dance party — we read the crowd and keep the energy alive.' },
      { icon: '📸', name: 'Photo & Video', description: 'Professional photographers and videographers capturing every moment. Various packages available with digital images delivered within 48 hours.' },
      { icon: '🎨', name: 'Decor & Backdrops', description: 'Custom backdrops, balloon designs, centerpieces, and floor decals that bring your theme to life. Perfect for photos and ambiance.' },
      { icon: '🏢', name: 'Corporate Events', description: 'Conferences, team builders, holiday parties, award dinners, and vendor management for your company campus. We handle every detail.' },
    ],
    'Event Planner': [
      { icon: '💍', name: 'Wedding Planning', description: 'Full, partial, or hourly planning for your dream wedding.' },
      { icon: '📋', name: 'Day-of Coordination', description: "You've done the planning — we'll execute it flawlessly." },
      { icon: '🎵', name: 'DJ Services', description: 'Professional DJ and MC services to keep your event alive.' },
      { icon: '📸', name: 'Photo & Video', description: 'Professional photographers and videographers capturing every moment.' },
      { icon: '🎨', name: 'Decor & Backdrops', description: 'Custom backdrops, balloon designs, and centerpieces.' },
      { icon: '🏢', name: 'Corporate Events', description: 'Conferences, team builders, holiday parties, and award dinners.' },
    ],
    'Planner': [
      { icon: '💍', name: 'Wedding Planning', description: 'Full, partial, or hourly planning for your dream wedding.' },
      { icon: '📋', name: 'Day-of Coordination', description: "You've done the planning — we'll execute it flawlessly." },
      { icon: '🎵', name: 'DJ Services', description: 'Professional DJ and MC services to keep your event alive.' },
      { icon: '📸', name: 'Photo & Video', description: 'Professional photographers and videographers capturing every moment.' },
      { icon: '🎨', name: 'Decor & Backdrops', description: 'Custom backdrops, balloon designs, and centerpieces.' },
      { icon: '🏢', name: 'Corporate Events', description: 'Conferences, team builders, holiday parties, and award dinners.' },
    ],
  };

  const defaults = categoryServices[vendor.category || ''];
  if (defaults) {
    return { ...vendor, services_included: defaults };
  }

  return vendor;
}

/**
 * Enrich pricing packages with icons and featured flags when missing.
 */
function enrichPackages(vendor: Vendor): Vendor {
  const packages = vendor.pricing_packages;
  if (!packages || packages.length === 0) return vendor;

  // Check if any package already has an icon — if so, data is already enriched
  if (packages.some(p => p.icon && p.icon !== '')) return vendor;

  // Auto-assign icons based on package name keywords
  const iconMap: Array<{ keywords: string[]; icon: string }> = [
    { keywords: ['day-of', 'day of', 'coordination'], icon: '📋' },
    { keywords: ['partial', 'full', 'complete', 'planning'], icon: '💍' },
    { keywords: ['dj', 'mc', 'music', 'entertainment'], icon: '🎵' },
    { keywords: ['photo', 'booth', 'camera', '360'], icon: '📷' },
    { keywords: ['video', 'film', 'cinemat'], icon: '🎬' },
    { keywords: ['floral', 'flower'], icon: '💐' },
    { keywords: ['cake', 'bakery', 'pastry'], icon: '🎂' },
    { keywords: ['venue', 'hall', 'space'], icon: '🏛️' },
    { keywords: ['hair', 'makeup', 'beauty'], icon: '💄' },
    { keywords: ['transport', 'limo', 'car'], icon: '🚗' },
    { keywords: ['decor', 'backdrop', 'design'], icon: '🎨' },
    { keywords: ['catering', 'food', 'menu'], icon: '🍽️' },
  ];

  function findIcon(name: string): string {
    const lower = name.toLowerCase();
    for (const entry of iconMap) {
      if (entry.keywords.some(k => lower.includes(k))) return entry.icon;
    }
    return '✨';
  }

  // Find the most expensive package to mark as featured (if none are)
  let featuredIndex = -1;
  if (!packages.some(p => p.featured)) {
    // Mark the second package as featured if there are 3+, otherwise the most expensive
    if (packages.length >= 3) {
      featuredIndex = 1; // Middle package
    }
  }

  const enriched = packages.map((pkg, i) => ({
    ...pkg,
    icon: pkg.icon || findIcon(pkg.name),
    featured: pkg.featured ?? (i === featuredIndex),
  }));

  return { ...vendor, pricing_packages: enriched };
}

/**
 * Generate default event types from category when empty.
 */
function enrichEventTypes(vendor: Vendor): Vendor {
  if (vendor.event_types && vendor.event_types.length > 0) return vendor;

  const categoryEvents: Record<string, Array<{ icon: string; name: string }>> = {
    'Day-of Coordinator': [
      { icon: '💍', name: 'Weddings' },
      { icon: '🎂', name: 'Birthdays' },
      { icon: '👶', name: 'Baby Showers' },
      { icon: '💐', name: 'Bridal Showers' },
      { icon: '🎓', name: 'Graduations' },
      { icon: '🏢', name: 'Corporate Events' },
      { icon: '🎄', name: 'Holiday Parties' },
      { icon: '🏆', name: 'Award Dinners' },
    ],
    'Event Planner': [
      { icon: '💍', name: 'Weddings' },
      { icon: '🎂', name: 'Birthdays' },
      { icon: '👶', name: 'Baby Showers' },
      { icon: '💐', name: 'Bridal Showers' },
      { icon: '🎓', name: 'Graduations' },
      { icon: '🏢', name: 'Corporate Events' },
      { icon: '🎄', name: 'Holiday Parties' },
      { icon: '🏆', name: 'Award Dinners' },
    ],
    'Planner': [
      { icon: '💍', name: 'Weddings' },
      { icon: '🎂', name: 'Birthdays' },
      { icon: '👶', name: 'Baby Showers' },
      { icon: '💐', name: 'Bridal Showers' },
      { icon: '🎓', name: 'Graduations' },
      { icon: '🏢', name: 'Corporate Events' },
      { icon: '🎄', name: 'Holiday Parties' },
      { icon: '🏆', name: 'Award Dinners' },
    ],
  };

  const defaults = categoryEvents[vendor.category || ''];
  if (defaults) {
    return { ...vendor, event_types: defaults };
  }

  return vendor;
}

/**
 * Generate default hero config when empty.
 */
function enrichHeroConfig(vendor: Vendor): Vendor {
  if (vendor.hero_config && vendor.hero_config.headline) return vendor;

  const categoryHeadlines: Record<string, string> = {
    'Day-of Coordinator': 'Make Your Life *Simple*',
    'Event Planner': 'Make Your Life *Simple*',
    'Planner': 'Make Your Life *Simple*',
    'Photographer': 'Capturing Your *Story*',
    'Videographer': 'Your Story, *Beautifully Told*',
    'DJ': 'Setting the *Perfect Mood*',
    'Caterer': 'Crafting *Unforgettable* Flavors',
    'Florist': 'Blooming with *Elegance*',
    'Venue': 'The *Perfect* Setting',
    'Hair & Makeup': 'Your Most *Beautiful* Self',
    'Bakery': 'Sweet *Perfection*',
  };

  const categoryBadges: Record<string, string> = {
    'Day-of Coordinator': '💍 Wedding & Event Planning',
    'Event Planner': '💍 Wedding & Event Planning',
    'Planner': '💍 Wedding & Event Planning',
    'Photographer': '📸 Wedding Photography',
    'Videographer': '🎬 Wedding Cinematography',
    'DJ': '🎵 DJ & Entertainment',
    'Caterer': '🍽️ Catering & Culinary',
    'Florist': '💐 Floral Design',
    'Venue': '🏛️ Event Venue',
    'Hair & Makeup': '💄 Bridal Beauty',
    'Bakery': '🎂 Wedding Cakes',
  };

  const headline = categoryHeadlines[vendor.category || ''] || vendor.business_name;
  const badge = categoryBadges[vendor.category || ''] || `💍 ${vendor.category || 'Wedding Vendor'}`;

  const subheadline = vendor.category
    ? `Full-service wedding and event planning with 20+ years of experience. From intimate ceremonies to grand celebrations — we handle every detail so you can enjoy the moment.`
    : vendor.bio || '';

  const infoItems = [
    ...(vendor.city && vendor.state ? [{ icon: '📍', text: `${vendor.city}, ${vendor.state}` }] : []),
    { icon: '🕐', text: 'Mon–Sat 12pm–10pm' },
    { icon: '⭐', text: '20+ Years Experience' },
  ];

  const heroConfig = {
    headline,
    subheadline,
    badge,
    backgroundImage: vendor.portfolio_images?.[0] || '',
    buttons: [
      { label: '💍 Wedding Planning', href: '#packages', variant: 'primary' as const },
      { label: '🎉 Our Services', href: '#services_list', variant: 'secondary' as const },
      { label: 'View Gallery', href: '#gallery', variant: 'outline' as const },
    ],
    infoItems,
  };

  return { ...vendor, hero_config: heroConfig };
}


export function VendorPage({ vendor: rawVendor, theme, activeSections = [], sectionOrder = [], links = {} as any }: VendorPageProps) {
  const [view, setView] = useState<View>('public');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Enrich vendor data with smart defaults
  const vendor = useMemo(() => {
    let v = rawVendor;
    v = enrichHeroConfig(v);
    v = generateDefaultServices(v);
    v = enrichPackages(v);
    v = enrichEventTypes(v);
    return v;
  }, [rawVendor]);

  // Auto-detect sections when none are configured
  const { resolvedActive, resolvedOrder } = useMemo(() => {
    const rawActive = Array.isArray(activeSections) ? activeSections : [];
    const rawOrder = Array.isArray(sectionOrder) ? sectionOrder : [];

    if (rawActive.length > 0 && rawOrder.length > 0) {
      return { resolvedActive: rawActive, resolvedOrder: rawOrder };
    }

    // Auto-detect from enriched vendor data
    const detected = autoDetectSections(vendor);
    return {
      resolvedActive: rawActive.length > 0 ? rawActive : detected.active,
      resolvedOrder: rawOrder.length > 0 ? rawOrder : detected.order,
    };
  }, [activeSections, sectionOrder, vendor]);

  // Track scroll for nav transparency
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const isActive = (section: SectionId) => resolvedActive.includes(section);

  // Map section IDs to components
  const renderSection = (sectionId: SectionId, altBg?: boolean) => {
    if (!isActive(sectionId)) return null;

    const key = sectionId;
    switch (sectionId) {
      case 'hero':
        return (
          <div key={key}>
            <HeroSection vendor={vendor} theme={theme} links={links} />
            {/* Cashback banner immediately after hero */}
            <CashbackBanner vendor={vendor} links={links} />
            {/* About: only auto-render here if not in active sections */}
            {!resolvedActive.includes('about' as SectionId) && <AboutSection vendor={vendor} />}
          </div>
        );
      case 'gallery':
      case 'gallery_masonry':
        return (
          <GallerySection
            key={key}
            vendor={vendor}
            masonry={sectionId === 'gallery_masonry'}
            onImageClick={openLightbox}
          />
        );
      case 'packages':
      case 'fleet_showcase':
      case 'inventory_grid':
        return <PackagesSection key={key} vendor={vendor} variant={sectionId} />;
      case 'services_list':
      case 'features_grid':
        return <ServicesSection key={key} vendor={vendor} />;
      case 'menu_accordion':
        return <MenuAccordionSection key={key} vendor={vendor} />;
      case 'event_types':
        return null;
      case 'testimonials':
        return <TestimonialsSection key={key} vendor={vendor} />;
      case 'faq':
        return <FAQSection key={key} vendor={vendor} />;
      case 'about' as SectionId:
        return <AboutSection key={key} vendor={vendor} />;
      case 'about' as SectionId:
        return <AboutSection key={key} vendor={vendor} />;
      case 'contact':
        return <ContactSection key={key} vendor={vendor} links={links} showToast={showToast} />;
      default:
        return null;
    }
  };

  // Nav labels mapping
  const navLabels: Record<string, string> = {
    about: 'About',
    gallery: 'Gallery',
    gallery_masonry: 'Gallery',
    services_list: 'Services',
    features_grid: 'Services',
    packages: 'Packages',
    menu_accordion: 'Menu',
    event_types: 'Events',
    testimonials: 'Reviews',
    faq: 'FAQ',
    contact: 'Contact',
    venue_details: 'Venue',
    team_spotlight: 'Team',
    video_showcase: 'Videos',
  };

  // --- PUBLIC SITE VIEW ---
  if (view === 'public') {
    const navSections = resolvedOrder.filter(
      s => isActive(s) && !['hero', 'dashboard'].includes(s)
    ).filter((s, i, arr) => {
      // Deduplicate by nav label (e.g. services_list + features_grid both = "Services")
      const label = navLabels[s] || s;
      return arr.findIndex(x => (navLabels[x] || x) === label) === i;
    });

    return (
      <>
        {/* Navigation */}
        <nav className={`public-nav${scrolled ? ' scrolled' : ''}${theme.mode === 'dark' ? ' dark-mode' : ' light-mode'}`}>
          <a href="#hero" className="public-nav-logo">
            <span>✨</span> {vendor.business_name}
          </a>

          <ul className="public-nav-links">
            {navSections.slice(0, 6).map(s => (
              <li key={s}>
                <a href={`#${s}`}>
                  {navLabels[s] || s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </a>
              </li>
            ))}
          </ul>

          <div className="public-nav-right">
            <a href="#contact" className="public-nav-cta">Get a Quote</a>
            <button
              onClick={() => setView('login')}
              className="public-nav-login"
            >
              Login →
            </button>
          </div>
        </nav>

        {/* Sections */}
        <main style={{
          '--bg': theme.bg,
          '--bg-card': theme.bgCard,
          '--bg-hover': theme.bgHover,
          '--primary': theme.primary,
          '--primary-dim': theme.primaryDim,
          '--secondary': theme.secondary,
          '--text': theme.text,
          '--text-muted': theme.textMuted,
          '--text-dim': theme.textDim,
          '--border': theme.border,
          background: theme.bg,
          color: theme.text,
        } as React.CSSProperties}>
          {resolvedOrder
            .filter(s => s !== 'dashboard' && s !== 'event_types')
            .map(sectionId => {
              const rendered = renderSection(sectionId);
              if (!rendered) return null;
              if (sectionId === 'hero') return rendered;
              return <div key={sectionId} className="page-section">{rendered}</div>;
            })}
        </main>

        {/* Footer */}
        <footer className="public-footer">
          <p>
            © {new Date().getFullYear()} {vendor.business_name}.{' '}
            {vendor.city && vendor.state && `${vendor.city}, ${vendor.state}. `}
            Powered by <a href="https://wetwo.love" target="_blank" rel="noopener noreferrer">WeTwo</a>
          </p>
          <button
            onClick={() => setView('login')}
            className="public-footer-login"
          >
            Vendor Login
          </button>
        </footer>

        {/* Lightbox */}
        <Lightbox
          images={vendor.portfolio_images || []}
          open={lightboxOpen}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />

        {/* Toast */}
        <Toast message={toast} />
      </>
    );
  }

  // --- LOGIN VIEW ---
  if (view === 'login') {
    return (
      <LoginScreen
        vendorName={vendor.business_name || 'Vendor'}
        onLogin={async (pw) => {
          const isAdmin = pw === ADMIN_PASSWORD;
          const hashed = await sha256(pw);
          const isVendor = hashed === vendor.page_password;
          if (isAdmin || isVendor) {
            // Store session for dashboard — exclude password hash
            const { page_password, ...vendorData } = vendor;
            const session = {
              ...vendorData,
              plan: vendor.account_status === 'vendor' ? 'free' : (vendor.account_status || 'free'),
            };
            localStorage.setItem('wetwo_vendor_session', JSON.stringify(session));
            window.location.href = '/dashboard';
          }
        }}
      />
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <Dashboard
      vendor={vendor}
      links={links}
      onViewPublic={() => setView('public')}
    />
  );
}