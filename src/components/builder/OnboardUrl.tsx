'use client';

import React, { useState, useCallback } from 'react';

interface OnboardResult {
  business_name: string;
  tagline: string;
  accent_word: string;
  hero_style: string;
  description: string;
  vendor_category: string;
  vendor_category_icon: string;
  recommended_theme: string;
  custom_brand_color: string | null;
  trust_badges: Array<{ icon: string; text: string }>;
  about_title: string;
  about_bio: string;
  about_highlights: Array<{ icon: string; name: string; description: string }>;
  services: Array<{ icon: string; name: string; description: string }>;
  packages: Array<{ name: string; price: string; description: string; features: string[] }>;
  event_types: Array<{ icon: string; name: string }>;
  contact_info: Record<string, string | null>;
  suggested_hero_image: string;
  suggested_about_image: string;
  suggested_gallery_images: string[];
  menu_categories: Array<{ name: string; subtitle: string; items: unknown[] }>;
  creative_notes: string;
}

interface OnboardUrlProps {
  onVendorReady: (data: OnboardResult) => void;
}

type Stage = 'idle' | 'scraping' | 'creating' | 'done' | 'error';

const STAGE_MESSAGES: Record<Stage, string> = {
  idle: '',
  scraping: 'Reading the vendor\'s website...',
  creating: 'Art directing the page — choosing headlines, styles, copy...',
  done: 'Done! Review the creative output in each tab.',
  error: 'Something went wrong.',
};

const STAGE_ICONS: Record<Stage, string> = {
  idle: '',
  scraping: '🔍',
  creating: '🎨',
  done: '✨',
  error: '⚠️',
};

export default function OnboardUrl({ onVendorReady }: OnboardUrlProps) {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState('');
  const [creativeNotes, setCreativeNotes] = useState('');
  const [progress, setProgress] = useState(0);

  const handleOnboard = useCallback(async () => {
    if (!url.trim()) return;

    setStage('scraping');
    setError('');
    setCreativeNotes('');
    setProgress(15);

    try {
      const scrapeRes = await fetch('/api/scrape-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!scrapeRes.ok) {
        const err = await scrapeRes.json();
        throw new Error(err.error || 'Failed to read vendor website');
      }

      const scrapedData = await scrapeRes.json();
      setProgress(40);

      setStage('creating');
      setProgress(55);

      const onboardRes = await fetch('/api/onboard-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrapedData: scrapedData.data }),
      });

      setProgress(85);

      if (!onboardRes.ok) {
        const err = await onboardRes.json();
        throw new Error(err.error || 'Failed to generate vendor page');
      }

      const { vendor } = await onboardRes.json();
      setProgress(100);
      setStage('done');
      setCreativeNotes(vendor.design_notes || vendor.creative_notes || '');

      onVendorReady(vendor);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setStage('error');
      setProgress(0);
    }
  }, [url, onVendorReady]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url.trim() && stage === 'idle') {
      handleOnboard();
    }
  };

  const isLoading = stage === 'scraping' || stage === 'creating';

  return (
    <div style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>✨</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
              Onboard a New Vendor
            </h2>
            <p style={{ fontSize: 14, color: '#888', margin: '4px 0 0' }}>
              Drop a URL and let Claude art-direct the page
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste vendor website URL — e.g. ljdjs.com"
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '14px 18px',
            borderRadius: 10,
            border: '1.5px solid rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(0,0,0,0.3)',
            color: '#eee',
            fontSize: 15,
            outline: 'none',
            fontFamily: 'inherit',
            opacity: isLoading ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleOnboard}
          disabled={!url.trim() || isLoading}
          style={{
            padding: '14px 28px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: '#e8c56d',
            color: '#1a1a2e',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.02em',
            fontFamily: 'inherit',
            cursor: !url.trim() || isLoading ? 'not-allowed' : 'pointer',
            opacity: !url.trim() || isLoading ? 0.5 : 1,
            transition: 'opacity 0.15s, transform 0.15s',
          }}
        >
          {isLoading ? 'Working...' : 'Build Page →'}
        </button>
      </div>

      {isLoading && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            width: '100%', height: 4, borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2, width: `${progress}%`,
              background: 'linear-gradient(90deg, #e8c56d, #f0d78a)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginTop: 12, fontSize: 14, color: '#aaa',
          }}>
            <span>{STAGE_ICONS[stage]}</span>
            <span>{STAGE_MESSAGES[stage]}</span>
            {stage === 'creating' && <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>...</span>}
          </div>
        </div>
      )}

      {stage === 'done' && creativeNotes && (
        <div style={{
          marginTop: 20, padding: 18, borderRadius: 10,
          backgroundColor: 'rgba(232, 197, 109, 0.08)',
          border: '1px solid rgba(232, 197, 109, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span>🎨</span>
            <span style={{ fontWeight: 700, color: '#e8c56d' }}>Creative Direction</span>
          </div>
          <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.6, margin: 0 }}>
            {creativeNotes}
          </p>
          <p style={{ fontSize: 13, color: '#888', marginTop: 12, fontStyle: 'italic' }}>
            Review each section in the tabs above. Tweak anything, then Save & Publish.
          </p>
        </div>
      )}

      {stage === 'error' && (
        <div style={{
          marginTop: 16, padding: 14, borderRadius: 10,
          backgroundColor: 'rgba(255, 80, 80, 0.1)',
          border: '1px solid rgba(255, 80, 80, 0.2)',
          color: '#ff8888', fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => { setStage('idle'); setError(''); setProgress(0); }}
            style={{
              marginLeft: 'auto', padding: '6px 16px', borderRadius: 6,
              border: '1px solid rgba(255, 80, 80, 0.3)',
              backgroundColor: 'transparent', color: '#ff8888',
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {stage === 'idle' && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
          {[
            ['🌐', 'Works with any wedding vendor website'],
            ['🎨', 'Claude reads the site and makes creative decisions — headlines, copy, style, layout'],
            ['⚡', 'Takes about 20-30 seconds'],
            ['✏️', 'You review and refine everything before publishing'],
          ].map(([icon, text], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#777' }}>
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' as const }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}