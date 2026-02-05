'use client';
import { useState } from 'react';
import type { Vendor } from '@/lib/types';
export function FAQSection({ vendor }: { vendor: Vendor }) {
  const items = vendor.faqs || [];
  const [openId, setOpenId] = useState<number|null>(null);
  if (items.length === 0) return null;
  return (<section id="faq" className="section" style={{padding:'100px 40px'}}>
    <div className="section-header"><div className="section-label">FAQ</div><h2 className="section-title">Common Questions</h2></div>
    <div style={{maxWidth:'700px',margin:'0 auto'}}>
      {items.map(item => (<div key={item.id} style={{borderBottom:'1px solid var(--border)',padding:'20px 0'}}>
        <button onClick={()=>setOpenId(openId===item.id?null:item.id)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',background:'none',border:'none',color:'var(--text)',cursor:'pointer',fontFamily:'inherit',fontSize:'16px',fontWeight:600,textAlign:'left',padding:0}}>
          {item.question}<span style={{transform:openId===item.id?'rotate(180deg)':'rotate(0)',transition:'transform 0.3s',marginLeft:'16px'}}>&#9662;</span>
        </button>
        {openId===item.id && <div style={{color:'var(--text-muted)',fontSize:'15px',lineHeight:1.7,marginTop:'12px',paddingLeft:'0'}}>{item.answer}</div>}
      </div>))}
    </div>
  </section>);
}
