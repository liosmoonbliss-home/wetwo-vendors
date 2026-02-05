'use client';
import type { Vendor } from '@/lib/types';
export function EventTypesSection({ vendor }: { vendor: Vendor }) {
  const types = Array.isArray(vendor.event_types) ? vendor.event_types : [];
  if (types.length === 0) return null;
  return (<section id="events" className="section" style={{padding:'100px 40px'}}>
    <div className="section-header"><div className="section-label">We Specialize In</div><h2 className="section-title">Event Types</h2></div>
    <div style={{display:'flex',flexWrap:'wrap',gap:'16px',justifyContent:'center',maxWidth:'800px',margin:'0 auto'}}>
      {types.map((t,i) => (<div key={i} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'16px 24px',display:'flex',alignItems:'center',gap:'10px',fontSize:'15px',fontWeight:500}}><span style={{fontSize:'20px'}}>{t.icon}</span>{t.name}</div>))}
    </div>
  </section>);
}
