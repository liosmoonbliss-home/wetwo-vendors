'use client'

import { useState } from 'react'

interface ContactFormProps {
  vendorRef: string
  vendorName: string
  accentColor?: string
}

export default function VendorContactForm({ vendorRef, vendorName, accentColor }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event_date: '',
    interest: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_ref: vendorRef,
          ...formData,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div style={{
        background: 'var(--card-bg, #fff)',
        borderRadius: 16,
        padding: 40,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
        <h3 style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
          Message Sent!
        </h3>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Thanks for reaching out! {vendorName} will get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--card-bg, #fff)',
      borderRadius: 16,
      padding: 32,
    }}>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 13,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Your Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Full name"
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-dark, #f3efe9)',
              border: '1px solid var(--border, #e4ddd4)',
              borderRadius: 8,
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-dark, #f3efe9)',
              border: '1px solid var(--border, #e4ddd4)',
              borderRadius: 8,
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 555-1234"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-dark, #f3efe9)',
              border: '1px solid var(--border, #e4ddd4)',
              borderRadius: 8,
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Event Date
          </label>
          <input
            type="date"
            value={formData.event_date}
            onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-dark, #f3efe9)',
              border: '1px solid var(--border, #e4ddd4)',
              borderRadius: 8,
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
          I'm Interested In
        </label>
        <select
          value={formData.interest}
          onChange={(e) => setFormData(prev => ({ ...prev, interest: e.target.value }))}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--bg-dark, #f3efe9)',
            border: '1px solid var(--border, #e4ddd4)',
            borderRadius: 8,
            fontSize: 15,
            color: 'var(--text)',
            fontFamily: 'inherit',
          }}
        >
          <option value="">Select an option...</option>
          <option value="Wedding Planning">Wedding Planning</option>
          <option value="Day-of Coordination">Day-of Coordination</option>
          <option value="Full Event Planning">Full Event Planning</option>
          <option value="Photography">Photography</option>
          <option value="Videography">Videography</option>
          <option value="DJ / Music">DJ / Music</option>
          <option value="Catering">Catering</option>
          <option value="Florals">Florals</option>
          <option value="Venue">Venue</option>
          <option value="Decor">Decor</option>
          <option value="Other">Something Else</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
          Tell Us More
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Share details about your event — date, guest count, venue, special requests..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--bg-dark, #f3efe9)',
            border: '1px solid var(--border, #e4ddd4)',
            borderRadius: 8,
            fontSize: 15,
            color: 'var(--text)',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          padding: 14,
          background: accentColor || 'var(--brand, #c9944a)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          opacity: submitting ? 0.7 : 1,
          transition: 'all 0.2s',
        }}
      >
        {submitting ? 'Sending...' : 'Send Message ✨'}
      </button>
    </form>
  )
}

