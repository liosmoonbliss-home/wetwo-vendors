'use client';
import type { Vendor, SectionId } from '@/lib/types';
export function PackagesSection({ vendor, variant='packages' }: { vendor: Vendor; variant?: SectionId }) {
  const pkgs = vendor.pricing_packages || [];
  if (pkgs.length === 0) return null;
  return (<section id="packages" className="section section-alt" style={{padding:'100px 40px',background:'var(--bg-hover)'}}>
    <div className="section-header"><div className="section-label">Our Packages</div><h2 className="section-title">Packages &amp; Pricing</h2><p className="section-subtitle">Choose the package that fits your vision.</p></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'24px',maxWidth:'1100px',margin:'0 auto'}}>
      {pkgs.map(pkg => (<div key={pkg.id} style={{background:'var(--bg-card)',border:`1px solid ${pkg.featured?'var(--primary)':'var(--border)'}`,borderRadius:'16px',padding:'32px',transition:'all 0.3s',position:'relative',overflow:'hidden'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='var(--primary)'}} onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor=pkg.featured?'var(--primary)':'var(--border)'}}>
        <div style={{fontSize:'36px',marginBottom:'16px'}}>{pkg.icon}</div>
        <div style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>{pkg.name}</div>
        <div style={{fontSize:'28px',fontWeight:700,color:'var(--primary)',marginBottom:'16px'}}>{pkg.price}</div>
        <p style={{color:'var(--text-muted)',fontSize:'14px',marginBottom:'20px',lineHeight:1.6}}>{pkg.description}</p>
        <ul style={{listStyle:'none',marginBottom:'24px'}}>{pkg.features.map((f,i) => (<li key={i} style={{padding:'8px 0',fontSize:'14px',color:'var(--text-muted)',display:'flex',alignItems:'flex-start',gap:'10px'}}><span style={{color:'var(--primary)',fontWeight:700}}>&#10003;</span>{f}</li>))}</ul>
        <a href="#contact" style={{display:'block',textAlign:'center',width:'100%',padding:'12px',background:pkg.featured?'var(--primary)':'transparent',color:pkg.featured?'#fff':'var(--text)',border:pkg.featured?'none':'1px solid var(--border)',borderRadius:'8px',fontWeight:600,fontSize:'14px'}}>{pkg.featured?'Inquire Now':'Book Now'}</a>
      </div>))}
    </div>
  </section>);
}
