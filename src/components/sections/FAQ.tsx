'use client';

import { useState } from 'react';
import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function FAQSection({ vendor }: Props) {
  const faqs = Array.isArray(vendor.faqs) ? vendor.faqs : [];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="section">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Questions</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.id || i} style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: isOpen ? 'var(--primary)' : 'var(--text)',
                    transition: 'color 0.3s',
                  }}>
                    {faq.question}
                  </span>
                  <span style={{
                    fontSize: '20px',
                    color: 'var(--text-dim)',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    flexShrink: 0,
                    marginLeft: '16px',
                  }}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 24px 20px',
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: 'var(--text-muted)',
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
