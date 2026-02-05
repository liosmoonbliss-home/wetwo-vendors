'use client';
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (<div style={{position:'fixed',bottom:'24px',right:'24px',background:'var(--green,#22c55e)',color:'white',padding:'16px 24px',borderRadius:'8px',fontWeight:600,zIndex:10001}}>&#10003; {message}</div>);
}
