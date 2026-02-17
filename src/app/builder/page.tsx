'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Vendor, SectionId } from '@/lib/types';
import OnboardUrl from '@/components/builder/OnboardUrl';
import BuilderChat from '@/components/builder/BuilderChat';
import { mapOnboardToVendor } from '@/lib/mapOnboardToVendor';
import { THEME_LIBRARY } from '@/lib/themes';
import { normalizeSectionIds } from '@/lib/normalizeSections';

// ── TYPES ─────────────────────────────────────────────────────

type Step = 'input' | 'analyzing' | 'editor' | 'creating' | 'done';
type Tab = 'images' | 'info' | 'sections' | 'theme' | 'ai';

interface AnalysisResult {
  vendor: Partial<Vendor>;
  confidence: Record<string, number>;
  themeMatch: { name: string; distance: number }[];
  suggestedSections: SectionId[];
  suggestedOrder: SectionId[];
  rawColors: string[];
  warnings: string[];
}

interface ImageSelection {
  url: string;
  isHero: boolean;
  inGallery: boolean;
}

// ── ALL SECTION DEFINITIONS ───────────────────────────────────

const ALL_SECTIONS: { id: SectionId; label: string; icon: string; description: string }[] = [
  { id: 'hero', label: 'Hero', icon: '🏠', description: 'Full-width hero banner with headline and CTA buttons' },
  { id: 'about' as SectionId, label: 'About / Meet', icon: '👋', description: 'Photo, bio, and role title' },
  { id: 'gallery', label: 'Gallery', icon: '🖼️', description: 'Portfolio image grid showcasing work' },
  { id: 'packages', label: 'Packages', icon: '💰', description: 'Pricing cards with features and booking' },
  { id: 'services_list', label: 'Services', icon: '✨', description: 'List of services offered' },
  { id: 'testimonials', label: 'Testimonials', icon: '⭐', description: 'Client reviews and ratings' },
  { id: 'faq', label: 'FAQ', icon: '❓', description: 'Frequently asked questions accordion' },
  { id: 'menu_accordion', label: 'Menu', icon: '🍽️', description: 'Food/drink menu categories' },
  { id: 'video_showcase', label: 'Video', icon: '🎬', description: 'Video reel or showcase' },
  { id: 'team_spotlight', label: 'Team', icon: '👥', description: 'Team member spotlights' },
  { id: 'venue_details', label: 'Venue', icon: '🏛️', description: 'Venue capacity and amenities' },
  { id: 'contact', label: 'Contact', icon: '📬', description: 'Contact form and info' },
];

// ── STYLES ────────────────────────────────────────────────────

const S = {
  root: { display: 'flex', flexDirection: 'column' as const, height: '100vh', background: '#0a0a15', color: '#f0ece6', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #1e1e30', flexShrink: 0 },
  brand: { fontSize: '1.25rem', fontWeight: 700, color: '#c9a050' },
  headerSub: { fontSize: '0.8rem', color: '#6b6058' },
  splitWrap: { display: 'flex', flex: 1, overflow: 'hidden' },
  // Left editor panel
  leftPanel: { width: '420px', minWidth: '420px', display: 'flex', flexDirection: 'column' as const, borderRight: '1px solid #1e1e30', overflow: 'hidden' },
  tabBar: { display: 'flex', borderBottom: '1px solid #1e1e30', flexShrink: 0 },
  tabBtn: (active: boolean) => ({
    flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.75rem', fontWeight: active ? 600 : 400,
    background: active ? '#141420' : 'transparent', color: active ? '#c9a050' : '#6b6058',
    border: 'none', borderBottom: active ? '2px solid #c9a050' : '2px solid transparent',
    cursor: 'pointer', textAlign: 'center' as const, transition: 'all 0.15s',
  }),
  tabContent: { flex: 1, overflow: 'auto', padding: '1rem' },
  // Right preview panel
  rightPanel: { flex: 1, display: 'flex', flexDirection: 'column' as const, background: '#f8f6f2', overflow: 'hidden' },
  previewHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: '#1a1a2e', borderBottom: '1px solid #2a2a3a', flexShrink: 0 },
  previewLabel: { fontSize: '0.75rem', color: '#a09888', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  previewBody: { flex: 1, overflow: 'auto', background: '#fff' },
  // Common
  fieldLabel: { fontSize: '0.65rem', color: '#6b6058', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.25rem' },
  fieldInput: { width: '100%', padding: '0.45rem 0.6rem', background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: '6px', color: '#f0ece6', fontSize: '0.85rem', outline: 'none' },
  fieldTextarea: { width: '100%', padding: '0.45rem 0.6rem', background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: '6px', color: '#f0ece6', fontSize: '0.85rem', resize: 'vertical' as const, outline: 'none', minHeight: '60px' },
  card: { background: '#141420', borderRadius: '10px', border: '1px solid #1e1e30', padding: '0.75rem', marginBottom: '0.75rem' },
  cardTitle: { fontSize: '0.8rem', fontWeight: 600, color: '#c9a050', marginBottom: '0.5rem' },
  gold: '#c9a050',
  dim: '#6b6058',
  bg2: '#141420',
  border: '#1e1e30',
};

// ── DATA NORMALIZER ──────────────────────────────────────────
// Supabase JSONB can store arrays of strings instead of objects.
// This normalizer ensures services, menus, packages etc. are always proper objects.
function normalizeService(s: any): { icon: string; name: string; description: string } {
  if (typeof s === 'string') {
    try { const p = JSON.parse(s); if (p && typeof p === 'object') return { icon: p.icon || '✦', name: p.name || '', description: p.description || '' }; } catch {}
    return { icon: '✦', name: s, description: '' };
  }
  if (s && typeof s === 'object') return { icon: s.icon || '✦', name: s.name || '', description: s.description || '' };
  return { icon: '✦', name: String(s || ''), description: '' };
}
function normalizeMenuCat(c: any): any {
  if (typeof c === 'string') { try { return JSON.parse(c); } catch {} return { name: c, icon: '🍽️', subtitle: '', imageUrl: '', items: [] }; }
  return { id: c.id ?? Date.now(), name: c.name || c.category || '', icon: c.icon || '🍽️', subtitle: c.subtitle || c.description || '', imageUrl: c.imageUrl || '', items: c.items || [] };
}
function normalizePackage(p: any): any {
  if (typeof p === 'string') { try { return JSON.parse(p); } catch {} return { id: Date.now(), name: p, price: '', description: '', features: [], icon: '📋' }; }
  return { id: p.id ?? Date.now(), name: p.name || '', price: p.price || '', description: p.description || '', features: p.features || [], icon: p.icon || '📋' };
}
function normalizeVendorData(v: any): any {
  const out = { ...v };
  if (Array.isArray(out.services_included)) out.services_included = out.services_included.map(normalizeService);
  if (Array.isArray(out.menu_categories)) out.menu_categories = out.menu_categories.map(normalizeMenuCat);
  if (Array.isArray(out.pricing_packages)) out.pricing_packages = out.pricing_packages.map(normalizePackage);
  return out;
}

// ── MAIN COMPONENT ────────────────────────────────────────────

export default function BuilderPage() {
  const [step, setStep] = useState<Step>('input');
  const [url, setUrl] = useState('');
  const [pasteHtml, setPasteHtml] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [vendor, setVendor] = useState<Partial<Vendor>>({});
  const [error, setError] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [tab, setTab] = useState<Tab>('images');
  const [images, setImages] = useState<ImageSelection[]>([]);
  const [previewScale, setPreviewScale] = useState(0.5);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [expandedSection, setExpandedSection] = useState<SectionId | null>(null);
  const [editRef, setEditRef] = useState('');
  const [vendorRef, setVendorRef] = useState('');
  const [saveStatus, setSaveStatus] = useState<'' | 'saving' | 'saved' | 'error'>('');

  // ── Load from URL param on mount ──────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setEditRef(ref);
      setVendorRef(ref);
      loadVendor(ref);
    }
  }, []);

  // ── Load existing vendor for editing ──────────
  const loadVendor = async (ref: string) => {
    setError('');
    setStep('analyzing');
    try {
      const res = await fetch(`/api/load-vendor?ref=${encodeURIComponent(ref)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to load vendor'); setStep('input'); return; }

      const v = normalizeVendorData(data.vendor);
      setVendor(v);
      if (v.ref) {
        setVendorRef(v.ref);
        setLiveUrl(`https://wetwo-vendors.vercel.app/vendor/${v.ref}`);
      }

      // Build image selections from existing data
      const imgs: ImageSelection[] = (v.portfolio_images || []).map((u: string, i: number) => ({
        url: u, isHero: i === 0 && !v.photo_url, inGallery: true,
      }));
      if (v.photo_url) {
        const existingIdx = imgs.findIndex((im: ImageSelection) => im.url === v.photo_url);
        if (existingIdx >= 0) {
          imgs[existingIdx].isHero = true;
        } else {
          imgs.unshift({ url: v.photo_url, isHero: true, inGallery: false });
        }
        imgs.forEach((im: ImageSelection, i: number) => { if (!im.isHero || (im.isHero && im.url !== v.photo_url)) im.isHero = im.url === v.photo_url; });
      } else if (imgs.length > 0) {
        imgs[0].isHero = true;
      }
      setImages(imgs);

      // Create a minimal analysis object so theme tab works
      setAnalysis({ vendor: v, confidence: {}, themeMatch: [], suggestedSections: [], suggestedOrder: [], rawColors: [], warnings: [] });
      setTab('info');
      setStep('editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
      setStep('input');
    }
  };

  // ── Analyze ───────────────────────────────────
  const analyze = useCallback(async () => {
    setError('');
    setStep('analyzing');
    try {
      const res = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url || undefined, html: pasteHtml || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Analysis failed'); setStep('input'); return; }

      setAnalysis(data);
      setVendor(normalizeVendorData(data.vendor));

      // Build image selections — first image defaults to hero
      const imgs: ImageSelection[] = (data.vendor.portfolio_images || []).map((u: string, i: number) => ({
        url: u, isHero: i === 0, inGallery: true,
      }));
      // Also add og image / photo_url if not already in list
      if (data.vendor.photo_url && !imgs.find((im: ImageSelection) => im.url === data.vendor.photo_url)) {
        imgs.unshift({ url: data.vendor.photo_url, isHero: true, inGallery: false });
        if (imgs.length > 1) imgs[1].isHero = false;
      }
      setImages(imgs);
      setTab('images');
      setStep('editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
      setStep('input');
    }
  }, [url, pasteHtml]);

  // ── Creative AI Onboarding Handler ──────────────────────────
  const handleVendorOnboard = useCallback((claudeOutput: any) => {
    const result = mapOnboardToVendor(claudeOutput);
    
    // Populate vendor state with Claude creative output
    setVendor(prev => ({ ...prev, ...result.vendor } as Partial<Vendor>));
    
    // Build image selections from Claude suggestions
    const imgs: ImageSelection[] = result.images.map((img, i) => ({
      url: img.url, isHero: i === 0, inGallery: true,
    }));
    setImages(imgs);
    
    // Auto-apply theme
    if (result.theme) {
      console.log("Theme auto-applied:", result.theme.preset);
    }
    if (result.designNotes) {
      console.log("Creative Direction:", result.designNotes);
    }
    
    // Jump to editor
    setTab("images");
    setStep("editor");
  }, []);

  // ── Build final vendor payload ─────────────────
  const buildFinalVendor = useCallback(() => {
    const heroImg = images.find(i => i.isHero);
    const galleryImgs = images.filter(i => i.inGallery).map(i => i.url);
    return {
      ...vendor,
      photo_url: heroImg?.url || vendor.photo_url || '',
      portfolio_images: galleryImgs,
      hero_config: {
        ...(vendor.hero_config || {}),
        backgroundImage: heroImg?.url || '',
      },
      // Pass ref so API can target the exact vendor for updates
      ...(vendorRef ? { ref: vendorRef } : {}),
    };
  }, [vendor, images, vendorRef]);

  // ── Save (write to Supabase, stay in editor) ──
  const saveVendor = useCallback(async () => {
    setError('');
    setSaveStatus('saving');
    try {
      const finalVendor = buildFinalVendor();
      const res = await fetch('/api/create-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor: finalVendor }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed'); setSaveStatus('error'); return; }

      // Track the ref for future saves
      if (data.ref && !vendorRef) {
        setVendorRef(data.ref);
        // Update URL so refresh reloads this vendor
        window.history.replaceState({}, '', `/builder?ref=${data.ref}`);
      }
      setLiveUrl(data.url);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
      setSaveStatus('error');
    }
  }, [buildFinalVendor, vendorRef]);

  // ── Create/Publish (save + go to done screen) ──
  const createVendor = useCallback(async () => {
    setError('');
    setStep('creating');
    try {
      const finalVendor = buildFinalVendor();
      const res = await fetch('/api/create-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor: finalVendor }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Creation failed'); setStep('editor'); return; }

      if (data.ref) {
        setVendorRef(data.ref);
        window.history.replaceState({}, '', `/builder?ref=${data.ref}`);
      }
      setLiveUrl(data.url);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
      setStep('editor');
    }
  }, [buildFinalVendor]);

  // ── Update helpers ────────────────────────────
  const updateField = (field: string, value: unknown) => setVendor(prev => ({ ...prev, [field]: value }));

  const setHeroImage = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, isHero: i === idx })));
  };
  const toggleGallery = (idx: number) => {
    setImages(prev => prev.map((img, i) => i === idx ? { ...img, inGallery: !img.inGallery } : img));
  };
  const setAboutPhoto = (url: string) => {
    const hc = { ...(vendor.hero_config || {}), about_photo: url } as any;
    updateField('hero_config', hc);
  };

  const toggleSection = (sectionId: SectionId) => {
    const current = vendor.active_sections || [];
    const isActive = current.includes(sectionId);
    const newSections = isActive ? current.filter(s => s !== sectionId) : [...current, sectionId];
    const newOrder = isActive ? (vendor.section_order || []).filter(s => s !== sectionId) : [...(vendor.section_order || []), sectionId];
    updateField('active_sections', newSections);
    updateField('section_order', newOrder);
  };

  const moveSection = (sectionId: SectionId, direction: 'up' | 'down') => {
    const order = [...(vendor.section_order || [])];
    const idx = order.indexOf(sectionId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= order.length) return;
    [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
    updateField('section_order', order);
    updateField('active_sections', order);
  };

  // ── Content array helpers ─────────────────────
  const addPackage = () => {
    const pkgs = [...(vendor.pricing_packages || [])] as any[];
    pkgs.push({ id: Date.now(), name: '', price: '', description: '', features: [], icon: '📋' });
    updateField('pricing_packages', pkgs);
  };
  const updatePackage = (idx: number, field: string, value: unknown) => {
    const pkgs = [...(vendor.pricing_packages || [])] as any[];
    pkgs[idx] = { ...pkgs[idx], [field]: value };
    updateField('pricing_packages', pkgs);
  };
  const removePackage = (idx: number) => {
    const pkgs = [...(vendor.pricing_packages || [])] as any[];
    pkgs.splice(idx, 1);
    updateField('pricing_packages', pkgs);
  };

  const addService = () => {
    const svcs = [...(vendor.services_included || [])];
    svcs.push({ icon: '✦', name: '', description: '' } as any);
    updateField('services_included', svcs);
  };
  const updateService = (idx: number, value: string) => {
    const svcs = [...(vendor.services_included || [])].map(normalizeService);
    svcs[idx] = { ...svcs[idx], name: value };
    updateField('services_included', svcs);
  };
  const removeService = (idx: number) => {
    const svcs = [...(vendor.services_included || [])];
    svcs.splice(idx, 1);
    updateField('services_included', svcs);
  };

  const addMenuCategory = () => {
    const cats = [...(vendor.menu_categories || [])] as any[];
    cats.push({ id: Date.now(), name: '', icon: '🍽️', subtitle: '', imageUrl: '', items: [] });
    updateField('menu_categories', cats);
  };
  const updateMenuCategory = (idx: number, field: string, value: unknown) => {
    const cats = [...(vendor.menu_categories || [])] as any[];
    cats[idx] = { ...cats[idx], [field]: value };
    updateField('menu_categories', cats);
  };
  const removeMenuCategory = (idx: number) => {
    const cats = [...(vendor.menu_categories || [])] as any[];
    cats.splice(idx, 1);
    updateField('menu_categories', cats);
  };

  const addFaq = () => {
    const faqs = [...(vendor.faqs || [])] as any[];
    faqs.push({ question: '', answer: '' });
    updateField('faqs', faqs);
  };
  const updateFaq = (idx: number, field: string, value: string) => {
    const faqs = [...(vendor.faqs || [])] as any[];
    faqs[idx] = { ...faqs[idx], [field]: value };
    updateField('faqs', faqs);
  };
  const removeFaq = (idx: number) => {
    const faqs = [...(vendor.faqs || [])] as any[];
    faqs.splice(idx, 1);
    updateField('faqs', faqs);
  };

  const addTestimonial = () => {
    const test = [...(vendor.testimonials || [])] as any[];
    test.push({ name: '', text: '', rating: 5 });
    updateField('testimonials', test);
  };
  const updateTestimonial = (idx: number, field: string, value: unknown) => {
    const test = [...(vendor.testimonials || [])] as any[];
    test[idx] = { ...test[idx], [field]: value };
    updateField('testimonials', test);
  };
  const removeTestimonial = (idx: number) => {
    const test = [...(vendor.testimonials || [])] as any[];
    test.splice(idx, 1);
    updateField('testimonials', test);
  };

  // ── RENDER: INPUT STEP ────────────────────────
  if (step === 'input' || step === 'analyzing') {
    return (
      <div style={{ ...S.root, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
          <div style={{ fontSize: '0.75rem', color: S.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>WeTwo Vendor Builder</div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Build a Vendor Page
          </h1>
          <p style={{ color: '#a09888', marginBottom: '2rem', lineHeight: 1.5 }}>
            Paste any vendor website URL. We&apos;ll extract their brand, content, and images — then you curate and publish.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <input
              type="url"
              placeholder="https://vendor-website.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={step === 'analyzing'}
              onKeyDown={e => e.key === 'Enter' && (url || pasteHtml) && analyze()}
              style={{ flex: 1, padding: '0.9rem 1.1rem', fontSize: '1rem', background: S.bg2, border: `2px solid ${S.border}`, borderRadius: '10px', color: '#f0ece6', outline: 'none' }}
            />
            <button
              onClick={analyze}
              disabled={step === 'analyzing' || (!url && !pasteHtml)}
              style={{
                padding: '0.9rem 1.75rem', fontSize: '0.95rem', fontWeight: 600,
                background: step === 'analyzing' ? '#2a2a3a' : S.gold, color: '#0a0a15',
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                opacity: step === 'analyzing' || (!url && !pasteHtml) ? 0.5 : 1,
              }}
            >
              {step === 'analyzing' ? '⏳ Analyzing...' : '🔍 Analyze'}
            </button>
          </div>

          <button onClick={() => setShowPaste(!showPaste)} style={{ background: 'none', border: 'none', color: S.gold, cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0' }}>
            {showPaste ? '▾ Hide HTML paste' : '▸ Or paste HTML directly'}
          </button>
          {showPaste && (
            <textarea placeholder="Paste HTML..." value={pasteHtml} onChange={e => setPasteHtml(e.target.value)}
              style={{ width: '100%', minHeight: '150px', padding: '0.75rem', marginTop: '0.5rem', background: S.bg2, border: `1px solid ${S.border}`, borderRadius: '10px', color: '#f0ece6', fontFamily: 'monospace', fontSize: '0.75rem', resize: 'vertical' }} />
          )}

          {/* ── AI Creative Onboarding ── */}
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: `1px solid ${S.border}` }}>
            <OnboardUrl onVendorReady={handleVendorOnboard} />
          </div>
          {/* ── Edit Existing Vendor ── */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${S.border}` }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0ece6', marginBottom: '0.5rem' }}>✏️ Edit Existing Vendor</div>
            <p style={{ color: '#a09888', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              Paste a vendor page URL or ref code to reload it into the builder.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="e.g. ljdjs-event-design-e-skbr or full URL"
                value={editRef}
                onChange={e => setEditRef(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && editRef.trim()) {
                    const ref = editRef.trim().replace(/.*\/vendor\//, '').replace(/\?.*/, '');
                    loadVendor(ref);
                  }
                }}
                style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.9rem', background: S.bg2, border: `2px solid ${S.border}`, borderRadius: '10px', color: '#f0ece6', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => {
                  if (editRef.trim()) {
                    const ref = editRef.trim().replace(/.*\/vendor\//, '').replace(/\?.*/, '');
                    loadVendor(ref);
                  }
                }}
                disabled={!editRef.trim() || step === 'analyzing'}
                style={{
                  padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 600,
                  background: 'transparent', color: S.gold,
                  border: `2px solid ${S.gold}`, borderRadius: '10px', cursor: 'pointer',
                  opacity: !editRef.trim() || step === 'analyzing' ? 0.5 : 1,
                }}
              >
                {step === 'analyzing' ? '⏳ Loading...' : '📂 Load'}
              </button>
            </div>
          </div>

          {error && <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
        </div>
      </div>
    );
  }

  // ── RENDER: DONE STEP ─────────────────────────
  if (step === 'done') {
    return (
      <div style={{ ...S.root, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Vendor Page Created!</h1>
          <p style={{ color: '#a09888', marginBottom: '2rem' }}>{vendor.business_name}&apos;s page is now live.</p>
          <a href={liveUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, background: S.gold, color: '#0a0a15', borderRadius: '12px', textDecoration: 'none' }}>
            View Live Page →
          </a>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#a09888' }}>{liveUrl}</div>
          {vendorRef && <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: '#666' }}>Edit anytime: /builder?ref={vendorRef}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button onClick={() => { setStep('editor'); setTab('info'); }}
              style={{ padding: '0.6rem 1.5rem', background: S.bg2, color: S.gold, border: `1px solid ${S.gold}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              ✏️ Keep Editing
            </button>
            <button onClick={() => { setStep('input'); setUrl(''); setPasteHtml(''); setAnalysis(null); setVendor({}); setImages([]); setLiveUrl(''); setEditRef(''); setVendorRef(''); setSaveStatus(''); window.history.replaceState({}, '', '/builder'); }}
              style={{ padding: '0.6rem 1.5rem', background: S.bg2, color: '#a09888', border: `1px solid ${S.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              Build Another →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: EDITOR (split panel) ──────────────
  const heroImage = images.find(i => i.isHero)?.url || '';
  const galleryImages = images.filter(i => i.inGallery).map(i => i.url);
  const activeSections = normalizeSectionIds((vendor.active_sections || []) as SectionId[]);
  const sectionOrder = normalizeSectionIds((vendor.section_order || []) as SectionId[]);
  const theme = vendor.theme_preset ? THEME_LIBRARY[vendor.theme_preset] : null;

  return (
    <div style={S.root}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.brand}>WeTwo</div>
        <div style={S.headerSub}>Builder</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {saveStatus === 'saved' && <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>✓ Saved</span>}
          {saveStatus === 'error' && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Save failed</span>}
          {error && <span style={{ fontSize: '0.75rem', color: '#ef4444', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{error}</span>}
          <button onClick={() => { setStep('input'); setError(''); }} style={{ padding: '0.4rem 1rem', background: '#1a1a2e', color: '#a09888', border: `1px solid ${S.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            ← Back
          </button>
          <button onClick={saveVendor} disabled={saveStatus === 'saving'}
            style={{ padding: '0.4rem 1.25rem', background: '#1a1a2e', color: S.gold, border: `1px solid ${S.gold}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, opacity: saveStatus === 'saving' ? 0.5 : 1 }}>
            {saveStatus === 'saving' ? '⏳ Saving...' : '💾 Save'}
          </button>
          <button onClick={createVendor} disabled={step === 'creating'}
            style={{ padding: '0.4rem 1.25rem', background: step === 'creating' ? '#2a2a3a' : S.gold, color: '#0a0a15', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, opacity: step === 'creating' ? 0.5 : 1 }}>
            {step === 'creating' ? '⏳ Publishing...' : '🚀 Publish Page'}
          </button>
        </div>
      </header>

      {/* Split layout */}
      <div style={S.splitWrap}>
        {/* ── LEFT PANEL: Editor ── */}
        <div style={S.leftPanel}>
          <div style={S.tabBar}>
            {(['images', 'info', 'sections', 'theme', 'ai'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={S.tabBtn(tab === t)}>
                {{ images: '🖼 Images', info: '📝 Info', sections: '📋 Sections', theme: '🎨 Theme', ai: '🤖 AI' }[t]}
              </button>
            ))}
          </div>

          <div style={S.tabContent}>
            {/* ── TAB: Images ── */}
            {tab === 'images' && (
              <div>
                {/* Add image by URL */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Paste image URL to add..."
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newImageUrl.trim()) {
                        setImages(prev => [...prev, { url: newImageUrl.trim(), isHero: prev.length === 0, inGallery: true }]);
                        setNewImageUrl('');
                      }
                    }}
                    style={{ ...S.fieldInput, flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        setImages(prev => [...prev, { url: newImageUrl.trim(), isHero: prev.length === 0, inGallery: true }]);
                        setNewImageUrl('');
                      }
                    }}
                    style={{ padding: '0.4rem 0.75rem', background: S.gold, color: '#0a0a15', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    + Add
                  </button>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a09888', marginBottom: '0.75rem' }}>
                  Click ⭐ to set hero image. Click eye to include/exclude from gallery. {images.length} images found.
                </div>
                {images.length === 0 && (
                  <div style={{ ...S.card, textAlign: 'center', color: S.dim, padding: '2rem' }}>
                    No images extracted. You can manually add image URLs after creating the page.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{
                      position: 'relative', borderRadius: '8px', overflow: 'hidden',
                      border: img.isHero ? `2px solid ${S.gold}` : img.inGallery ? '2px solid rgba(201,160,80,0.3)' : '2px solid #2a2a3a',
                      opacity: img.inGallery || img.isHero ? 1 : 0.4,
                      transition: 'all 0.15s',
                    }}>
                      <div style={{ aspectRatio: '4/3', background: '#1a1a2e', overflow: 'hidden' }}>
                        <img
                          src={img.url}
                          alt={`Image ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      {/* Controls overlay */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '4px' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <button onClick={() => setHeroImage(idx)} title="Set as hero image"
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', background: img.isHero ? S.gold : 'rgba(0,0,0,0.6)', color: img.isHero ? '#0a0a15' : '#fff' }}>
                            ⭐
                          </button>
                          <button onClick={() => setAboutPhoto(img.url)} title="Set as About/Meet photo"
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', background: (vendor.hero_config as any)?.about_photo === img.url ? '#a78bfa' : 'rgba(0,0,0,0.6)', color: '#fff' }}>
                            👋
                          </button>
                        </div>
                        <button onClick={() => toggleGallery(idx)} title={img.inGallery ? 'Remove from gallery' : 'Add to gallery'}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', background: img.inGallery ? 'rgba(34,197,94,0.8)' : 'rgba(0,0,0,0.6)', color: '#fff' }}>
                          {img.inGallery ? '👁' : '✕'}
                        </button>
                      </div>
                      {img.isHero && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: S.gold, color: '#0a0a15', fontSize: '0.6rem', fontWeight: 700, textAlign: 'center', padding: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Hero Image
                        </div>
                      )}
                      {(vendor.hero_config as any)?.about_photo === img.url && !img.isHero && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#a78bfa', color: '#fff', fontSize: '0.6rem', fontWeight: 700, textAlign: 'center', padding: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          About Photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: S.dim }}>
                  ⭐ = Hero background &nbsp;|&nbsp; 👋 = About photo &nbsp;|&nbsp; 👁 = In gallery &nbsp;|&nbsp; ✕ = Excluded
                </div>
              </div>
            )}

            {/* ── TAB: Info ── */}
            {tab === 'info' && (
              <div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Business</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <Field label="Business Name" value={vendor.business_name} onChange={v => updateField('business_name', v)} span={2} />
                    <Field label="Category" value={vendor.category} onChange={v => updateField('category', v)} />
                    <Field label="Contact Name" value={vendor.contact_name} onChange={v => updateField('contact_name', v)} />
                    <Field label="Email" value={vendor.email} onChange={v => updateField('email', v)} />
                    <Field label="Phone" value={vendor.phone} onChange={v => updateField('phone', v)} />
                    <Field label="Instagram" value={vendor.instagram_handle} onChange={v => updateField('instagram_handle', v)} />
                    <Field label="Website" value={vendor.website} onChange={v => updateField('website', v)} />
                    <Field label="City" value={vendor.city} onChange={v => updateField('city', v)} />
                    <Field label="State" value={vendor.state} onChange={v => updateField('state', v)} />
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Bio</div>
                  <textarea value={vendor.bio || ''} onChange={e => updateField('bio', e.target.value)} rows={4} style={S.fieldTextarea} />
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Hero</div>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <Field label="Headline" value={((vendor.hero_config || {}) as any)?.headline} onChange={v => updateField('hero_config', { ...(vendor.hero_config || {}), headline: v })} />
                    <Field label="Subheadline" value={((vendor.hero_config || {}) as any)?.subheadline} onChange={v => updateField('hero_config', { ...(vendor.hero_config || {}), subheadline: v })} />
                    <Field label="Badge" value={((vendor.hero_config || {}) as any)?.badge} onChange={v => updateField('hero_config', { ...(vendor.hero_config || {}), badge: v })} />
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Sections ── */}
            {tab === 'sections' && (
              <div>
                <div style={{ fontSize: '0.7rem', color: '#a09888', marginBottom: '0.75rem' }}>
                  Toggle sections on/off. Click to edit content. Use ↑↓ to reorder.
                </div>
                {/* Active sections in order */}
                {sectionOrder.map((sId, idx) => {
                  const def = ALL_SECTIONS.find(s => s.id === sId);
                  if (!def) return null;
                  const isExpanded = expandedSection === sId;
                  return (
                    <div key={sId} style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                      {/* Section header row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                        onClick={() => setExpandedSection(isExpanded ? null : sId)}>
                        <span style={{ fontSize: '1.1rem' }}>{def.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0ece6' }}>{def.label}</div>
                          <div style={{ fontSize: '0.65rem', color: S.dim }}>{def.description}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
                          <button type="button" onClick={() => moveSection(sId, 'up')} disabled={idx === 0}
                            style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: '#1a1a2e', color: idx === 0 ? '#2a2a3a' : '#a09888', cursor: 'pointer', fontSize: '0.7rem' }}>▲</button>
                          <button type="button" onClick={() => moveSection(sId, 'down')} disabled={idx === sectionOrder.length - 1}
                            style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: '#1a1a2e', color: idx === sectionOrder.length - 1 ? '#2a2a3a' : '#a09888', cursor: 'pointer', fontSize: '0.7rem' }}>▼</button>
                        </div>
                        <button type="button" onClick={e => { e.stopPropagation(); toggleSection(sId); }}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                        <span style={{ fontSize: '0.7rem', color: S.dim, transition: 'transform 0.15s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                      </div>

                      {/* Expanded content editor */}
                      {isExpanded && (
                        <div style={{ padding: '0.75rem', borderTop: `1px solid ${S.border}`, background: '#0d0d1a' }}>
                          {/* ── PACKAGES EDITOR ── */}
                          {sId === 'gallery' && (
                            <div>
                              <div style={{ padding: '0.5rem', color: '#888', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.75rem' }}>
                                Photos are managed in the Images tab. Event types show as pills above the gallery.
                              </div>
                              <div style={S.fieldLabel}>Event Types (shown above photos)</div>
                              {(vendor.event_types || []).map((evt: any, ei: number) => (
                                <div key={ei} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', alignItems: 'center' }}>
                                  <input value={evt?.icon || '🎉'} onChange={e => { const evts = [...(vendor.event_types || [])]; evts[ei] = { ...evts[ei], icon: e.target.value }; updateField('event_types', evts); }} style={{ ...S.fieldInput, width: '40px', textAlign: 'center' }} />
                                  <input value={evt?.name || ''} onChange={e => { const evts = [...(vendor.event_types || [])]; evts[ei] = { ...evts[ei], name: e.target.value }; updateField('event_types', evts); }} placeholder="Event type..." style={{ ...S.fieldInput, flex: 1 }} />
                                  <button type="button" onClick={() => { const evts = [...(vendor.event_types || [])]; evts.splice(ei, 1); updateField('event_types', evts); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem', flexShrink: 0 }}>✕</button>
                                </div>
                              ))}
                              <button type="button" onClick={() => { const evts = [...(vendor.event_types || [])]; evts.push({ icon: '🎉', name: '' }); updateField('event_types', evts); }}
                                style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: `1px dashed ${S.gold}`, borderRadius: '8px', color: S.gold, cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                + Add Event Type
                              </button>
                            </div>
                          )}
                          {sId === 'packages' && (
                            <div>
                              {/* Section heading */}
                              <div style={{ background: '#141420', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.75rem', border: `1px solid ${S.border}` }}>
                                <div style={{ fontSize: '0.7rem', color: S.gold, fontWeight: 600, marginBottom: '0.4rem' }}>Section Heading</div>
                                <div style={{ display: 'grid', gap: '0.4rem' }}>
                                  <div>
                                    <div style={S.fieldLabel}>Title</div>
                                    <input value={((vendor as any).packages_heading) || 'Planning Made Simple'} onChange={e => updateField('packages_heading' as any, e.target.value)} placeholder="Our Packages" style={S.fieldInput} />
                                  </div>
                                  <div>
                                    <div style={S.fieldLabel}>Subtitle</div>
                                    <input value={((vendor as any).packages_subtitle) || ''} onChange={e => updateField('packages_subtitle' as any, e.target.value)} placeholder="Choose the level of support that's right for you." style={S.fieldInput} />
                                  </div>
                                </div>
                              </div>
                              {/* Package cards */}
                              {(vendor.pricing_packages || []).map((pkg: any, pi: number) => (
                                <div key={pi} style={{ background: '#141420', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.5rem', border: `1px solid ${S.border}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: S.gold, fontWeight: 600 }}>Package {pi + 1}</span>
                                    <button type="button" onClick={() => removePackage(pi)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}>Remove</button>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                    <div>
                                      <div style={S.fieldLabel}>Name</div>
                                      <input value={pkg.name || ''} onChange={e => updatePackage(pi, 'name', e.target.value)} placeholder="Day-of Coordination" style={S.fieldInput} />
                                    </div>
                                    <div>
                                      <div style={S.fieldLabel}>Price</div>
                                      <input value={pkg.price || ''} onChange={e => updatePackage(pi, 'price', e.target.value)} placeholder="$1,400" style={S.fieldInput} />
                                    </div>
                                  </div>
                                  <div style={{ marginBottom: '0.4rem' }}>
                                    <div style={S.fieldLabel}>Description</div>
                                    <textarea value={pkg.description || ''} onChange={e => updatePackage(pi, 'description', e.target.value)} placeholder="What's included in this package..." rows={2} style={S.fieldTextarea} />
                                  </div>
                                  <div>
                                    <div style={S.fieldLabel}>Features (one per line)</div>
                                    <textarea
                                      value={(pkg.features || []).join('\n')}
                                      onChange={e => updatePackage(pi, 'features', e.target.value.split('\n'))}
                                      placeholder="Pre-event meeting&#10;Shared Google Drive folder&#10;Up to 10 hours day-of coordination"
                                      rows={4} style={S.fieldTextarea}
                                    />
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={addPackage}
                                style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: `1px dashed ${S.gold}`, borderRadius: '8px', color: S.gold, cursor: 'pointer', fontSize: '0.8rem' }}>
                                + Add Package
                              </button>
                            </div>
                          )}

                          {/* ── SERVICES EDITOR ── */}
                          {sId === 'services_list' && (
                            <div>
                              {(vendor.services_included || []).map((svc: any, si: number) => (
                                <div key={si} style={{ background: '#141420', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.5rem', border: `1px solid ${S.border}` }}>
                                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', alignItems: 'center' }}>
                                    <input value={svc?.name || ''} onChange={e => { const svcs = [...(vendor.services_included || [])]; svcs[si] = { ...svcs[si], name: e.target.value }; updateField('services_included', svcs); }} placeholder="Service name..." style={{ ...S.fieldInput, flex: 1 }} />
                                    <button type="button" disabled={si === 0} onClick={() => { const svcs = [...(vendor.services_included || [])]; const tmp = svcs[si]; svcs[si] = svcs[si - 1]; svcs[si - 1] = tmp; updateField('services_included', svcs); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.08)', color: si === 0 ? '#444' : S.gold, cursor: si === 0 ? 'default' : 'pointer', fontSize: '0.7rem', flexShrink: 0 }}>▲</button>
                                    <button type="button" disabled={si === (vendor.services_included || []).length - 1} onClick={() => { const svcs = [...(vendor.services_included || [])]; const tmp = svcs[si]; svcs[si] = svcs[si + 1]; svcs[si + 1] = tmp; updateField('services_included', svcs); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.08)', color: si === (vendor.services_included || []).length - 1 ? '#444' : S.gold, cursor: si === (vendor.services_included || []).length - 1 ? 'default' : 'pointer', fontSize: '0.7rem', flexShrink: 0 }}>▼</button>
                                    <button type="button" onClick={() => removeService(si)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem', flexShrink: 0 }}>✕</button>
                                  </div>
                                  <textarea value={svc?.description || ''} onChange={e => { const svcs = [...(vendor.services_included || [])]; svcs[si] = { ...svcs[si], description: e.target.value }; updateField('services_included', svcs); }} placeholder="Brief description (optional)..." rows={2} style={{ ...S.fieldInput, resize: 'vertical', fontSize: '0.75rem' }} />
                                </div>
                              ))}
                              <button type="button" onClick={addService}
                                style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: `1px dashed ${S.gold}`, borderRadius: '8px', color: S.gold, cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                + Add Service
                              </button>
                            </div>
                          )}

                          {/* ── MENU EDITOR ── */}
                          {sId === 'menu_accordion' && (
                            <div>
                              {(vendor.menu_categories || []).map((cat: any, ci: number) => (
                                <div key={ci} style={{ background: '#141420', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.5rem', border: `1px solid ${S.border}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: S.gold, fontWeight: 600 }}>Menu {ci + 1}</span>
                                    <button type="button" onClick={() => removeMenuCategory(ci)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}>Remove</button>
                                  </div>
                                  <div style={{ marginBottom: '0.4rem' }}>
                                    <div style={S.fieldLabel}>Menu Name</div>
                                    <input value={cat.name || cat.category || ''} onChange={e => updateMenuCategory(ci, 'name', e.target.value)} placeholder="Cafe Menu, Catering Menu, Drinks..." style={S.fieldInput} />
                                  </div>
                                  <div style={{ marginBottom: '0.4rem' }}>
                                    <div style={S.fieldLabel}>Subtitle (optional)</div>
                                    <input value={cat.subtitle || ''} onChange={e => updateMenuCategory(ci, 'subtitle', e.target.value)} placeholder="Seasonal selections, prix fixe..." style={S.fieldInput} />
                                  </div>
                                  <div style={{ marginBottom: '0.4rem' }}>
                                    <div style={S.fieldLabel}>Menu Image URL (screenshot or photo of menu)</div>
                                    <input value={cat.imageUrl || ''} onChange={e => updateMenuCategory(ci, 'imageUrl', e.target.value)} placeholder="https://..." style={S.fieldInput} />
                                  </div>
                                  {cat.imageUrl && (
                                    <div style={{ marginTop: '0.4rem', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${S.border}`, maxHeight: '120px' }}>
                                      <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                  )}
                                  <div style={{ marginTop: '0.4rem' }}>
                                    <div style={S.fieldLabel}>Icon (emoji)</div>
                                    <input value={cat.icon || '🍽️'} onChange={e => updateMenuCategory(ci, 'icon', e.target.value)} placeholder="🍽️" style={{ ...S.fieldInput, width: '60px' }} />
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={addMenuCategory}
                                style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: `1px dashed ${S.gold}`, borderRadius: '8px', color: S.gold, cursor: 'pointer', fontSize: '0.8rem' }}>
                                + Add Menu
                              </button>
                            </div>
                          )}

                          {/* ── FAQ EDITOR ── */}
                          {sId === 'faq' && (
                            <div>
                              {(vendor.faqs || []).map((faq: any, fi: number) => (
                                <div key={fi} style={{ background: '#141420', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.5rem', border: `1px solid ${S.border}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: S.gold, fontWeight: 600 }}>FAQ {fi + 1}</span>
                                    <button type="button" onClick={() => removeFaq(fi)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}>Remove</button>
                                  </div>
                                  <div style={{ marginBottom: '0.4rem' }}>
                                    <div style={S.fieldLabel}>Question</div>
                                    <input value={faq.question || ''} onChange={e => updateFaq(fi, 'question', e.target.value)} placeholder="How far in advance should I book?" style={S.fieldInput} />
                                  </div>
                                  <div>
                                    <div style={S.fieldLabel}>Answer</div>
                                    <textarea value={faq.answer || ''} onChange={e => updateFaq(fi, 'answer', e.target.value)} placeholder="We recommend booking at least 6 months..." rows={2} style={S.fieldTextarea} />
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={addFaq}
                                style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: `1px dashed ${S.gold}`, borderRadius: '8px', color: S.gold, cursor: 'pointer', fontSize: '0.8rem' }}>
                                + Add FAQ
                              </button>
                            </div>
                          )}

                          {/* ── TESTIMONIALS EDITOR ── */}
                          {sId === 'testimonials' && (
                            <div>
                              {(vendor.testimonials || []).map((test: any, ti: number) => (
                                <div key={ti} style={{ background: '#141420', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.5rem', border: `1px solid ${S.border}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: S.gold, fontWeight: 600 }}>Review {ti + 1}</span>
                                    <button type="button" onClick={() => removeTestimonial(ti)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}>Remove</button>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                    <div>
                                      <div style={S.fieldLabel}>Client Name</div>
                                      <input value={test.name || ''} onChange={e => updateTestimonial(ti, 'name', e.target.value)} placeholder="Sarah & James" style={S.fieldInput} />
                                    </div>
                                    <div>
                                      <div style={S.fieldLabel}>Rating</div>
                                      <select value={test.rating || 5} onChange={e => updateTestimonial(ti, 'rating', Number(e.target.value))}
                                        style={{ ...S.fieldInput, width: '60px' }}>
                                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}★</option>)}
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <div style={S.fieldLabel}>Review Text</div>
                                    <textarea value={test.text || ''} onChange={e => updateTestimonial(ti, 'text', e.target.value)} placeholder="Working with this team was absolutely amazing..." rows={2} style={S.fieldTextarea} />
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={addTestimonial}
                                style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: `1px dashed ${S.gold}`, borderRadius: '8px', color: S.gold, cursor: 'pointer', fontSize: '0.8rem' }}>
                                + Add Testimonial
                              </button>
                            </div>
                          )}



                          {/* ── ABOUT / MEET EDITOR ── */}
                          {sId === ('about' as SectionId) && (
                            <div>
                              <div style={{ background: '#141420', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.5rem', border: `1px solid ${S.border}` }}>
                                <div style={{ marginBottom: '0.4rem' }}>
                                  <div style={S.fieldLabel}>Contact / Owner Name</div>
                                  <input value={vendor.contact_name || ''} onChange={e => updateField('contact_name', e.target.value)} placeholder="First Last" style={S.fieldInput} />
                                </div>
                                <div style={{ marginBottom: '0.4rem' }}>
                                  <div style={S.fieldLabel}>Role / Title (leave blank for auto from category)</div>
                                  <input value={(vendor.hero_config as any)?.about_title || ''} onChange={e => {
                                    const hc = { ...(vendor.hero_config || {}), about_title: e.target.value };
                                    updateField('hero_config', hc);
                                  }} placeholder={vendor.category ? getCategoryTitle(vendor.category) : 'Owner & Creative Director'} style={S.fieldInput} />
                                </div>
                                <div style={{ marginBottom: '0.4rem' }}>
                                  <div style={S.fieldLabel}>Photo URL (or use 👋 in Images tab)</div>
                                  <input value={(vendor.hero_config as any)?.about_photo || vendor.photo_url || ''} onChange={e => {
                                    const hc = { ...(vendor.hero_config || {}), about_photo: e.target.value };
                                    updateField('hero_config', hc);
                                  }} placeholder="https://..." style={S.fieldInput} />
                                </div>
                                {((vendor.hero_config as any)?.about_photo || vendor.photo_url) && (
                                  <div style={{ marginBottom: '0.4rem', borderRadius: '6px', overflow: 'hidden', maxHeight: '100px', maxWidth: '80px' }}>
                                    <img src={(vendor.hero_config as any)?.about_photo || vendor.photo_url} alt="" style={{ width: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  </div>
                                )}
                                <div style={{ marginBottom: '0.4rem' }}>
                                  <div style={S.fieldLabel}>Bio</div>
                                  <textarea value={vendor.bio || ''} onChange={e => updateField('bio', e.target.value)} placeholder="Tell your story..." rows={4} style={S.fieldTextarea} />
                                </div>
                                {/* Service highlight pills */}
                                <div style={{ marginTop: '0.5rem' }}>
                                  <div style={S.fieldLabel}>Highlight Pills (shown under bio)</div>
                                  {(vendor.services_included || []).slice(0, 4).map((s: any, si: number) => (
                                    <div key={si} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem', alignItems: 'center' }}>
                                      <input value={s.icon || ''} onChange={e => {
                                        const svcs = [...(vendor.services_included || [])] as any[];
                                        svcs[si] = { ...svcs[si], icon: e.target.value };
                                        updateField('services_included', svcs);
                                      }} placeholder="✨" style={{ ...S.fieldInput, width: '36px', textAlign: 'center', padding: '0.3rem' }} />
                                      <input value={s.name || ''} onChange={e => {
                                        const svcs = [...(vendor.services_included || [])] as any[];
                                        svcs[si] = { ...svcs[si], name: e.target.value };
                                        updateField('services_included', svcs);
                                      }} placeholder="Service name" style={{ ...S.fieldInput, flex: 1 }} />
                                    </div>
                                  ))}
                                  {(vendor.services_included || []).length < 4 && (
                                    <button type="button" onClick={() => {
                                      const svcs = [...(vendor.services_included || [])] as any[];
                                      svcs.push({ icon: '✨', name: '', description: '' });
                                      updateField('services_included', svcs);
                                    }} style={{ width: '100%', padding: '0.35rem', background: 'transparent', border: `1px dashed ${S.gold}`, borderRadius: '6px', color: S.gold, cursor: 'pointer', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                                      + Add Highlight
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Generic message for sections without editors */}
                          {!['packages', 'services_list', 'menu_accordion', 'faq', 'testimonials', 'event_types', 'about'].includes(sId as string) && (
                            <div style={{ fontSize: '0.75rem', color: S.dim, textAlign: 'center', padding: '0.5rem' }}>
                              This section is configured from other tabs or displays automatically.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Inactive sections */}
                {ALL_SECTIONS.filter(s => !activeSections.includes(s.id)).length > 0 && (
                  <>
                    <div style={{ fontSize: '0.65rem', color: S.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1rem', marginBottom: '0.5rem' }}>Available Sections</div>
                    {ALL_SECTIONS.filter(s => !activeSections.includes(s.id)).map(def => (
                      <div key={def.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', opacity: 0.5 }}>
                        <span style={{ fontSize: '1.1rem' }}>{def.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', color: '#a09888' }}>{def.label}</div>
                        </div>
                        <button onClick={() => toggleSection(def.id)}
                          style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', border: `1px solid ${S.border}`, background: 'transparent', color: S.gold, cursor: 'pointer', fontSize: '0.7rem' }}>+ Add</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── TAB: Theme ── */}
            {tab === 'theme' && (
              <div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Detected Brand Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: vendor.brand_color || '#ccc', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <input value={vendor.brand_color || ''} onChange={e => updateField('brand_color', e.target.value)}
                      style={{ ...S.fieldInput, width: '120px', fontFamily: 'monospace' }} />
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Theme — Top Matches</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {(analysis?.themeMatch || []).slice(0, 8).map(match => {
                      const t = THEME_LIBRARY[match.name];
                      const isSelected = vendor.theme_preset === match.name;
                      return (
                        <button key={match.name} onClick={() => updateField('theme_preset', match.name)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                            borderRadius: '8px', cursor: 'pointer', width: '100%', textAlign: 'left',
                            background: isSelected ? 'rgba(201,160,80,0.12)' : '#1a1a2e',
                            border: isSelected ? `2px solid ${S.gold}` : `1px solid ${S.border}`,
                            color: '#f0ece6', transition: 'all 0.15s',
                          }}>
                          <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                            {t && [t.bg, t.primary, t.secondary, t.bgCard].map((c, i) => (
                              <div key={i} style={{ width: '14px', height: '14px', borderRadius: '3px', background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.8rem', flex: 1 }}>{match.name}</span>
                          {isSelected && <span style={{ fontSize: '0.7rem', color: S.gold }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>All Themes</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', maxHeight: '300px', overflow: 'auto' }}>
                    {Object.entries(THEME_LIBRARY).map(([name, t]) => {
                      const isSelected = vendor.theme_preset === name;
                      return (
                        <button key={name} onClick={() => updateField('theme_preset', name)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.5rem',
                            borderRadius: '6px', cursor: 'pointer', background: isSelected ? 'rgba(201,160,80,0.12)' : 'transparent',
                            border: isSelected ? `1px solid ${S.gold}` : `1px solid transparent`,
                            color: '#f0ece6', fontSize: '0.65rem',
                          }}>
                          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: t.primary }} />
                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: t.bg }} />
                          </div>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: AI Chat ── */}
            {tab === 'ai' && (
              <div style={{ height: '100%', margin: '-1rem', display: 'flex' }}>
                <BuilderChat
                  vendor={vendor}
                  onApplyChanges={(changes) => {
                    const c = changes as any;
                    // Handle gallery_images_append separately (images are in their own state)
                    if (c.gallery_images_append && Array.isArray(c.gallery_images_append)) {
                      const newImgs = (c.gallery_images_append as string[]).map((url: string) => ({
                        url,
                        isHero: false,
                        inGallery: true,
                      }));
                      setImages(prev => [...prev, ...newImgs]);
                      delete c.gallery_images_append;
                    }
                    // Handle hero_image_url separately
                    if (c.hero_image_url && typeof c.hero_image_url === 'string') {
                      const heroUrl = c.hero_image_url as string;
                      setImages(prev => {
                        const updated = prev.map(img => ({ ...img, isHero: false }));
                        return [{ url: heroUrl, isHero: true, inGallery: false }, ...updated];
                      });
                      delete c.hero_image_url;
                    }
                    // Apply remaining changes to vendor state
                    if (Object.keys(c).length > 0) {
                      setVendor(prev => {
                        const merged = { ...prev };
                        for (const [key, value] of Object.entries(c)) {
                          if (key === 'hero_config' && typeof value === 'object' && value !== null) {
                            merged.hero_config = { ...(prev.hero_config || {}), ...value } as any;
                          } else {
                            (merged as any)[key] = value;
                          }
                        }
                        return merged;
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Preview ── */}
        <div style={S.rightPanel}>
          <div style={S.previewHeader}>
            <span style={S.previewLabel}>Preview</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#6b6058' }}>Zoom</span>
              {[0.35, 0.5, 0.75, 1].map(s => (
                <button key={s} onClick={() => setPreviewScale(s)}
                  style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: 'none', fontSize: '0.7rem', cursor: 'pointer', background: previewScale === s ? S.gold : '#2a2a3a', color: previewScale === s ? '#0a0a15' : '#a09888' }}>
                  {Math.round(s * 100)}%
                </button>
              ))}
            </div>
          </div>
          <div style={S.previewBody}>
            <PreviewPane vendor={vendor} heroImage={heroImage} galleryImages={galleryImages} theme={theme} scale={previewScale} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FIELD COMPONENT ───────────────────────────────────────────

function Field({ label, value, onChange, span }: { label: string; value?: string; onChange: (v: string) => void; span?: number }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <div style={S.fieldLabel}>{label}</div>
      <input value={value || ''} onChange={e => onChange(e.target.value)} style={S.fieldInput} />
    </div>
  );
}

// ── CATEGORY TITLE HELPER ────────────────────────────────────

function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    'Planner': 'Event Planner, Coordinator & Visionary',
    'Day-of Coordinator': 'Event Planner, Coordinator & Visionary',
    'Event Planner': 'Event Planner, Coordinator & Visionary',
    'Photographer': 'Photographer & Visual Storyteller',
    'Videographer': 'Cinematographer & Visual Artist',
    'DJ': 'DJ, MC & Entertainment Specialist',
    'Band': 'Musician & Entertainment Director',
    'Caterer': 'Chef & Culinary Artist',
    'Florist': 'Floral Designer & Botanical Artist',
    'Venue': 'Venue Director & Host',
    'Hair & Makeup': 'Beauty Artist & Stylist',
    'Photo Booth': 'Photo Experience Specialist',
    'Decor': 'Décor Designer & Stylist',
    'Bakery': 'Pastry Chef & Cake Artist',
    'Transportation': 'Luxury Transportation Specialist',
    'Rentals': 'Event Rentals & Design Specialist',
    'Officiant': 'Wedding Officiant & Ceremony Designer',
    'Jeweler': 'Fine Jewelry Artisan',
    'Bridal Salon': 'Bridal Fashion Consultant',
    'Bar Service': 'Mixologist & Bar Service Specialist',
  };
  return titles[category] || 'Owner & Creative Director';
}

// ── PREVIEW PANE ──────────────────────────────────────────────

function PreviewPane({ vendor, heroImage, galleryImages, theme, scale }: {
  vendor: Partial<Vendor>;
  heroImage: string;
  galleryImages: string[];
  theme: { bg: string; primary: string; secondary: string; text: string; textMuted: string; bgCard: string; border: string; mode: string } | null;
  scale: number;
}) {
  const bg = theme?.bg || '#faf8f5';
  const primary = theme?.primary || '#c9a050';
  const text = theme?.text || '#1a1a2e';
  const textMuted = theme?.textMuted || '#6b6058';
  const bgCard = theme?.bgCard || '#ffffff';
  const isDark = theme?.mode === 'dark';
  const heroConfig = vendor.hero_config as Record<string, unknown> | undefined;
  const sections = normalizeSectionIds((vendor.section_order || []) as SectionId[]);

  return (
    <div style={{ transformOrigin: 'top left', transform: `scale(${scale})`, width: `${100 / scale}%`, minHeight: `${100 / scale}%` }}>
      {/* Simulated vendor page */}
      <div style={{ background: bg, color: text, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: `1px solid ${theme?.border || '#e5e1dc'}` }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: primary }}>
            ✦ {vendor.business_name || 'Vendor Name'}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: textMuted }}>
            <span>Gallery</span><span>Events</span><span>Contact</span>
          </div>
          <div style={{ padding: '0.4rem 1rem', background: primary, color: isDark ? '#fff' : '#0a0a15', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            Get a Quote
          </div>
        </div>

        {/* Cashback banner renders after hero inside the sections loop */}

        {sections.map(sectionId => {
          switch (sectionId) {
            case 'hero':
              return (
                <div key="hero">
                  <div style={{
                    position: 'relative', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    backgroundImage: heroImage ? `url(${heroImage})` : undefined,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: heroImage ? undefined : (isDark ? '#1a1a2e' : '#e8e4de'),
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
                    <div style={{ position: 'relative', zIndex: 1, color: '#fff', padding: '2rem' }}>
                      <div style={{ display: 'inline-block', padding: '0.3rem 1rem', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '1rem', backdropFilter: 'blur(4px)' }}>
                        {(heroConfig?.badge as string) || `✦ ${vendor.category || 'Vendor'}`}
                      </div>
                      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.1 }}>
                        {(heroConfig?.headline as string) || vendor.business_name || 'Your Business'}
                      </h1>
                      <p style={{ fontSize: '1rem', opacity: 0.85 }}>
                        {(heroConfig?.subheadline as string) || `Premium ${vendor.category} Services`}
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <div style={{ padding: '0.6rem 1.5rem', background: primary, color: isDark ? '#fff' : '#0a0a15', borderRadius: '8px', fontWeight: 600 }}>View Packages</div>
                        <div style={{ padding: '0.6rem 1.5rem', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)' }}>Get in Touch</div>
                      </div>
                    </div>
                  </div>
                  {/* Cashback banner — always right below hero */}
                  <div style={{ background: 'linear-gradient(135deg, #00d084, #00b37a)', color: '#fff', textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem' }}>
                    ✨ Shop with us and earn cash back on everything — wedding registries, home, fashion &amp; more — Start Shopping →
                  </div>
                </div>
              );

            case 'about' as SectionId: {
              const aboutPhoto = (vendor.hero_config as any)?.about_photo || vendor.photo_url || heroImage;
              return (
                <div key="about" style={{ padding: '3rem 2rem', background: bg }}>
                  <div style={{ display: 'grid', gridTemplateColumns: aboutPhoto ? '1fr 1.5fr' : '1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto', alignItems: 'center' }}>
                    {aboutPhoto && (
                      <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', maxHeight: '300px' }}>
                        <img src={aboutPhoto} alt={vendor.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                        Meet {(vendor.contact_name || vendor.business_name || '').split(' ')[0]}
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        {(vendor as any).hero_config?.about_title || (vendor.category ? getCategoryTitle(vendor.category) : 'Owner & Creative Director')}
                      </h2>
                      {vendor.bio && vendor.bio.split('\n').map((p: string, i: number) => (
                        <p key={i} style={{ fontSize: '0.85rem', color: textMuted, lineHeight: 1.6, marginBottom: '0.5rem' }}>{p}</p>
                      ))}
                      {(vendor.services_included || []).length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.75rem' }}>
                          {(vendor.services_included || []).slice(0, 4).map((s: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem', background: bgCard, borderRadius: '6px', border: `1px solid ${theme?.border || '#e5e1dc'}`, fontSize: '0.8rem' }}>
                              <span>{s.icon || '✨'}</span> <span>{typeof s === 'string' ? s : s.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            case 'gallery':
              return (
                <div key="gallery" style={{ padding: '3rem 2rem', background: bg }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Our Work</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Events We&apos;ve Brought to Life</h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {galleryImages.slice(0, 6).map((img, i) => (
                      <div key={i} style={{ aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', background: bgCard }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    ))}
                    {galleryImages.length === 0 && (
                      <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '3rem', color: textMuted, fontSize: '0.9rem' }}>No gallery images selected</div>
                    )}
                  </div>
                </div>
              );

            case 'event_types':
              return (
                <div key="events" style={{ padding: '3rem 2rem', background: isDark ? '#111' : '#f5f2ed', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Events We Serve</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Celebrations of Every Kind</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {(vendor.event_types || []).map((et, i) => (
                      <div key={i} style={{ padding: '0.5rem 1.25rem', background: bgCard, borderRadius: '20px', fontSize: '0.9rem', border: `1px solid ${theme?.border || '#e5e1dc'}` }}>
                        {(et as { icon: string; name: string }).icon} {(et as { icon: string; name: string }).name}
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'packages':
              return (
                <div key="packages" style={{ padding: '3rem 2rem', background: bg }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Our Packages</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{(vendor as any).packages_heading || 'Our Packages'}</h2>
                    {(vendor as any).packages_subtitle && <p style={{ color: textMuted, maxWidth: '500px', margin: '0 auto' }}>{(vendor as any).packages_subtitle}</p>}
                  </div>
                  {(vendor.pricing_packages || []).length === 0 && <div style={{ textAlign: 'center', color: textMuted }}>No packages — click Packages in sections to add</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((vendor.pricing_packages || []).length, 3)}, 1fr)`, gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
                    {(vendor.pricing_packages || []).slice(0, 3).map((pkg: any, i: number) => (
                      <div key={i} style={{ background: bgCard, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${theme?.border || '#e5e1dc'}`, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{pkg.name || 'Package'}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: primary, marginBottom: '0.5rem' }}>{pkg.price || '$0'}</div>
                        {pkg.description && <p style={{ fontSize: '0.85rem', color: textMuted, marginBottom: '0.75rem', lineHeight: 1.5 }}>{pkg.description}</p>}
                        {(pkg.features || []).length > 0 && (
                          <div style={{ flex: 1, marginBottom: '1rem' }}>
                            {pkg.features.map((f: string, fi: number) => (
                              <div key={fi} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                <span style={{ color: primary, flexShrink: 0 }}>✓</span>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ padding: '0.6rem', background: primary, color: isDark ? '#fff' : '#0a0a15', borderRadius: '8px', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem', marginTop: 'auto' }}>
                          Inquire Now
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'contact':
              return (
                <div key="contact" style={{ background: isDark ? '#111' : '#f5f2ed' }}>
                  {/* Header */}
                  <div style={{ textAlign: 'center', padding: '3rem 2rem 1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Get in Touch</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>Let&apos;s Plan Something Amazing</h2>
                    <p style={{ color: textMuted }}>Ready to start planning? Reach out for a free consultation.</p>
                  </div>
                  {/* Split: Info left, Form right */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', padding: '0 3rem 3rem', maxWidth: '900px', margin: '0 auto' }}>
                    {/* Left — Let's Talk + Info */}
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>Let&apos;s Talk</h3>
                      <p style={{ color: textMuted, fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                        Whether you&apos;re planning a wedding, corporate event, or milestone celebration — we&apos;d love to hear about your vision. Reach out anytime for a free consultation.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {vendor.city && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: isDark ? '#222' : '#f0e8e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📍</div>
                            <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Location</div><div style={{ fontSize: '0.8rem', color: textMuted }}>{vendor.city}{vendor.state ? `, ${vendor.state}` : ''}</div></div>
                          </div>
                        )}
                        {vendor.phone && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: isDark ? '#222' : '#f0e8e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📞</div>
                            <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Phone</div><div style={{ fontSize: '0.8rem', color: textMuted }}>{vendor.phone}</div></div>
                          </div>
                        )}
                        {vendor.email && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: isDark ? '#222' : '#f0e8e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📧</div>
                            <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email</div><div style={{ fontSize: '0.8rem', color: textMuted }}>{vendor.email}</div></div>
                          </div>
                        )}
                        {vendor.instagram_handle && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: isDark ? '#222' : '#f0e8e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📷</div>
                            <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Instagram</div><div style={{ fontSize: '0.8rem', color: textMuted }}>@{vendor.instagram_handle}</div></div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Right — Contact Form */}
                    <div style={{ background: bgCard, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${theme?.border || '#e5e1dc'}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.25rem', color: text }}>Your Name *</div>
                          <div style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: `1px solid ${theme?.border || '#d8d4ce'}`, background: isDark ? '#1a1a2e' : '#fff', color: textMuted, fontSize: '0.85rem' }}>Full name</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.25rem', color: text }}>Email *</div>
                          <div style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: `1px solid ${theme?.border || '#d8d4ce'}`, background: isDark ? '#1a1a2e' : '#fff', color: textMuted, fontSize: '0.85rem' }}>you@example.com</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.25rem', color: text }}>Phone</div>
                          <div style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: `1px solid ${theme?.border || '#d8d4ce'}`, background: isDark ? '#1a1a2e' : '#fff', color: textMuted, fontSize: '0.85rem' }}>(862) 555-1234</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.25rem', color: text }}>Event Date</div>
                          <div style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: `1px solid ${theme?.border || '#d8d4ce'}`, background: isDark ? '#1a1a2e' : '#fff', color: textMuted, fontSize: '0.85rem' }}>mm/dd/yyyy</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.25rem', color: text }}>I&apos;m Interested In</div>
                        <div style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: `1px solid ${theme?.border || '#d8d4ce'}`, background: isDark ? '#1a1a2e' : '#fff', color: textMuted, fontSize: '0.85rem' }}>Select an option...</div>
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.25rem', color: text }}>Tell Us More</div>
                        <div style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: `1px solid ${theme?.border || '#d8d4ce'}`, background: isDark ? '#1a1a2e' : '#fff', color: textMuted, fontSize: '0.85rem', minHeight: '60px' }}>Share details about your event...</div>
                      </div>
                      <div style={{ marginTop: '1rem', padding: '0.7rem', background: primary, color: isDark ? '#fff' : '#0a0a15', borderRadius: '8px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                        Send Message ✨
                      </div>
                    </div>
                  </div>
                </div>
              );

            case 'testimonials':
              return (
                <div key="testimonials" style={{ padding: '3rem 2rem', background: bg }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Testimonials</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>What Our Clients Say</h2>
                  </div>
                  {(vendor.testimonials || []).length === 0 && <div style={{ textAlign: 'center', color: textMuted }}>No testimonials — click Testimonials in sections to add</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((vendor.testimonials || []).length, 2)}, 1fr)`, gap: '1rem', maxWidth: '700px', margin: '0 auto' }}>
                    {(vendor.testimonials || []).map((test: any, ti: number) => (
                      <div key={ti} style={{ background: bgCard, borderRadius: '12px', padding: '1.25rem', border: `1px solid ${theme?.border || '#e5e1dc'}` }}>
                        <div style={{ color: primary, marginBottom: '0.5rem' }}>{'★'.repeat(test.rating || 5)}</div>
                        <p style={{ fontSize: '0.85rem', color: text, lineHeight: 1.5, marginBottom: '0.75rem', fontStyle: 'italic' }}>&ldquo;{test.text}&rdquo;</p>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{test.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'faq':
              return (
                <div key="faq" style={{ padding: '3rem 2rem', background: isDark ? '#111' : '#f5f2ed' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Frequently Asked Questions</h2>
                  </div>
                  {(vendor.faqs || []).length === 0 && <div style={{ textAlign: 'center', color: textMuted }}>No FAQs — click FAQ in sections to add</div>}
                  <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                    {(vendor.faqs || []).map((faq: any, fi: number) => (
                      <div key={fi} style={{ borderBottom: `1px solid ${theme?.border || '#e5e1dc'}`, padding: '1rem 0' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{faq.question}</div>
                        <div style={{ fontSize: '0.85rem', color: textMuted, lineHeight: 1.5 }}>{faq.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'services_list':
              return (
                <div key="services" style={{ padding: '3rem 2rem', background: bg }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>What We Offer</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>{(vendor as any).services_heading || 'Our Services'}</h2>
                  </div>
                  {(vendor.services_included || []).length === 0 && <div style={{ textAlign: 'center', color: textMuted }}>No services — click Services in sections to add</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((vendor.services_included || []).length, 3)}, 1fr)`, gap: '0.75rem', maxWidth: '750px', margin: '0 auto' }}>
                    {(vendor.services_included || []).map((svc: any, si: number) => {
                      const icon = typeof svc === 'string' ? '✦' : svc?.icon || '✦';
                      const name = typeof svc === 'string' ? svc : svc?.name || '';
                      const desc = typeof svc === 'string' ? '' : svc?.description || '';
                      return (
                        <div key={si} style={{ background: bgCard, borderRadius: '12px', border: `1px solid ${theme?.border || '#e5e1dc'}`, padding: '1.25rem 1rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem', color: text }}>{name}</div>
                          {desc && <div style={{ fontSize: '0.75rem', color: textMuted, lineHeight: 1.5 }}>{desc}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );

            case 'menu_accordion':
              return (
                <div key="menu" style={{ padding: '3rem 2rem', background: isDark ? '#111' : '#f5f2ed' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Our Menu</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>What We Serve</h2>
                  </div>
                  {(vendor.menu_categories || []).length === 0 && <div style={{ textAlign: 'center', color: textMuted }}>No menus — click Menu in sections to add</div>}
                  <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {(vendor.menu_categories || []).map((cat: any, ci: number) => (
                      <div key={ci} style={{ marginBottom: '0.75rem', background: bgCard, borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme?.border || '#e5e1dc'}` }}>
                        <div style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                          <span>{cat.icon || '🍽️'} {cat.name || cat.category || 'Menu'}</span>
                          <span style={{ fontSize: '0.75rem', color: textMuted }}>Click to view ▾</span>
                        </div>
                        {cat.subtitle && <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.8rem', color: textMuted, fontStyle: 'italic' }}>{cat.subtitle}</div>}
                        {cat.imageUrl && (
                          <div style={{ padding: '0 0.5rem 0.5rem' }}>
                            <img src={cat.imageUrl} alt={cat.name || cat.category} style={{ width: '100%', borderRadius: '6px', display: 'block' }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );

            default:
              return (
                <div key={sectionId} style={{ padding: '2rem', textAlign: 'center', color: textMuted, borderTop: `1px solid ${theme?.border || '#e5e1dc'}` }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {ALL_SECTIONS.find(s => s.id === sectionId)?.icon} {ALL_SECTIONS.find(s => s.id === sectionId)?.label || sectionId}
                  </div>
                </div>
              );
          }
        })}
      </div>
    </div>
  );
}
