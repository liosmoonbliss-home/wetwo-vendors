'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PayPalConnect from '@/components/dashboard/PayPalConnect';

interface ShopperData {
  shopper: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    vendor_ref?: string;
    goaffpro_affiliate_id?: string;
    goaffpro_referral_code?: string;
    created_at: string;
    paypal_email?: string;
  };
  vendor: {
    ref: string;
    business_name: string;
    photo_url?: string;
  } | null;
}

export default function ShopperDashboard() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ShopperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/shopper?id=${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('Shopper not found'))
      .finally(() => setLoading(false));

    // Track visit
    fetch('/api/admin/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'page_view', vendor_ref: '', metadata: { shopper_id: id } }),
    }).catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ color: '#7a7570', fontSize: '14px', textAlign: 'center', paddingTop: '100px' }}>
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (error || !data?.shopper) {
    return (
      <div style={pageStyle}>
        <div style={{ color: '#e74c3c', fontSize: '16px', textAlign: 'center', paddingTop: '100px' }}>
          {error || 'Something went wrong'}
        </div>
      </div>
    );
  }

  const s = data.shopper;
  const v = data.vendor;
  const firstName = (s.name || 'there').split(' ')[0];
  const shopLink = s.goaffpro_referral_code
    ? `https://wetwo.love?ref=${s.goaffpro_referral_code}`
    : 'https://wetwo.love';

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '12px', letterSpacing: '5px', color: '#c9a96e',
            textTransform: 'uppercase', marginBottom: '8px',
          }}>WETWO</div>
          <h1 style={{
            fontSize: '32px', color: '#e8e0d4', fontWeight: 300, margin: '0 0 8px',
            fontFamily: "'Georgia', serif",
          }}>
            Welcome, {firstName}
          </h1>
          <p style={{ color: '#7a7570', fontSize: '14px', margin: 0 }}>
            Your cashback shopping dashboard
          </p>
        </div>

        {/* Referred by vendor banner */}
        {v && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px 20px', borderRadius: '12px',
            background: 'rgba(201,169,110,0.06)',
            border: '1px solid rgba(201,169,110,0.12)',
            marginBottom: '24px',
          }}>
            {v.photo_url && (
              <img src={v.photo_url} alt="" style={{
                width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover',
              }} />
            )}
            <div>
              <div style={{ color: '#c9a96e', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Referred by
              </div>
              <div style={{ color: '#e8e0d4', fontSize: '15px' }}>{v.business_name}</div>
            </div>
          </div>
        )}

        {/* Shop Now CTA */}
        <div style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.04))',
          border: '1px solid rgba(201,169,110,0.15)',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <div style={{ color: '#e8e0d4', fontSize: '20px', fontWeight: 300, marginBottom: '8px', fontFamily: "'Georgia', serif" }}>
            Shop & Earn 25% Cashback
          </div>
          <p style={{ color: '#7a7570', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
            Every purchase you make on WeTwo earns you 25% back. Shop gifts for weddings, for friends, or for yourself.
          </p>
          <a href="https://wetwo.love" target="_blank" style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#c9a96e',
            color: '#0f1419',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.5px',
            fontFamily: 'inherit',
          }}>
            Shop Now →
          </a>
        </div>

        {/* Share Your Link */}
        {s.goaffpro_referral_code && (
          <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            marginBottom: '24px',
          }}>
            <div style={{ color: '#e8e0d4', fontSize: '16px', fontWeight: 400, marginBottom: '8px', fontFamily: "'Georgia', serif" }}>
              Share & Earn More
            </div>
            <p style={{ color: '#7a7570', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
              Share your personal link with friends. When they shop, you earn cashback on their purchases too.
            </p>
            <div style={{
              display: 'flex', gap: '8px', alignItems: 'center',
            }}>
              <input
                readOnly
                value={shopLink}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: '#c8c0b4',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <CopyButton text={shopLink} />
            </div>
          </div>
        )}

        {/* PayPal Connect */}
        <div style={{ marginBottom: '24px' }}>
          <PayPalConnect type="shopper" refId={id} darkTheme={true} />
        </div>

        {/* Account Info */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px',
        }}>
          <div style={{
            color: '#5a5550', fontSize: '10px', letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: '12px',
          }}>
            Your Account
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ color: '#7a7570', fontSize: '13px' }}>
              <span style={{ color: '#5a5550' }}>Name: </span>{s.name || '—'}
            </div>
            <div style={{ color: '#7a7570', fontSize: '13px' }}>
              <span style={{ color: '#5a5550' }}>Email: </span>{s.email || '—'}
            </div>
            <div style={{ color: '#7a7570', fontSize: '13px' }}>
              <span style={{ color: '#5a5550' }}>Member since: </span>
              {new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#3a3530', fontSize: '11px', letterSpacing: '2px' }}>
          WETWO · WHERE EVERY GIFT GOES FURTHER
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button onClick={handleCopy} style={{
      padding: '12px 16px',
      background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(201,169,110,0.15)',
      color: copied ? '#22c55e' : '#c9a96e',
      border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'rgba(201,169,110,0.2)'}`,
      borderRadius: '8px',
      fontSize: '13px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #0f1419 100%)',
  fontFamily: "'Georgia', 'Times New Roman', serif",
};
