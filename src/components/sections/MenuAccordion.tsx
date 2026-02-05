'use client';
import { useState } from 'react';
import type { Vendor } from '@/lib/types';
export function MenuAccordionSection({ vendor }: { vendor: Vendor }) {
  const cats = vendor.menu_categories || [];
  const [openId, setOpenId] = useState<number|null>(cats[0]?.id ?? null);
  if (cats.length === 0) return null;
  return (<section id="menu" className="section section-alt" style={{padding:'100px 40px',background:'var(--bg-hover)'}}>
    <div className="section-header"><div className="section-label">Our Menu</div><h2 className="section-title">Cuisine &amp; Menus</h2></div>
    <div style={{maxWidth:'800px',margin:'0 auto'}}>
      {cats.map(cat => (<div key={cat.id} style={{marginBottom:'8px',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
        <button onClick={()=>setOpenId(openId===cat.id?null:cat.id)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',background:openId===cat.id?'var(--bg-card)':'transparent',border:'none',color:'var(--text)',cursor:'pointer',fontFamily:'inherit',fontSize:'16px',fontWeight:600}}>
          <span>{cat.icon} {cat.name}</span><span style={{transform:openId===cat.id?'rotate(180deg)':'rotate(0)',transition:'transform 0.3s'}}>&#9662;</span>
        </button>
        {openId===cat.id && (<div style={{padding:'0 24px 24px'}}>
          {cat.subtitle && <p style={{color:'var(--text-muted)',marginBottom:'16px',fontSize:'14px'}}>{cat.subtitle}</p>}
          {cat.items?.map((item,i) => (<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--border)'}}><div><div style={{fontWeight:600}}>{item.name}</div>{item.description && <div style={{color:'var(--text-muted)',fontSize:'13px'}}>{item.description}</div>}</div>{item.price && <div style={{color:'var(--primary)',fontWeight:600}}>{item.price}</div>}</div>))}
        </div>)}
      </div>))}
    </div>
  </section>);
}
