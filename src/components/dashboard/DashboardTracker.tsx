'use client';

import { useEffect, useState } from 'react';

export default function DashboardTracker() {
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    // Parse ref from URL without useSearchParams (avoids Suspense requirement)
    const params = new URLSearchParams(window.location.search);
    setRef(params.get('ref'));
  }, []);

  useEffect(() => {
    if (!ref) return;

    // Log dashboard visit
    fetch('/api/admin/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'dashboard_visit',
        vendor_ref: ref,
      }),
    }).catch(() => {});
  }, [ref]);

  return null; // invisible component
}
