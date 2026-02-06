import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WeTwo Vendor Builder/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    const result = {
      url: normalizedUrl,
      title: extractTitle(html),
      metaDescription: extractMeta(html, 'description'),
      ogImage: extractMeta(html, 'og:image'),
      textContent: extractTextContent(html),
      images: extractImages(html, normalizedUrl),
      brandColors: extractBrandColors(html),
      socialLinks: extractSocialLinks(html),
      contactInfo: extractContactInfo(html),
      structuredData: extractJsonLd(html),
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scrape failed';
    console.error('Scrape error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].trim()) : '';
}

function extractMeta(html: string, name: string): string {
  const propMatch = html.match(
    new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')
  );
  if (propMatch) return propMatch[1];

  const nameMatch = html.match(
    new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')
  );
  if (nameMatch) return nameMatch[1];

  const revMatch = html.match(
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i')
  );
  return revMatch ? revMatch[1] : '';
}

function extractTextContent(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  text = text
    .replace(/<\/?(h[1-6]|p|div|section|article|li|br|tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#?\w+;/g, ' ');

  text = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 2)
    .join('\n');

  return text.slice(0, 8000);
}

function extractImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const ogImage = extractMeta(html, 'og:image');
  if (ogImage) {
    const resolved = resolveUrl(ogImage, baseUrl);
    if (resolved) { images.push(resolved); seen.add(resolved); }
  }

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.includes('1x1') || src.includes('pixel') || src.includes('favicon') ||
        src.includes('.svg') || src.includes('data:image') || src.includes('gravatar')) continue;
    const resolved = resolveUrl(src, baseUrl);
    if (resolved && !seen.has(resolved)) { images.push(resolved); seen.add(resolved); }
  }

  const bgRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    const resolved = resolveUrl(match[1], baseUrl);
    if (resolved && !seen.has(resolved)) { images.push(resolved); seen.add(resolved); }
  }

  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const sources = match[1].split(',');
    for (const source of sources) {
      const srcUrl = source.trim().split(/\s+/)[0];
      if (srcUrl) {
        const resolved = resolveUrl(srcUrl, baseUrl);
        if (resolved && !seen.has(resolved)) { images.push(resolved); seen.add(resolved); }
      }
    }
  }

  return images.slice(0, 30);
}

function extractBrandColors(html: string): string[] {
  const colors = new Set<string>();

  const themeColor = extractMeta(html, 'theme-color');
  if (themeColor) colors.add(themeColor);

  const hexRegex = /#([0-9a-fA-F]{6})\b/g;
  let match;
  const styleContent = html.match(/<style[\s\S]*?<\/style>/gi) || [];
  const styleText = styleContent.join(' ');

  while ((match = hexRegex.exec(styleText)) !== null) {
    const hex = `#${match[1]}`;
    if (!isBoringColor(hex)) colors.add(hex);
  }

  return Array.from(colors).slice(0, 5);
}

function extractSocialLinks(html: string): Record<string, string> {
  const social: Record<string, string> = {};
  const patterns: [string, RegExp][] = [
    ['instagram', /https?:\/\/(www\.)?instagram\.com\/[^\s"'<>]+/gi],
    ['facebook', /https?:\/\/(www\.)?facebook\.com\/[^\s"'<>]+/gi],
    ['tiktok', /https?:\/\/(www\.)?tiktok\.com\/@[^\s"'<>]+/gi],
    ['youtube', /https?:\/\/(www\.)?youtube\.com\/[^\s"'<>]+/gi],
    ['pinterest', /https?:\/\/(www\.)?pinterest\.com\/[^\s"'<>]+/gi],
    ['twitter', /https?:\/\/(www\.)?(twitter|x)\.com\/[^\s"'<>]+/gi],
  ];

  for (const [name, regex] of patterns) {
    const match = html.match(regex);
    if (match) social[name] = match[0].replace(/["'<>]/g, '');
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
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (r > 230 && g > 230 && b > 230) return true;
  if (r < 30 && g < 30 && b < 30) return true;
  if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) return true;
  return false;
}

function decodeEntities(str: string): string {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}