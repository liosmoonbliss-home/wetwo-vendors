#!/usr/bin/env node

// ============================================================
// WeTwo — Install Toolbox v2 + Coupon API
// Adds: toggle, scheduling, flash codes
// ============================================================

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = process.cwd()

const SEP = '═'.repeat(50)
const log = (msg) => console.log(`  ${msg}`)

console.log(SEP)
console.log(' WeTwo — Install Toolbox v2 + Coupon API')
console.log(SEP)

let changes = 0

// ---- Step 1: Install VendorToolbox v2 ----
console.log('📦 Step 1: Installing VendorToolbox v2...')
const toolboxSrc = join(__dirname, 'VendorToolbox.tsx')
const toolboxDest = join(ROOT, 'src/components/VendorToolbox.tsx')
const toolboxBackup = join(ROOT, 'src/components/VendorToolbox.tsx.v1-backup')

if (!existsSync(toolboxSrc)) {
  console.error('  ❌ VendorToolbox.tsx not found next to installer')
  process.exit(1)
}

if (existsSync(toolboxDest)) {
  copyFileSync(toolboxDest, toolboxBackup)
  log('✅ Backed up old VendorToolbox.tsx')
}

copyFileSync(toolboxSrc, toolboxDest)
log('✅ VendorToolbox v2 installed')
changes++

// ---- Step 2: Install Coupon Management API ----
console.log('🔌 Step 2: Installing coupon management API...')
const apiSrc = join(__dirname, 'route.ts')
const apiDir = join(ROOT, 'src/app/api/coupons/manage')
const apiDest = join(apiDir, 'route.ts')

if (!existsSync(apiSrc)) {
  console.error('  ❌ route.ts not found next to installer')
  process.exit(1)
}

mkdirSync(apiDir, { recursive: true })
copyFileSync(apiSrc, apiDest)
log(`✅ API installed at src/app/api/coupons/manage/route.ts`)
changes++

// ---- Step 3: Update dashboard to pass vendorRef to toolbox ----
console.log('🔧 Step 3: Patching dashboard for vendorRef...')
const dashPath = join(ROOT, 'src/app/dashboard/page.tsx')

if (existsSync(dashPath)) {
  let dash = readFileSync(dashPath, 'utf8')

  // Update the VendorToolbox usage to pass vendorRef and tier
  if (dash.includes('vendorId={undefined}')) {
    dash = dash.replace(
      '<VendorToolbox vendorId={undefined} />',
      '<VendorToolbox vendorRef={vendor.ref} tier={tier} />'
    )
    writeFileSync(dashPath, dash)
    log('✅ Updated VendorToolbox props in dashboard')
    changes++
  } else if (dash.includes('vendorRef={vendor.ref}')) {
    log('✅ Dashboard already passes vendorRef (no change needed)')
  } else {
    log('⚠️  Could not find VendorToolbox usage to patch — update manually')
  }
} else {
  log('⚠️  Dashboard not found — run dashboard v2 installer first')
}

// ---- Step 4: Verify ----
console.log('🔎 Step 4: Verifying...')
const toolbox = readFileSync(toolboxDest, 'utf8')
const api = readFileSync(apiDest, 'utf8')

const checks = [
  ['Toggle component', toolbox.includes('function Toggle')],
  ['SchedulePicker component', toolbox.includes('SchedulePicker')],
  ['FlashCodeGenerator component', toolbox.includes('FlashCodeGenerator')],
  ['Flash tab', toolbox.includes('⚡ Flash Code')],
  ['API toggle action', api.includes("action === 'toggle'")],
  ['API schedule action', api.includes("action === 'schedule'")],
  ['API flash action', api.includes("action === 'flash'")],
  ['usage_limit: 1', api.includes('usage_limit: 1')],
]

let allPass = true
for (const [label, ok] of checks) {
  if (ok) log(`✅ ${label}`)
  else { log(`❌ ${label}`); allPass = false }
}

if (allPass) {
  console.log(SEP)
  console.log(`✅ Toolbox v2 installed! (${changes} files changed)`)
  console.log('')
  console.log('New features:')
  console.log('  🔛 Toggle switch — turn campaign codes on/off instantly')
  console.log('  📅 Schedule — set date ranges for sales campaigns')
  console.log('  ⚡ Flash Code — generate one-time codes on the spot')
  console.log('')
  console.log('Files installed:')
  console.log('  src/components/VendorToolbox.tsx (v2)')
  console.log('  src/app/api/coupons/manage/route.ts')
  console.log('')
  console.log('Rollback:')
  console.log('  cp src/components/VendorToolbox.tsx.v1-backup src/components/VendorToolbox.tsx')
  console.log(SEP)
} else {
  console.log('⚠️  Some checks failed — review the output above.')
}
