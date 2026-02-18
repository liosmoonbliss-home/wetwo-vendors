# WeTwo Password Reset Package

## What's Inside
- `generate.js` — Node script that produces everything below
- `vendors.json` — Source vendor data (29 real + 1 system placeholder)
- `output/` — Generated after running (migration SQL, credentials CSV/JSON, admin patch guide)

## Quick Start (One Command)
```bash
cd password-reset && node generate.js
```

## Generated Files

| File | Purpose |
|------|---------|
| `output/migration.sql` | Run in Supabase SQL Editor — resets all passwords + adds `initial_password` column |
| `output/vendor-credentials.csv` | Email blast reference — name, email, password, all links |
| `output/vendor-credentials.json` | Same data as JSON (programmatic use) |
| `output/ADMIN-OVERRIDE.md` | Code patch instructions for admin master password |

## Password Pattern
```
WeTwo-{vendor-ref-slug}
```
Example: `WeTwo-paul-francis-photography-lcln`

If a vendor asks how to log in, you can say: *"Your password is WeTwo- followed by your vendor slug."*

## Admin Override
Password: `058305` (same as your admin panel key)
- Works on ANY vendor dashboard/landing page after applying the code patch
- Stored as env var `ADMIN_PAGE_PASSWORD_HASH` in Vercel
- Vendors cannot see or change this — it's a separate check

## Step-by-Step

1. **Generate files:** `cd password-reset && node generate.js`
2. **Run SQL:** Copy `output/migration.sql` → paste in Supabase SQL Editor → Run
3. **Add env var:** `ADMIN_PAGE_PASSWORD_HASH` → Vercel dashboard → redeploy
4. **Apply code patch:** Follow `output/ADMIN-OVERRIDE.md` for the 2-line auth change
5. **Email vendors:** Use `output/vendor-credentials.csv` as your mail merge source

## New Supabase Column: `initial_password`
The migration adds `initial_password` (text) to the `vendors` table. This stores the plaintext password you assigned so you always have a reference. Vendors change their own password via the dashboard form — that updates `page_password` (the hash) but `initial_password` stays as your record.
