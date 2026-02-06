#!/bin/bash
FILE="src/components/VendorPage.tsx"
if [ ! -f "$FILE" ]; then echo "ERROR: $FILE not found."; exit 1; fi
if grep -q "case 'about'" "$FILE"; then
  echo "VendorPage.tsx already patched."
else
  sed -i "/case 'contact':/i\\      case 'about' as SectionId:\\n        return <AboutSection key={key} vendor={vendor} />;" "$FILE"
  echo "✓ Added about case"
fi
if grep -q "resolvedActive.includes" "$FILE"; then
  echo "About conditional already patched."
else
  sed -i "s|<AboutSection vendor={vendor} />|{!resolvedActive.includes('about' as SectionId) \&\& <AboutSection vendor={vendor} />}|" "$FILE"
  echo "✓ Wrapped auto-About"
fi
echo "Done"
