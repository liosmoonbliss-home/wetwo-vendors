// ============================================================
// WETWO VENDOR THEME SYSTEM — 100 Figma-Inspired Color Palettes
// + Original 10 presets + auto-matching from brand color
// ============================================================

import { ThemeConfig, ThemeMode } from './types';

// -- Helper --
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// -- Theme definition shorthand --
function light(primary: string, secondary: string, bg: string, bgCard: string, bgHover: string, text: string, textMuted: string, textDim: string, border: string): ThemeConfig {
  return { bg, bgCard, bgHover, primary, primaryDim: hexToRgba(primary, 0.10), secondary, text, textMuted, textDim, border, mode: 'light' as ThemeMode };
}
function dark(primary: string, secondary: string, bg: string, bgCard: string, bgHover: string, text: string, textMuted: string, textDim: string, border: string): ThemeConfig {
  return { bg, bgCard, bgHover, primary, primaryDim: hexToRgba(primary, 0.12), secondary, text, textMuted, textDim, border, mode: 'dark' as ThemeMode };
}

// ============================================================
// MASTER THEME LIBRARY
// Categories: monochromatic, romantic, playful, vibrant,
//             neutral, tranquil, seasonal + original presets
// ============================================================

export const THEME_LIBRARY: Record<string, ThemeConfig> = {

  // ── ORIGINAL PRESETS (backward-compatible) ──────────────────
  'dark-luxury':    dark('#c9a050','#d4b06a','#0a0a15','#141420','#1a1a2e','#f0ece6','#a09888','#6b6058','#2a2a3a'),
  'dark-burgundy':  dark('#8b2252','#c44a7a','#1a0a0a','#241414','#2e1a1a','#f0e8e8','#a08888','#6b5858','#3a2020'),
  'dark-navy':      dark('#4a7fb5','#6a9fd5','#0a0e1a','#121828','#1a2238','#e8ecf0','#8898a8','#586878','#202a3a'),
  'dark-emerald':   dark('#2e8b57','#4aad77','#0a1a0a','#142014','#1a2e1a','#e8f0e8','#88a888','#587858','#203a20'),
  'dark-royal':     dark('#7b3fa0','#9b5fc0','#0f0a1a','#191428','#231e38','#ece8f0','#9888a8','#685878','#2a203a'),
  'light-elegant':  light('#8b7355','#a89070','#faf8f5','#ffffff','#f0ece6','#2a2420','#6b5e52','#9a8d80','#e4ddd4'),
  'light-blush':    light('#c47080','#d4808a','#fdf5f5','#ffffff','#f8eaea','#2a2020','#7a5a5a','#a08888','#e8d8d8'),
  'light-sage':     light('#6b8e6b','#7aa87a','#f5faf5','#ffffff','#eaf0ea','#202a20','#5a6b5a','#88a088','#d4e0d4'),
  'light-coastal':  light('#4a7fb5','#5a90c5','#f5f8fa','#ffffff','#eaf0f5','#1a2530','#5a6a7a','#8898a8','#d4dde8'),
  'custom':         light('#c9a050','#d4b06a','#faf8f5','#ffffff','#f0ece6','#2a2420','#6b5e52','#9a8d80','#e4ddd4'),

  // ── MONOCHROMATIC (1–11) ────────────────────────────────────
  'stormy-morning':       dark('#7c8a96','#9ba8b4','#1e2730','#28333e','#313e4a','#dce2e8','#9aa6b2','#6e7a86','#3a4550'),
  'mossy-hollow':         dark('#6b7c45','#8a9e5a','#1a1f12','#252c1c','#303826','#e4ead8','#a0aa88','#707a58','#3a4028'),
  'blue-eclipse':         dark('#3a5a8c','#5478aa','#080e1e','#101a2e','#182440','#d8e0f0','#8898b8','#586888','#1e2a42'),
  'lush-forest':          dark('#2d7a4a','#48a068','#0a1a10','#142218','#1e3024','#d8f0e2','#80b898','#508868','#1e3828'),
  'green-juice':          light('#4a8c2a','#68aa48','#f4f9f0','#ffffff','#e8f2e0','#1a2a10','#4a6838','#80a06a','#d0e0c0'),
  'chili-spice':          dark('#b83020','#d85040','#1e0a08','#2e1410','#401e18','#f0dcd8','#b89088','#886058','#4a2820'),
  'chocolate-truffle':    dark('#6b4226','#8a5a38','#1a0e08','#281a10','#382418','#f0e4d8','#b09880','#806850','#402a18'),
  'ink-wash':             dark('#4a4a5a','#6a6a7a','#0e0e14','#18181e','#222230','#e0e0e8','#9898a8','#686878','#303040'),
  'golden-taupe':         light('#a08050','#b89868','#faf6f0','#ffffff','#f0eae0','#2a2418','#6b5e48','#9a8d70','#e0d8c8'),
  'wisteria-bloom':       light('#8a6aaa','#a080c0','#f8f4fc','#ffffff','#f0e8f8','#2a2030','#6a5878','#9888a8','#e0d4ec'),
  'burnt-sienna':         light('#b06030','#c87848','#faf4f0','#ffffff','#f0e8e0','#2a1e14','#6b5040','#9a7860','#e0d0c0'),

  // ── ROMANTIC (12–27) ────────────────────────────────────────
  'blooming-romance':     light('#d4708a','#e8889e','#fef5f7','#ffffff','#fceaef','#2e1a20','#7a4a5a','#aa7888','#f0d8e0'),
  'desert-dusk':          dark('#c4785a','#d89878','#1e1410','#2e201a','#402e24','#f0e4da','#b09880','#806858','#4a3428'),
  'lavender-fields':      light('#8a70b8','#a488d0','#f6f2fc','#ffffff','#eee8f8','#221a30','#604878','#8870a0','#dcd0ec'),
  'hydrangea':            light('#6a80c0','#8498d8','#f2f4fc','#ffffff','#e8ecf8','#1a2040','#4a5a80','#7080aa','#d0d8f0'),
  'cactus-flower':        light('#d05878','#e87090','#fef4f6','#ffffff','#fce8ee','#301820','#7a3848','#a86078','#f0d0da'),
  'wildflowers':          light('#b868a0','#d080b8','#fcf4fa','#ffffff','#f8e8f4','#2a1828','#6a4060','#985888','#e8d0e4'),
  'country-garden':       light('#7a9a58','#92b270','#f4f8f0','#ffffff','#e8f0e0','#1a2810','#4a6838','#78986a','#d0e0c4'),
  'lotus-garden':         light('#c87898','#e090b0','#fef5f8','#ffffff','#fcecf2','#2e1a22','#7a4a62','#a87890','#f0d8e2'),
  'iris-garden':          light('#6a58a8','#8070c0','#f4f2fc','#ffffff','#ece8f8','#1e1830','#4a4078','#7068a0','#d8d0ec'),
  'fresh-peach':          light('#e89060','#f0a878','#fef8f4','#ffffff','#fcf0e8','#2e2018','#7a5a40','#aa8468','#f0e0d0'),
  'golden-hour':          light('#d4a040','#e8b858','#fdf8f0','#ffffff','#faf0e0','#2a2210','#6b5a38','#9a8458','#e8dcc4'),
  'spiced-chai':          light('#a87040','#c08858','#f8f4f0','#ffffff','#f0e8e0','#2a1e14','#6b5438','#9a7c5a','#e0d4c4'),
  'cherry-blossom':       light('#e0889a','#f0a0b0','#fef6f8','#ffffff','#fceef2','#2e1c22','#7a5060','#a88090','#f0dce2'),
  'evening-rose':         dark('#c06080','#d87898','#1e0e14','#2e1a22','#40242e','#f0dce4','#b08898','#806068','#4a2830'),
  'pastel-garden':        light('#a0b888','#b8d0a0','#f6f8f4','#ffffff','#eef2ea','#222a1e','#5a6a50','#889a78','#d8e4d0'),
  'tuscan-sunset':        light('#c87848','#e09060','#faf4f0','#ffffff','#f2ece4','#2a1c14','#6b5038','#9a7858','#e0d4c0'),

  // ── PLAYFUL (28–40) ─────────────────────────────────────────
  'zesty-lemon':          light('#d4b020','#e8c838','#fdfcf0','#ffffff','#faf8e0','#2a2610','#6b6030','#9a8a48','#e8e0b8'),
  'california-beaches':   light('#e8983e','#f0b058','#fef8f2','#ffffff','#fcf0e4','#2e2214','#7a5e38','#aa8858','#f0e0c8'),
  'freshly-squeezed':     light('#e88030','#f09848','#fef6f0','#ffffff','#fceee0','#2e1e14','#7a5430','#aa7c50','#f0dcc4'),
  'pistachio-dream':      light('#88b868','#a0d080','#f4faf2','#ffffff','#eaf4e4','#1e2a18','#4e6a40','#78986a','#d4e8cc'),
  'mango-popsicle':       light('#e8802a','#f09842','#fef6f0','#ffffff','#fceee0','#2e1e10','#7a5428','#aa7c48','#f0dcc0'),
  'guava':                light('#e87090','#f088a8','#fef5f8','#ffffff','#fceaf0','#2e1a22','#7a4258','#a86880','#f0d4de'),
  'glowing-horizon':      light('#e8a020','#f0b838','#fef8f0','#ffffff','#faf2e0','#2a2210','#6b5c30','#9a8650','#e8dcc0'),
  'sunny-day':            light('#e8b830','#f0d048','#fefcf2','#ffffff','#faf8e4','#2a2610','#6b6230','#9a8e50','#e8e0c0'),
  'retro-sunset':         light('#d86838','#e88050','#faf4f0','#ffffff','#f2ece2','#2a1a14','#6b4a30','#9a7250','#e0d4c0'),
  'bubblegum-pop':        light('#e060a0','#f078b8','#fef4f8','#ffffff','#fce8f4','#2e182a','#7a3860','#a86088','#f0d0e4'),
  'cotton-candy-skies':   light('#c080c8','#d898e0','#fcf4fc','#ffffff','#f8eaf8','#281828','#6a4870','#9870a0','#e8d4ec'),
  'electric-kiwi':        light('#68c848','#80e060','#f2fcf0','#ffffff','#e4f8e0','#182a10','#408830','#68b050','#c8e8c0'),
  'watermelon-splash':    light('#e84860','#f06078','#fef4f6','#ffffff','#fce8ec','#2e1418','#7a3040','#a85868','#f0ccd4'),

  // ── VIBRANT (41–55) ─────────────────────────────────────────
  'alchemical-reaction':  dark('#c8a830','#e0c048','#181408','#282010','#382c18','#f0e8d0','#b0a070','#807040','#40381c'),
  'electropop':           dark('#a040e0','#b858f0','#140820','#201430','#2c1e40','#e8d8f8','#a888c8','#785898','#382050'),
  'cool-revival':         dark('#3898d0','#50b0e8','#081828','#102438','#183048','#d8ecf8','#80b0d0','#5088a8','#1c3450'),
  'neon-jungle':          dark('#50d850','#68f068','#081808','#102810','#183818','#d8f8d8','#80c880','#509850','#1c4020'),
  'sharp-edge':           dark('#e84040','#f05858','#1e0808','#2e1010','#401818','#f8d8d8','#c88888','#985858','#4a2020'),
  'electric-fusion':      dark('#d060d0','#e878e8','#1e0820','#2e1430','#401e40','#f8d8f8','#c888c8','#985898','#4a2050'),
  'fireworks':            dark('#e86830','#f08048','#1e1008','#2e1c10','#402818','#f8e4d8','#c89880','#986850','#4a3020'),
  'space-berries':        dark('#8848c0','#a060d8','#100820','#1c1430','#282040','#e8d8f8','#a088c0','#705890','#302050'),
  'pop-art':              light('#e83838','#f05050','#fef4f4','#ffffff','#fce8e8','#2e1010','#7a2828','#a85050','#f0cccc'),
  'urban-graffiti':       dark('#e0c020','#f0d838','#181408','#282010','#3c2e18','#f8f0d0','#b8a868','#887838','#403818'),
  'neon-noir':            dark('#00e8a0','#20f0b8','#080e0a','#10201a','#183028','#d8f8ec','#80c8aa','#50987a','#1c4038'),
  'tropical-punch':       light('#e85898','#f070b0','#fef4f8','#ffffff','#fce8f2','#2e1422','#7a3458','#a85c80','#f0cede'),
  'cobalt-sky':           light('#2868d0','#4080e8','#f2f5fe','#ffffff','#e4ecfc','#101a38','#384a80','#5870aa','#c8d4f0'),
  'technicolor-dream':    light('#a850c8','#c068e0','#f8f4fc','#ffffff','#f2e8fa','#221030','#5a3070','#825098','#dcc8f0'),
  'jewel-box':            dark('#c84848','#e06060','#1a0808','#281010','#381818','#f0d8d8','#b08888','#805858','#4a2020'),

  // ── NEUTRAL (56–71) ─────────────────────────────────────────
  'salt-and-pepper':      light('#505860','#687078','#f6f7f8','#ffffff','#eceef0','#1e2228','#4a5058','#788088','#d8dcdf'),
  'quite-clear':          light('#808890','#98a0a8','#f8f9fa','#ffffff','#f0f2f4','#1a1e22','#484e54','#78808a','#dce0e4'),
  'gothic-noir':          dark('#a0a0a0','#b8b8b8','#0a0a0a','#161616','#222222','#e8e8e8','#a0a0a0','#686868','#303030'),
  'yacht-club':           light('#2060a0','#3878b8','#f4f7fc','#ffffff','#e8f0fa','#101a30','#384a70','#5870a0','#c8d8f0'),
  'quiet-luxury':         light('#9a8870','#b0a088','#faf8f4','#ffffff','#f0ece4','#282420','#605848','#8a8070','#ddd8cc'),
  'night-sands':          dark('#c8b890','#d8c8a0','#141210','#201e18','#2c2a22','#f0ece0','#b0a890','#807860','#3a3828'),
  'harbor-haze':          light('#708898','#88a0b0','#f5f8fa','#ffffff','#eaf0f4','#1a2028','#4a5868','#788898','#d0dce4'),
  'old-photograph':       light('#8a7860','#a09078','#f8f6f2','#ffffff','#f0ece4','#28241c','#5e5648','#888070','#dcd4c8'),
  'cappuccino':           light('#8a6840','#a28058','#f8f4f0','#ffffff','#f0e8e0','#28201a','#5e4e3a','#887860','#dcd0c0'),
  'breakfast-tea':        light('#a08050','#b89868','#faf6f0','#ffffff','#f0eae0','#2a2418','#605438','#8a7c58','#ddd4c0'),
  'cozy-campfire':        dark('#d89040','#e8a858','#181008','#281c10','#382818','#f0e4d0','#b09868','#806838','#403018'),
  'stone-path':           light('#787878','#909090','#f6f6f6','#ffffff','#ececec','#222222','#505050','#808080','#d8d8d8'),
  'desert-mirage':        light('#c89858','#d8b070','#faf6f0','#ffffff','#f2ece0','#2a2214','#6b5838','#9a8258','#e0d8c0'),
  'honeycomb':            light('#d4a030','#e8b848','#fdf8f0','#ffffff','#faf0e0','#2a2210','#6b5a30','#9a8448','#e8dcbc'),
  'urban-loft':           light('#6a6a6a','#828282','#f4f4f4','#ffffff','#eaeaea','#1e1e1e','#4a4a4a','#7a7a7a','#d4d4d4'),
  'spiced-mocha':         dark('#a07040','#b88858','#18100a','#281e14','#382a1e','#f0e0d0','#b09470','#806440','#403020'),

  // ── TRANQUIL (72–88) ────────────────────────────────────────
  'charming-seaside':     light('#4890b8','#60a8d0','#f2f8fc','#ffffff','#e8f2fa','#142030','#3a5a78','#6080a0','#c8ddf0'),
  'calm-blue':            light('#5880a8','#7098c0','#f4f7fc','#ffffff','#eaf0f8','#182030','#3e5a78','#6880a0','#ccd8ec'),
  'beachfront-views':     light('#38a0b8','#50b8d0','#f0f8fc','#ffffff','#e4f4f8','#102028','#2e5868','#508090','#c0dce8'),
  'under-the-moonlight':  dark('#6878a8','#8090c0','#0a1020','#141c30','#1e2840','#dce0f0','#8890b0','#586080','#242e48'),
  'lavender-lullaby':     light('#9880b8','#b098d0','#f6f4fc','#ffffff','#eeeafa','#201830','#5a4870','#8070a0','#dcd4ec'),
  'minty-fresh':          light('#40a888','#58c0a0','#f0faf8','#ffffff','#e4f4f0','#102820','#2e6858','#509880','#c0e0d8'),
  'retro-calm':           light('#8090a0','#98a8b8','#f5f7fa','#ffffff','#eef0f4','#1a2028','#4a5868','#788898','#d0d8e0'),
  'siltstone':            light('#8a8878','#a09e90','#f8f8f6','#ffffff','#f0f0ec','#24241e','#5a5850','#888680','#dcdcd4'),
  'emerald-odyssey':      dark('#28a060','#40b878','#081810','#10281c','#183828','#d8f0e4','#80b898','#508868','#1e4030'),
  'ocean-tide':           dark('#2878b0','#4090c8','#081828','#102438','#183048','#d8e8f8','#80a8c8','#5080a0','#1c3450'),
  'peach-skyline':        light('#e8a880','#f0c098','#fef8f4','#ffffff','#fcf2ea','#2e221a','#7a5e48','#a88870','#f0e0d0'),
  'mountain-mist':        light('#7888a0','#90a0b8','#f4f6fa','#ffffff','#eaf0f6','#1a2028','#4a5868','#788898','#d0d8e4'),
  'morning-dew':          light('#70b090','#88c8a8','#f2faf6','#ffffff','#e6f4ee','#182820','#3e6850','#689880','#c8e4d8'),
  'frozen-lake':          light('#5898c8','#70b0e0','#f2f7fc','#ffffff','#e8f0fa','#142030','#3a5878','#6088b0','#c8dcf0'),
  'olive-grove':          light('#788830','#90a048','#f6f8f0','#ffffff','#eef0e4','#222810','#4e5830','#78884e','#d4dcc0'),
  'coastal-morning':      light('#5098a8','#68b0c0','#f2f8fa','#ffffff','#e6f2f6','#122028','#366068','#588890','#c4dce4'),
  'eucalyptus-grove':     light('#609878','#78b090','#f2f8f4','#ffffff','#e6f2ec','#182820','#3e6050','#689078','#c4e0d0'),

  // ── SEASONAL (89–100) ───────────────────────────────────────
  'soft-spring':          light('#a0c078','#b8d890','#f4faf2','#ffffff','#ecf4e6','#202a18','#4e6840','#78986a','#d4e4c8'),
  'autumn-leaves':        dark('#c87830','#e09048','#181008','#281c10','#382818','#f0e0d0','#b09060','#806030','#403018'),
  'winter-chill':         light('#6090c0','#78a8d8','#f2f6fc','#ffffff','#e8f0fa','#142038','#3a5a80','#6080b0','#c8d8f0'),
  'spring-energy':        light('#68b848','#80d060','#f2faf0','#ffffff','#e6f6e0','#182a12','#408830','#68b058','#c8eac0'),
  'pumpkin-spice':        light('#c87030','#e08848','#faf4f0','#ffffff','#f2eae0','#281c10','#6b5030','#987850','#ddd0c0'),
  'island-oasis':         light('#20a8a0','#38c0b8','#f0fafa','#ffffff','#e2f6f4','#0e2828','#2e6868','#509090','#c0e0de'),
  'autumn-orchard':       light('#b87028','#d08840','#f8f4f0','#ffffff','#f0e8de','#28200e','#604e28','#8a7848','#dcd0b8'),
  'tropical-rainforest':  dark('#28a850','#40c068','#081a0a','#102814','#18381e','#d8f8e0','#80c090','#509060','#1c4028'),
  'wildflower-meadow':    light('#b870a0','#d088b8','#fcf4fa','#ffffff','#f8e8f4','#281828','#6a4060','#985888','#e8d0e4'),
  'harvest-moon':         dark('#d8a840','#e8c058','#181408','#282010','#382c18','#f0e8d0','#b0a060','#807030','#403818'),
  'winter-berry':         dark('#a03050','#c04868','#1a0810','#28101c','#381828','#f0d8e0','#b08090','#805060','#4a2030'),
  'summer-breeze':        light('#48b0d0','#60c8e8','#f0f8fc','#ffffff','#e4f4fa','#102028','#2e5868','#508890','#c0dce8'),
};

// ── THEME NAME LIST (for dropdowns/selectors) ─────────────────
export const THEME_NAMES = Object.keys(THEME_LIBRARY);

export const THEME_CATEGORIES: Record<string, string[]> = {
  'Original Presets': ['dark-luxury','dark-burgundy','dark-navy','dark-emerald','dark-royal','light-elegant','light-blush','light-sage','light-coastal','custom'],
  'Monochromatic': ['stormy-morning','mossy-hollow','blue-eclipse','lush-forest','green-juice','chili-spice','chocolate-truffle','ink-wash','golden-taupe','wisteria-bloom','burnt-sienna'],
  'Romantic': ['blooming-romance','desert-dusk','lavender-fields','hydrangea','cactus-flower','wildflowers','country-garden','lotus-garden','iris-garden','fresh-peach','golden-hour','spiced-chai','cherry-blossom','evening-rose','pastel-garden','tuscan-sunset'],
  'Playful': ['zesty-lemon','california-beaches','freshly-squeezed','pistachio-dream','mango-popsicle','guava','glowing-horizon','sunny-day','retro-sunset','bubblegum-pop','cotton-candy-skies','electric-kiwi','watermelon-splash'],
  'Vibrant': ['alchemical-reaction','electropop','cool-revival','neon-jungle','sharp-edge','electric-fusion','fireworks','space-berries','pop-art','urban-graffiti','neon-noir','tropical-punch','cobalt-sky','technicolor-dream','jewel-box'],
  'Neutral': ['salt-and-pepper','quite-clear','gothic-noir','yacht-club','quiet-luxury','night-sands','harbor-haze','old-photograph','cappuccino','breakfast-tea','cozy-campfire','stone-path','desert-mirage','honeycomb','urban-loft','spiced-mocha'],
  'Tranquil': ['charming-seaside','calm-blue','beachfront-views','under-the-moonlight','lavender-lullaby','minty-fresh','retro-calm','siltstone','emerald-odyssey','ocean-tide','peach-skyline','mountain-mist','morning-dew','frozen-lake','olive-grove','coastal-morning','eucalyptus-grove'],
  'Seasonal': ['soft-spring','autumn-leaves','winter-chill','spring-energy','pumpkin-spice','island-oasis','autumn-orchard','tropical-rainforest','wildflower-meadow','harvest-moon','winter-berry','summer-breeze'],
};

// ── AUTO-MATCH: Find closest theme to a given brand color ─────
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function colorDistance(hex1: string, hex2: string): number {
  const a = hexToHSL(hex1);
  const b = hexToHSL(hex2);
  // Weighted distance: hue matters most, then saturation, then lightness
  const hDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 180;
  const sDiff = Math.abs(a.s - b.s);
  const lDiff = Math.abs(a.l - b.l);
  return hDiff * 3 + sDiff * 2 + lDiff;
}

/** Given a hex brand color, find the closest matching theme */
export function findClosestTheme(brandColor: string, preferMode?: ThemeMode): string {
  let bestName = 'light-elegant';
  let bestDist = Infinity;
  for (const [name, theme] of Object.entries(THEME_LIBRARY)) {
    if (preferMode && theme.mode !== preferMode) continue;
    const dist = colorDistance(brandColor, theme.primary);
    if (dist < bestDist) {
      bestDist = dist;
      bestName = name;
    }
  }
  return bestName;
}

/** Given a hex brand color, return the top N closest themes */
export function findTopThemes(brandColor: string, n = 5, preferMode?: ThemeMode): Array<{ name: string; theme: ThemeConfig; distance: number }> {
  const results: Array<{ name: string; theme: ThemeConfig; distance: number }> = [];
  for (const [name, theme] of Object.entries(THEME_LIBRARY)) {
    if (preferMode && theme.mode !== preferMode) continue;
    results.push({ name, theme, distance: colorDistance(brandColor, theme.primary) });
  }
  results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, n);
}

// ── RESOLVE THEME (backward-compatible) ───────────────────────
export function resolveTheme(preset?: string, brandColor?: string, brandColorSecondary?: string): ThemeConfig {
  const theme = { ...(THEME_LIBRARY[preset || 'dark-luxury'] || THEME_LIBRARY['dark-luxury']) };
  if (brandColor) {
    theme.primary = brandColor;
    theme.primaryDim = hexToRgba(brandColor, theme.mode === 'dark' ? 0.12 : 0.10);
  }
  if (brandColorSecondary) {
    theme.secondary = brandColorSecondary;
  }
  return theme;
}

// ── CSS VARIABLE INJECTION ────────────────────────────────────
export function themeToCSSVariables(theme: ThemeConfig): string {
  return `--bg:${theme.bg};--bg-card:${theme.bgCard};--bg-hover:${theme.bgHover};--primary:${theme.primary};--primary-dim:${theme.primaryDim};--secondary:${theme.secondary};--text:${theme.text};--text-muted:${theme.textMuted};--text-dim:${theme.textDim};--border:${theme.border};--mode:${theme.mode};--green:#22c55e;--green-dim:rgba(34,197,94,0.1);--blue:#3b82f6;--blue-dim:rgba(59,130,246,0.1);--red:#ef4444;--red-dim:rgba(239,68,68,0.1);--gold:#c9a050;--gold-dim:rgba(201,160,80,0.1)`;
}
