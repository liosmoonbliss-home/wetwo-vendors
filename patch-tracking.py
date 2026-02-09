#!/usr/bin/env python3
"""
Patches existing API routes and dashboard to add admin event tracking.
Run from the repo root: python3 patch-tracking.py
"""

import os
import re
import sys

def patch_file(filepath, patches):
    """Apply text patches to a file. Each patch is (search_text, replacement_text)."""
    if not os.path.exists(filepath):
        print(f"  ⚠ SKIP: {filepath} not found")
        return False
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for search, replace in patches:
        if search in content:
            content = content.replace(search, replace, 1)
            print(f"  ✓ Patched: {search[:60]}...")
        else:
            print(f"  ⚠ Pattern not found: {search[:60]}...")
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✅ Saved: {filepath}")
        return True
    else:
        print(f"  — No changes: {filepath}")
        return False


def inject_after_line(filepath, after_text, inject_text):
    """Insert text after a specific line."""
    if not os.path.exists(filepath):
        print(f"  ⚠ SKIP: {filepath} not found")
        return False
    
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    injected = False
    for line in lines:
        new_lines.append(line)
        if not injected and after_text in line:
            new_lines.append(inject_text + '\n')
            injected = True
    
    if injected:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
        print(f"  ✅ Injected into: {filepath}")
        return True
    else:
        print(f"  ⚠ Injection point not found in: {filepath}")
        return False


print("\n🔧 WeTwo Admin Event Tracking Patcher\n")
print("=" * 50)

# ─────────────────────────────────────────────
# 1. Patch /api/couples/signup/route.ts
# ─────────────────────────────────────────────
print("\n1️⃣  Patching couples signup route...")
couples_path = "src/app/api/couples/signup/route.ts"

if os.path.exists(couples_path):
    with open(couples_path, 'r') as f:
        content = f.read()
    
    # Add import if not present
    if "admin-track" not in content:
        # Add import at top
        content = "import { trackEvent } from '@/lib/admin-track';\n" + content
        
        # Find a good place to add the tracking call - after the couple is inserted
        # Look for the success response or the end of the signup logic
        # We'll add it before the final return/response
        track_code = """
    // Track couple signup event
    try {
      await trackEvent({
        event_type: 'couple_signup',
        vendor_ref: vendorRef || undefined,
        actor_name: partnerA && partnerB ? `${partnerA} & ${partnerB}` : undefined,
        actor_email: email || undefined,
        summary: `New couple signup: ${partnerA || ''} & ${partnerB || ''} under ${vendorRef || 'direct'}`,
        metadata: { slug, wedding_date: weddingDate },
      });
    } catch (e) { /* tracking should never break signup */ }
"""
        # Try to insert before the final NextResponse.json success
        # This is a best-effort patch - the variable names may differ
        if "NextResponse.json(" in content:
            # Find the LAST success response
            lines = content.split('\n')
            insert_idx = None
            for i in range(len(lines) - 1, -1, -1):
                if 'NextResponse.json(' in lines[i] and 'error' not in lines[i].lower():
                    insert_idx = i
                    break
            
            if insert_idx:
                lines.insert(insert_idx, track_code)
                content = '\n'.join(lines)
        
        with open(couples_path, 'w') as f:
            f.write(content)
        print(f"  ✅ Added tracking to {couples_path}")
        print("  ⚠  PLEASE VERIFY: Check the variable names (vendorRef, partnerA, partnerB, email, slug, weddingDate)")
        print("     match what's used in your signup route. Adjust if needed.")
    else:
        print("  — Already patched")
else:
    print(f"  ⚠ SKIP: {couples_path} not found")


# ─────────────────────────────────────────────
# 2. Patch /api/shoppers/route.ts
# ─────────────────────────────────────────────
print("\n2️⃣  Patching shoppers route...")
shoppers_path = "src/app/api/shoppers/route.ts"

if os.path.exists(shoppers_path):
    with open(shoppers_path, 'r') as f:
        content = f.read()
    
    if "admin-track" not in content:
        content = "import { trackEvent } from '@/lib/admin-track';\n" + content
        
        track_code = """
    // Track shopper signup event
    try {
      await trackEvent({
        event_type: 'shopper_signup',
        vendor_ref: vendorRef || undefined,
        actor_name: name || undefined,
        actor_email: email || undefined,
        summary: `New shopper: ${name || email || 'unknown'} under ${vendorRef || 'direct'}`,
      });
    } catch (e) { /* tracking should never break signup */ }
"""
        if "NextResponse.json(" in content:
            lines = content.split('\n')
            insert_idx = None
            for i in range(len(lines) - 1, -1, -1):
                if 'NextResponse.json(' in lines[i] and 'error' not in lines[i].lower():
                    insert_idx = i
                    break
            if insert_idx:
                lines.insert(insert_idx, track_code)
                content = '\n'.join(lines)
        
        with open(shoppers_path, 'w') as f:
            f.write(content)
        print(f"  ✅ Added tracking to {shoppers_path}")
        print("  ⚠  PLEASE VERIFY: Check variable names (vendorRef, name, email) match your route.")
    else:
        print("  — Already patched")
else:
    print(f"  ⚠ SKIP: {shoppers_path} not found")


# ─────────────────────────────────────────────
# 3. Patch /api/vendor-assistant/route.ts
# ─────────────────────────────────────────────
print("\n3️⃣  Patching Claude assistant route...")
assistant_path = "src/app/api/vendor-assistant/route.ts"

if os.path.exists(assistant_path):
    with open(assistant_path, 'r') as f:
        content = f.read()
    
    if "admin-track" not in content:
        content = "import { trackEvent } from '@/lib/admin-track';\n" + content
        
        # Add tracking near the top of the POST handler, after parsing the request body
        track_code = """
  // Track Claude chat event
  trackEvent({
    event_type: 'claude_chat',
    vendor_ref: vendorRef || ref || undefined,
    summary: `Claude chat from vendor ${vendorRef || ref || 'unknown'}`,
    metadata: { message_preview: (message || userMessage || '').substring(0, 100) },
  }).catch(() => {});
"""
        # Try to find the body parsing line
        if "await req.json()" in content or "await request.json()" in content:
            # Insert after the body parsing
            body_parse = "await req.json()" if "await req.json()" in content else "await request.json()"
            lines = content.split('\n')
            insert_idx = None
            for i, line in enumerate(lines):
                if body_parse in line:
                    # Find the end of the destructuring (might span multiple lines)
                    insert_idx = i + 1
                    # Skip any additional lines that are part of the destructuring
                    while insert_idx < len(lines) and lines[insert_idx].strip().startswith(('const ', 'let ')):
                        insert_idx += 1
                    break
            
            if insert_idx:
                lines.insert(insert_idx, track_code)
                content = '\n'.join(lines)
        
        with open(assistant_path, 'w') as f:
            f.write(content)
        print(f"  ✅ Added tracking to {assistant_path}")
        print("  ⚠  PLEASE VERIFY: Check variable names (vendorRef/ref, message/userMessage) match your route.")
    else:
        print("  — Already patched")
else:
    print(f"  ⚠ SKIP: {assistant_path} not found")


# ─────────────────────────────────────────────
# 4. Add DashboardTracker to dashboard layout
# ─────────────────────────────────────────────
print("\n4️⃣  Patching dashboard layout for visit tracking...")
layout_path = "src/app/dashboard/layout.tsx"

if os.path.exists(layout_path):
    with open(layout_path, 'r') as f:
        content = f.read()
    
    if "DashboardTracker" not in content:
        # Add import
        import_line = "import DashboardTracker from '@/components/dashboard/DashboardTracker';\n"
        
        # Find first import line and add before it, or at top
        if "import " in content:
            first_import = content.index("import ")
            content = content[:first_import] + import_line + content[first_import:]
        else:
            content = import_line + content
        
        # Add <DashboardTracker /> component - try to find it inside the JSX
        # Look for the children render point
        if "{children}" in content:
            content = content.replace("{children}", "<DashboardTracker />\n        {children}", 1)
        
        with open(layout_path, 'w') as f:
            f.write(content)
        print(f"  ✅ Added DashboardTracker to {layout_path}")
        print("  ⚠  PLEASE VERIFY: Make sure <DashboardTracker /> is inside a <Suspense> boundary if needed.")
    else:
        print("  — Already patched")
else:
    print(f"  ⚠ SKIP: {layout_path} not found")


# ─────────────────────────────────────────────
# 5. Patch vendor page for page_view tracking
# ─────────────────────────────────────────────
print("\n5️⃣  Checking vendor page for view tracking...")
vendor_page_path = "src/app/vendor/[ref]/page.tsx"

if os.path.exists(vendor_page_path):
    with open(vendor_page_path, 'r') as f:
        content = f.read()
    
    if "admin/track" not in content and "page_view" not in content:
        print(f"  ℹ  To track vendor page views, add this fetch call inside the vendor page component:")
        print("""
    // Add inside a useEffect in the vendor page:
    useEffect(() => {
      fetch('/api/admin/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'page_view', vendor_ref: ref }),
      }).catch(() => {});
    }, [ref]);
""")
    else:
        print("  — Already has tracking")
else:
    print(f"  ⚠ SKIP: {vendor_page_path} not found")


# ─────────────────────────────────────────────
# 6. Patch lead form route
# ─────────────────────────────────────────────
print("\n6️⃣  Looking for lead form/contact route to patch...")

# Check common paths for the contact form API
lead_paths = [
    "src/app/api/vendor/leads/route.ts",
    "src/app/api/leads/route.ts", 
    "src/app/api/contact/route.ts",
]

found_lead_route = False
for lead_path in lead_paths:
    if os.path.exists(lead_path):
        with open(lead_path, 'r') as f:
            content = f.read()
        
        if "admin-track" not in content:
            content = "import { trackEvent } from '@/lib/admin-track';\n" + content
            
            track_code = """
    // Track lead form event
    try {
      await trackEvent({
        event_type: 'lead_form',
        vendor_ref: vendorRef || vendor_ref || undefined,
        actor_name: name || undefined,
        actor_email: email || undefined,
        summary: `New lead from ${name || email || 'unknown'} for ${vendorRef || vendor_ref || 'unknown'}`,
        metadata: { message: (message || '').substring(0, 200) },
      });
    } catch (e) { /* tracking should never break form */ }
"""
            if "NextResponse.json(" in content:
                lines = content.split('\n')
                insert_idx = None
                for i in range(len(lines) - 1, -1, -1):
                    if 'NextResponse.json(' in lines[i] and 'error' not in lines[i].lower():
                        insert_idx = i
                        break
                if insert_idx:
                    lines.insert(insert_idx, track_code)
                    content = '\n'.join(lines)
            
            with open(lead_path, 'w') as f:
                f.write(content)
            print(f"  ✅ Added tracking to {lead_path}")
            print("  ⚠  PLEASE VERIFY variable names.")
        else:
            print(f"  — Already patched: {lead_path}")
        found_lead_route = True
        break

if not found_lead_route:
    print("  ⚠ Could not find lead form API route. Check your route paths.")


print("\n" + "=" * 50)
print("✅ Patching complete!")
print("\n⚠  IMPORTANT: Review each patched file to ensure:")
print("   1. Variable names match your actual code")
print("   2. The tracking calls are in the right position")
print("   3. No syntax errors were introduced")
print("\nThe patch script uses best-effort matching — some files")
print("may need manual adjustment if variable names differ.\n")
