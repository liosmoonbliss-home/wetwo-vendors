#!/bin/bash
# patch-vendorpage.sh — Run from project root after unzipping builder-v12.zip
# Adds 'about' as a standalone section case in VendorPage.tsx

FILE="src/components/VendorPage.tsx"

if [ ! -f "$FILE" ]; then
  echo "ERROR: $FILE not found. Run from project root."
  exit 1
fi

# Check if already patched
if grep -q "case 'about'" "$FILE"; then
  echo "VendorPage.tsx already has 'about' case — skipping patch."
else
  # Add about case before the contact case
  sed -i "/case 'contact':/i\\      case 'about' as SectionId:\\n        return <AboutSection key={key} vendor={vendor} />;" "$FILE"
  echo "✓ Added 'about' section case to VendorPage.tsx"
fi

# Make About only auto-render if NOT in active sections (prevents double-render)
if grep -q "resolvedActive.includes" "$FILE"; then
  echo "About conditional already patched — skipping."
else
  # Wrap the auto-AboutSection in a condition
  sed -i "s|<AboutSection vendor={vendor} />|{!resolvedActive.includes('about' as SectionId) \&\& <AboutSection vendor={vendor} />}|" "$FILE"
  echo "✓ Wrapped auto-About in conditional"
fi

echo "Done! Run: npm run build"
