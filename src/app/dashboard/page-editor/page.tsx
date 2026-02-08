'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PageEditorPage() {
  const [vendor, setVendor] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  if (!vendor) return null

  const pageLink = `https://wetwo-vendors.vercel.app/vendor/${vendor.ref}`

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Your Page</h1>
          <p className="page-subtitle">View and manage your vendor landing page</p>
        </div>
        <a href={pageLink} target="_blank" rel="noopener" className="header-btn">
          View Live Page →
        </a>
      </header>

      <div className="page-content">
        {/* Page Preview */}
        <div className="preview-card">
          <div className="preview-header">
            <h3>📱 Live Preview</h3>
            <a href={pageLink} target="_blank" rel="noopener" className="preview-link">Open in new tab →</a>
          </div>
          <div className="preview-frame">
            <iframe src={pageLink} title="Vendor Page Preview" className="preview-iframe" />
          </div>
        </div>

        {/* Page Info */}
        <div className="info-card">
          <h3>Page Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Business Name</label>
              <div>{vendor.business_name}</div>
            </div>
            <div className="info-item">
              <label>Category</label>
              <div>{vendor.category || '—'}</div>
            </div>
            <div className="info-item">
              <label>Location</label>
              <div>{[vendor.city, vendor.state].filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div className="info-item">
              <label>Page URL</label>
              <div className="url-text">{pageLink}</div>
            </div>
          </div>
        </div>

        {/* Request Changes */}
        <div className="changes-card">
          <div className="changes-icon">✨</div>
          <div>
            <h3>Want to update your page?</h3>
            <p>Tell Claude what you'd like to change — your bio, photos, packages, theme, anything. Claude will write the copy and our team will apply it.</p>
          </div>
          <Link href="/dashboard/assistant" className="changes-btn">
            Ask Claude →
          </Link>
        </div>

        {/* What's on your page */}
        <div className="sections-card">
          <h3>What's on your page</h3>
          <div className="sections-grid">
            {[
              { icon: '🎬', label: 'Hero', desc: 'Your headline, badge, and call-to-action' },
              { icon: '💬', label: 'About', desc: 'Your story, experience, and specialties' },
              { icon: '📸', label: 'Gallery', desc: 'Your best work, front and center' },
              { icon: '🎯', label: 'Services', desc: 'What you offer, clear and organized' },
              { icon: '📦', label: 'Packages', desc: 'Pricing tiers with features' },
              { icon: '📬', label: 'Contact Form', desc: 'Leads come directly to your dashboard' },
              { icon: '🎁', label: 'Cashback Banner', desc: '25% cashback link — always visible' },
            ].map((s) => (
              <div key={s.label} className="section-item">
                <span className="section-icon">{s.icon}</span>
                <div>
                  <strong>{s.label}</strong>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
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
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .page-title { font-size: 20px; font-weight: 700; color: #2c2420; margin: 0; }
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .header-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          color: #6b5e52;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .header-btn:hover { border-color: #c9944a; color: #c9944a; }
        .page-content { padding: 28px 32px; max-width: 900px; }
        .preview-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e4ddd4;
        }
        .preview-header h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0; }
        .preview-link { font-size: 13px; color: #c9944a; text-decoration: none; }
        .preview-frame { background: #f3efe9; padding: 12px; }
        .preview-iframe {
          width: 100%;
          height: 500px;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          background: #fff;
        }
        .info-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .info-card h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .info-item label { font-size: 11px; font-weight: 600; color: #9a8d80; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
        .info-item div { font-size: 14px; color: #2c2420; }
        .url-text { font-size: 12px; color: #c9944a; word-break: break-all; }
        .changes-card {
          display: flex;
          gap: 16px;
          align-items: center;
          background: linear-gradient(135deg, rgba(147,130,220,0.08), rgba(201,148,74,0.06));
          border: 1px solid rgba(147,130,220,0.25);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .changes-icon { font-size: 32px; flex-shrink: 0; }
        .changes-card h3 { font-size: 16px; font-weight: 700; color: #2c2420; margin: 0 0 4px; }
        .changes-card p { font-size: 13px; color: #6b5e52; margin: 0; line-height: 1.5; }
        .changes-btn {
          padding: 12px 24px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .changes-btn:hover { filter: brightness(1.1); }
        .sections-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 14px;
          padding: 24px;
        }
        .sections-card h3 { font-size: 15px; font-weight: 700; color: #2c2420; margin: 0 0 16px; }
        .sections-grid { display: flex; flex-direction: column; gap: 10px; }
        .section-item {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 10px 14px;
          background: #f3efe9;
          border-radius: 8px;
        }
        .section-icon { font-size: 20px; flex-shrink: 0; }
        .section-item strong { font-size: 14px; color: #2c2420; display: block; }
        .section-item p { font-size: 12px; color: #6b5e52; margin: 2px 0 0; }
        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 12px; align-items: flex-start; padding: 16px 20px; }
          .page-content { padding: 20px; }
          .info-grid { grid-template-columns: 1fr; }
          .changes-card { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}

