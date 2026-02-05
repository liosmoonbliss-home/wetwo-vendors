'use client';

import { useState, useCallback, useEffect } from 'react';
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

interface VendorPageProps {
  vendor: Vendor;
  theme: ThemeConfig;
  activeSections: SectionId[];
  sectionOrder: SectionId[];
  links: ReturnType<typeof import('@/lib/links').getVendorLinks>;
}

export function VendorPage({ vendor, theme, activeSections = [], sectionOrder = [], links = {} as any }: VendorPageProps) {
  const [view, setView] = useState<View>('public');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

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

  const safeActiveSections = Array.isArray(activeSections) ? activeSections : [];
  const safeSectionOrder = Array.isArray(sectionOrder) ? sectionOrder : [];

  const isActive = (section: SectionId) => safeActiveSections.includes(section);

  // Map section IDs to components
  const renderSection = (sectionId: SectionId) => {
    if (!isActive(sectionId)) return null;

    const key = sectionId;
    switch (sectionId) {
      case 'hero':
        return (
          <div key={key}>
            <HeroSection vendor={vendor} theme={theme} links={links} />
            {/* Cashback banner immediately after hero */}
            <CashbackBanner vendor={vendor} links={links} />
            {/* About section after hero if vendor has photo or long bio */}
            <AboutSection vendor={vendor} />
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
        return <EventTypesSection key={key} vendor={vendor} />;
      case 'testimonials':
        return <TestimonialsSection key={key} vendor={vendor} />;
      case 'faq':
        return <FAQSection key={key} vendor={vendor} />;
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
    const navSections = safeSectionOrder.filter(
      s => isActive(s) && !['hero', 'dashboard'].includes(s)
    );

    return (
      <>
        {/* Navigation — now using CSS classes for scroll state */}
        <nav className={`public-nav${scrolled ? ' scrolled' : ''}${theme.mode === 'dark' ? ' dark-mode' : ' light-mode'}`}>
          <a href="#hero" className="public-nav-logo">
            <span>✨</span> {vendor.business_name}
          </a>

          <ul className="public-nav-links">
            {navSections.slice(0, 5).map(s => (
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
        <main>
          {safeSectionOrder
            .filter(s => s !== 'dashboard')
            .map(sectionId => renderSection(sectionId))}
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
        onLogin={(pw) => { if (pw === vendor.page_password) setView('dashboard'); }}
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
