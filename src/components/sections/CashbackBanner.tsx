'use client';

import { useState, type FormEvent } from 'react';
import type { Vendor } from '@/lib/types';

interface CashbackBannerProps {
  vendor: Vendor;
  links: any;
}

export function CashbackBanner({ vendor, links }: CashbackBannerProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // The actual store URL with affiliate attribution
  const affiliateRef = vendor.goaffpro_referral_code || `vendor-${vendor.ref}`;
  const storeUrl = `https://wetwo.love?ref=${affiliateRef}`;

  async function handleShopperSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      vendor_ref: vendor.ref,
      vendor_name: vendor.business_name,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || null,
      source: 'cashback_banner',
    };

    try {
      const res = await fetch('/api/shoppers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // Redirect to shopper dashboard if we have an ID
      if (data.client?.id) { window.location.href = '/shopper/' + data.client.id + '/dashboard'; } else { window.open(data.storeUrl || storeUrl, '_blank'); }
      setShowForm(false);
      form.reset();
    } catch (err) {
      console.error('Shopper registration error:', err);
      // Still redirect — don't block shopping
      window.open(storeUrl, '_blank');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Banner */}
      <div className="cashback-banner">
        <p>
          ✨ Shop with us and get <strong>25% cashback</strong> on everything — wedding registries, home, fashion &amp; more —{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowForm(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            Unlock Cashback →
          </a>
        </p>
      </div>

      {/* Registration Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '24px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '0',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                padding: '24px 28px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowForm(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛍️</div>
              <h2
                style={{
                  color: '#fff',
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Unlock 25% Cashback
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  margin: '8px 0 0',
                  lineHeight: 1.5,
                }}
              >
                Courtesy of <strong>{vendor.business_name}</strong>. Enter your info below and start shopping with cashback on every purchase.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleShopperSubmit} style={{ padding: '24px 28px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="shopper-name"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#6b5e52',
                    marginBottom: '6px',
                  }}
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  id="shopper-name"
                  name="name"
                  placeholder="Full name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#f3efe9',
                    border: '1px solid #e4ddd4',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    color: '#2c2420',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="shopper-email"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#6b5e52',
                    marginBottom: '6px',
                  }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="shopper-email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#f3efe9',
                    border: '1px solid #e4ddd4',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    color: '#2c2420',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="shopper-phone"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#6b5e52',
                    marginBottom: '6px',
                  }}
                >
                  Phone <span style={{ color: '#9a8d80', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="tel"
                  id="shopper-phone"
                  name="phone"
                  placeholder="(555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#f3efe9',
                    border: '1px solid #e4ddd4',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    color: '#2c2420',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: submitting ? '#9a8d80' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {submitting ? 'Unlocking...' : '🛍️ Start Shopping — 25% Cashback'}
              </button>

              <p
                style={{
                  fontSize: '12px',
                  color: '#9a8d80',
                  textAlign: 'center',
                  marginTop: '12px',
                  lineHeight: 1.5,
                }}
              >
                Free forever. No credit card needed. Your cashback link will open in a new tab.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
