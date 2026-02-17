#!/usr/bin/env node

// ============================================================
// WeTwo — Dashboard v2 Installer
// Replaces dashboard/page.tsx with new earning-first design
// Installs recharts dependency
// ============================================================

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = process.cwd()

const SEP = '═'.repeat(50)
const log = (msg) => console.log(`  ${msg}`)

console.log(SEP)
console.log(' WeTwo — Install Dashboard v2')
console.log(SEP)

const dashPath = join(ROOT, 'src/app/dashboard/page.tsx')
const backupPath = join(ROOT, 'src/app/dashboard/page.tsx.v1-backup')
const newDashPath = join(__dirname, 'page.tsx')

// ---- Step 1: Check source file exists ----
console.log('📦 Step 1: Checking files...')
if (!existsSync(newDashPath)) {
  console.error('  ❌ page.tsx not found next to installer. Unzip both files together.')
  process.exit(1)
}
log('✅ New dashboard file found')

if (!existsSync(dashPath)) {
  console.error('  ❌ Dashboard not found at src/app/dashboard/page.tsx')
  console.error('     Run this from the wetwo-vendors project root.')
  process.exit(1)
}
log('✅ Existing dashboard found')

// ---- Step 2: Backup old dashboard ----
console.log('💾 Step 2: Backing up old dashboard...')
copyFileSync(dashPath, backupPath)
log(`✅ Backed up to page.tsx.v1-backup`)

// ---- Step 3: Install recharts ----
console.log('📊 Step 3: Installing recharts...')
try {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  if (deps['recharts']) {
    log('✅ recharts already installed')
  } else {
    execSync('npm install recharts', { cwd: ROOT, stdio: 'pipe' })
    log('✅ recharts installed')
  }
} catch (e) {
  log('⚠️  Could not auto-install recharts. Run: npm install recharts')
}

// ---- Step 4: Verify VendorToolbox component exists ----
console.log('🔧 Step 4: Checking VendorToolbox component...')
const toolboxPath = join(ROOT, 'src/components/VendorToolbox.tsx')
if (existsSync(toolboxPath)) {
  log('✅ VendorToolbox.tsx found')
} else {
  log('⚠️  VendorToolbox.tsx not found — toolbox section will error.')
  log('   Run the toolbox installer first if you haven\'t.')
}

// ---- Step 5: Copy new dashboard ----
console.log('📝 Step 5: Installing new dashboard...')
copyFileSync(newDashPath, dashPath)
log('✅ Dashboard v2 installed')

// ---- Step 6: Verify ----
console.log('🔎 Step 6: Verifying...')
const content = readFileSync(dashPath, 'utf8')
const checks = [
  ['recharts import', content.includes("from 'recharts'")],
  ['VendorToolbox import', content.includes('VendorToolbox')],
  ['EarningsChart component', content.includes('EarningsChart')],
  ['PoolMath component', content.includes('PoolMath')],
  ['Grow Your Business tab', content.includes('Grow Your Business')],
  ['Tab highlight class', content.includes('tab-highlight')],
  ['Tier info (free/starter/pro/elite)', content.includes('elite')],
  ['Costco messaging', content.includes('Costco')],
]

let allPass = true
for (const [label, ok] of checks) {
  if (ok) log(`✅ ${label}`)
  else { log(`❌ ${label}`); allPass = false }
}

if (allPass) {
  console.log(SEP)
  console.log('✅ Dashboard v2 installed successfully!')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Your old dashboard is saved as page.tsx.v1-backup')
  console.log('  2. Restart dev server if running: npm run dev')
  console.log('  3. Go to /dashboard')
  console.log('  4. Click "Grow Your Business 🚀" to see the earnings chart')
  console.log('')
  console.log('To rollback: cp src/app/dashboard/page.tsx.v1-backup src/app/dashboard/page.tsx')
  console.log(SEP)
} else {
  console.log('⚠️  Some checks failed — review the output above.')
}
