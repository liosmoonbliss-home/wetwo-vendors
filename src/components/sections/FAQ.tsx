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

        <div className="faq-list">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.id || i} className={`faq-item${isOpen ? ' open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-chevron">+</span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
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
