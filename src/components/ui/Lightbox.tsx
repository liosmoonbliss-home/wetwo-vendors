'use client';
import { useEffect, useCallback } from 'react';
interface Props { images: string[]; open: boolean; index: number; onClose: () => void; onNavigate: (i: number) => void; }
export function Lightbox({ images, open, index, onClose, onNavigate }: Props) {
  const next = useCallback(() => onNavigate((index+1)%images.length), [index,images.length,onNavigate]);
  const prev = useCallback(() => onNavigate((index-1+images.length)%images.length), [index,images.length,onNavigate]);
  useEffect(() => { if (!open) return; function h(e: KeyboardEvent) { if(e.key==='Escape')onClose(); if(e.key==='ArrowRight')next(); if(e.key==='ArrowLeft')prev(); } document.addEventListener('keydown',h); document.body.style.overflow='hidden'; return () => { document.removeEventListener('keydown',h); document.body.style.overflow=''; }; }, [open,next,prev,onClose]);
  if (!open || images.length===0) return null;
  return (<div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px'}}>
    <button onClick={onClose} style={{position:'absolute',top:'20px',right:'20px',background:'none',border:'none',color:'white',fontSize:'32px',cursor:'pointer'}}>x</button>
    <button onClick={e=>{e.stopPropagation();prev()}} style={{position:'absolute',left:'20px',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:'28px',width:'50px',height:'50px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>&lsaquo;</button>
    <img src={images[index]} alt={`Image ${index+1}`} onClick={e=>e.stopPropagation()} style={{maxWidth:'90%',maxHeight:'85vh',objectFit:'contain',borderRadius:'8px'}} />
    <button onClick={e=>{e.stopPropagation();next()}} style={{position:'absolute',right:'20px',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:'28px',width:'50px',height:'50px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>&rsaquo;</button>
    <div style={{position:'absolute',bottom:'20px',left:'50%',transform:'translateX(-50%)',color:'rgba(255,255,255,0.6)',fontSize:'14px'}}>{index+1} / {images.length}</div>
  </div>);
}
