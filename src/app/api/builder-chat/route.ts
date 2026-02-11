import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ── URL detection + fetch ────────────────────────────────────
const URL_REGEX = /https?:\/\/[^\s"'<>)\]]+/gi;

async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WeTwo-Builder/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) return null;
    const html = await res.text();
    // Strip scripts/styles to save tokens, keep meaningful content
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    // Cap at ~30k chars to leave room in context window
    return cleaned.slice(0, 30000);
  } catch {
    return null;
  }
}

async function extractImageUrls(html: string, baseUrl: string): Promise<string[]> {
  const imgs: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];
    if (src.startsWith('//')) src = 'https:' + src;
    else if (src.startsWith('/')) {
      try {
        const u = new URL(baseUrl);
        src = u.origin + src;
      } catch { continue; }
    }
    if (src.startsWith('http') && !src.includes('data:') && !src.includes('.svg')) {
      imgs.push(src);
    }
  }
  // Also grab background-image URLs
  const bgRegex = /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    let src = match[1];
    if (src.startsWith('//')) src = 'https:' + src;
    else if (src.startsWith('/')) {
      try {
        const u = new URL(baseUrl);
        src = u.origin + src;
      } catch { continue; }
    }
    if (src.startsWith('http') && !src.includes('data:')) {
      imgs.push(src);
    }
  }
  // Deduplicate
  return [...new Set(imgs)];
}

const EDITOR_SYSTEM_PROMPT = `You are the creative director at WeTwo — a premium wedding vendor platform. You're inside the page builder, reviewing and refining a vendor's page in real time.

You can SEE the current state of the vendor page (business info, hero, services, packages, bio, theme, etc). The human editor — the WeTwo platform operator — is talking to you about this specific vendor's page.

=== WHAT YOU CAN DO ===

1. **Answer questions** about the page, the vendor, design choices, strategy
2. **Make changes** to any part of the page by returning a JSON patch
3. **Incorporate new content** — the editor might paste a page you missed, vendor feedback, social posts, reviews, etc
4. **Suggest improvements** — headline rewrites, bio polish, package restructuring, theme changes
5. **Creative direction** — explain why a layout or color choice works or doesn't
6. **Fetch web content** — when the editor shares a URL, you can see the fetched HTML and any images found on that page. Use this to extract gallery images, content, bios, services, etc.

=== HOW TO RESPOND ===

Always respond with a JSON object (no markdown fences):

{
  "message": "Your conversational response to the editor. Be concise, creative, and direct.",
  "changes": null
}

OR, when making changes:

{
  "message": "Here's what I changed and why...",
  "changes": {
    "bio": "New bio text...",
    "hero_config": { "headline": "New headline", "accentWord": "word" },
    "pricing_packages": [...],
    "services_included": [...],
    "theme_preset": "evening-rose",
    "brand_color": "#c47080",
    "brand_color_secondary": "#d4808a",
    "any_other_vendor_field": "new value"
  }
}

OR, when adding images to the gallery:

{
  "message": "Found some beautiful shots! Here are the best ones I'd add to the gallery...",
  "changes": {
    "gallery_images_append": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
  }
}

The "changes" object is a PARTIAL update — only include fields you're changing. The builder will merge them into the current vendor state.

=== WORKING WITH FETCHED WEB CONTENT ===

When the system provides fetched HTML and image lists from a URL:
- Examine the images and pick the best ones for the vendor's gallery (look for portfolio shots, event photos, high-quality work samples)
- Skip logos, icons, tiny thumbnails, social media badges, and stock photos
- Prefer images that are large, high-quality, and showcase the vendor's actual work
- When adding gallery images, use "gallery_images_append" in changes to ADD to existing gallery (don't replace)
- You can also extract text content like bios, service descriptions, testimonials, etc.

=== RULES ===

1. Return ONLY the JSON object. No markdown fences.
2. "changes" is null when you're just talking, or a partial vendor object when making edits.
3. When rewriting copy (bio, headlines, packages), maintain the editorial magazine-quality standard.
4. When the editor pastes raw content, extract the useful info and propose how to incorporate it.
5. Be opinionated. You're the creative director. If something could be better, say so.
6. Keep "message" concise — 1-3 sentences unless explaining a complex change.
7. For theme changes, use real theme names from the WeTwo library or describe the mood.
8. For hero_config changes, remember: headline is the PROMISE (never the business name), accent_word must appear in the headline.
9. When asked to adjust based on vendor feedback, balance their preferences with good design.
10. You can suggest changes without making them — use "changes": null and describe what you'd do.
11. When a URL is provided with fetched content, USE IT. Don't say you can't access URLs — the system has already fetched the page for you.`;

export async function POST(req: NextRequest) {
  try {
    const { message, vendorState, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    // ── Detect URLs and fetch them ───────────────────────────
    const urls = message.match(URL_REGEX) || [];
    let fetchedContent = '';

    if (urls.length > 0) {
      const fetches = await Promise.all(
        urls.slice(0, 3).map(async (url: string) => {
          const html = await fetchUrlContent(url);
          if (!html) return null;
          const images = await extractImageUrls(html, url);
          return { url, html, images };
        })
      );

      const successful = fetches.filter(Boolean);
      if (successful.length > 0) {
        fetchedContent = '\n\n=== FETCHED WEB CONTENT ===\n';
        for (const result of successful) {
          if (!result) continue;
          fetchedContent += `\n--- URL: ${result.url} ---\n`;
          fetchedContent += `IMAGES FOUND (${result.images.length}):\n`;
          result.images.forEach((img, i) => {
            fetchedContent += `  ${i + 1}. ${img}\n`;
          });
          // Include a trimmed version of the HTML for text extraction
          const textHtml = result.html.slice(0, 15000);
          fetchedContent += `\nPAGE CONTENT (trimmed):\n${textHtml}\n`;
        }
        fetchedContent += '\n=== END FETCHED CONTENT ===\n';
      }
    }

    // Build the conversation context
    const vendorContext = vendorState
      ? `\n\n=== CURRENT VENDOR PAGE STATE ===\n${JSON.stringify(vendorState, null, 2)}\n=== END STATE ===`
      : '';

    // Build message history for multi-turn
    const messages: Array<{ role: string; content: string }> = [];

    // Include prior turns if available (keep last 10 for context window)
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const turn of recentHistory) {
        messages.push({ role: turn.role, content: turn.content });
      }
    }

    // Current user message with vendor context + fetched content
    messages.push({
      role: 'user',
      content: `${message}${fetchedContent}${vendorContext}`,
    });

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
        system: EDITOR_SYSTEM_PROMPT,
        messages,
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

    // Parse Claude's response
    let parsed;
    try {
      const cleaned = textContent.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, treat the whole response as a message
      parsed = { message: textContent.text, changes: null };
    }

    return NextResponse.json({
      success: true,
      message: parsed.message || '',
      changes: parsed.changes || null,
      usage: claudeData.usage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Builder chat failed';
    console.error('Builder chat error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
