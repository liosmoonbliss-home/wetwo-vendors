'use client';
import { useState } from 'react';
import type { Vendor } from '@/lib/types';
export function ContactSection({ vendor }: { vendor: Vendor }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', event_date:'', interest:'', message:'' });
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setStatus('sending');
    try {
      const res = await fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ vendor_id: vendor.id, ...form }) });
      if (res.ok) { setStatus('sent'); setForm({ name:'',email:'',phone:'',event_date:'',interest:'',message:'' }); } else setStatus('error');
    } catch { setStatus('error'); }
  }
  return (<section id="contact" className="section" style={{padding:'100px 40px'}}>
    <div style={{maxWidth:'700px',margin:'0 auto'}}>
      <div className="section-header"><div className="section-label">Get In Touch</div><h2 className="section-title">Contact Us</h2><p className="section-subtitle">Tell us about your event and we will get back to you shortly.</p></div>
      {status==='sent' ? (<div style={{textAlign:'center',padding:'40px',background:'var(--bg-card)',borderRadius:'16px',border:'1px solid var(--border)'}}><div style={{fontSize:'48px',marginBottom:'16px'}}>&#10003;</div><h3 style={{fontSize:'24px',marginBottom:'8px'}}>Message Sent!</h3><p style={{color:'var(--text-muted)'}}>We will be in touch soon.</p></div>) : (
      <form onSubmit={handleSubmit}>
        <div className="form-row"><div className="form-group"><label>Name *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div><div className="form-group"><label>Email *</label><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div></div>
        <div className="form-row"><div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div><div className="form-group"><label>Event Date</label><input type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})} /></div></div>
        <div className="form-group"><label>Interest</label><select value={form.interest} onChange={e=>setForm({...form,interest:e.target.value})}><option value="">Select...</option><option>Wedding</option><option>Corporate Event</option><option>Private Party</option><option>Other</option></select></div>
        <div className="form-group"><label>Message</label><textarea rows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} /></div>
        <button type="submit" className="btn btn-primary" disabled={status==='sending'} style={{width:'100%',padding:'16px',fontSize:'16px'}}>{status==='sending'?'Sending...':'Send Message'}</button>
        {status==='error' && <p style={{color:'var(--red)',marginTop:'12px',textAlign:'center'}}>Something went wrong. Please try again.</p>}
      </form>)}
    </div>
  </section>);
}
