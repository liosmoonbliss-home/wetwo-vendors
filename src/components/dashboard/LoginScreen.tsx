'use client';
import { useState } from 'react';
export function LoginScreen({ vendorName, onLogin }: { vendorName: string; onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  return (<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:'40px'}}>
    <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'16px',padding:'48px',maxWidth:'400px',width:'100%',textAlign:'center'}}>
      <div style={{fontSize:'36px',marginBottom:'16px'}}>&#128274;</div>
      <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'28px',fontWeight:500,marginBottom:'8px'}}>{vendorName}</h2>
      <p style={{color:'var(--text-muted)',fontSize:'14px',marginBottom:'32px'}}>Enter your dashboard password</p>
      <div className="form-group"><input type="password" placeholder="Enter password" value={pw} onChange={e=>{setPw(e.target.value);setError(false)}} onKeyDown={e=>{if(e.key==='Enter')onLogin(pw)}} style={{textAlign:'center'}} /></div>
      {error && <p style={{color:'var(--red,#ef4444)',fontSize:'13px',marginBottom:'16px'}}>Invalid password</p>}
      <button onClick={()=>onLogin(pw)} className="btn btn-primary" style={{width:'100%',padding:'14px'}}>Access Dashboard</button>
    </div>
  </div>);
}
