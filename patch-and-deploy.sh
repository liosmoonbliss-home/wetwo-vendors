#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# WeTwo v4.5 — Couples Registration Flow
# Run from codespace root: bash patch-and-deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e
echo ""
echo "🚀 WeTwo v4.5 — Couples Registration Flow"
echo "═══════════════════════════════════════════"
echo ""

SIGNUP_ROUTE="src/app/api/couples/signup/route.ts"

# ── Check files exist ─────────────────────────────────────────
if [ ! -f "$SIGNUP_ROUTE" ]; then
  echo "❌ Cannot find $SIGNUP_ROUTE"
  echo "   Make sure you're running this from the codespace root."
  exit 1
fi

if [ ! -f "src/app/create-registry/page.tsx" ]; then
  echo "❌ Cannot find src/app/create-registry/page.tsx"
  echo "   Make sure you unzipped wetwo-v45.zip first."
  exit 1
fi

echo "✅ New files found:"
echo "   src/app/create-registry/page.tsx"
echo "   src/app/api/vendor/resolve/route.ts"
echo ""

# ── Backup signup route ───────────────────────────────────────
cp "$SIGNUP_ROUTE" "${SIGNUP_ROUTE}.bak"
echo "📦 Backed up signup route → ${SIGNUP_ROUTE}.bak"

# ── PATCH 1: Add cashback_rate to destructure ────────────────
if grep -q "cashback_rate" "$SIGNUP_ROUTE"; then
  echo "⏭️  PATCH 1: cashback_rate already in file, skipping"
else
  # Find the line with "phone" in the destructure block and add cashback_rate after it
  sed -i '/^      phone$/a\      cashback_rate,' "$SIGNUP_ROUTE" 2>/dev/null || \
  sed -i 's/      phone\n    } = body/      phone,\n      cashback_rate\n    } = body/' "$SIGNUP_ROUTE" 2>/dev/null || \
  # Fallback: try matching the line with phone and closing brace context
  node -e "
    const fs = require('fs');
    let code = fs.readFileSync('$SIGNUP_ROUTE', 'utf8');
    // Add cashback_rate after phone in the destructure
    code = code.replace(
      /phone\n(\s*}\s*=\s*body)/,
      'phone,\n      cashback_rate\n\$1'
    );
    fs.writeFileSync('$SIGNUP_ROUTE', code);
  "
  echo "✅ PATCH 1: Added cashback_rate to destructure"
fi

# ── PATCH 2: Add cashback_rate to Supabase insert ────────────
if grep -q "cashback_rate: cashback_rate" "$SIGNUP_ROUTE"; then
  echo "⏭️  PATCH 2: cashback_rate already in insert, skipping"
else
  node -e "
    const fs = require('fs');
    let code = fs.readFileSync('$SIGNUP_ROUTE', 'utf8');
    // Add cashback_rate after phone in the insert block
    code = code.replace(
      /phone: phone \|\| null,\n/,
      'phone: phone || null,\n        cashback_rate: cashback_rate || 0,\n'
    );
    fs.writeFileSync('$SIGNUP_ROUTE', code);
  "
  echo "✅ PATCH 2: Added cashback_rate to Supabase insert"
fi

# ── PATCH 3: Add GoAffPro commission PATCH call ──────────────
if grep -q "Commission rate set" "$SIGNUP_ROUTE"; then
  echo "⏭️  PATCH 3: Commission PATCH already in file, skipping"
else
  node -e "
    const fs = require('fs');
    let code = fs.readFileSync('$SIGNUP_ROUTE', 'utf8');
    
    const commissionBlock = \`
        // 🎯 Set couple's cashback commission rate
        if (cashback_rate && cashback_rate > 0) {
          try {
            const commissionResponse = await fetch(
              \\\`https://api.goaffpro.com/v1/admin/affiliates/\\\${coupleAffiliateId}\\\`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!
                },
                body: JSON.stringify({
                  commission: {
                    type: 'percentage',
                    amount: String(cashback_rate)
                  }
                })
              }
            )
            console.log('🎯 Commission rate set:', cashback_rate + '%', 'Status:', commissionResponse.status)
          } catch (commErr) {
            console.error('⚠️ Commission rate set failed (non-blocking):', commErr)
          }
        }
\`;
    
    // Insert after the GoAffPro affiliate linked log line
    code = code.replace(
      /console\.log\('✅ GoAffPro affiliate linked:', coupleAffiliateId\)/,
      \"console.log('✅ GoAffPro affiliate linked:', coupleAffiliateId)\" + commissionBlock
    );
    
    fs.writeFileSync('$SIGNUP_ROUTE', code);
  "
  echo "✅ PATCH 3: Added GoAffPro commission PATCH call"
fi

# ── Verify patches ────────────────────────────────────────────
echo ""
echo "🔍 Verifying patches..."

ERRORS=0

if grep -q "cashback_rate," "$SIGNUP_ROUTE"; then
  echo "   ✅ cashback_rate in destructure"
else
  echo "   ❌ cashback_rate NOT in destructure — apply manually"
  ERRORS=$((ERRORS+1))
fi

if grep -q "cashback_rate: cashback_rate" "$SIGNUP_ROUTE"; then
  echo "   ✅ cashback_rate in Supabase insert"
else
  echo "   ❌ cashback_rate NOT in Supabase insert — apply manually"
  ERRORS=$((ERRORS+1))
fi

if grep -q "Commission rate set" "$SIGNUP_ROUTE"; then
  echo "   ✅ GoAffPro commission PATCH call"
else
  echo "   ❌ GoAffPro commission PATCH NOT found — apply manually"
  ERRORS=$((ERRORS+1))
fi

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "⚠️  $ERRORS patch(es) need manual attention. See DEPLOYMENT.md for details."
  echo "   Backup is at: ${SIGNUP_ROUTE}.bak"
  echo ""
  read -p "Continue with deploy anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

# ── Deploy ────────────────────────────────────────────────────
echo ""
echo "📤 Deploying to Vercel..."
git add -A
git commit -m "v4.5: couples registration flow

- Create registry page (/create-registry)
- Vendor resolve API (/api/vendor/resolve)
- Cashback rate stored in couples table
- GoAffPro commission % set on affiliate creation
- Dynamic cashback from vendor &cb= URL param"

git push

echo ""
echo "═══════════════════════════════════════════"
echo "✅ DEPLOYED! Now do these manual steps:"
echo "═══════════════════════════════════════════"
echo ""
echo "1. SUPABASE — Run this SQL:"
echo "   ALTER TABLE couples ADD COLUMN IF NOT EXISTS cashback_rate numeric DEFAULT 0;"
echo ""
echo "2. TEST — Open this URL:"
echo "   https://wetwo-vendors.vercel.app/create-registry?ref=vendor-glitter-thicket-4l7j&cb=20"
echo ""
echo "3. SHOPIFY — In wt-incentive-handler.liquid, change:"
echo "   const REGISTRY_FORM_PATH = '/pages/create-registry'"
echo "   → const REGISTRY_FORM_PATH = 'https://wetwo-vendors.vercel.app/create-registry'"
echo ""
echo "4. CLEAR CACHE — In Shopify console:"
echo "   sessionStorage.removeItem('wetwo_brand_v4')"
echo ""
