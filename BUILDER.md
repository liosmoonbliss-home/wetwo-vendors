# WETWO VENDOR SITE BUILDER — Master Instructions

> **Purpose:** Given a single URL of an existing wedding vendor website, automatically
> analyze, extract, theme-match, and create a fully configured vendor page on the
> WeTwo platform. This document contains EVERYTHING needed — no prior context required.

---

## 1. SYSTEM OVERVIEW

**Stack:** Next.js 14 + Supabase + Vercel
**Repo:** `liosmoonbliss-home/wetwo-vendors`
**Live:** `wetwo-vendors.vercel.app`
**Vendor pages:** `wetwo-vendors.vercel.app/vendor/[ref]`

Each vendor gets a page powered by a single `vendors` row in Supabase. The page is
fully dynamic — theme, sections, content all come from the database. Our job is to
populate that row intelligently from the vendor's existing website.

---

## 2. THE BUILD PIPELINE

```
URL Input
   ↓
[1] FETCH & ANALYZE — scrape HTML, extract brand data
   ↓
[2] THEME MATCH — map brand colors → closest of 110 pre-built themes
   ↓
[3] SECTION SELECT — based on category + available content, decide active sections
   ↓
[4] DATA MAP — transform extracted data → Vendor schema
   ↓
[5] SUPABASE WRITE — insert/upsert vendor row
   ↓
[6] VERIFY — check live page renders correctly
```

---

## 3. STEP 1: FETCH & ANALYZE

### What to Extract

| Field | Where to Look |
|-------|---------------|
| **Business name** | `<title>`, `og:title`, `<h1>`, schema.org `name` |
| **Category** | Keywords in title/meta/content (see category map below) |
| **Bio/Description** | `meta[name=description]`, `og:description`, first `<p>` in about section |
| **Brand color** | `meta[name=theme-color]`, CSS `--primary`, `--brand`, most-used non-white/black color in inline styles, logo dominant color |
| **Secondary color** | Second most-used accent color |
| **Contact name** | About section, "Meet [Name]", schema.org `founder` |
| **Email** | `mailto:` links, text matching email pattern |
| **Phone** | `tel:` links, text matching phone pattern `(xxx) xxx-xxxx` |
| **Website** | The input URL itself |
| **Instagram** | Links containing `instagram.com/`, `@handle` patterns |
| **City/State** | Address text, schema.org `address`, footer content |
| **Portfolio images** | `og:image`, gallery section images, hero backgrounds, any high-res images |
| **Packages/Pricing** | Sections with "package", "pricing", "plan" headings; structured cards |
| **Services** | Lists under "services", "what we offer", "specialties" |
| **Testimonials** | Sections with "testimonial", "review", star ratings |
| **FAQs** | Accordion/toggle sections, "FAQ", "questions" headings |
| **Event types** | "Weddings", "Corporate", "Birthday" mentions |

### Category Detection Map

```
Photographer/Videographer → portfolio-heavy, "capture", "photo", "film", "lens"
Caterer → "catering", "menu", "cuisine", "food", "chef"
Venue → "venue", "capacity", "ballroom", "space", "estate"
DJ → "DJ", "music", "entertainment", "dance", "playlist"
Florist → "floral", "flowers", "bouquet", "arrangement"
Planner → "planning", "coordinator", "full-service planning"
Hair & Makeup → "makeup", "hair", "beauty", "bridal glam", "artist"
Photo Booth → "photo booth", "selfie", "props", "backdrop"
Transportation → "limo", "limousine", "car service", "transportation", "fleet"
Decor → "decor", "design", "styling", "centerpiece"
Bakery → "cake", "bakery", "pastry", "dessert"
Band → "band", "live music", "ensemble", "performer"
Bar Service → "bar", "cocktail", "bartender", "mixology"
Officiant → "officiant", "ceremony", "ordained", "minister"
Rentals → "rental", "tent", "chair", "table", "linen"
Jeweler → "jewel", "ring", "diamond", "custom band"
Bridal Salon → "bridal", "gown", "dress", "salon", "boutique"
```

### Color Extraction Priority

1. `<meta name="theme-color" content="#xxx">`
2. CSS custom properties: `--primary`, `--brand`, `--accent`, `--main-color`
3. Most frequent hex/rgb in inline `style` attributes (excluding #fff, #000, #333, grays)
4. Background color of header/nav elements
5. Color of primary buttons/CTAs
6. If all else fails, use the dominant color from the logo/hero image

---

## 4. STEP 2: THEME MATCH

**File:** `src/lib/themes.ts`

### 110 Pre-built Themes

Organized in categories:
- **Original (10):** dark-luxury, dark-burgundy, dark-navy, dark-emerald, dark-royal, light-elegant, light-blush, light-sage, light-coastal, custom
- **Monochromatic (11):** stormy-morning through burnt-sienna
- **Romantic (16):** blooming-romance through tuscan-sunset
- **Playful (13):** zesty-lemon through watermelon-splash
- **Vibrant (15):** alchemical-reaction through jewel-box
- **Neutral (16):** salt-and-pepper through spiced-mocha
- **Tranquil (17):** charming-seaside through eucalyptus-grove
- **Seasonal (12):** soft-spring through summer-breeze

### How to Match

```typescript
import { findClosestTheme, findTopThemes } from '@/lib/themes';

// Simple: get best match
const themeName = findClosestTheme('#c9944a'); // → 'golden-taupe'

// Advanced: get top 5, optionally filter by light/dark
const top5 = findTopThemes('#c9944a', 5, 'light');
```

### Mode Selection Logic

- If vendor's existing site has a dark background → prefer `'dark'` mode
- If light/white background → prefer `'light'` mode
- Wedding photographers, luxury venues → dark mode tends to look better
- Caterers, planners, florists → light mode often feels more inviting
- When in doubt, use light mode

---

## 5. STEP 3: SECTION SELECTION

### Available Sections

| Section ID | When to Activate |
|-----------|-----------------|
| `hero` | **ALWAYS** — every vendor gets a hero |
| `gallery` | When 3+ portfolio images found |
| `packages` | When pricing/package data found |
| `services_list` | When services/offerings are listed |
| `event_types` | When multiple event types mentioned |
| `testimonials` | When reviews/testimonials found |
| `faq` | When FAQ content found |
| `menu_accordion` | **Caterers only** — when menu categories found |
| `video_showcase` | When YouTube/Vimeo URLs found |
| `team_spotlight` | When team member bios found |
| `venue_details` | **Venues only** — capacity, amenities |
| `contact` | **ALWAYS** — every vendor gets contact |

### Default Section Order by Category

```typescript
const SECTION_DEFAULTS: Record<string, SectionId[]> = {
  'Photographer':     ['hero','gallery','packages','testimonials','faq','contact'],
  'Videographer':     ['hero','gallery','video_showcase','packages','testimonials','contact'],
  'Caterer':          ['hero','gallery','menu_accordion','packages','event_types','testimonials','faq','contact'],
  'Venue':            ['hero','gallery','venue_details','packages','event_types','testimonials','faq','contact'],
  'DJ':               ['hero','gallery','packages','event_types','testimonials','faq','contact'],
  'Florist':          ['hero','gallery','packages','services_list','testimonials','contact'],
  'Planner':          ['hero','services_list','packages','testimonials','faq','contact'],
  'Hair & Makeup':    ['hero','gallery','services_list','packages','testimonials','contact'],
  'Photo Booth':      ['hero','gallery','packages','event_types','faq','contact'],
  'Transportation':   ['hero','gallery','packages','event_types','faq','contact'],
  'Bakery':           ['hero','gallery','menu_accordion','packages','testimonials','contact'],
  'Band':             ['hero','gallery','video_showcase','packages','event_types','contact'],
  'Decor':            ['hero','gallery','services_list','packages','testimonials','contact'],
  'Bar Service':      ['hero','gallery','menu_accordion','packages','event_types','contact'],
  'Rentals':          ['hero','gallery','inventory_grid','packages','faq','contact'],
  'default':          ['hero','gallery','packages','services_list','testimonials','faq','contact'],
};
```

### Section Activation Rules

Only include a section in `active_sections` if there is actual content for it.
The `section_order` should list ALL potentially active sections in display order.
Empty sections won't render even if listed (components check for data).

---

## 6. STEP 4: DATA MAPPING

### Target Schema (Supabase `vendors` table)

```typescript
{
  // Required
  ref: string,              // slug: "joes-catering-a1b2" (lowercase, hyphens, + 4-char random suffix)
  business_name: string,
  category: VendorCategory,

  // Profile
  bio: string,
  contact_name: string,
  email: string,
  phone: string,
  website: string,
  instagram_handle: string,  // just the handle, no URL
  city: string,
  state: string,
  service_states: string[],  // ["NJ", "NY", "PA"]

  // Media
  photo_url: string,         // primary/logo image URL
  portfolio_images: string[], // array of image URLs

  // Theming
  theme_preset: string,      // theme name from THEME_LIBRARY
  brand_color: string,       // hex, e.g. "#c9944a"
  brand_color_secondary: string,

  // Sections
  active_sections: SectionId[],
  section_order: SectionId[],

  // Content
  hero_config: {
    headline: string,        // e.g. "Capturing Your Perfect Day"
    subheadline: string,
    badge: string,           // e.g. "Award-Winning Photography"
    backgroundImage: string,
    buttons: [
      { label: "View Packages", href: "#packages", variant: "primary" },
      { label: "Get in Touch", href: "#contact", variant: "secondary" }
    ],
    infoItems: [
      { icon: "📍", text: "Northern NJ" },
      { icon: "⭐", text: "5.0 Rating" }
    ]
  },
  pricing_packages: PricingPackage[],
  services_included: ServiceItem[],
  event_types: EventType[],
  testimonials: Testimonial[],
  faqs: FAQItem[],
  menu_categories: MenuCategory[],   // caterers/bakeries
  team_members: TeamMember[],
  venue_info: VenueInfo,             // venues only
  video_urls: string[],

  // System
  page_active: true,
  account_status: "active",
  goaffpro_referral_code: "",        // filled later during onboarding
  affiliate_link: "",
  page_password: "",
}
```

### Ref Generation

```typescript
function generateRef(businessName: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}
```

---

## 7. STEP 5: SUPABASE WRITE

### Connection

```
URL: https://pyjrnezwehagtnvhdjmq.supabase.co
Table: vendors
```

### API Route: `/api/create-vendor`

```typescript
// POST /api/create-vendor
// Body: { vendor: Vendor }
// Returns: { success: boolean, ref: string, url: string }
```

### Upsert Logic

If a vendor with the same `business_name` exists → update
Otherwise → insert new row

---

## 8. STEP 6: VERIFY

After creating the vendor, visit:
```
https://wetwo-vendors.vercel.app/vendor/[ref]
```

Check:
- [ ] Hero renders with correct brand color and business name
- [ ] Theme looks appropriate (colors, mode)
- [ ] Active sections are showing
- [ ] Package cards display properly
- [ ] Contact info is correct
- [ ] Images load
- [ ] Cashback banner shows

---

## 9. BUILDER UI

**Route:** `/builder`

Single-page interface with:
1. One URL input field
2. "Analyze" button → calls `/api/analyze-site`
3. Preview panel showing extracted data
4. Theme preview (top 3 matches)
5. Section toggles (pre-selected based on analysis)
6. "Create Vendor Page" button → calls `/api/create-vendor`
7. Success state with link to live page

---

## 10. MANUAL BUILD WORKFLOW (For Claude Sessions)

When David says "build a vendor page from [URL]", follow these steps:

1. **Fetch the URL** using `web_fetch` tool
2. **Parse the HTML** — extract all fields per Step 1
3. **Show David** the extracted data for confirmation
4. **Match theme** — suggest top 3 themes, let David pick
5. **Select sections** — suggest based on category, let David adjust
6. **Generate the vendor object** — complete JSON
7. **Write to Supabase** — via API or direct insert
8. **Verify** — check the live page

### Quick Command (paste in any Claude session)

```
Read /BUILDER.md in the wetwo-vendors repo for full instructions.
The theme library is in src/lib/themes.ts (110 themes).
The vendor schema is in src/lib/types.ts.
Supabase URL: https://pyjrnezwehagtnvhdjmq.supabase.co
Table: vendors
```

---

## 11. COMMON PATTERNS & DEFAULTS

### Default Event Types by Category

```typescript
const DEFAULT_EVENTS: Record<string, EventType[]> = {
  'DJ':              [{ icon: '💒', name: 'Weddings' }, { icon: '🎂', name: 'Birthdays' }, { icon: '🏢', name: 'Corporate' }, { icon: '🎓', name: 'Sweet 16s' }, { icon: '🎉', name: 'Private Parties' }],
  'Photographer':    [{ icon: '💒', name: 'Weddings' }, { icon: '👶', name: 'Maternity' }, { icon: '👨‍👩‍👧', name: 'Family' }, { icon: '🏢', name: 'Corporate' }, { icon: '💍', name: 'Engagements' }],
  'Caterer':         [{ icon: '💒', name: 'Weddings' }, { icon: '🏢', name: 'Corporate' }, { icon: '🎉', name: 'Private Events' }, { icon: '🎂', name: 'Celebrations' }, { icon: '🍽️', name: 'Galas' }],
  'Venue':           [{ icon: '💒', name: 'Weddings' }, { icon: '🏢', name: 'Corporate' }, { icon: '🎂', name: 'Social Events' }, { icon: '🎓', name: 'Milestone Events' }],
  'Florist':         [{ icon: '💒', name: 'Weddings' }, { icon: '🌸', name: 'Events' }, { icon: '💐', name: 'Sympathy' }, { icon: '🎉', name: 'Celebrations' }],
  'Photo Booth':     [{ icon: '💒', name: 'Weddings' }, { icon: '🎂', name: 'Birthdays' }, { icon: '🏢', name: 'Corporate' }, { icon: '🎓', name: 'Proms' }, { icon: '🎉', name: 'Parties' }],
  'Transportation':  [{ icon: '💒', name: 'Weddings' }, { icon: '🎓', name: 'Proms' }, { icon: '🏢', name: 'Corporate' }, { icon: '✈️', name: 'Airport' }, { icon: '🌃', name: 'Night Out' }],
  'default':         [{ icon: '💒', name: 'Weddings' }, { icon: '🏢', name: 'Corporate' }, { icon: '🎉', name: 'Private Events' }, { icon: '🎂', name: 'Celebrations' }],
};
```

### Default Hero Config Template

```typescript
function buildHeroConfig(vendor: Partial<Vendor>): HeroConfig {
  const name = vendor.business_name || 'Welcome';
  const category = vendor.category || 'Wedding Professional';
  const city = vendor.city || '';
  const state = vendor.state || '';
  const location = [city, state].filter(Boolean).join(', ');

  return {
    headline: name,
    subheadline: `Premium ${category} Services${location ? ` · ${location}` : ''}`,
    badge: `✦ ${category}`,
    backgroundImage: vendor.portfolio_images?.[0] || vendor.photo_url || '',
    buttons: [
      { label: 'View Packages', href: '#packages', variant: 'primary' },
      { label: 'Get in Touch', href: '#contact', variant: 'secondary' },
    ],
    infoItems: [
      ...(location ? [{ icon: '📍', text: location }] : []),
      { icon: '⭐', text: '5.0 Rating' },
    ],
  };
}
```

---

## 12. FILE PATHS REFERENCE

```
src/lib/types.ts          — All TypeScript interfaces
src/lib/themes.ts         — 110 themes + findClosestTheme + resolveTheme
src/lib/site-analyzer.ts  — HTML analysis & data extraction
src/app/builder/page.tsx  — Builder UI
src/app/api/analyze-site/route.ts  — Site analysis API
src/app/api/create-vendor/route.ts — Supabase vendor creation API
src/components/VendorPage.tsx      — Main vendor page component
src/components/sections/*.tsx      — All section components
src/app/globals.css                — All CSS styles
BUILDER.md                         — This file (master instructions)
```

---

*Last updated: 2026-02-05*
*Version: 1.0*
