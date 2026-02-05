'use client';
import type { Vendor } from '@/lib/types';
import type { ThemeConfig } from '@/lib/themes';
function hexToRgb(hex: string) { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`; }
export function HeroSection({ vendor, theme, links }: { vendor: Vendor; theme: ThemeConfig; links: { affiliateLink: string } }) {
  const hc = vendor.hero_config;
  const headline = hc?.headline || vendor.business_name;
  const sub = hc?.subheadline || vendor.bio || '';
  const badge = hc?.badge || `\uD83D\uDC8D ${vendor.category || 'Wedding Vendor'}`;
  const bg = hc?.backgroundImage || vendor.portfolio_images?.[0] || '';
  const loc = [vendor.city, vendor.state].filter(Boolean).join(', ');
  const overlay = `linear-gradient(180deg,rgba(10,10,21,0.4) 0%,rgba(10,10,21,0.7) 50%,${theme.bg} 100%)`;
  return (<section id="hero" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 40px 80px',position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,background:bg?`${overlay},url('${bg}') center/cover`:overlay}} />
    <div style={{position:'relative',maxWidth:'800px',color:'#f8f6f3'}}>
      <div style={{display:'inline-block',background:`rgba(${hexToRgb(theme.primary)},0.2)`,border:`1px solid rgba(${hexToRgb(theme.primary)},0.6)`,color:'#f0e0c8',padding:'8px 20px',borderRadius:'50px',fontSize:'13px',fontWeight:600,marginBottom:'24px'}}>{badge}</div>
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'clamp(40px,7vw,68px)',fontWeight:500,marginBottom:'24px',lineHeight:1.1,color:'#fff'}}>{headline}</h1>
      {sub && <p style={{fontSize:'18px',color:'#d4cfc8',maxWidth:'600px',margin:'0 auto 32px',lineHeight:1.7}}>{sub.length>200?sub.slice(0,200)+'...':sub}</p>}
      <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
        <a href="#packages" className="btn" style={{background:theme.primary,color:'#fff',padding:'12px 24px',borderRadius:'8px',fontWeight:600,fontSize:'14px'}}>View Packages</a>
        <a href="#gallery" className="btn" style={{background:'transparent',color:'#fff',border:'1px solid rgba(255,255,255,0.4)',padding:'12px 24px',borderRadius:'8px',fontWeight:600,fontSize:'14px'}}>View Gallery</a>
      </div>
      <div style={{marginTop:'48px',display:'flex',gap:'40px',justifyContent:'center',flexWrap:'wrap'}}>
        {loc && <div style={{display:'flex',alignItems:'center',gap:'10px',color:'#fff',fontSize:'14px'}}><span>\uD83D\uDCCD</span> {loc}</div>}
        {vendor.phone && <div style={{display:'flex',alignItems:'center',gap:'10px',color:'#fff',fontSize:'14px'}}><span>\uD83D\uDCF1</span> {vendor.phone}</div>}
      </div>
    </div>
  </section>);
}
