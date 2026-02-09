import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 });
  }

  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
  const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    // Return defaults if Shopify not configured
    return NextResponse.json({ 
      success: true, 
      itemCount: 57, 
      totalValue: 9850, 
      source: 'default' 
    });
  }

  try {
    const collectionHandle = `registry-${slug}`;
    
    // Step 1: Get collection ID by handle
    const collectionsRes = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/custom_collections.json?handle=${collectionHandle}`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!collectionsRes.ok) {
      console.error('Shopify collections fetch failed:', collectionsRes.status);
      return NextResponse.json({ success: true, itemCount: 0, totalValue: 0, source: 'error' });
    }

    const collectionsData = await collectionsRes.json();
    const collection = collectionsData.custom_collections?.[0];

    if (!collection) {
      return NextResponse.json({ success: true, itemCount: 0, totalValue: 0, source: 'not_found' });
    }

    // Step 2: Get products in collection via collects
    const collectsRes = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/collects.json?collection_id=${collection.id}&limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    const collectsData = await collectsRes.json();
    const collects = collectsData.collects || [];
    const itemCount = collects.length;

    if (itemCount === 0) {
      return NextResponse.json({ success: true, itemCount: 0, totalValue: 0, source: 'empty' });
    }

    // Step 3: Get product prices (batch by 50)
    let totalValue = 0;
    const productIds = collects.map((c: any) => c.product_id);
    
    for (let i = 0; i < productIds.length; i += 50) {
      const batch = productIds.slice(i, i + 50);
      const idsParam = batch.join(',');
      
      const productsRes = await fetch(
        `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json?ids=${idsParam}&fields=id,variants`,
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        for (const product of productsData.products || []) {
          const price = parseFloat(product.variants?.[0]?.price || '0');
          totalValue += price;
        }
      }
    }

    return NextResponse.json({
      success: true,
      itemCount,
      totalValue: Math.round(totalValue),
      source: 'shopify',
    });
  } catch (err) {
    console.error('Registry stats error:', err);
    return NextResponse.json({ success: true, itemCount: 0, totalValue: 0, source: 'error' });
  }
}
