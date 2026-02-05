'use client';

import { useState } from 'react';
import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
  links: { affiliateLink: string };
  showToast: (msg: string) => void;
}

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

  const contactInfo = [
    location && { icon: '📍', label: 'Location', value: location, sub: 'Serving all of New Jersey & beyond' },
    vendor.phone && { icon: '📱', label: 'Phone', value: vendor.phone },
    vendor.email && { icon: '✉️', label: 'Email', value: vendor.email },
    vendor.instagram_handle && { icon: '📷', label: 'Instagram', value: `@${vendor.instagram_handle.replace('@', '')}` },
  ].filter(Boolean) as Array<{ icon: string; label: string; value: string; sub?: string }>;

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

        <div className={`contact-grid${contactInfo.length === 0 ? ' form-only' : ''}`}>
          {/* Left: Contact Info */}
          {contactInfo.length > 0 && (
            <div className="contact-info">
              <h3>Let&apos;s Talk</h3>
              <p>
                Whether you&apos;re planning a wedding, corporate event, or milestone celebration — we&apos;d love to hear about your vision.
              </p>

              {contactInfo.map((info, i) => (
                <div key={i} className="contact-item">
                  <div className="contact-icon">{info.icon}</div>
                  <div>
                    <div className="contact-item-label">{info.label}</div>
                    <div className="contact-item-value">{info.value}</div>
                    {info.sub && <div className="contact-item-sub">{info.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

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
                  placeholder="your@email.com"
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
                  placeholder="(555) 123-4567"
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
                placeholder="Tell us about your event..."
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
