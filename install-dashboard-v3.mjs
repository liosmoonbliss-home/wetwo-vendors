#!/usr/bin/env node

// ============================================================
// WeTwo — Install Dashboard v3 (Simplified)
// Cockpit dashboard + unified code generator
// ============================================================

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = process.cwd()

const SEP = '═'.repeat(50)
const log = (msg) => console.log(`  ${msg}`)
let changes = 0

console.log(SEP)
console.log(' WeTwo — Install Dashboard v3 (Simplified)')
console.log(SEP)

// ---- Step 1: Backup ----
console.log('💾 Step 1: Backing up current files...')
const files = [
  { name: 'dashboard/page.tsx', path: 'src/app/dashboard/page.tsx' },
  { name: 'VendorToolbox.tsx', path: 'src/components/VendorToolbox.tsx' },
]
for (const f of files) {
  const full = join(ROOT, f.path)
  if (existsSync(full)) {
    copyFileSync(full, full + '.v2-backup')
    log(`✅ Backed up ${f.name}`)
  }
}

// ---- Step 2: Install dashboard ----
console.log('📝 Step 2: Installing dashboard v3...')
const dashSrc = join(__dirname, 'page.tsx')
const dashDest = join(ROOT, 'src/app/dashboard/page.tsx')
if (!existsSync(dashSrc)) { console.error('  ❌ page.tsx not found'); process.exit(1) }
copyFileSync(dashSrc, dashDest)
log('✅ Dashboard v3 installed')
changes++

// ---- Step 3: Install toolbox ----
console.log('🔧 Step 3: Installing VendorToolbox v3...')
const toolSrc = join(__dirname, 'VendorToolbox.tsx')
const toolDest = join(ROOT, 'src/components/VendorToolbox.tsx')
if (!existsSync(toolSrc)) { console.error('  ❌ VendorToolbox.tsx not found'); process.exit(1) }
copyFileSync(toolSrc, toolDest)
log('✅ VendorToolbox v3 installed')
changes++

// ---- Step 4: Install API ----
console.log('🔌 Step 4: Installing coupon API v2...')
const apiSrc = join(__dirname, 'route.ts')
const apiDir = join(ROOT, 'src/app/api/coupons/manage')
const apiDest = join(apiDir, 'route.ts')
if (!existsSync(apiSrc)) { console.error('  ❌ route.ts not found'); process.exit(1) }
mkdirSync(apiDir, { recursive: true })
copyFileSync(apiSrc, apiDest)
log('✅ Coupon API v2 installed')
changes++

// ---- Step 5: Verify recharts ----
console.log('📊 Step 5: Checking recharts...')
try {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  if (deps['recharts']) {
    log('✅ recharts present')
  } else {
    const { execSync } = await import('child_process')
    execSync('npm install recharts', { cwd: ROOT, stdio: 'pipe' })
    log('✅ recharts installed')
  }
} catch (e) {
  log('⚠️  Check recharts manually: npm install recharts')
}

// ---- Step 6: Verify ----
console.log('🔎 Step 6: Verifying...')
const dash = readFileSync(dashDest, 'utf8')
const tool = readFileSync(toolDest, 'utf8')
const api = readFileSync(apiDest, 'utf8')

const checks = [
  ['Dashboard: hero-explainer section', dash.includes('hero-explainer')],
  ['Dashboard: VendorToolbox import', dash.includes("from '@/components/VendorToolbox'")],
  ['Dashboard: learn-grid links', dash.includes('learn-grid')],
  ['Dashboard: EarningsChart', dash.includes('EarningsChart')],
  ['Dashboard: no IncentiveTools', !dash.includes('IncentiveTools')],
  ['Dashboard: store link section', dash.includes('earning') && dash.includes('building your list')],
  ['Dashboard: upgrade tease', dash.includes('still profit on every sale')],
  ['Dashboard: flywheel messaging', dash.includes('customer for life') || dash.includes('Customer for life')],
  ['Toolbox: registry links section', tool.includes('For Couples')],
  ['Toolbox: code generator', tool.includes('Generate a Code')],
  ['Toolbox: 14-day safety', tool.includes('14')],
  ['Toolbox: no campaign codes', !tool.includes('Campaign Code')],
  ['API: usage_limit null for unlimited', api.includes('usage_limit: isOneUse ? 1 : null')],
]

let allPass = true
for (const [label, ok] of checks) {
  if (ok) log(`✅ ${label}`)
  else { log(`❌ ${label}`); allPass = false }
}

console.log(SEP)
if (allPass) {
  console.log(`✅ Dashboard v3 installed! (${changes} files)`)
  console.log('')
  console.log('What changed:')
  console.log('  ✂️  80% shorter — cockpit, not pitch deck')
  console.log('  🎁  Registry Links (3) — permanent, for couples')
  console.log('  🛒  Code Generator — one tool, pick %, who, expiry')
  console.log('  🔒  14-day safety net on all codes')
  console.log('  📚  How It Works / Grow / Playbook → behind links')
  console.log('')
  console.log('Rollback:')
  console.log('  cp src/app/dashboard/page.tsx.v2-backup src/app/dashboard/page.tsx')
  console.log('  cp src/components/VendorToolbox.tsx.v2-backup src/components/VendorToolbox.tsx')
} else {
  console.log('⚠️  Some checks failed — review above.')
}
console.log(SEP)
