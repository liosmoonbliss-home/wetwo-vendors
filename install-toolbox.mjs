#!/usr/bin/env node
/**
 * WeTwo — Install Vendor Toolbox into Dashboard
 * Run: node install-toolbox.mjs
 * 
 * What it does:
 *   1. Copies VendorToolbox.tsx to src/components/
 *   2. Adds import to dashboard/page.tsx
 *   3. Adds "Toolbox" tab to the tabs array
 *   4. Adds the toolbox render block in the tab content area
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const COMPONENT_SRC = resolve(__dirname, 'VendorToolbox.tsx')
const COMPONENT_DEST = resolve('src/components/VendorToolbox.tsx')
const DASHBOARD_PATH = resolve('src/app/dashboard/page.tsx')

function main() {
  console.log('═══════════════════════════════════════════')
  console.log(' WeTwo — Install Vendor Toolbox')
  console.log('═══════════════════════════════════════════')

  // ---- Step 1: Copy component ----
  console.log('\n📦 Step 1: Copying VendorToolbox.tsx...')
  
  if (!existsSync(COMPONENT_SRC)) {
    console.error(`  ❌ Source not found: ${COMPONENT_SRC}`)
    process.exit(1)
  }
  
  mkdirSync(resolve('src/components'), { recursive: true })
  copyFileSync(COMPONENT_SRC, COMPONENT_DEST)
  console.log(`  ✅ Copied to ${COMPONENT_DEST}`)

  // ---- Step 2: Patch dashboard ----
  console.log('\n🔧 Step 2: Patching dashboard/page.tsx...')
  
  if (!existsSync(DASHBOARD_PATH)) {
    console.error(`  ❌ Dashboard not found: ${DASHBOARD_PATH}`)
    process.exit(1)
  }

  let dashboard = readFileSync(DASHBOARD_PATH, 'utf8')
  let changes = 0

  // 2a: Add import (after the last existing import)
  if (dashboard.includes('VendorToolbox')) {
    console.log('  ⚠️  VendorToolbox already imported — skipping import')
  } else {
    // Find the last import line
    const importMatch = dashboard.match(/^import .+ from .+$/gm)
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1]
      const importLine = `import VendorToolbox from '@/components/VendorToolbox'`
      dashboard = dashboard.replace(
        lastImport,
        lastImport + '\n' + importLine
      )
      console.log(`  ✅ Added import after: ${lastImport.substring(0, 50)}...`)
      changes++
    } else {
      console.error('  ❌ Could not find import statements')
      process.exit(1)
    }
  }

  // 2b: Add "Toolbox" tab to tabs array
  if (dashboard.includes("'toolbox'")) {
    console.log('  ⚠️  Toolbox tab already exists — skipping tab')
  } else {
    // Find the tabs array — look for the last tab entry
    const tabPatterns = [
      /(\{ id: 'playbook', label: 'Your Playbook' \},?)/,
      /(\{ id: 'earn', label: 'Earn Commission' \},?)/,
    ]
    
    let tabAdded = false
    for (const pattern of tabPatterns) {
      const match = dashboard.match(pattern)
      if (match) {
        const replacement = match[0].replace(/,?\s*$/, ',') + 
          `\n    { id: 'toolbox', label: '🎁 Toolbox' },`
        dashboard = dashboard.replace(match[0], replacement)
        console.log(`  ✅ Added toolbox tab after: ${match[0].substring(0, 40)}...`)
        changes++
        tabAdded = true
        break
      }
    }
    
    if (!tabAdded) {
      console.log('  ⚠️  Could not find tabs array — you\'ll need to add the tab manually')
      console.log('  Add this to your tabs array:')
      console.log("    { id: 'toolbox', label: '🎁 Toolbox' },")
    }
  }

  // 2c: Add the toolbox tab content (before the closing </div> of page-content)
  if (dashboard.includes("activeTab === 'toolbox'")) {
    console.log('  ⚠️  Toolbox tab content already exists — skipping render block')
  } else {
    // Find the last tab content block — look for the playbook tab's closing
    const renderPatterns = [
      // After the playbook tab closing
      /({\s*\/\*\s*={5}\s*TAB:\s*YOUR PLAYBOOK\s*={5}\s*\*\/[\s\S]*?\n        \)\}\n)/,
      // Or after any tab content with a specific pattern
      /(activeTab === 'playbook'[\s\S]*?\n        \)\}\n)/,
    ]

    let renderAdded = false
    for (const pattern of renderPatterns) {
      const match = dashboard.match(pattern)
      if (match) {
        const toolboxBlock = `
        {/* ===== TAB: INCENTIVE TOOLBOX ===== */}
        {activeTab === 'toolbox' && (
          <div className="tab-content">
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#2c2420', margin: '0 0 4px' }}>
                Your Incentive Toolbox
              </h2>
              <p style={{ fontSize: '14px', color: '#6b5e52', margin: 0 }}>
                8 tools to grow your business — cashback links for brides, discount codes for everyone.
              </p>
            </div>
            <VendorToolbox vendorId={vendor.id} />
          </div>
        )}
`
        dashboard = dashboard.replace(match[0], match[0] + toolboxBlock)
        console.log('  ✅ Added toolbox tab content block')
        changes++
        renderAdded = true
        break
      }
    }

    if (!renderAdded) {
      console.log('  ⚠️  Could not auto-insert render block.')
      console.log('  Add this inside your tab content area:')
      console.log(`
        {activeTab === 'toolbox' && (
          <div className="tab-content">
            <VendorToolbox vendorId={vendor.id} />
          </div>
        )}
      `)
    }
  }

  // ---- Step 3: Write ----
  if (changes > 0) {
    writeFileSync(DASHBOARD_PATH, dashboard, 'utf8')
    console.log(`\n💾 Step 3: Saved ${changes} changes to dashboard/page.tsx`)
  } else {
    console.log('\n  No changes needed — everything already installed.')
  }

  // ---- Step 4: Verify ----
  console.log('\n🔎 Step 4: Verifying...')
  const final = readFileSync(DASHBOARD_PATH, 'utf8')
  
  const checks = [
    ['VendorToolbox import', final.includes("import VendorToolbox from")],
    ['Toolbox tab in array', final.includes("id: 'toolbox'")],
    ['Toolbox render block', final.includes("activeTab === 'toolbox'")],
    ['Component file exists', existsSync(COMPONENT_DEST)],
  ]

  checks.forEach(([label, pass]) => {
    console.log(`  ${pass ? '✅' : '❌'} ${label}`)
  })

  console.log('\n✅ Installation complete!')
  console.log('\nNext steps:')
  console.log('  1. Run: npm run dev (or check your running dev server)')
  console.log('  2. Go to /dashboard and click the "🎁 Toolbox" tab')
  console.log('  3. It will load demo data until a vendor has generated incentives')
}

main()
