'use client';

import { useState } from 'react';
import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
  links: { affiliateLink: string };
  showToast: (msg: string) => void;
}

// Styled icon components with colored backgrounds
const IconLocation = () => (
  <div className="contact-icon contact-icon-location">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>
);

const IconHours = () => (
  <div className="contact-icon contact-icon-hours">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  </div>
);

const IconPhone = () => (
  <div className="contact-icon contact-icon-phone">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  </div>
);

const IconEmail = () => (
  <div className="contact-icon contact-icon-email">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  </div>
);

const IconInstagram = () => (
  <div className="contact-icon contact-icon-instagram">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  </div>
);

export function ContactSection({ vendor, links, showToast }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    event_date: '', interest: '', message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, vendor_id: vendor.id }),
      });

      if (res.ok) {
        showToast('Message sent! We\'ll be in touch soon.');
        setForm({ name: '', email: '', phone: '', event_date: '', interest: '', message: '' });
      } else {
        showToast('Something went wrong. Please try again.');
      }
    } catch {
      showToast('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  const location = [vendor.city, vendor.state].filter(Boolean).join(', ');
  
  // Clean up Instagram handle - remove full URL if present
  const getInstagramHandle = (handle?: string) => {
    if (!handle) return null;
    // Remove URL parts if present
    const cleaned = handle
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/\/$/, '')
      .replace(/^@/, '');
    return `@${cleaned}`;
  };

  const instagramHandle = getInstagramHandle(vendor.instagram_handle);

  const interestOptions = getInterestOptions(vendor.category);

  return (
    <section id="contact" className="section">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Get in Touch</span>
          <h2 className="section-title">Let&apos;s Plan Something Amazing</h2>
          <p className="section-subtitle">
            Ready to start planning? Reach out for a free consultation.
          </p>
        </div>

        <div className="contact-grid">
          {/* Left: Contact Info */}
          <div className="contact-info">
            <h3>Let&apos;s Talk</h3>
            <p>
              Whether you&apos;re planning a wedding, corporate event, or milestone celebration — we&apos;d love to hear about your vision.
            </p>

            {/* Location */}
            {location && (
              <div className="contact-item">
                <IconLocation />
                <div>
                  <div className="contact-item-label">Location</div>
                  <div className="contact-item-value">{location}</div>
                  <div className="contact-item-sub">Serving all of New Jersey &amp; beyond</div>
                </div>
              </div>
            )}

            {/* Hours - always show default if vendor doesn't have specific hours */}
            <div className="contact-item">
              <IconHours />
              <div>
                <div className="contact-item-label">Hours</div>
                <div className="contact-item-value">Monday – Saturday</div>
                <div className="contact-item-sub">12pm – 10pm</div>
              </div>
            </div>

            {/* Phone */}
            {vendor.phone && (
              <div className="contact-item">
                <IconPhone />
                <div>
                  <div className="contact-item-label">Phone</div>
                  <div className="contact-item-value">{vendor.phone}</div>
                </div>
              </div>
            )}

            {/* Email */}
            {vendor.email && (
              <div className="contact-item">
                <IconEmail />
                <div>
                  <div className="contact-item-label">Email</div>
                  <div className="contact-item-value">
                    <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
                  </div>
                </div>
              </div>
            )}

            {/* Instagram */}
            {instagramHandle && (
              <div className="contact-item">
                <IconInstagram />
                <div>
                  <div className="contact-item-label">Instagram</div>
                  <div className="contact-item-value">{instagramHandle}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact Form */}
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="(862) 555-1234"
                />
              </div>
              <div className="form-group">
                <label>Event Date</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => setForm({ ...form, event_date: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>I&apos;m Interested In</label>
              <select
                value={form.interest}
                onChange={e => setForm({ ...form, interest: e.target.value })}
              >
                <option value="">Select an option...</option>
                {interestOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tell Us More</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Share details about your event — type, guest count, venue, special requests, etc."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                width: '100%', justifyContent: 'center',
                padding: '16px', fontSize: '15px', borderRadius: '12px',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Sending...' : 'Send Message ✨'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function getInterestOptions(category?: string): string[] {
  const base = ['Something Else'];
  const categoryOptions: Record<string, string[]> = {
    'Planner': ['Wedding Planning', 'Day-of Coordination', 'DJ Services', 'Photo / Video', 'Decor & Backdrops', 'Corporate Event'],
    'Day-of Coordinator': ['Wedding Planning', 'Day-of Coordination', 'DJ Services', 'Photo / Video', 'Decor & Backdrops', 'Corporate Event'],
    'Event Planner': ['Wedding Planning', 'Day-of Coordination', 'DJ Services', 'Photo / Video', 'Decor & Backdrops', 'Balloon Designs', 'Corporate Event'],
    'Photographer': ['Wedding Photography', 'Engagement Session', 'Event Coverage', 'Portrait Session', 'Corporate Headshots'],
    'Videographer': ['Wedding Film', 'Highlight Reel', 'Event Coverage', 'Corporate Video'],
    'DJ': ['Wedding DJ', 'Corporate Event', 'Birthday Party', 'Holiday Party', 'MC Services'],
    'Caterer': ['Wedding Catering', 'Corporate Catering', 'Private Event', 'Tasting Request'],
    'Florist': ['Wedding Flowers', 'Event Florals', 'Custom Arrangement', 'Consultation'],
    'Venue': ['Wedding Venue', 'Corporate Event', 'Private Party', 'Venue Tour'],
    'Hair & Makeup': ['Bridal Beauty', 'Bridesmaid Services', 'Special Event', 'Trial Session'],
  };
  return [...(categoryOptions[category || ''] || ['Wedding Services', 'Event Services', 'Consultation']), ...base];
}
