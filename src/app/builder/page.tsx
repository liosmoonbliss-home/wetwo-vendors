'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Vendor, SectionId } from '@/lib/types';
import { THEME_LIBRARY } from '@/lib/themes';

// ── TYPES ─────────────────────────────────────────────────────

type Step = 'input' | 'analyzing' | 'editor' | 'creating' | 'done';
type Tab = 'images' | 'info' | 'sections' | 'theme';

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
  { id: 'gallery', label: 'Gallery', icon: '🖼️', description: 'Portfolio image grid showcasing work' },
  { id: 'packages', label: 'Packages', icon: '💰', description: 'Pricing cards with features and booking' },
  { id: 'services_list', label: 'Services', icon: '✨', description: 'List of services offered' },
  { id: 'event_types', label: 'Events', icon: '🎉', description: 'Types of events served' },
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
      setVendor(data.vendor);

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

  // ── Create Vendor ─────────────────────────────
  const createVendor = useCallback(async () => {
    setError('');
    setStep('creating');
    try {
      // Apply image selections to vendor before saving
      const heroImg = images.find(i => i.isHero);
      const galleryImgs = images.filter(i => i.inGallery).map(i => i.url);
      const finalVendor = {
        ...vendor,
        photo_url: heroImg?.url || vendor.photo_url || '',
        portfolio_images: galleryImgs,
        hero_config: {
          ...(vendor.hero_config || {}),
          backgroundImage: heroImg?.url || '',
        },
      };

      const res = await fetch('/api/create-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor: finalVendor }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Creation failed'); setStep('editor'); return; }
      setLiveUrl(data.url);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
      setStep('editor');
    }
  }, [vendor, images]);

  // ── Update helpers ────────────────────────────
  const updateField = (field: string, value: unknown) => setVendor(prev => ({ ...prev, [field]: value }));

  const setHeroImage = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, isHero: i === idx })));
  };
  const toggleGallery = (idx: number) => {
    setImages(prev => prev.map((img, i) => i === idx ? { ...img, inGallery: !img.inGallery } : img));
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
          <button onClick={() => { setStep('input'); setUrl(''); setPasteHtml(''); setAnalysis(null); setVendor({}); setImages([]); setLiveUrl(''); }}
            style={{ marginTop: '2rem', padding: '0.6rem 1.5rem', background: S.bg2, color: S.gold, border: `1px solid ${S.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Build Another →
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: EDITOR (split panel) ──────────────
  const heroImage = images.find(i => i.isHero)?.url || '';
  const galleryImages = images.filter(i => i.inGallery).map(i => i.url);
  const activeSections = vendor.active_sections || [];
  const sectionOrder = vendor.section_order || [];
  const theme = vendor.theme_preset ? THEME_LIBRARY[vendor.theme_preset] : null;

  return (
    <div style={S.root}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.brand}>WeTwo</div>
        <div style={S.headerSub}>Builder</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {error && <span style={{ fontSize: '0.75rem', color: '#ef4444', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{error}</span>}
          <button onClick={() => { setStep('input'); setError(''); }} style={{ padding: '0.4rem 1rem', background: '#1a1a2e', color: '#a09888', border: `1px solid ${S.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            ← Back
          </button>
          <button onClick={createVendor} disabled={step === 'creating'}
            style={{ padding: '0.4rem 1.25rem', background: step === 'creating' ? '#2a2a3a' : S.gold, color: '#0a0a15', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, opacity: step === 'creating' ? 0.5 : 1 }}>
            {step === 'creating' ? '⏳ Creating...' : '🚀 Create Vendor Page'}
          </button>
        </div>
      </header>

      {/* Split layout */}
      <div style={S.splitWrap}>
        {/* ── LEFT PANEL: Editor ── */}
        <div style={S.leftPanel}>
          <div style={S.tabBar}>
            {(['images', 'info', 'sections', 'theme'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={S.tabBtn(tab === t)}>
                {{ images: '🖼 Images', info: '📝 Info', sections: '📋 Sections', theme: '🎨 Theme' }[t]}
              </button>
            ))}
          </div>

          <div style={S.tabContent}>
            {/* ── TAB: Images ── */}
            {tab === 'images' && (
              <div>
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
                        <button onClick={() => setHeroImage(idx)} title="Set as hero image"
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', background: img.isHero ? S.gold : 'rgba(0,0,0,0.6)', color: img.isHero ? '#0a0a15' : '#fff' }}>
                          ⭐
                        </button>
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
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: S.dim }}>
                  ⭐ = Hero background &nbsp;|&nbsp; 👁 = In gallery &nbsp;|&nbsp; ✕ = Excluded
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
                  Toggle sections on/off. Drag to reorder (use ↑↓ arrows).
                </div>
                {/* Active sections in order */}
                {sectionOrder.map((sId, idx) => {
                  const def = ALL_SECTIONS.find(s => s.id === sId);
                  if (!def) return null;
                  return (
                    <div key={sId} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{def.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0ece6' }}>{def.label}</div>
                        <div style={{ fontSize: '0.65rem', color: S.dim }}>{def.description}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button onClick={() => moveSection(sId, 'up')} disabled={idx === 0}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: '#1a1a2e', color: idx === 0 ? '#2a2a3a' : '#a09888', cursor: 'pointer', fontSize: '0.7rem' }}>▲</button>
                        <button onClick={() => moveSection(sId, 'down')} disabled={idx === sectionOrder.length - 1}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: '#1a1a2e', color: idx === sectionOrder.length - 1 ? '#2a2a3a' : '#a09888', cursor: 'pointer', fontSize: '0.7rem' }}>▼</button>
                      </div>
                      <button onClick={() => toggleSection(sId)}
                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
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
            {tab === 'theme' && analysis && (
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
                    {analysis.themeMatch.slice(0, 8).map(match => {
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
  const sections = vendor.section_order || [];

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

        {/* Cashback banner */}
        <div style={{ background: 'linear-gradient(135deg, #00d084, #00b37a)', color: '#fff', textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem' }}>
          ✨ Shop with us and get 25% cashback on everything — Unlock Cashback →
        </div>

        {sections.map(sectionId => {
          switch (sectionId) {
            case 'hero':
              return (
                <div key="hero" style={{
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
              );

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
                <div key="packages" style={{ padding: '3rem 2rem', background: bg, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Pricing</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Our Packages</h2>
                  {(vendor.pricing_packages || []).length === 0 && <div style={{ color: textMuted }}>No packages extracted — add them in Supabase</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((vendor.pricing_packages || []).length, 3)}, 1fr)`, gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                    {(vendor.pricing_packages || []).slice(0, 3).map((pkg, i) => (
                      <div key={i} style={{ background: bgCard, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${theme?.border || '#e5e1dc'}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{(pkg as any).name}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: primary, margin: '0.5rem 0' }}>{(pkg as any).price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'contact':
              return (
                <div key="contact" style={{ padding: '3rem 2rem', background: isDark ? '#111' : '#f5f2ed', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Get in Touch</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Let&apos;s Plan Something Amazing</h2>
                  <p style={{ color: textMuted, marginBottom: '1.5rem' }}>Ready to start planning? Reach out for a free consultation.</p>
                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.9rem', color: textMuted }}>
                    {vendor.email && <span>📧 {vendor.email}</span>}
                    {vendor.phone && <span>📞 {vendor.phone}</span>}
                    {vendor.instagram_handle && <span>📷 @{vendor.instagram_handle}</span>}
                  </div>
                </div>
              );

            case 'testimonials':
              return (
                <div key="testimonials" style={{ padding: '3rem 2rem', background: bg, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Testimonials</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>What Our Clients Say</h2>
                  {(vendor.testimonials || []).length === 0 && <div style={{ color: textMuted }}>No testimonials found</div>}
                </div>
              );

            case 'faq':
              return (
                <div key="faq" style={{ padding: '3rem 2rem', background: isDark ? '#111' : '#f5f2ed', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
                  {(vendor.faqs || []).length === 0 && <div style={{ color: textMuted }}>No FAQs found</div>}
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
