'use client';

import { useState, type FormEvent } from 'react';
import type { Vendor } from '@/lib/types';

interface ContactSectionProps {
  vendor: Vendor;
  links: any;
  showToast: (msg: string) => void;
}

export function ContactSection({ vendor, links, showToast }: ContactSectionProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
      event_date: (formData.get('event_date') as string) || null,
      interest: (formData.get('interest') as string) || null,
      message: (formData.get('message') as string) || null,
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        showToast(`Thank you! ${vendor.contact_name || vendor.business_name} will get back to you soon! ✨`);
        form.reset();
        // Reset submitted state after 5 seconds so they can submit again
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        console.error('Lead submission failed:', await res.text());
        showToast(`Thank you! ${vendor.contact_name || vendor.business_name} will get back to you soon! ✨`);
        form.reset();
      }
    } catch (err) {
      console.error('Contact form error:', err);
      // Still show success to the visitor (the email might work even if DB insert fails)
      showToast(`Thank you! ${vendor.contact_name || vendor.business_name} will get back to you soon! ✨`);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const contactName = vendor.contact_name || vendor.first_name || vendor.business_name;
  const contactEmail = vendor.email;
  const contactPhone = vendor.phone;
  const contactCity = vendor.city;
  const contactState = vendor.state;
  const contactInstagram = vendor.instagram_handle;

  return (
    <section id="contact" className="section">
      <div className="section-header">
        <div className="section-label">Get In Touch</div>
        <h2 className="section-title">
          Let&apos;s Plan <em>Together</em>
        </h2>
        <p className="section-subtitle">
          Ready to start planning? Send us a message and we&apos;ll be in touch within 24 hours.
        </p>
      </div>

      <div className="contact-grid">
        {/* Left: Contact Info */}
        <div className="contact-info">
          <h3>
            {vendor.business_name}
          </h3>
          <p>
            {vendor.bio
              ? vendor.bio.substring(0, 200) + (vendor.bio.length > 200 ? '...' : '')
              : `Get in touch with ${contactName} to discuss your event. We'd love to hear from you!`}
          </p>

          {contactEmail && (
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div className="contact-item-content">
                <div className="contact-item-label">Email</div>
                <div className="contact-item-value">{contactEmail}</div>
              </div>
            </div>
          )}

          {contactPhone && (
            <div className="contact-item">
              <div className="contact-icon">📱</div>
              <div className="contact-item-content">
                <div className="contact-item-label">Phone</div>
                <div className="contact-item-value">{contactPhone}</div>
              </div>
            </div>
          )}

          {contactCity && contactState && (
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div className="contact-item-content">
                <div className="contact-item-label">Location</div>
                <div className="contact-item-value">{contactCity}, {contactState}</div>
              </div>
            </div>
          )}

          {contactInstagram && (
            <div className="contact-item">
              <div className="contact-icon">📷</div>
              <div className="contact-item-content">
                <div className="contact-item-label">Instagram</div>
                <div className="contact-item-value">@{contactInstagram.replace('@', '')}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Contact Form */}
        <div className="contact-form">
          {submitted ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
              <h3 style={{ fontFamily: 'var(--font-heading, "Playfair Display", serif)', fontSize: '24px', marginBottom: '12px' }}>
                Message Sent!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Thank you for reaching out. {contactName} will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-name">Your Name *</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email *</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-phone">Phone</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-date">Event Date</label>
                  <input
                    type="date"
                    id="contact-date"
                    name="event_date"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-interest">I&apos;m Interested In</label>
                <select id="contact-interest" name="interest">
                  <option value="">Select an option...</option>
                  {vendor.category === 'Photographer' || vendor.category === 'Videographer' ? (
                    <>
                      <option value="Wedding Photography">Wedding Photography</option>
                      <option value="Engagement Shoot">Engagement Shoot</option>
                      <option value="Event Coverage">Event Coverage</option>
                      <option value="Portrait Session">Portrait Session</option>
                      <option value="Other">Something Else</option>
                    </>
                  ) : vendor.category === 'DJ' ? (
                    <>
                      <option value="Wedding DJ">Wedding DJ</option>
                      <option value="Party DJ">Party DJ</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Other">Something Else</option>
                    </>
                  ) : (
                    <>
                      <option value="Wedding Planning">Wedding Planning</option>
                      <option value="Day-of Coordination">Day-of Coordination</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Birthday / Celebration">Birthday / Celebration</option>
                      <option value="Other">Something Else</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Tell Us More</label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Share details about your event — type, guest count, venue, special requests, etc."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? 'Sending...' : 'Send Message ✨'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
