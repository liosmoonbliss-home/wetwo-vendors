import { ThemePreset, ThemeConfig, ThemeMode } from './types';
export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  'dark-luxury': { bg:'#0a0a15',bgCard:'#141420',bgHover:'#1a1a2e',primary:'#c9a050',primaryDim:'rgba(201,160,80,0.12)',secondary:'#d4b06a',text:'#f0ece6',textMuted:'#a09888',textDim:'#6b6058',border:'#2a2a3a',mode:'dark' },
  'dark-burgundy': { bg:'#1a0a0a',bgCard:'#241414',bgHover:'#2e1a1a',primary:'#8b2252',primaryDim:'rgba(139,34,82,0.15)',secondary:'#c44a7a',text:'#f0e8e8',textMuted:'#a08888',textDim:'#6b5858',border:'#3a2020',mode:'dark' },
  'dark-navy': { bg:'#0a0e1a',bgCard:'#121828',bgHover:'#1a2238',primary:'#4a7fb5',primaryDim:'rgba(74,127,181,0.12)',secondary:'#6a9fd5',text:'#e8ecf0',textMuted:'#8898a8',textDim:'#586878',border:'#202a3a',mode:'dark' },
  'dark-emerald': { bg:'#0a1a0a',bgCard:'#142014',bgHover:'#1a2e1a',primary:'#2e8b57',primaryDim:'rgba(46,139,87,0.12)',secondary:'#4aad77',text:'#e8f0e8',textMuted:'#88a888',textDim:'#587858',border:'#203a20',mode:'dark' },
  'dark-royal': { bg:'#0f0a1a',bgCard:'#191428',bgHover:'#231e38',primary:'#7b3fa0',primaryDim:'rgba(123,63,160,0.12)',secondary:'#9b5fc0',text:'#ece8f0',textMuted:'#9888a8',textDim:'#685878',border:'#2a203a',mode:'dark' },
  'light-elegant': { bg:'#faf8f5',bgCard:'#ffffff',bgHover:'#f0ece6',primary:'#8b7355',primaryDim:'rgba(139,115,85,0.10)',secondary:'#a89070',text:'#2a2420',textMuted:'#6b5e52',textDim:'#9a8d80',border:'#e4ddd4',mode:'light' },
  'light-blush': { bg:'#fdf5f5',bgCard:'#ffffff',bgHover:'#f8eaea',primary:'#c47080',primaryDim:'rgba(196,112,128,0.10)',secondary:'#d4808a',text:'#2a2020',textMuted:'#7a5a5a',textDim:'#a08888',border:'#e8d8d8',mode:'light' },
  'light-sage': { bg:'#f5faf5',bgCard:'#ffffff',bgHover:'#eaf0ea',primary:'#6b8e6b',primaryDim:'rgba(107,142,107,0.10)',secondary:'#7aa87a',text:'#202a20',textMuted:'#5a6b5a',textDim:'#88a088',border:'#d4e0d4',mode:'light' },
  'light-coastal': { bg:'#f5f8fa',bgCard:'#ffffff',bgHover:'#eaf0f5',primary:'#4a7fb5',primaryDim:'rgba(74,127,181,0.10)',secondary:'#5a90c5',text:'#1a2530',textMuted:'#5a6a7a',textDim:'#8898a8',border:'#d4dde8',mode:'light' },
  'custom': { bg:'#faf8f5',bgCard:'#ffffff',bgHover:'#f0ece6',primary:'#c9a050',primaryDim:'rgba(201,160,80,0.10)',secondary:'#d4b06a',text:'#2a2420',textMuted:'#6b5e52',textDim:'#9a8d80',border:'#e4ddd4',mode:'light' },
};
function hexToRgba(hex: string, alpha: number): string { const r=parseInt(hex.slice(1,3),16); const g=parseInt(hex.slice(3,5),16); const b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${alpha})`; }
export function resolveTheme(preset: ThemePreset='dark-luxury', brandColor?: string, brandColorSecondary?: string): ThemeConfig {
  const theme = { ...THEME_PRESETS[preset] };
  if (brandColor) { theme.primary = brandColor; theme.primaryDim = hexToRgba(brandColor, 0.12); }
  if (brandColorSecondary) { theme.secondary = brandColorSecondary; }
  return theme;
}
export function themeToCSSVariables(theme: ThemeConfig): string {
  return `--bg:${theme.bg};--bg-card:${theme.bgCard};--bg-hover:${theme.bgHover};--primary:${theme.primary};--primary-dim:${theme.primaryDim};--secondary:${theme.secondary};--text:${theme.text};--text-muted:${theme.textMuted};--text-dim:${theme.textDim};--border:${theme.border};--mode:${theme.mode};--green:#22c55e;--green-dim:rgba(34,197,94,0.1);--blue:#3b82f6;--blue-dim:rgba(59,130,246,0.1);--red:#ef4444;--red-dim:rgba(239,68,68,0.1);--gold:#c9a050;--gold-dim:rgba(201,160,80,0.1)`;
}
