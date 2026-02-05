'use client';
import type { Vendor } from '@/lib/types';
export function TestimonialsSection({ vendor }: { vendor: Vendor }) {
  const items = vendor.testimonials || [];
  if (items.length === 0) return null;
  return (<section id="testimonials" className="section section-alt" style={{padding:'100px 40px',background:'var(--bg-hover)'}}>
    <div className="section-header"><div className="section-label">Reviews</div><h2 className="section-title">What Clients Say</h2></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'24px',maxWidth:'1000px',margin:'0 auto'}}>
      {items.map(t => (<div key={t.id} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'16px',padding:'32px'}}>
        <div style={{color:'var(--primary)',fontSize:'20px',marginBottom:'16px'}}>{'★'.repeat(t.rating)}{'☆'.repeat(5-t.rating)}</div>
        <p style={{color:'var(--text-muted)',fontSize:'15px',lineHeight:1.7,marginBottom:'20px',fontStyle:'italic'}}>&ldquo;{t.text}&rdquo;</p>
        <div style={{fontWeight:700,fontSize:'15px'}}>{t.name}</div>
        {t.date && <div style={{color:'var(--text-dim)',fontSize:'13px'}}>{t.date}</div>}
      </div>))}
    </div>
  </section>);
}
