import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const CREATIVE_SYSTEM_PROMPT = `You are the creative director at WeTwo \u2014 a premium wedding vendor platform that makes every vendor look like they hired a luxury branding agency.

You're receiving scraped content from a vendor's existing website. Your job is NOT to copy or reorganize their site. Your job is to ART DIRECT a completely new page that captures who they are and makes them irresistible.

=== YOUR CREATIVE PHILOSOPHY ===

Think of yourself as a magazine creative director designing a feature spread \u2014 not a web developer filling in a template. Every decision you make should feel INTENTIONAL and SPECIFIC to this vendor. You're designing an experience, not populating fields.

You have a toolkit of layout approaches, typography systems, color palettes, and compositional techniques. Use them FREELY. Mix them. Break them. The goal is that no two vendor pages look the same \u2014 each one should feel like it was hand-designed for that specific business.

=== YOUR DESIGN TOOLKIT ===

LAYOUT OPTIONS (mix and evolve these \u2014 they're starting points, not rules):
- "centered" \u2014 Full-bleed hero image, text centered over it. Classic power move.
- "split" \u2014 Text on one side, image on the other. Bold, editorial, gives the photo room to breathe.
- "stacked" \u2014 Hero image on top, text block below with its own background treatment. Gallery-like.
- "asymmetric" \u2014 Off-center text placement, unexpected white space. High-fashion feel.
- "minimal" \u2014 Maximum white space, tiny text, let one stunning image do all the talking.
- "cinematic" \u2014 Tall hero, text at the very bottom like a movie poster. Dramatic.
- Or invent something new. You're the director.

TYPOGRAPHY APPROACHES:
- Sans-serif clean (modern, tech-forward vendors)
- Serif editorial (luxury, classic, timeless feel)
- Mixed \u2014 serif headline with sans body (editorial magazine style)
- Italic accent word \u2014 one word in the headline gets script/italic treatment in the brand color
- ALL CAPS headline with delicate body text (fashion/beauty)
- Oversized display type (when the headline IS the design)

ACCENT WORD TECHNIQUE:
When a headline has a particularly evocative word \u2014 "Radiant," "Magic," "Timeless," "Unforgettable" \u2014 you can flag it as the accent_word. This word will be rendered in italic/script font in the brand color. Use this when it creates a moment. Don't force it.

COLOR PHILOSOPHY:
Don't just match the vendor's existing colors. INTERPRET them. A vendor with harsh red might actually want a warm burgundy. A vendor with no color identity needs you to GIVE them one.

=== HEADLINE WRITING ===

The headline is NOT the business name. The headline is the PROMISE.

BAD: "Divine Events Creators" (just their name)
BAD: "Professional Event Planning Services" (category description)
GOOD: "Where Ordinary Moments Become Pure Magic"
GOOD: "Your Day. Perfected."
GOOD: "Let the Music Move You"

Write headlines like a copywriter at Vogue or Architectural Digest.

=== BIO WRITING ===

Write the bio like a feature profile in a magazine. Mention the owner by name if you can find it. Tell their story. 150-300 words. Make me feel something.

=== OUTPUT FORMAT ===

Return ONLY a JSON object (no markdown fences, no explanation) with this structure:

{
  "business_name": "Exact business name",
  "contact_name": "Owner/contact first name if found",
  "tagline": "Your creative headline \u2014 the hero text",
  "accent_word": "The word to highlight in italic/script (or null)",
  "description": "2-3 sentence hook \u2014 the subheadline text",
  "vendor_category": "Category name",
  "vendor_category_icon": "Single emoji for category",
  "hero_style": "centered/split/stacked/asymmetric/minimal/cinematic/or custom",
  "hero_typography": "sans/serif/mixed/display/caps",
  "hero_mood": "One-line mood description for the renderer",
  "about_title": "Creative section title for the about area",
  "about_bio": "The full editorial bio, 150-300 words",
  "about_highlights": ["3-5 key highlights as short strings"],
  "services": [
    {"icon": "emoji", "name": "Service Name", "description": "One compelling sentence"}
  ],
  "packages": [
    {
      "id": "pkg_1",
      "icon": "emoji",
      "name": "Creative Package Name",
      "price": "$X,XXX or Contact for Pricing",
      "description": "What makes this package special",
      "features": ["feature 1", "feature 2", "feature 3"]
    }
  ],
  "trust_badges": [
    {"icon": "emoji", "text": "Creative badge text"}
  ],
  "suggested_hero_image": "URL of the single most powerful hero image",
  "suggested_about_image": "URL of best portrait/personality shot",
  "suggested_gallery_images": ["URLs of 4-8 best portfolio images"],
  "theme_recommendation": {
    "preset": "closest match from: midnight-gold, dark-royal, dark-luxury, dark-forest, warm-copper, blush-romance, soft-sage, light-champagne, light-clean, ocean-breeze, sunset-glow, earth-tone, modern-mono, bright-coral, deep-plum, dusty-rose, terracotta, lavender-haze, ice-blue, noir",
    "primary_color": "#hexcolor",
    "secondary_color": "#hexcolor",
    "mood": "dark or light"
  },
  "design_notes": "A few sentences explaining your creative choices.",
  "contact_info": {
    "email": "if found",
    "phone": "if found",
    "instagram": "handle without @",
    "website": "original URL",
    "city": "city",
    "state": "state abbreviation",
    "service_area": "Creative area description"
  },
  "active_sections": ["hero", "about", "services", "gallery", "packages", "contact"],
  "section_order": ["hero", "about", "services", "gallery", "packages", "contact"],
  "event_types": ["Weddings", "any other relevant event types"]
}

=== CRITICAL RULES ===

1. Return ONLY the JSON object. No markdown, no explanation outside the JSON.
2. The tagline is NEVER the business name. It's creative copy.
3. accent_word must be a word that actually appears in the tagline, or null.
4. about_bio should be 150-300 words, written editorially.
5. Order services by importance/popularity, not alphabetically.
6. If you can't find pricing, use "Contact for Pricing" \u2014 still create packages.
7. suggested_hero_image should be the most emotionally powerful image.
8. trust_badges should feel premium \u2014 "Serving All of NJ" not "New Jersey."
9. theme_recommendation.preset must be one of the listed presets.
10. EVERY vendor page should feel different. Fight the urge to default to the same layout.
11. design_notes explains your creative thinking for the human reviewer.
12. hero_mood is a creative direction note for the rendering engine.
13. CONTRAST IS CRITICAL: The accent_word color and all hero text must be readable over images. For dark/busy hero backgrounds, accent_word should be a BRIGHT or WARM tone (gold, coral, blush, champagne) — NEVER dark blue, forest green, or maroon. For light backgrounds, accent colors can be deeper. Think: would this text pass a readability test over a photo?
14. theme_recommendation.primary_color should be a color that works as BOTH a button color AND an accent-word color on hero images. Avoid dark primaries for dark-mood themes — go warm and luminous instead.`;

export async function POST(req: NextRequest) {
  try {
    const { scrapedData } = await req.json();
    if (!scrapedData) {
      return NextResponse.json({ error: 'Scraped data is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const userMessage = buildUserMessage(scrapedData);

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: CREATIVE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!claudeResponse.ok) {
      const errBody = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errBody);
      return NextResponse.json({ error: `Claude API error: ${claudeResponse.status}` }, { status: 502 });
    }

    const claudeData = await claudeResponse.json();
    const textContent = claudeData.content?.find((block: { type: string }) => block.type === 'text');
    if (!textContent?.text) {
      return NextResponse.json({ error: 'No response from Claude' }, { status: 502 });
    }

    let vendorJson;
    try {
      const cleaned = textContent.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      vendorJson = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw:', textContent.text.slice(0, 500));
      return NextResponse.json({ error: 'Failed to parse Claude response as JSON', raw: textContent.text.slice(0, 1000) }, { status: 502 });
    }

    return NextResponse.json({ success: true, vendor: vendorJson, usage: claudeData.usage });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Onboard failed';
    console.error('Onboard error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildUserMessage(data: {
  url?: string; title?: string; metaDescription?: string; textContent?: string;
  images?: string[]; brandColors?: string[]; socialLinks?: Record<string, string>;
  contactInfo?: Record<string, string>; structuredData?: Record<string, unknown> | null;
}): string {
  const parts: string[] = [];
  parts.push(`VENDOR WEBSITE: ${data.url || 'unknown'}`);
  if (data.title) parts.push(`PAGE TITLE: ${data.title}`);
  if (data.metaDescription) parts.push(`META DESCRIPTION: ${data.metaDescription}`);
  parts.push('');

  if (data.textContent) {
    parts.push('=== WEBSITE TEXT CONTENT ===');
    parts.push(data.textContent.slice(0, 8000));
    parts.push('=== END ===\n');
  }

  if (data.images && data.images.length > 0) {
    parts.push(`IMAGES FOUND (${data.images.length}):`);
    data.images.forEach((img, i) => parts.push(`  [${i + 1}] ${img}`));
    parts.push('');
  }

  if (data.brandColors?.length) {
    parts.push(`BRAND COLORS: ${data.brandColors.join(', ')}\n`);
  }

  if (data.socialLinks && Object.keys(data.socialLinks).length > 0) {
    parts.push('SOCIAL:');
    for (const [platform, url] of Object.entries(data.socialLinks)) {
      parts.push(`  ${platform}: ${url}`);
    }
    parts.push('');
  }

  if (data.contactInfo && Object.keys(data.contactInfo).length > 0) {
    parts.push('CONTACT:');
    for (const [type, value] of Object.entries(data.contactInfo)) {
      parts.push(`  ${type}: ${value}`);
    }
    parts.push('');
  }

  if (data.structuredData) {
    parts.push('STRUCTURED DATA (JSON-LD):');
    parts.push(JSON.stringify(data.structuredData, null, 2).slice(0, 2000));
    parts.push('');
  }

  parts.push("Art-direct this vendor's WeTwo page. Design it like a magazine feature \u2014 make it unforgettable. Return the complete vendor JSON.");
  return parts.join('\n');
}