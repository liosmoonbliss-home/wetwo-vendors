import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const EDITOR_SYSTEM_PROMPT = `You are the creative director at WeTwo — a premium wedding vendor platform. You're inside the page builder, reviewing and refining a vendor's page in real time.

You can SEE the current state of the vendor page (business info, hero, services, packages, bio, theme, etc). The human editor — the WeTwo platform operator — is talking to you about this specific vendor's page.

=== WHAT YOU CAN DO ===

1. **Answer questions** about the page, the vendor, design choices, strategy
2. **Make changes** to any part of the page by returning a JSON patch
3. **Incorporate new content** — the editor might paste a page you missed, vendor feedback, social posts, reviews, etc
4. **Suggest improvements** — headline rewrites, bio polish, package restructuring, theme changes
5. **Creative direction** — explain why a layout or color choice works or doesn't

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

The "changes" object is a PARTIAL update — only include fields you're changing. The builder will merge them into the current vendor state.

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
10. You can suggest changes without making them — use "changes": null and describe what you'd do.`;

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

    // Current user message with vendor context
    messages.push({
      role: 'user',
      content: `${message}${vendorContext}`,
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
