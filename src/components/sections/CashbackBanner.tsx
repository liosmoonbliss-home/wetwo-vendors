'use client';

import { useState, useEffect, type FormEvent } from 'react';
import type { Vendor } from '@/lib/types';

interface ShopBannerProps {
  vendor: Vendor;
  links: any;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

export function ShopBanner({ vendor, links, showForm, setShowForm }: ShopBannerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-open form when ?shop=true (or legacy ?gift=true) is in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('shop') === 'true' || params.get('gift') === 'true') {
      setShowForm(true);
    }
  }, [setShowForm]);

  const affiliateRef = vendor.goaffpro_referral_code || `vendor-${vendor.ref}`;
  const storeUrl = `https://wetwo.love?ref=${affiliateRef}`;
  const contactName = vendor.contact_name || vendor.business_name;
  const displayName = vendor.white_label_name || vendor.business_name;

  async function handleShopSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      vendor_id: vendor.id,
      vendor_ref: vendor.ref,
      vendor_name: vendor.business_name,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || null,
      interest: 'Shop',
      message: null,
    };

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Shop form error:', err);
    }

    // Always redirect to store
    window.location.href = storeUrl;
  }

  return (
    <>
      {/* Banner */}
      <div className="cashback-banner" suppressHydrationWarning>
        <p>
          ✨ Browse thousands of wedding, home &amp; fashion gifts at <strong>{displayName}{"'"}s</strong> store —{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowForm(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            Shop Now →
          </a>
        </p>
      </div>

      {/* Shop Form Modal */}
      {showForm && !submitted && (
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
                background: 'linear-gradient(135deg, #c9944a, #d4a76a)',
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
                Shop {displayName}{"'"}s Store
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  margin: '8px 0 0',
                  lineHeight: 1.5,
                }}
              >
                Enter your info and start browsing thousands of wedding, home &amp; fashion gifts.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleShopSubmit} style={{ padding: '24px 28px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="shop-name"
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
                  id="shop-name"
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
                  htmlFor="shop-email"
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
                  id="shop-email"
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
                  htmlFor="shop-phone"
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
                  id="shop-phone"
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
                  background: submitting ? '#9a8d80' : 'linear-gradient(135deg, #c9944a, #d4a76a)',
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
                {submitting ? 'Loading...' : '🛍️ Start Shopping →'}
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
                {contactName} may follow up with exclusive offers and updates.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
