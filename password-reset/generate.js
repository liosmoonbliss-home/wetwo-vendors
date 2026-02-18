#!/usr/bin/env node
/**
 * WeTwo Password Reset Generator
 * Generates vendor passwords, SHA-256 hashes, SQL migration, and credentials CSV.
 * 
 * Password pattern: WeTwo-{vendor-ref-slug}
 * Admin override:   058305
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// --- Config ---
const ADMIN_PASSWORD = '058305';
const VENDOR_JSON = path.join(__dirname, 'vendors.json');
const OUTPUT_DIR = path.join(__dirname, 'output');

// --- Helpers ---
function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// --- Load vendors ---
const vendors = JSON.parse(fs.readFileSync(VENDOR_JSON, 'utf8'));
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// --- Generate admin hash ---
const adminHash = sha256(ADMIN_PASSWORD);
console.log(`\n🔑 Admin override password: ${ADMIN_PASSWORD}`);
console.log(`   SHA-256: ${adminHash}\n`);

// --- Process vendors ---
const rows = [];
const sqlLines = [];
const skipSlugs = ['wetwo-default']; // system placeholder

// SQL header: add initial_password column if it doesn't exist
sqlLines.push('-- WeTwo Password Reset Migration');
sqlLines.push(`-- Generated: ${new Date().toISOString()}`);
sqlLines.push('-- Run this in Supabase SQL Editor\n');
sqlLines.push('-- Step 1: Add initial_password column (safe to re-run)');
sqlLines.push(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS initial_password text;\n`);
sqlLines.push('-- Step 2: Update all vendor passwords + store plaintext reference');

for (const v of vendors) {
  const ref = v.ref || '';
  if (skipSlugs.includes(ref)) continue;
  if (!v.goaffpro_affiliate_id) continue; // skip non-GoAffPro vendors

  const password = `WeTwo-${ref}`;
  const hash = sha256(password);
  const magicLink = `https://wetwo-vendors.vercel.app/dashboard?token=${v.magic_token}`;
  const landingPage = `https://wetwo-vendors.vercel.app/vendor/${ref}`;
  const storefront = `https://wetwo.love?ref=vendor-${ref}`;

  rows.push({
    id: v.id,
    business_name: v.business_name,
    contact_name: v.contact_name || '',
    email: v.email,
    ref,
    password,
    hash,
    magic_token: v.magic_token,
    magic_link: magicLink,
    landing_page: landingPage,
    storefront,
    goaffpro_id: v.goaffpro_affiliate_id
  });

  // SQL: update page_password hash + store plaintext in initial_password
  sqlLines.push(`UPDATE vendors SET page_password = '${hash}', initial_password = '${password}' WHERE id = '${v.id}';`);
}

// Step 3: Set admin override hash (store as a Supabase secret or env var)
sqlLines.push(`\n-- Step 3: Store admin override hash for reference (use in code)`);
sqlLines.push(`-- Admin password: ${ADMIN_PASSWORD}`);
sqlLines.push(`-- Admin SHA-256:  ${adminHash}`);
sqlLines.push(`-- Add this to your Vercel env as ADMIN_PAGE_PASSWORD_HASH=${adminHash}`);

// --- Write SQL ---
const sqlPath = path.join(OUTPUT_DIR, 'migration.sql');
fs.writeFileSync(sqlPath, sqlLines.join('\n') + '\n');
console.log(`📄 SQL migration: output/migration.sql (${sqlLines.length} lines)`);

// --- Write CSV ---
const csvHeader = 'Business Name,Contact Name,Email,Ref Slug,Password,Landing Page,Storefront Link,Dashboard Magic Link,GoAffPro ID';
const csvRows = rows.map(r =>
  `"${r.business_name}","${r.contact_name}","${r.email}","${r.ref}","${r.password}","${r.landing_page}","${r.storefront}","${r.magic_link}","${r.goaffpro_id}"`
);
const csvPath = path.join(OUTPUT_DIR, 'vendor-credentials.csv');
fs.writeFileSync(csvPath, [csvHeader, ...csvRows].join('\n') + '\n');
console.log(`📊 Credentials CSV: output/vendor-credentials.csv (${rows.length} vendors)`);

// --- Write JSON reference (for programmatic use) ---
const jsonPath = path.join(OUTPUT_DIR, 'vendor-credentials.json');
fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));
console.log(`📋 Credentials JSON: output/vendor-credentials.json`);

// --- Write admin override patch instructions ---
const patchContent = `# Admin Override Password Patch

## What this does
Allows you to log into ANY vendor dashboard or landing page using password: ${ADMIN_PASSWORD}

## Admin hash
\`${adminHash}\`

## Environment Variable (add to Vercel)
\`\`\`
ADMIN_PAGE_PASSWORD_HASH=${adminHash}
\`\`\`

## Code Patch — Vendor Landing Page Auth
In the password verification logic (wherever page_password is checked), change:

### BEFORE (single check):
\`\`\`javascript
const inputHash = sha256(password);
if (inputHash !== vendor.page_password) {
  return { error: 'Invalid password' };
}
\`\`\`

### AFTER (vendor password OR admin override):
\`\`\`javascript
const inputHash = crypto.createHash('sha256').update(password).digest('hex');
const adminHash = process.env.ADMIN_PAGE_PASSWORD_HASH;
if (inputHash !== vendor.page_password && inputHash !== adminHash) {
  return { error: 'Invalid password' };
}
\`\`\`

This works for both:
- The vendor landing page password gate (\`/vendor/[ref]\`)
- The dashboard login (if password-based)

The vendor's "Change Password" form only updates their own \`page_password\` — 
the admin override stays permanent via the env var.
`;
const patchPath = path.join(OUTPUT_DIR, 'ADMIN-OVERRIDE.md');
fs.writeFileSync(patchPath, patchContent);
console.log(`🔧 Admin override patch: output/ADMIN-OVERRIDE.md`);

// --- Summary ---
console.log(`\n✅ Done! ${rows.length} vendors processed.`);
console.log(`\n📌 Next steps:`);
console.log(`   1. Run output/migration.sql in Supabase SQL Editor`);
console.log(`   2. Add ADMIN_PAGE_PASSWORD_HASH to Vercel env vars`);
console.log(`   3. Apply admin override code patch (see ADMIN-OVERRIDE.md)`);
console.log(`   4. Use vendor-credentials.csv for your email blast\n`);
console.log(`🔒 Password pattern: WeTwo-{vendor-ref-slug}`);
console.log(`   Example: WeTwo-paul-francis-photography-lcln`);
console.log(`   If a vendor asks: "Your password is WeTwo- followed by your vendor slug"\n`);
