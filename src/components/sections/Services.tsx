'use client';
import type { Vendor } from '@/lib/types';
export function ServicesSection({ vendor }: { vendor: Vendor }) {
  const services = vendor.services_included || [];
  if (services.length === 0) return null;
  return (<section id="services" className="section" style={{padding:'100px 40px'}}>
    <div className="section-header"><div className="section-label">What We Offer</div><h2 className="section-title">Our Services</h2></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'24px',maxWidth:'1100px',margin:'0 auto'}}>
      {services.map((s,i) => (<div key={i} className="card" style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'16px',padding:'32px',textAlign:'center'}}>
        <div style={{fontSize:'36px',marginBottom:'16px'}}>{s.icon}</div>
        <div style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>{s.name}</div>
        {s.description && <p style={{color:'var(--text-muted)',fontSize:'14px',lineHeight:1.6}}>{s.description}</p>}
      </div>))}
    </div>
  </section>);
}
