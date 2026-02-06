import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const CREATIVE_SYSTEM_PROMPT = `You are the creative director for WeTwo, a premium wedding vendor platform. You are receiving scraped content from a wedding vendor's existing website. Your job is to build them a stunning vendor page — not by copying their site, but by reimagining it through the lens of a luxury editorial brand.

Think of yourself as a creative agency hired to redesign this vendor's web presence. You have access to a flexible template system with multiple hero styles, color themes, and section layouts. Your job is to make CREATIVE DECISIONS, not just extract data.

## Your Creative Process

### 1. READ THE ROOM — Understand the brand
Before extracting a single field, absorb the vendor's identity:
- What is the EMOTIONAL TONE of their brand? (Elegant? Fun? Edgy? Warm? Luxurious? Playful?)
- What is their IDEAL CLIENT? (Budget bride? Luxury couple? Corporate event planners? South Asian weddings?)
- What WORDS do they use about themselves?
- What is their VISUAL LANGUAGE? (Dark and moody? Bright and airy? Gold and ornate? Clean and minimal?)
- What is the ONE THING that makes them different?

### 2. ART DIRECT THE HERO — Don't just name, HEADLINE
Do NOT just put the business name as the headline. Create a TAGLINE/HEADLINE that captures the vendor's essence:
- "You Are Welcome Here" (inclusive venue)
- "Feel Radiant on Your Big Day" (makeup artist)
- "The Original Selfie Booth" (photo booth company)
- "Where Every Detail Tells Your Story" (planner)

Pick an ACCENT WORD — one word from the headline that carries the most emotional weight, to be rendered in italic/script in the brand color.

Choose the HERO STYLE based on brand personality:
- "classic" — Clean & modern. Safe default.
- "editorial" — Centered + italic accent word. Most versatile.
- "grand" — All serif, italic accent. Venues, luxury, churches. Established brands.
- "split" — Text left, image right. Photo booths, DJs, bold brands.
- "split-editorial" — Split + script accent. Beauty, florists, bakers, feminine/creative energy.
- "minimal" — Understated luxury. "Less is more" brands.

### 3. WRITE EDITORIAL COPY
- Description: Write TO the couple, not ABOUT the vendor. 2-3 sentences.
- About title: A quote or tagline, not "About Us". Use quotes around it.
- About bio: Warm, editorial, magazine-quality. Mention the owner by name if found.
- Service descriptions: Each should sell, not just name the service.

### 4. CRAFT TRUST BADGES
2-3 pills for the hero bottom. Be creative:
- Not "New Jersey" → "Serving All of NJ"
- Not "5 stars" → "80+ 5-Star Reviews"
- Not "10 years" → "A Decade of Dream Weddings"
- Include real awards, certifications, differentiators.

### 5. COLOR & THEME
Look at brand colors found in the scrape. Recommend the closest WeTwo theme:
dark-luxury, dark-burgundy, dark-navy, dark-emerald, dark-royal,
light-elegant, light-blush, light-sage, light-coastal,
stormy-morning, mossy-hollow, blue-eclipse, lush-forest,
green-juice, chili-spice, chocolate-truffle, ink-wash,
golden-taupe, wisteria-bloom, custom

If custom, provide the hex color.

## OUTPUT FORMAT

Return ONLY valid JSON (no markdown, no backticks, no commentary outside the JSON). Use this exact structure:

{
  "creative_notes": "Brief explanation of your art direction choices (2-3 sentences)",
  "business_name": "Exact Business Name",
  "tagline": "Your Creative Headline (the big hero text)",
  "accent_word": "TheWord",
  "hero_style": "editorial",
  "description": "2-3 sentence editorial description for the hero area",
  "vendor_category": "Category Name",
  "vendor_category_icon": "emoji",
  "recommended_theme": "theme-id",
  "custom_brand_color": "#hex or null",
  "trust_badges": [
    { "icon": "emoji", "text": "Badge text" }
  ],
  "about_title": "Editorial About Section Title",
  "about_bio": "3-4 paragraph editorial bio. Use the owner's name. Write like a wedding magazine.",
  "about_highlights": [
    { "icon": "emoji", "name": "Highlight Name", "description": "Brief description" }
  ],
  "services": [
    { "icon": "emoji", "name": "Service Name", "description": "Selling description of the service" }
  ],
  "packages": [
    { "name": "Package Name", "price": "$X,XXX", "description": "What's included", "features": ["feature 1", "feature 2"] }
  ],
  "event_types": [
    { "icon": "emoji", "name": "Event Type" }
  ],
  "contact_info": {
    "phone": "number or null",
    "email": "email or null",
    "instagram": "@handle or null",
    "address": "address or null",
    "hours": "hours string or null"
  },
  "suggested_hero_image": "URL of the best hero image from the scraped images",
  "suggested_about_image": "URL of the best about/portrait image",
  "suggested_gallery_images": ["URL1", "URL2", "up to 9"],
  "menu_categories": [
    { "name": "Category", "subtitle": "Description", "items": [] }
  ]
}

RULES:
- Return ONLY the JSON object. No markdown fences. No extra text.
- Every string field must have a value (use null only where indicated).
- The tagline should NOT be the business name — it should be a creative headline.
- accent_word must be a word that appears in the tagline.
- about_bio should be 150-300 words, written editorially.
- services should be ordered by importance/popularity, not alphabetically.
- If you can't find packages/pricing, still create the packages array but leave price as "Contact for Pricing".
- suggested_hero_image should be the most emotionally impactful image.
- suggested_about_image should ideally be a portrait/headshot of the owner.
- menu_categories can be empty array if not applicable.`;

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

    const textContent = claudeData.content?.find(
      (block: { type: string }) => block.type === 'text'
    );

    if (!textContent?.text) {
      return NextResponse.json({ error: 'No response from Claude' }, { status: 502 });
    }

    let vendorJson;
    try {
      const cleaned = textContent.text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      vendorJson = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', textContent.text.slice(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse Claude response as JSON', raw: textContent.text.slice(0, 1000) },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, vendor: vendorJson, usage: claudeData.usage });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Onboard failed';
    console.error('Onboard error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildUserMessage(data: {
  url?: string;
  title?: string;
  metaDescription?: string;
  textContent?: string;
  images?: string[];
  brandColors?: string[];
  socialLinks?: Record<string, string>;
  contactInfo?: Record<string, string>;
  structuredData?: Record<string, unknown> | null;
}): string {
  const parts: string[] = [];

  parts.push(`VENDOR WEBSITE URL: ${data.url || 'unknown'}`);
  parts.push('');

  if (data.title) parts.push(`PAGE TITLE: ${data.title}`);
  if (data.metaDescription) parts.push(`META DESCRIPTION: ${data.metaDescription}`);
  parts.push('');

  if (data.textContent) {
    parts.push('=== WEBSITE TEXT CONTENT ===');
    parts.push(data.textContent);
    parts.push('=== END WEBSITE TEXT ===');
    parts.push('');
  }

  if (data.images && data.images.length > 0) {
    parts.push(`IMAGES FOUND (${data.images.length} total):`);
    data.images.forEach((img, i) => parts.push(`  [${i + 1}] ${img}`));
    parts.push('');
  }

  if (data.brandColors && data.brandColors.length > 0) {
    parts.push(`DETECTED BRAND COLORS: ${data.brandColors.join(', ')}`);
    parts.push('');
  }

  if (data.socialLinks && Object.keys(data.socialLinks).length > 0) {
    parts.push('SOCIAL MEDIA LINKS:');
    for (const [platform, url] of Object.entries(data.socialLinks)) {
      parts.push(`  ${platform}: ${url}`);
    }
    parts.push('');
  }

  if (data.contactInfo && Object.keys(data.contactInfo).length > 0) {
    parts.push('CONTACT INFO FOUND:');
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

  parts.push("Please art-direct this vendor's WeTwo page. Return the complete vendor JSON.");

  return parts.join('\n');
}