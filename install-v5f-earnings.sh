#!/bin/bash
# WeTwo Vendors — Install v5f (Earnings Page Math Fix)
# Fixes incorrect break-even math, adds The Knot 2024 citation,
# integrates "only tool that pays you back" positioning

set -e

PROJ_DIR="$HOME/wetwo-vendors"

if [ ! -d "$PROJ_DIR" ]; then
  echo "❌ Project not found at $PROJ_DIR"
  exit 1
fi

echo "📊 Installing earnings page fix..."

# Fix the earnings page
cp /home/claude/wetwo-v5/earnings-page.tsx "$PROJ_DIR/src/app/dashboard/earnings/page.tsx"
echo "  ✓ Earnings page rewritten with correct math"

echo ""
echo "✅ Install complete!"
echo ""
echo "WHAT CHANGED:"
echo "  - Removed wrong '2-3 couples' / '3-4 couples' break-even claims"
echo "  - Added The Knot 2024 Guest Study citation ($150 avg gift)"
echo "  - Registry bomb: 150 guests × $150 = $22,500 per couple"
echo "  - Commission calc: $1,125-$4,500 per couple depending on tier"
echo "  - Napkin math: 7/9/10 sales to cover Starter/Growth/Pro"
echo "  - 'Only tool that pays you back' competitive positioning"
echo "  - Removed incorrect '~10 purchases/mo' from all plan cards"
echo "  - Fixed to '~7/~9/~10 sales covers your plan' per tier"
