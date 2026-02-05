'use client';
export function CashbackBanner({ affiliateLink }: { affiliateLink: string }) {
  return (<section style={{padding:'60px 40px',background:'var(--primary-dim)',textAlign:'center'}}>
    <div style={{maxWidth:'700px',margin:'0 auto'}}>
      <div style={{fontSize:'36px',marginBottom:'12px'}}>&#127881;</div>
      <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'28px',fontWeight:500,marginBottom:'12px'}}>Earn <span style={{color:'var(--primary)'}}>25% Cashback</span> on Your Wedding</h2>
      <p style={{color:'var(--text-muted)',fontSize:'15px',marginBottom:'24px'}}>Shop through our WeTwo link and get cashback on wedding essentials.</p>
      <a href={affiliateLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Start Earning Cashback</a>
    </div>
  </section>);
}
