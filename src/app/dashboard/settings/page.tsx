'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: vendor.email, newPassword })
      })
      if (res.ok) {
        setMessage('Password updated successfully')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage('Failed to update password')
      }
    } catch {
      setMessage('Something went wrong')
    }
    setSaving(false)
  }

  if (!vendor) return null

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
      </header>

      <div className="page-content">
        {/* Account Info */}
        <div className="settings-card">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Business Name</label>
              <div className="info-value">{vendor.business_name}</div>
            </div>
            <div className="info-item">
              <label>Email</label>
              <div className="info-value">{vendor.email}</div>
            </div>
            <div className="info-item">
              <label>Plan</label>
              <div className="info-value">
                {vendor.plan === 'free' ? 'Free' : `${vendor.plan.charAt(0).toUpperCase() + vendor.plan.slice(1)} — ${vendor.commission_rate}%`}
              </div>
            </div>
            <div className="info-item">
              <label>Vendor Page</label>
              <a href={`/vendor/${vendor.ref}`} target="_blank" className="info-link">
                wetwo-vendors.vercel.app/vendor/{vendor.ref}
              </a>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="settings-card">
          <h3>Change Password</h3>
          {message && (
            <div className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Support */}
        <div className="settings-card">
          <h3>Need Help?</h3>
          <p className="help-text">
            For page updates, technical support, or account changes, reach out to us directly.
          </p>
          <div className="help-links">
            <a href="mailto:hello@wetwo.love" className="help-link">✉️ hello@wetwo.love</a>
            <a href="/dashboard/assistant" className="help-link">✨ Ask Claude</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-header {
          background: #fff;
          border-bottom: 1px solid #e4ddd4;
          padding: 20px 32px;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-content { padding: 28px 32px; max-width: 640px; }
        .settings-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .settings-card h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .info-grid { display: flex; flex-direction: column; gap: 14px; }
        .info-item label { font-size: 12px; font-weight: 600; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
        .info-value { font-size: 15px; color: #2c2420; }
        .info-link { font-size: 14px; color: #c9944a; text-decoration: none; }
        .info-link:hover { text-decoration: underline; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 13px; font-weight: 600; color: #6b5e52; margin-bottom: 6px; }
        .form-group input {
          width: 100%;
          padding: 12px 14px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 15px;
          color: #2c2420;
          font-family: inherit;
        }
        .form-group input:focus { outline: none; border-color: #c9944a; }
        .save-btn {
          padding: 12px 24px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .save-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .save-btn:disabled { opacity: 0.7; }
        .settings-message {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .settings-message.success { background: rgba(34,197,94,0.08); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .settings-message.error { background: rgba(239,68,68,0.08); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .help-text { font-size: 14px; color: #6b5e52; line-height: 1.5; margin: 0 0 14px; }
        .help-links { display: flex; gap: 12px; }
        .help-link {
          padding: 10px 18px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 13px;
          color: #6b5e52;
          text-decoration: none;
          transition: all 0.15s;
        }
        .help-link:hover { border-color: #c9944a; color: #c9944a; }
        @media (max-width: 768px) { .page-content { padding: 20px; } }
      `}</style>
    </div>
  )
}

