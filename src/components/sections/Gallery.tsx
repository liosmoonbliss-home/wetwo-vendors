'use client';
import type { Vendor } from '@/lib/types';
export function GallerySection({ vendor, masonry=false, onImageClick }: { vendor: Vendor; masonry?: boolean; onImageClick: (i: number) => void }) {
  const images = Array.isArray(vendor.portfolio_images) ? vendor.portfolio_images : [];
  if (images.length === 0) return null;
  return (<section id="gallery" className="section section-alt" style={{padding:'100px 40px',background:'var(--bg-hover)'}}>
    <div className="section-header"><div className="section-label">Our Work</div><h2 className="section-title">Gallery</h2></div>
    <div style={{display:'grid',gridTemplateColumns:masonry?'repeat(3,1fr)':'repeat(auto-fill,minmax(250px,1fr))',gap:'16px',maxWidth:'1200px',margin:'0 auto'}}>
      {images.map((url,i) => (<div key={i} onClick={()=>onImageClick(i)} style={{borderRadius:'12px',overflow:'hidden',cursor:'pointer',aspectRatio:'4/3'}}>
        <img src={url} alt={`Gallery ${i+1}`} loading={i<4?'eager':'lazy'} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s'}} onMouseOver={e=>(e.currentTarget.style.transform='scale(1.05)')} onMouseOut={e=>(e.currentTarget.style.transform='scale(1)')} />
      </div>))}
    </div>
  </section>);
}
