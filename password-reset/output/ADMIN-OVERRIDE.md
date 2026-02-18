# Admin Override Password Patch

## What this does
Allows you to log into ANY vendor dashboard or landing page using password: 058305

## Admin hash
`a7cd53d0e143678e440485e1943e138213f2e2c8cb5dda1b82da9f786bf3cc3b`

## Environment Variable (add to Vercel)
```
ADMIN_PAGE_PASSWORD_HASH=a7cd53d0e143678e440485e1943e138213f2e2c8cb5dda1b82da9f786bf3cc3b
```

## Code Patch — Vendor Landing Page Auth
In the password verification logic (wherever page_password is checked), change:

### BEFORE (single check):
```javascript
const inputHash = sha256(password);
if (inputHash !== vendor.page_password) {
  return { error: 'Invalid password' };
}
```

### AFTER (vendor password OR admin override):
```javascript
const inputHash = crypto.createHash('sha256').update(password).digest('hex');
const adminHash = process.env.ADMIN_PAGE_PASSWORD_HASH;
if (inputHash !== vendor.page_password && inputHash !== adminHash) {
  return { error: 'Invalid password' };
}
```

This works for both:
- The vendor landing page password gate (`/vendor/[ref]`)
- The dashboard login (if password-based)

The vendor's "Change Password" form only updates their own `page_password` — 
the admin override stays permanent via the env var.
