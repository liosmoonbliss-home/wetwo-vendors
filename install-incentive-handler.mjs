#!/usr/bin/env node
/**
 * WeTwo — Install Incentive Handler into Shopify Theme
 * Run from codespace: node install-incentive-handler.mjs
 * 
 * Requires env vars:
 *   SHOPIFY_ADMIN_API_ACCESS_TOKEN
 * 
 * What it does:
 *   1. Finds the "WeTwo - White Label Dev" theme
 *   2. Creates snippets/wt-incentive-handler.liquid
 *   3. Reads layout/theme.liquid
 *   4. Inserts {% render 'wt-incentive-handler' %} after the branding engine
 *   5. Shows you the diff before writing
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const SHOP = 'bb0sam-tz.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('❌ Missing SHOPIFY_ADMIN_API_ACCESS_TOKEN in environment');
  process.exit(1);
}

const headers = {
  'X-Shopify-Access-Token': TOKEN,
  'Content-Type': 'application/json',
};

async function shopifyGet(path) {
  const res = await fetch(`https://${SHOP}/admin/api/2024-01/${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function shopifyPut(path, body) {
  const res = await fetch(`https://${SHOP}/admin/api/2024-01/${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

// ============================================================
// STEP 1: Find the dev theme
// ============================================================
async function findTheme() {
  console.log('\n🔍 Step 1: Finding "WeTwo - White Label Dev" theme...');
  const { themes } = await shopifyGet('themes.json');
  
  const devTheme = themes.find(t => t.name.includes('White Label Dev'));
  if (!devTheme) {
    console.log('Available themes:');
    themes.forEach(t => console.log(`  - ${t.name} (id: ${t.id}, role: ${t.role})`));
    throw new Error('Could not find White Label Dev theme');
  }
  
  console.log(`  ✅ Found: "${devTheme.name}" (id: ${devTheme.id}, role: ${devTheme.role})`);
  return devTheme.id;
}

// ============================================================
// STEP 2: Upload the snippet
// ============================================================
async function uploadSnippet(themeId) {
  console.log('\n📦 Step 2: Uploading snippets/wt-incentive-handler.liquid...');
  
  // Read the file from the same directory
  let snippetContent;
  try {
    snippetContent = readFileSync(resolve(process.cwd(), '03-wt-incentive-handler.liquid'), 'utf8');
    console.log(`  Read file: ${snippetContent.length} chars`);
  } catch {
    console.error('  ❌ Could not read 03-wt-incentive-handler.liquid');
    console.error('  Make sure the file is in the current directory.');
    process.exit(1);
  }
  
  const result = await shopifyPut(`themes/${themeId}/assets.json`, {
    asset: {
      key: 'snippets/wt-incentive-handler.liquid',
      value: snippetContent,
    },
  });
  
  console.log(`  ✅ Uploaded: ${result.asset.key} (${result.asset.size} bytes)`);
  return result;
}

// ============================================================
// STEP 3: Read current theme.liquid
// ============================================================
async function readThemeLiquid(themeId) {
  console.log('\n📖 Step 3: Reading layout/theme.liquid...');
  const { asset } = await shopifyGet(`themes/${themeId}/assets.json?asset[key]=layout/theme.liquid`);
  console.log(`  ✅ Read: ${asset.value.length} chars`);
  return asset.value;
}

// ============================================================
// STEP 4: Insert the render tag
// ============================================================
function insertRenderTag(themeLiquid) {
  console.log('\n🔧 Step 4: Inserting render tag...');
  
  const renderTag = "{% render 'wt-incentive-handler' %}";
  
  // Check if already installed
  if (themeLiquid.includes('wt-incentive-handler')) {
    console.log('  ⚠️  Already installed! Skipping insertion.');
    return null;
  }
  
  // Strategy: Insert after the branding engine render/include
  // Look for common patterns the branding engine might use
  const brandingPatterns = [
    /({%[-\s]*render\s+'wt-page-styles'[^%]*%})/,       // render wt-page-styles
    /({%[-\s]*include\s+'wt-page-styles'[^%]*%})/,       // include wt-page-styles  
    /({%[-\s]*render\s+'wt-branding-engine'[^%]*%})/,    // render wt-branding-engine
    /(<!-- WeTwo Branding Engine[^>]*-->[\s\S]*?<\/script>)/, // inline branding engine script block
    /(<script[^>]*id="wt-branding[^"]*"[^>]*>[\s\S]*?<\/script>)/, // script with wt-branding id
  ];
  
  for (const pattern of brandingPatterns) {
    const match = themeLiquid.match(pattern);
    if (match) {
      const insertAfter = match[0];
      const insertPoint = themeLiquid.indexOf(insertAfter) + insertAfter.length;
      
      // Show context
      const before = themeLiquid.substring(Math.max(0, insertPoint - 80), insertPoint).trim();
      console.log(`  Found branding engine: ...${before.slice(-60)}`);
      console.log(`  Inserting: ${renderTag}`);
      
      const updated = 
        themeLiquid.substring(0, insertPoint) + 
        '\n  ' + renderTag + '\n' + 
        themeLiquid.substring(insertPoint);
      
      return updated;
    }
  }
  
  // Fallback: insert right before </head> or {{ content_for_header }}
  const fallbackPatterns = [
    /({{ content_for_header }})/,
    /(<\/head>)/,
  ];
  
  for (const pattern of fallbackPatterns) {
    const match = themeLiquid.match(pattern);
    if (match) {
      console.log(`  ⚠️  Could not find branding engine. Inserting before: ${match[0].substring(0, 40)}`);
      console.log(`  You may want to manually reposition this later.`);
      
      const insertPoint = themeLiquid.indexOf(match[0]);
      const updated = 
        themeLiquid.substring(0, insertPoint) + 
        '  ' + renderTag + '\n  ' + 
        themeLiquid.substring(insertPoint);
      
      return updated;
    }
  }
  
  throw new Error('Could not find insertion point in theme.liquid');
}

// ============================================================
// STEP 5: Write updated theme.liquid
// ============================================================
async function writeThemeLiquid(themeId, content) {
  console.log('\n💾 Step 5: Writing updated layout/theme.liquid...');
  
  const result = await shopifyPut(`themes/${themeId}/assets.json`, {
    asset: {
      key: 'layout/theme.liquid',
      value: content,
    },
  });
  
  console.log(`  ✅ Written: ${result.asset.size} bytes`);
  return result;
}

// ============================================================
// STEP 6: Verify installation
// ============================================================
async function verify(themeId) {
  console.log('\n🔎 Step 6: Verifying installation...');
  
  // Check snippet exists
  try {
    const { asset } = await shopifyGet(`themes/${themeId}/assets.json?asset[key]=snippets/wt-incentive-handler.liquid`);
    console.log(`  ✅ Snippet exists: ${asset.key} (${asset.size} bytes)`);
  } catch {
    console.log('  ❌ Snippet NOT found');
  }
  
  // Check render tag in theme.liquid
  const { asset } = await shopifyGet(`themes/${themeId}/assets.json?asset[key]=layout/theme.liquid`);
  if (asset.value.includes('wt-incentive-handler')) {
    console.log('  ✅ Render tag found in theme.liquid');
    
    // Show surrounding context
    const idx = asset.value.indexOf('wt-incentive-handler');
    const start = Math.max(0, idx - 100);
    const end = Math.min(asset.value.length, idx + 100);
    console.log('\n  Context:');
    console.log('  ────────');
    asset.value.substring(start, end).split('\n').forEach(line => {
      console.log('  ' + line);
    });
    console.log('  ────────');
  } else {
    console.log('  ❌ Render tag NOT found in theme.liquid');
  }
}

// ============================================================
// RUN
// ============================================================
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log(' WeTwo — Install Incentive Handler');
  console.log('═══════════════════════════════════════════');
  
  try {
    const themeId = await findTheme();
    await uploadSnippet(themeId);
    const themeLiquid = await readThemeLiquid(themeId);
    const updated = insertRenderTag(themeLiquid);
    
    if (updated) {
      await writeThemeLiquid(themeId, updated);
    }
    
    await verify(themeId);
    
    console.log('\n✅ Installation complete!');
    console.log('\nNext: Test by visiting a vendor store with ?cb=15 parameter');
    console.log('Example: https://wetwo.love/?ref=vendor-rebell-entertainment-tld0&cb=15');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
