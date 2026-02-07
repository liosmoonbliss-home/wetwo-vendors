// ============================================================
// heroStyles.ts — Freestyle Hero Rendering System
// ============================================================
// These are NOT rigid templates. They're rendering vocabulary
// that the Hero component interprets based on Claude's
// creative direction (heroStyle, accentWord, heroMood).
// ============================================================

export interface HeroStyleDef {
  id: string;
  name: string;
  layout: 'centered' | 'split' | 'stacked' | 'cinematic' | 'asymmetric';
  headingFont: 'sans' | 'serif' | 'display';
  hasAccentWord: boolean;
  accentFont: 'serif-italic' | 'script' | null;
  overlayOpacity: number;
  className: string;
}

export const HERO_STYLES: Record<string, HeroStyleDef> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    layout: 'centered',
    headingFont: 'sans',
    hasAccentWord: false,
    accentFont: null,
    overlayOpacity: 0.45,
    className: 'hero-classic',
  },
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    layout: 'centered',
    headingFont: 'serif',
    hasAccentWord: true,
    accentFont: 'serif-italic',
    overlayOpacity: 0.5,
    className: 'hero-editorial',
  },
  grand: {
    id: 'grand',
    name: 'Grand',
    layout: 'centered',
    headingFont: 'display',
    hasAccentWord: true,
    accentFont: 'serif-italic',
    overlayOpacity: 0.55,
    className: 'hero-grand',
  },
  split: {
    id: 'split',
    name: 'Split',
    layout: 'split',
    headingFont: 'serif',
    hasAccentWord: false,
    accentFont: null,
    overlayOpacity: 0,
    className: 'hero-split',
  },
  'split-editorial': {
    id: 'split-editorial',
    name: 'Split Editorial',
    layout: 'split',
    headingFont: 'serif',
    hasAccentWord: true,
    accentFont: 'script',
    overlayOpacity: 0,
    className: 'hero-split-editorial',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    layout: 'centered',
    headingFont: 'sans',
    hasAccentWord: false,
    accentFont: null,
    overlayOpacity: 0.65,
    className: 'hero-minimal',
  },
  stacked: {
    id: 'stacked',
    name: 'Stacked',
    layout: 'stacked',
    headingFont: 'serif',
    hasAccentWord: true,
    accentFont: 'serif-italic',
    overlayOpacity: 0,
    className: 'hero-stacked',
  },
  asymmetric: {
    id: 'asymmetric',
    name: 'Asymmetric',
    layout: 'asymmetric',
    headingFont: 'display',
    hasAccentWord: true,
    accentFont: 'serif-italic',
    overlayOpacity: 0.4,
    className: 'hero-asymmetric',
  },
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    layout: 'cinematic',
    headingFont: 'display',
    hasAccentWord: true,
    accentFont: 'serif-italic',
    overlayOpacity: 0.35,
    className: 'hero-cinematic',
  },
};

// Fallback for any style Claude invents that we don't know yet
const DEFAULT_STYLE: HeroStyleDef = {
  id: 'freestyle',
  name: 'Freestyle',
  layout: 'centered',
  headingFont: 'serif',
  hasAccentWord: true,
  accentFont: 'serif-italic',
  overlayOpacity: 0.45,
  className: 'hero-editorial',
};

/** Resolve style ID to definition — graceful fallback */
export function resolveHeroStyle(styleId: string | undefined | null): HeroStyleDef {
  if (!styleId) return HERO_STYLES.editorial;
  return HERO_STYLES[styleId] || DEFAULT_STYLE;
}

/** Font family CSS stacks */
export const FONT_STACKS = {
  sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  serif: "'Cormorant Garamond', Georgia, serif",
  display: "'Cormorant Garamond', Georgia, serif",
  'serif-italic': "'Cormorant Garamond', Georgia, serif",
  script: "'Playfair Display', Georgia, serif",
};

/**
 * Split headline into segments with accent word marked.
 * Used to render one word in italic/script in brand color.
 */
export function splitAccentWord(
  headline: string,
  accentWord: string | null | undefined
): { text: string; isAccent: boolean }[] {
  if (!accentWord || !headline) {
    return [{ text: headline || '', isAccent: false }];
  }

  const idx = headline.toLowerCase().indexOf(accentWord.toLowerCase());
  if (idx === -1) {
    return [{ text: headline, isAccent: false }];
  }

  const before = headline.slice(0, idx);
  const match = headline.slice(idx, idx + accentWord.length);
  const after = headline.slice(idx + accentWord.length);

  const segments: { text: string; isAccent: boolean }[] = [];
  if (before) segments.push({ text: before, isAccent: false });
  segments.push({ text: match, isAccent: true });
  if (after) segments.push({ text: after, isAccent: false });

  return segments;
}
