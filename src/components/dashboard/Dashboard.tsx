'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Vendor, Lead, Shopper, Couple } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Toast } from '../ui/Toast';
type Panel = 'get-started'|'dashboard'|'couples'|'shoppers'|'leads'|'earnings'|'perks'|'analytics'|'marketing'|'settings';
const NAV: { id: Panel; icon: string; label: string }[] = [
  {id:'get-started',icon:'🚀',label:'Get Started'},{id:'dashboard',icon:'📊',label:'Dashboard'},{id:'couples',icon:'💍',label:'Couples'},
  {id:'shoppers',icon:'🛍️',label:'Shoppers'},{id:'leads',icon:'📋',label:'Leads'},{id:'earnings',icon:'💰',label:'Earnings'},
  {id:'perks',icon:'🎁',label:'Perks'},{id:'settings',icon:'⚙️',label:'Settings'},
];
export function Dashboard({ vendor, links, onViewPublic }: { vendor: Vendor; links: Record<string,string|null>; onViewPublic: () => void }) {
  const [panel, setPanel] = useState<Panel>('get-started');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [shoppers, setShoppers] = useState<Shopper[]>([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [toast, setToast] = useState<string|null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(()=>setToast(null), 3000); }, []);
  const copy = useCallback((text: string, label: string) => { navigator.clipboard.writeText(text); showToast(`${label} copied!`); }, [showToast]);
  useEffect(() => { async function load() {
    const [l,s,c] = await Promise.all([
      supabase.from('leads').select('*').eq('vendor_id',vendor.id).order('created_at',{ascending:false}),
      supabase.from('shoppers').select('*').eq('vendor_id',vendor.id).order('created_at',{ascending:false}),
      supabase.from('couples').select('*').eq('vendor_id',vendor.id).order('created_at',{ascending:false}),
    ]);
    if(l.data) setLeads(l.data); if(s.data) setShoppers(s.data); if(c.data) setCouples(c.data);
  } load(); }, [vendor.id]);
  const pageUrl = links.pageAbsolute || '';
  const shopLink = links.affiliateLink || '';
  const coupleLink = links.coupleSignup || '';
  return (<div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
    <aside style={{width:sidebarOpen?'260px':'0',overflow:'hidden',background:'var(--bg-card)',borderRight:'1px solid var(--border)',transition:'width 0.3s',flexShrink:0}}>
      <div style={{padding:'24px',borderBottom:'1px solid var(--border)'}}>
        <div style={{fontSize:'18px',fontWeight:700}}>{vendor.business_name}</div>
        <div style={{color:'var(--text-muted)',fontSize:'13px'}}>{vendor.category}</div>
      </div>
      <nav style={{padding:'12px'}}>{NAV.map(n=>(<button key={n.id} onClick={()=>setPanel(n.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',background:panel===n.id?'var(--primary-dim)':'transparent',color:panel===n.id?'var(--primary)':'var(--text-muted)',border:'none',borderRadius:'8px',cursor:'pointer',fontFamily:'inherit',fontSize:'14px',fontWeight:panel===n.id?600:400,marginBottom:'4px',textAlign:'left'}}><span>{n.icon}</span>{n.label}</button>))}</nav>
      <div style={{padding:'12px',marginTop:'auto'}}><button onClick={onViewPublic} style={{width:'100%',display:'flex',alignItems:'center',gap:'8px',padding:'12px 16px',background:'transparent',color:'var(--text-muted)',border:'1px solid var(--border)',borderRadius:'8px',cursor:'pointer',fontFamily:'inherit',fontSize:'13px'}}>👁 View Public Site</button></div>
    </aside>
    <main style={{flex:1,padding:'32px',overflow:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
        <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'8px',padding:'8px 12px',cursor:'pointer',color:'var(--text)',fontSize:'18px'}}>☰</button>
        <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'28px',fontWeight:500}}>{NAV.find(n=>n.id===panel)?.label||'Dashboard'}</h1>
        <div/>
      </div>
      {panel==='get-started' && (<div><h2 style={{fontSize:'24px',fontWeight:600,marginBottom:'24px'}}>Welcome, {vendor.contact_name || vendor.business_name}!</h2>
        <div style={{display:'grid',gap:'16px',maxWidth:'600px'}}>
          <div className="card"><div style={{fontSize:'13px',fontWeight:600,color:'var(--text-muted)',marginBottom:'8px'}}>Your Page URL</div><div style={{display:'flex',gap:'8px'}}><code style={{flex:1,padding:'10px',background:'var(--bg-hover)',borderRadius:'6px',fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis'}}>{pageUrl}</code><button onClick={()=>copy(pageUrl,'Page URL')} className="btn btn-sm btn-outline">Copy</button></div></div>
          <div className="card"><div style={{fontSize:'13px',fontWeight:600,color:'var(--text-muted)',marginBottom:'8px'}}>Cashback Shopping Link</div><div style={{display:'flex',gap:'8px'}}><code style={{flex:1,padding:'10px',background:'var(--bg-hover)',borderRadius:'6px',fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis'}}>{shopLink}</code><button onClick={()=>copy(shopLink,'Shop link')} className="btn btn-sm btn-outline">Copy</button></div></div>
          <div className="card"><div style={{fontSize:'13px',fontWeight:600,color:'var(--text-muted)',marginBottom:'8px'}}>Couple Signup Link</div><div style={{display:'flex',gap:'8px'}}><code style={{flex:1,padding:'10px',background:'var(--bg-hover)',borderRadius:'6px',fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis'}}>{coupleLink}</code><button onClick={()=>copy(coupleLink,'Couple link')} className="btn btn-sm btn-outline">Copy</button></div></div>
        </div></div>)}
      {panel==='dashboard' && (<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
        <div className="card" style={{textAlign:'center'}}><div style={{fontSize:'32px',fontWeight:700,color:'var(--primary)'}}>{couples.length}</div><div style={{color:'var(--text-muted)',fontSize:'14px'}}>Couples</div></div>
        <div className="card" style={{textAlign:'center'}}><div style={{fontSize:'32px',fontWeight:700,color:'var(--primary)'}}>{shoppers.length}</div><div style={{color:'var(--text-muted)',fontSize:'14px'}}>Shoppers</div></div>
        <div className="card" style={{textAlign:'center'}}><div style={{fontSize:'32px',fontWeight:700,color:'var(--primary)'}}>{leads.length}</div><div style={{color:'var(--text-muted)',fontSize:'14px'}}>Leads</div></div>
      </div>)}
      {panel==='couples' && (<div>{couples.length===0?<p style={{color:'var(--text-muted)'}}>No couples yet. Share your couple signup link to get started!</p>:couples.map((c,i)=>(<div key={i} className="card" style={{marginBottom:'12px'}}><div style={{fontWeight:600}}>{c.name}{c.partner_name?` & ${c.partner_name}`:''}</div>{c.email&&<div style={{color:'var(--text-muted)',fontSize:'13px'}}>{c.email}</div>}{c.wedding_date&&<div style={{color:'var(--text-dim)',fontSize:'13px'}}>Wedding: {c.wedding_date}</div>}</div>))}</div>)}
      {panel==='shoppers' && (<div>{shoppers.length===0?<p style={{color:'var(--text-muted)'}}>No shoppers yet. Share your cashback link!</p>:shoppers.map((s,i)=>(<div key={i} className="card" style={{marginBottom:'12px'}}><div style={{fontWeight:600}}>{s.name}</div>{s.email&&<div style={{color:'var(--text-muted)',fontSize:'13px'}}>{s.email}</div>}</div>))}</div>)}
      {panel==='leads' && (<div>{leads.length===0?<p style={{color:'var(--text-muted)'}}>No leads yet. Leads from your contact form will appear here.</p>:leads.map((l,i)=>(<div key={i} className="card" style={{marginBottom:'12px'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:600}}>{l.name}</div><div style={{color:'var(--text-dim)',fontSize:'13px'}}>{l.created_at?new Date(l.created_at).toLocaleDateString():''}</div></div><div style={{color:'var(--text-muted)',fontSize:'13px'}}>{l.email}{l.phone?` • ${l.phone}`:''}</div>{l.message&&<div style={{color:'var(--text-muted)',fontSize:'14px',marginTop:'8px'}}>{l.message}</div>}</div>))}</div>)}
      {panel==='earnings' && (<div>
        <p style={{color:'var(--text-muted)',marginBottom:'24px'}}>Your current tier: <strong style={{color:'var(--primary)'}}>{vendor.account_status==='starter'?'Starter (10%)':vendor.account_status==='growth'?'Growth (15%)':vendor.account_status==='pro'?'Pro (20%)':'Free'}</strong></p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px'}}>
          {[{n:'Free',p:'$0',r:'Referral only',c:'var(--text-dim)'},{n:'Starter',p:'$29/mo',r:'10% commission',c:'var(--green,#22c55e)'},{n:'Growth',p:'$59/mo',r:'15% commission',c:'var(--blue,#3b82f6)'},{n:'Pro',p:'$99/mo',r:'20% commission',c:'var(--primary)'}].map(t=>(<div key={t.n} className="card" style={{textAlign:'center'}}><div style={{fontWeight:700,color:t.c,marginBottom:'4px'}}>{t.n}</div><div style={{fontSize:'24px',fontWeight:700}}>{t.p}</div><div style={{color:'var(--text-muted)',fontSize:'13px'}}>{t.r}</div></div>))}
        </div></div>)}
      {panel==='perks' && (<div className="card"><div style={{fontSize:'36px',marginBottom:'12px'}}>🎁</div><h3 style={{fontSize:'20px',fontWeight:600,marginBottom:'8px'}}>25% Personal Cashback</h3><p style={{color:'var(--text-muted)',lineHeight:1.7}}>As a WeTwo vendor, you earn 25% cashback on your own purchases through our partner stores. Use the same cashback link you share with clients!</p></div>)}
      {panel==='settings' && (<div className="card"><h3 style={{fontSize:'18px',fontWeight:600,marginBottom:'20px'}}>Account Info</h3>
        <div style={{display:'grid',gap:'12px'}}>{[['Business',vendor.business_name],['Category',vendor.category],['Contact',vendor.contact_name],['Email',vendor.email],['Phone',vendor.phone],['Location',`${vendor.city||''}, ${vendor.state||''}`]].map(([l,v])=>v?(<div key={l as string} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--text-muted)',fontSize:'14px'}}>{l}</span><span style={{fontSize:'14px',fontWeight:500}}>{v}</span></div>):null)}</div></div>)}
    </main>
    <Toast message={toast} />
  </div>);
}
