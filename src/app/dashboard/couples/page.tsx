'use client'

import { useState, useEffect } from 'react'
import CouplesPanel from '@/components/dashboard/CouplesPanel'

export default function CouplesPage() {
  const [vendor, setVendor] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('wetwo_vendor_session')
    if (stored) setVendor(JSON.parse(stored))
  }, [])

  if (!vendor) return null

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="page-title">Couples</h1>
          <p className="page-subtitle">Couples who signed up through your registry link</p>
        </div>
      </header>

      <div className="page-content">
        <CouplesPanel vendorId={vendor.id} vendorRef={vendor.ref} />
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
        .page-subtitle { font-size: 13px; color: #9a8d80; margin: 2px 0 0; }
        .page-content { padding: 28px 32px; max-width: 800px; }
        @media (max-width: 768px) {
          .page-header { padding: 16px 20px; }
          .page-content { padding: 20px; }
        }
      `}</style>
    </div>
  )
}
