'use client';
import { useState } from 'react';
import type { Vendor, SectionId } from '@/lib/types';
import type { ThemeConfig } from '@/lib/themes';
import { HeroSection } from './sections/Hero';
import { GallerySection } from './sections/Gallery';
import { PackagesSection } from './sections/Packages';
import { ServicesSection } from './sections/Services';
import { ContactSection } from './sections/Contact';
import { MenuAccordionSection } from './sections/MenuAccordion';
import { EventTypesSection } from './sections/EventTypes';
import { TestimonialsSection } from './sections/Testimonials';
import { FAQSection } from './sections/FAQ';
import { CashbackBanner } from './sections/CashbackBanner';
import { Lightbox } from './ui/Lightbox';
import { LoginScreen } from './dashboard/LoginScreen';
import { Dashboard } from './dashboard/Dashboard';
import { verifyVendorPassword } from '@/lib/vendors';
interface Props { vendor: Vendor; theme: ThemeConfig; activeSections: SectionId[]; sectionOrder: SectionId[]; links: Record<string, string | null>; }
export function VendorPage({ vendor, theme, activeSections, sectionOrder, links }: Props) {
  const [view, setView] = useState<'public'|'login'|'dashboard'>('public');
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const images = vendor.portfolio_images || [];
  function openLightbox(i: number) { setLbIndex(i); setLbOpen(true); }
  async function handleLogin(pw: string) { const ok = await verifyVendorPassword(vendor.id, pw); if (ok) setView('dashboard'); }
  if (view === 'login') return <LoginScreen vendorName={vendor.business_name} onLogin={handleLogin} />;
  if (view === 'dashboard') return <Dashboard vendor={vendor} links={links} onViewPublic={() => setView('public')} />;
  function renderSection(id: SectionId) {
    switch (id) {
      case 'hero': return <HeroSection key={id} vendor={vendor} theme={theme} links={links as { affiliateLink: string }} />;
      case 'gallery': case 'gallery_masonry': return <GallerySection key={id} vendor={vendor} masonry={id==='gallery_masonry'} onImageClick={openLightbox} />;
      case 'packages': return <PackagesSection key={id} vendor={vendor} />;
      case 'services_list': return <ServicesSection key={id} vendor={vendor} />;
      case 'menu_accordion': return <MenuAccordionSection key={id} vendor={vendor} />;
      case 'event_types': return <EventTypesSection key={id} vendor={vendor} />;
      case 'testimonials': return <TestimonialsSection key={id} vendor={vendor} />;
      case 'faq': return <FAQSection key={id} vendor={vendor} />;
      case 'contact': return <ContactSection key={id} vendor={vendor} />;
      default: return null;
    }
  }
  return (<>
    {sectionOrder.filter(s => activeSections.includes(s)).map(renderSection)}
    <CashbackBanner affiliateLink={links.affiliateLink || '#'} />
    <footer style={{padding:'40px',textAlign:'center',borderTop:'1px solid var(--border)'}}>
      <p style={{color:'var(--text-dim)',fontSize:'13px',marginBottom:'12px'}}>Powered by <a href="https://wetwo.love" style={{color:'var(--primary)'}}>WeTwo</a></p>
      <button onClick={()=>setView('login')} style={{background:'none',border:'none',color:'var(--text-dim)',fontSize:'12px',cursor:'pointer',textDecoration:'underline'}}>Vendor Login</button>
    </footer>
    <Lightbox images={images} open={lbOpen} index={lbIndex} onClose={()=>setLbOpen(false)} onNavigate={setLbIndex} />
  </>);
}
