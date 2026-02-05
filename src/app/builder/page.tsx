'use client';

import { useState, useCallback } from 'react';
import type { Vendor, SectionId } from '@/lib/types';
import { THEME_LIBRARY, THEME_CATEGORIES } from '@/lib/themes';

type Step = 'input' | 'analyzing' | 'review' | 'creating' | 'done';

interface AnalysisResult {
  vendor: Partial<Vendor>;
  confidence: Record<string, number>;
  themeMatch: { name: string; distance: number }[];
  suggestedSections: SectionId[];
  suggestedOrder: SectionId[];
  rawColors: string[];
  warnings: string[];
}

export default function BuilderPage() {
  const [step, setStep] = useState<Step>('input');
  const [url, setUrl] = useState('');
  const [pasteHtml, setPasteHtml] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [vendor, setVendor] = useState<Partial<Vendor>>({});
  const [error, setError] = useState('');
  const [liveUrl, setLiveUrl] = useState('');

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

      if (!res.ok) {
        setError(data.error || 'Analysis failed');
        setStep('input');
        return;
      }

      setAnalysis(data);
      setVendor(data.vendor);
      setStep('review');
    } catch (err) {
      setError(String(err));
      setStep('input');
    }
  }, [url, pasteHtml]);

  const createVendor = useCallback(async () => {
    setError('');
    setStep('creating');

    try {
      const res = await fetch('/api/create-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Creation failed');
        setStep('review');
        return;
      }

      setLiveUrl(data.url);
      setStep('done');
    } catch (err) {
      setError(String(err));
      setStep('review');
    }
  }, [vendor]);

  const updateField = (field: string, value: unknown) => {
    setVendor(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a15', color: '#f0ece6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c9a050' }}>WeTwo</div>
        <div style={{ fontSize: '0.875rem', color: '#a09888' }}>Vendor Site Builder</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {['input', 'review', 'done'].map((s, i) => (
            <div key={s} style={{
              width: '2rem', height: '4px', borderRadius: '2px',
              background: ['input', 'analyzing'].includes(step) && i === 0 ? '#c9a050'
                : ['review', 'creating'].includes(step) && i <= 1 ? '#c9a050'
                : step === 'done' ? '#c9a050' : '#2a2a3a',
            }} />
          ))}
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>

        {/* ── STEP 1: INPUT ──────────────────────────── */}
        {(step === 'input' || step === 'analyzing') && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Build a Vendor Page
            </h1>
            <p style={{ color: '#a09888', marginBottom: '2rem' }}>
              Drop in any vendor website URL. We&apos;ll analyze their brand, extract content,
              match the perfect theme, and create their WeTwo page automatically.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="url"
                placeholder="https://vendor-website.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                disabled={step === 'analyzing'}
                style={{
                  flex: 1, padding: '1rem 1.25rem', fontSize: '1.1rem',
                  background: '#141420', border: '2px solid #2a2a3a', borderRadius: '12px',
                  color: '#f0ece6', outline: 'none',
                }}
              />
              <button
                onClick={analyze}
                disabled={step === 'analyzing' || (!url && !pasteHtml)}
                style={{
                  padding: '1rem 2rem', fontSize: '1rem', fontWeight: 600,
                  background: step === 'analyzing' ? '#2a2a3a' : '#c9a050', color: '#0a0a15',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  opacity: step === 'analyzing' || (!url && !pasteHtml) ? 0.5 : 1,
                }}
              >
                {step === 'analyzing' ? '⏳ Analyzing...' : '🔍 Analyze'}
              </button>
            </div>

            <button
              onClick={() => setShowPaste(!showPaste)}
              style={{ background: 'none', border: 'none', color: '#c9a050', cursor: 'pointer', fontSize: '0.875rem', padding: '0.5rem 0' }}
            >
              {showPaste ? '▼ Hide HTML paste' : '▶ Or paste HTML directly'}
            </button>

            {showPaste && (
              <textarea
                placeholder="Paste the vendor website HTML here..."
                value={pasteHtml}
                onChange={e => setPasteHtml(e.target.value)}
                style={{
                  width: '100%', minHeight: '200px', padding: '1rem', marginTop: '0.5rem',
                  background: '#141420', border: '1px solid #2a2a3a', borderRadius: '12px',
                  color: '#f0ece6', fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical',
                }}
              />
            )}

            {error && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#ef4444' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: REVIEW ─────────────────────────── */}
        {(step === 'review' || step === 'creating') && analysis && (
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Review & Customize
            </h1>

            {/* Theme Preview */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#141420', borderRadius: '16px', border: '1px solid #2a2a3a' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#c9a050', marginBottom: '1rem' }}>
                🎨 Theme Match
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {analysis.themeMatch.slice(0, 5).map(match => {
                  const theme = THEME_LIBRARY[match.name];
                  const isSelected = vendor.theme_preset === match.name;
                  return (
                    <button
                      key={match.name}
                      onClick={() => updateField('theme_preset', match.name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer',
                        background: isSelected ? 'rgba(201,160,80,0.15)' : '#1a1a2e',
                        border: isSelected ? '2px solid #c9a050' : '1px solid #2a2a3a',
                        color: '#f0ece6',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {theme && [theme.primary, theme.secondary, theme.bg].map((c, i) => (
                          <div key={i} style={{ width: '16px', height: '16px', borderRadius: '4px', background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.8rem' }}>{match.name}</span>
                    </button>
                  );
                })}
              </div>
              {vendor.brand_color && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#a09888' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: vendor.brand_color }} />
                  Detected brand color: {vendor.brand_color}
                </div>
              )}
            </div>

            {/* Business Info */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#141420', borderRadius: '16px', border: '1px solid #2a2a3a' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#c9a050', marginBottom: '1rem' }}>
                🏢 Business Info
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  ['business_name', 'Business Name'],
                  ['category', 'Category'],
                  ['contact_name', 'Contact Name'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['instagram_handle', 'Instagram'],
                  ['city', 'City'],
                  ['state', 'State'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label style={{ fontSize: '0.75rem', color: '#a09888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                    <input
                      value={(vendor as Record<string, unknown>)[field] as string || ''}
                      onChange={e => updateField(field, e.target.value)}
                      style={{
                        width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem',
                        background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: '8px',
                        color: '#f0ece6', fontSize: '0.9rem',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#a09888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio</label>
                <textarea
                  value={vendor.bio || ''}
                  onChange={e => updateField('bio', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem',
                    background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: '8px',
                    color: '#f0ece6', fontSize: '0.9rem', resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Sections */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#141420', borderRadius: '16px', border: '1px solid #2a2a3a' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#c9a050', marginBottom: '1rem' }}>
                📋 Active Sections
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(['hero', 'gallery', 'packages', 'services_list', 'event_types', 'testimonials', 'faq', 'menu_accordion', 'video_showcase', 'team_spotlight', 'venue_details', 'contact'] as SectionId[]).map(section => {
                  const isActive = vendor.active_sections?.includes(section);
                  return (
                    <button
                      key={section}
                      onClick={() => {
                        const current = vendor.active_sections || [];
                        updateField('active_sections', isActive ? current.filter(s => s !== section) : [...current, section]);
                        updateField('section_order', isActive ? (vendor.section_order || []).filter(s => s !== section) : [...(vendor.section_order || []), section]);
                      }}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                        background: isActive ? 'rgba(201,160,80,0.15)' : '#1a1a2e',
                        border: isActive ? '1px solid #c9a050' : '1px solid #2a2a3a',
                        color: isActive ? '#c9a050' : '#6b6058',
                      }}
                    >
                      {section.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extracted Content Summary */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#141420', borderRadius: '16px', border: '1px solid #2a2a3a' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#c9a050', marginBottom: '1rem' }}>
                📊 Extracted Content
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <Stat label="Images" value={vendor.portfolio_images?.length || 0} />
                <Stat label="Packages" value={vendor.pricing_packages?.length || 0} />
                <Stat label="Services" value={vendor.services_included?.length || 0} />
                <Stat label="Testimonials" value={vendor.testimonials?.length || 0} />
                <Stat label="FAQs" value={vendor.faqs?.length || 0} />
                <Stat label="Event Types" value={vendor.event_types?.length || 0} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => { setStep('input'); setAnalysis(null); }}
                style={{
                  padding: '1rem 2rem', fontSize: '1rem', fontWeight: 600,
                  background: '#1a1a2e', color: '#a09888', border: '1px solid #2a2a3a',
                  borderRadius: '12px', cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={createVendor}
                disabled={step === 'creating'}
                style={{
                  flex: 1, padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 700,
                  background: step === 'creating' ? '#2a2a3a' : '#c9a050', color: '#0a0a15',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  opacity: step === 'creating' ? 0.5 : 1,
                }}
              >
                {step === 'creating' ? '⏳ Creating...' : '🚀 Create Vendor Page'}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#ef4444' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: DONE ───────────────────────────── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Vendor Page Created!
            </h1>
            <p style={{ color: '#a09888', marginBottom: '2rem' }}>
              {vendor.business_name}&apos;s page is now live.
            </p>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700,
                background: '#c9a050', color: '#0a0a15', borderRadius: '12px', textDecoration: 'none',
              }}
            >
              View Live Page →
            </a>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#a09888' }}>
              {liveUrl}
            </div>
            <button
              onClick={() => { setStep('input'); setUrl(''); setPasteHtml(''); setAnalysis(null); setVendor({}); setLiveUrl(''); }}
              style={{
                marginTop: '2rem', padding: '0.75rem 2rem', background: '#1a1a2e',
                color: '#c9a050', border: '1px solid #2a2a3a', borderRadius: '10px',
                cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              Build Another →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: '0.75rem', background: '#1a1a2e', borderRadius: '8px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: value > 0 ? '#c9a050' : '#6b6058' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#a09888' }}>{label}</div>
    </div>
  );
}
