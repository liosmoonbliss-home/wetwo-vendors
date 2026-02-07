import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let fetchUrl = url.trim();
    if (!fetchUrl.startsWith('http')) fetchUrl = 'https://' + fetchUrl;

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${response.status}` }, { status: 502 });
    }

    const html = await response.text();
    const title = extractTitle(html);
    const metaDescription = extractMetaDescription(html);
    const textContent = extractTextContent(html);
    const rawImages = extractImages(html, fetchUrl);
    const images = deduplicateImages(rawImages);
    const brandColors = extractBrandColors(html);
    const socialLinks = extractSocialLinks(html);
    const contactInfo = extractContactInfo(html);
    const structuredData = extractJsonLd(html);

    return NextResponse.json({
      success: true,
      data: {
        url: fetchUrl, title, metaDescription,
        textContent: textContent.slice(0, 10000),
        images, brandColors, socialLinks, contactInfo, structuredData,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scrape failed';
    console.error('Scrape error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function deduplicateImages(images: string[]): string[] {
  const baseMap = new Map<string, string[]>();
  for (const img of images) {
    try {
      const parsed = new URL(img);
      const base = parsed.origin + parsed.pathname;
      if (!baseMap.has(base)) baseMap.set(base, []);
      baseMap.get(base)!.push(img);
    } catch {
      baseMap.set(img, [img]);
    }
  }
  const deduped: string[] = [];
  for (const [, variants] of baseMap) {
    const best = variants.reduce((a, b) => {
      const aW = extractWidthParam(a);
      const bW = extractWidthParam(b);
      if (aW && bW) return aW > bW ? a : b;
      if (aW) return a;
      if (bW) return b;
      return a.length >= b.length ? a : b;
    });
    deduped.push(best);
  }
  return deduped;
}

function extractWidthParam(url: string): number | null {
  try {
    const parsed = new URL(url);
    const w = parsed.searchParams.get('w') || parsed.searchParams.get('width') || parsed.searchParams.get('size');
    if (w) { const n = parseInt(w, 10); return isNaN(n) ? null : n; }
    const pathMatch = url.match(/[/._-]w[_-]?(\d+)/i);
    if (pathMatch) return parseInt(pathMatch[1], 10);
    return null;
  } catch { return null; }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].trim()) : '';
}

function extractMetaDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  return match ? decodeEntities(match[1].trim()) : '';
}

function extractTextContent(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  text = text
    .replace(/cookie[s]?\s*(policy|consent|notice)/gi, '')
    .replace(/accept\s*all\s*cookies/gi, '')
    .replace(/privacy\s*policy/gi, '');
  return text;
}

function extractImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*/gi);
  for (const match of imgMatches) {
    const src = match[1];
    if (src.includes('1x1') || src.includes('pixel') || src.includes('.svg') || src.includes('.ico') || src.includes('data:image') || src.includes('facebook.com') || src.includes('google-analytics') || src.length < 10) continue;
    const widthAttr = match[0].match(/width=["']?(\d+)/i);
    if (widthAttr && parseInt(widthAttr[1], 10) < 80) continue;
    const heightAttr = match[0].match(/height=["']?(\d+)/i);
    if (heightAttr && parseInt(heightAttr[1], 10) < 80) continue;
    const resolved = resolveUrl(src, baseUrl);
    if (resolved && !seen.has(resolved)) { seen.add(resolved); images.push(resolved); }
  }

  const bgMatches = html.matchAll(/background(?:-image)?:\s*url\(['"]?([^'")\s]+)['"]?\)/gi);
  for (const match of bgMatches) {
    const resolved = resolveUrl(match[1], baseUrl);
    if (resolved && !seen.has(resolved)) { seen.add(resolved); images.push(resolved); }
  }

  const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogMatch) {
    const resolved = resolveUrl(ogMatch[1], baseUrl);
    if (resolved && !seen.has(resolved)) { seen.add(resolved); images.unshift(resolved); }
  }

  return images;
}

function extractBrandColors(html: string): string[] {
  const colors = new Set<string>();
  const themeMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["'](#[0-9a-fA-F]{3,8})["']/i);
  if (themeMatch) colors.add(themeMatch[1]);
  const cssVarMatches = html.matchAll(/--[a-zA-Z-]*(?:color|brand|primary|accent)[a-zA-Z-]*:\s*(#[0-9a-fA-F]{3,8})/gi);
  for (const match of cssVarMatches) { if (!isBoringColor(match[1])) colors.add(match[1]); }
  return [...colors].slice(0, 6);
}

function extractSocialLinks(html: string): Record<string, string> {
  const social: Record<string, string> = {};
  const patterns: [string, RegExp][] = [
    ['instagram', /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._]+/i],
    ['facebook', /https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9.]+/i],
    ['tiktok', /https?:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9._]+/i],
    ['youtube', /https?:\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|c\/)[a-zA-Z0-9._-]+/i],
    ['twitter', /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+/i],
    ['pinterest', /https?:\/\/(?:www\.)?pinterest\.com\/[a-zA-Z0-9._]+/i],
  ];
  for (const [platform, regex] of patterns) {
    const match = html.match(regex);
    if (match) social[platform] = match[0];
  }
  return social;
}

function extractContactInfo(html: string): Record<string, string> {
  const info: Record<string, string> = {};
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) info.email = emailMatch[0];
  const phoneMatch = html.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
  if (phoneMatch) info.phone = phoneMatch[0];
  const addressMatch = html.match(/\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+)*,?\s+[A-Za-z]+,?\s+[A-Z]{2}\s+\d{5}/);
  if (addressMatch) info.address = addressMatch[0];
  return info;
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const match = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function resolveUrl(src: string, baseUrl: string): string | null {
  try {
    if (src.startsWith('//')) return 'https:' + src;
    if (src.startsWith('http')) return src;
    const base = new URL(baseUrl);
    return new URL(src, base.origin).href;
  } catch { return null; }
}

function isBoringColor(hex: string): boolean {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (r > 230 && g > 230 && b > 230) return true;
  if (r < 30 && g < 30 && b < 30) return true;
  if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) return true;
  return false;
}

function decodeEntities(str: string): string {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}