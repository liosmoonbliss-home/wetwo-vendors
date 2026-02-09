'use client';

import { useState, useEffect } from 'react';

interface PayPalConnectProps {
  type: 'vendor' | 'couple' | 'shopper';
  refId: string; // vendor ref, couple slug, or shopper id
  darkTheme?: boolean; // couple dashboard is dark
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.substring(0, 2);
  return `${visible}${'●'.repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

export default function PayPalConnect({ type, refId, darkTheme = false }: PayPalConnectProps) {
  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Color scheme
  const colors = darkTheme
    ? { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', text: '#e8e0d4', sub: '#7a7570', muted: '#5a5550', accent: '#c9a96e', inputBg: 'rgba(255,255,255,0.06)', successBg: 'rgba(34,197,94,0.08)', successBorder: 'rgba(34,197,94,0.2)' }
    : { bg: '#faf9f7', border: '#e8e0d4', text: '#2c2825', sub: '#7a7570', muted: '#9a9590', accent: '#c9a96e', inputBg: '#ffffff', successBg: 'rgba(34,197,94,0.06)', successBorder: 'rgba(34,197,94,0.15)' };

  useEffect(() => {
    if (!refId) return;
    fetch(`/api/payout?type=${type}&ref=${refId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paypal_email) {
          setSavedEmail(data.paypal_email);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [type, refId]);

  const handleSave = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ref: refId, paypal_email: email.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedEmail(data.paypal_email);
        setEmail('');
        setEditing(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Connection error, try again');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{
        padding: '24px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
      }}>
        <div style={{ color: colors.muted, fontSize: '13px' }}>Loading payout info...</div>
      </div>
    );
  }

  // Connected state
  if (savedEmail && !editing) {
    return (
      <div style={{
        padding: '24px',
        background: success ? colors.successBg : colors.bg,
        border: `1px solid ${success ? colors.successBorder : colors.border}`,
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {/* PayPal logo colors */}
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #003087, #009cde)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: '#fff',
            fontFamily: 'Arial, sans-serif', fontStyle: 'italic',
          }}>P</div>
          <div>
            <div style={{ color: colors.text, fontSize: '15px', fontWeight: 500 }}>
              PayPal Connected
            </div>
            <div style={{ color: colors.sub, fontSize: '13px', marginTop: '2px' }}>
              {maskEmail(savedEmail)}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {success && (
              <span style={{ color: '#22c55e', fontSize: '13px' }}>✓ Saved!</span>
            )}
            <span style={{
              background: 'rgba(34,197,94,0.12)',
              color: '#22c55e',
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 500,
            }}>Ready for payouts</span>
          </div>
        </div>
        <button
          onClick={() => { setEditing(true); setEmail(savedEmail); }}
          style={{
            background: 'none', border: 'none',
            color: colors.muted, fontSize: '12px',
            cursor: 'pointer', padding: 0,
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          Change PayPal email
        </button>
      </div>
    );
  }

  // Not connected / editing state
  return (
    <div style={{
      padding: '24px',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #003087, #009cde)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 700, color: '#fff',
          fontFamily: 'Arial, sans-serif', fontStyle: 'italic',
        }}>P</div>
        <div>
          <div style={{ color: colors.text, fontSize: '15px', fontWeight: 500 }}>
            {editing ? 'Update PayPal Email' : 'Connect Your PayPal'}
          </div>
          <div style={{ color: colors.sub, fontSize: '13px', marginTop: '2px' }}>
            {editing ? 'Enter your updated PayPal email below' : 'Add your PayPal email so we can send you your earnings'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="your.email@paypal.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: colors.inputBg,
              border: `1px solid ${error ? '#e74c3c' : colors.border}`,
              borderRadius: '8px',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
          />
          {error && (
            <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '6px' }}>{error}</div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={loading || !email.trim()}
          style={{
            padding: '12px 20px',
            background: loading || !email.trim()
              ? 'rgba(201,169,110,0.3)'
              : 'linear-gradient(135deg, #003087, #009cde)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading || !email.trim() ? 'default' : 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            minWidth: '100px',
          }}
        >
          {loading ? 'Saving...' : 'Connect'}
        </button>
        {editing && (
          <button
            onClick={() => { setEditing(false); setEmail(''); setError(''); }}
            style={{
              padding: '12px 14px',
              background: 'transparent',
              color: colors.muted,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <div style={{ color: colors.muted, fontSize: '11px', marginTop: '12px', lineHeight: 1.4 }}>
        We'll send your cashback earnings directly to this PayPal account.
        Make sure it matches your active PayPal email.
      </div>
    </div>
  );
}
