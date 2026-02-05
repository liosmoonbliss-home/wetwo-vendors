import { NextRequest, NextResponse } from 'next/server';
import { analyzeHTML } from '@/lib/site-analyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, html } = body;

    if (!url && !html) {
      return NextResponse.json({ error: 'Provide either url or html' }, { status: 400 });
    }

    let pageHtml = html;

    // If URL provided, fetch the page
    if (url && !html) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WeTwo-Builder/1.0)',
            'Accept': 'text/html',
          },
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) {
          return NextResponse.json({ error: `Failed to fetch URL: ${response.status}` }, { status: 400 });
        }
        pageHtml = await response.text();
      } catch (fetchErr) {
        return NextResponse.json({
          error: 'Could not fetch URL. You can paste the HTML directly instead.',
          details: String(fetchErr),
        }, { status: 400 });
      }
    }

    const result = analyzeHTML(pageHtml, url || '');

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
