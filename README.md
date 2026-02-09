# WeTwo Admin Console — Install Guide

## Step 1: Run the SQL in Supabase
1. Go to your Supabase dashboard → SQL Editor
2. Paste and run the contents of `supabase-admin-events.sql`
3. This creates the `admin_events` table

## Step 2: Add Environment Variable
In Vercel → Settings → Environment Variables, add:
```
ADMIN_PASSWORD = [choose a strong password]
```

## Step 3: Deploy the Files
Drag `wetwo-admin-console.zip` to your codespace root, then run:
```bash
unzip -o wetwo-admin-console.zip && rm wetwo-admin-console.zip && git add -A && git commit -m "add admin console + event tracking" && git push
```

## Step 4: Run the Tracking Patcher
This patches your existing API routes to log events:
```bash
python3 patch-tracking.py
```
⚠️ IMPORTANT: After running, review the patched files:
- `src/app/api/couples/signup/route.ts`
- `src/app/api/shoppers/route.ts`
- `src/app/api/vendor-assistant/route.ts`
- `src/app/dashboard/layout.tsx`

The patcher does best-effort variable name matching. You may need to
adjust variable names (vendorRef, name, email, etc.) to match your code.

Then commit the patches:
```bash
git add -A && git commit -m "add event tracking to routes" && git push
```

## Step 5: Access the Admin
Go to: `https://wetwo-vendors.vercel.app/admin`
Enter your ADMIN_PASSWORD to log in.

## What's Included

### Admin Pages
- `/admin` — Login
- `/admin/overview` — Dashboard with stat cards, 7-day activity, event breakdown
- `/admin/activity` — Full event feed with type filtering and pagination
- `/admin/vendors` — All vendors list with status badges
- `/admin/vendors/[ref]` — Vendor detail: activity, couples, shoppers, leads tabs
- `/admin/couples` — All couples across all vendors
- `/admin/shoppers` — All shoppers across all vendors
- `/admin/leads` — Leads inbox with message viewer and reply button

### Event Tracking
Events tracked:
- `dashboard_visit` — vendor opens their dashboard
- `claude_chat` — vendor sends a message to Claude assistant
- `couple_signup` — couple registers under a vendor
- `shopper_signup` — shopper signs up under a vendor
- `lead_form` — contact form submission on vendor page
- `page_view` — vendor page viewed (manual add needed)
- `vendor_created` — new vendor onboarded (add to your builder flow)
- `subscription_change` — for future Stripe/Shopify subscription tracking

### API Routes
- `POST /api/admin/auth` — login (sets cookie)
- `DELETE /api/admin/auth` — logout
- `GET /api/admin/stats` — overview counts + recent events
- `GET /api/admin/events` — filtered event feed
- `POST /api/admin/track` — client-side event logging
- `GET /api/admin/vendors` — vendors list (with ?ref= for detail)
- `GET /api/admin/couples` — all couples
- `GET /api/admin/shoppers` — all shoppers
- `GET /api/admin/leads` — all leads
