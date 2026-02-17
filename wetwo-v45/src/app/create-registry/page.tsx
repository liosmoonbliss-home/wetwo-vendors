'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// ═══════════════════════════════════════════════════════════════
// CREATE REGISTRY PAGE — Couples registration form
// URL: /create-registry?ref=vendor-xxx&cb=20
// Posts to: /api/couples/signup (existing pipeline)
// ═══════════════════════════════════════════════════════════════

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','District of Columbia'
]

interface VendorInfo {
  id: string
  ref: string
  business_name: string
  photo_url: string | null
  tier: string
}

function CreateRegistryForm() {
  const searchParams = useSearchParams()
  const refParam = searchParams.get('ref') || ''
  const cbParam = searchParams.get('cb') || '0'

  const [vendor, setVendor] = useState<VendorInfo | null>(null)
  const [vendorLoading, setVendorLoading] = useState(!!refParam)

  const [form, setForm] = useState({
    partner_a: '',
    partner_b: '',
    email: '',
    phone: '',
    state: '',
    wedding_date: '',
    guest_count: '',
    budget_range: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{
    dashboardUrl: string
    registryUrl: string
    coupleName: string
  } | null>(null)

  // Resolve vendor from ref param
  useEffect(() => {
    if (!refParam) {
      setVendorLoading(false)
      return
    }

    fetch(`/api/vendor/resolve?ref=${encodeURIComponent(refParam)}`)
      .then(r => r.json())
      .then(data => setVendor(data.vendor || null))
      .catch(() => {})
      .finally(() => setVendorLoading(false))
  }, [refParam])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.partner_a.trim()) {
      setError('Please enter your first name')
      return
    }
    if (!form.email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!form.state) {
      setError('Please select your state')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/couples/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_a: form.partner_a.trim(),
          partner_b: form.partner_b.trim() || null,
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          state: form.state,
          wedding_date: form.wedding_date || null,
          guest_count: form.guest_count || null,
          budget_range: form.budget_range || null,
          source: vendor ? `vendor-referral-${vendor.ref}` : 'create-registry',
          referred_by_vendor_id: vendor?.id || null,
          referred_by_vendor: vendor?.business_name || null,
          referral_bonus_percent: parseInt(cbParam) || 0,
          cashback_rate: parseInt(cbParam) || 0,
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      const coupleName = form.partner_b.trim()
        ? `${form.partner_a.trim()} & ${form.partner_b.trim()}`
        : form.partner_a.trim()

      setSuccess({
        dashboardUrl: data.dashboardUrl || data.magicLink || '',
        registryUrl: data.registryUrl || '',
        coupleName,
      })
    } catch (err) {
      setError('Connection error. Please check your internet and try again.')
      setSubmitting(false)
    }
  }

  // ── Success State ──────────────────────────────────────────
  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.successIcon}>🎉</div>
          <h1 style={styles.successHeading}>
            Your Registry is Ready!
          </h1>
          <p style={styles.successSubtext}>
            Welcome, {success.coupleName}. Your cashback wedding registry has been created
            {parseInt(cbParam) > 0 && (
              <> — you'll earn <strong style={{ color: '#22c55e' }}>{cbParam}% cash back</strong> on every gift</>
            )}
            .
          </p>

          {vendor && (
            <div style={styles.vendorPill}>
              Referred by {vendor.business_name}
            </div>
          )}

          <p style={styles.successNote}>
            Check your email for your personal dashboard link.
          </p>

          <div style={styles.successButtons}>
            {success.dashboardUrl && (
              <a href={success.dashboardUrl} style={styles.primaryButton}>
                Open My Dashboard →
              </a>
            )}
            {success.registryUrl && (
              <a href={success.registryUrl} style={styles.secondaryButton}>
                View My Registry →
              </a>
            )}
          </div>

          <a href="https://wetwo.love" style={styles.backLink}>
            ← Back to WeTwo
          </a>
        </div>
      </div>
    )
  }

  // ── Form State ─────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <span style={styles.logo}>WeTwo</span>
        </div>

        <h1 style={styles.heading}>
          Create Your Registry
        </h1>
        <p style={styles.subheading}>
          Sign up for your free cashback wedding registry
          {parseInt(cbParam) > 0 && (
            <> — earn <strong style={{ color: '#22c55e' }}>{cbParam}% back</strong> on every gift</>
          )}
          .
        </p>

        {/* Vendor attribution */}
        {vendorLoading ? (
          <div style={styles.vendorBanner}>
            <div style={{ color: '#9a8d80', fontSize: 13 }}>Loading referral...</div>
          </div>
        ) : vendor ? (
          <div style={styles.vendorBanner}>
            {vendor.photo_url && (
              <img
                src={vendor.photo_url}
                alt={vendor.business_name}
                style={styles.vendorPhoto}
              />
            )}
            <div>
              <div style={styles.vendorLabel}>Referred by</div>
              <div style={styles.vendorName}>{vendor.business_name}</div>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Partner names */}
          <div style={styles.row}>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>Your First Name *</label>
              <input
                name="partner_a"
                type="text"
                placeholder="e.g. Sarah"
                value={form.partner_a}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>Partner's First Name</label>
              <input
                name="partner_b"
                type="text"
                placeholder="e.g. James"
                value={form.partner_b}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email Address *</label>
            <input
              name="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Phone */}
          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="(555) 555-5555"
              value={form.phone}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* State */}
          <div style={styles.field}>
            <label style={styles.label}>State *</label>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              style={{
                ...styles.input,
                color: form.state ? '#2c2420' : '#9a8d80',
              }}
              required
            >
              <option value="">Select your state</option>
              {US_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Wedding date */}
          <div style={styles.field}>
            <label style={styles.label}>Wedding Date</label>
            <input
              name="wedding_date"
              type="date"
              value={form.wedding_date}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Guest count + Budget — optional extras */}
          <div style={styles.row}>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>Guest Count</label>
              <select
                name="guest_count"
                value={form.guest_count}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  color: form.guest_count ? '#2c2420' : '#9a8d80',
                }}
              >
                <option value="">Select</option>
                <option value="Under 50">Under 50</option>
                <option value="50-100">50–100</option>
                <option value="100-200">100–200</option>
                <option value="200+">200+</option>
              </select>
            </div>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>Budget Range</label>
              <select
                name="budget_range"
                value={form.budget_range}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  color: form.budget_range ? '#2c2420' : '#9a8d80',
                }}
              >
                <option value="">Select</option>
                <option value="Under $10K">Under $10K</option>
                <option value="$10K-$25K">$10K–$25K</option>
                <option value="$25K-$50K">$25K–$50K</option>
                <option value="$50K-$100K">$50K–$100K</option>
                <option value="$100K+">$100K+</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitButton,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Creating Your Registry...' : 'Create My Registry →'}
          </button>

          {parseInt(cbParam) > 0 && (
            <div style={styles.cashbackNote}>
              🎁 You'll earn {cbParam}% cash back on every gift your guests purchase
            </div>
          )}

          <p style={styles.terms}>
            By creating a registry, you agree to WeTwo's terms of service.
            <br />Your information is kept private and never shared.
          </p>
        </form>
      </div>

      {/* Powered by footer */}
      <div style={styles.footer}>
        <a href="https://wetwo.love" style={styles.footerLink}>
          WeTwo
        </a>{' '}
        · The Cashback Wedding Registry
      </div>
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function CreateRegistryPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #faf8f5 0%, #f3efe9 50%, #ede7df 100%)',
        color: '#9a8d80',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        Loading...
      </div>
    }>
      <CreateRegistryForm />
    </Suspense>
  )
}

// ═══════════════════════════════════════════════════════════════
// STYLES — WeTwo design language
// ═══════════════════════════════════════════════════════════════

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    background: 'linear-gradient(160deg, #faf8f5 0%, #f3efe9 50%, #ede7df 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e4ddd4',
    padding: '40px 36px',
    boxShadow: '0 4px 24px rgba(44, 36, 32, 0.06)',
  },
  logoRow: {
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  logo: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#c9944a',
    letterSpacing: '-0.5px',
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 26,
    fontWeight: 700,
    color: '#2c2420',
    textAlign: 'center' as const,
    margin: '0 0 8px',
    letterSpacing: '-0.3px',
  },
  subheading: {
    fontSize: 15,
    color: '#6b5e52',
    textAlign: 'center' as const,
    margin: '0 0 24px',
    lineHeight: 1.5,
  },
  vendorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 18px',
    background: 'rgba(201, 148, 74, 0.06)',
    border: '1px solid rgba(201, 148, 74, 0.2)',
    borderRadius: 10,
    marginBottom: 24,
  },
  vendorPhoto: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '2px solid rgba(201, 148, 74, 0.3)',
  },
  vendorLabel: {
    fontSize: 11,
    color: '#9a8d80',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#2c2420',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  row: {
    display: 'flex',
    gap: 12,
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  fieldHalf: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#6b5e52',
    letterSpacing: '0.2px',
  },
  input: {
    padding: '12px 14px',
    fontSize: 15,
    color: '#2c2420',
    background: '#faf8f5',
    border: '1px solid #e4ddd4',
    borderRadius: 8,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  error: {
    padding: '12px 16px',
    background: 'rgba(220, 38, 38, 0.06)',
    border: '1px solid rgba(220, 38, 38, 0.2)',
    borderRadius: 8,
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 1.4,
  },
  submitButton: {
    padding: '16px 24px',
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    background: '#c9944a',
    border: 'none',
    borderRadius: 10,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '0.2px',
    transition: 'opacity 0.2s ease',
    marginTop: 4,
  },
  cashbackNote: {
    textAlign: 'center' as const,
    fontSize: 14,
    color: '#22c55e',
    fontWeight: 600,
    padding: '10px 16px',
    background: 'rgba(34, 197, 94, 0.06)',
    borderRadius: 8,
    border: '1px solid rgba(34, 197, 94, 0.15)',
  },
  terms: {
    fontSize: 12,
    color: '#9a8d80',
    textAlign: 'center' as const,
    lineHeight: 1.5,
    margin: '4px 0 0',
  },

  // Success state
  successIcon: {
    textAlign: 'center' as const,
    fontSize: 56,
    marginBottom: 16,
  },
  successHeading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#2c2420',
    textAlign: 'center' as const,
    margin: '0 0 12px',
  },
  successSubtext: {
    fontSize: 15,
    color: '#6b5e52',
    textAlign: 'center' as const,
    lineHeight: 1.6,
    margin: '0 0 16px',
  },
  vendorPill: {
    display: 'inline-block',
    margin: '0 auto 20px',
    padding: '8px 16px',
    background: 'rgba(201, 148, 74, 0.08)',
    border: '1px solid rgba(201, 148, 74, 0.2)',
    borderRadius: 20,
    color: '#c9944a',
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center' as const,
    width: 'fit-content',
  },
  successNote: {
    textAlign: 'center' as const,
    fontSize: 14,
    color: '#9a8d80',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  successButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    marginBottom: 20,
  },
  primaryButton: {
    display: 'block',
    padding: '16px 24px',
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    background: '#c9944a',
    borderRadius: 10,
    textDecoration: 'none',
    textAlign: 'center' as const,
    letterSpacing: '0.2px',
  },
  secondaryButton: {
    display: 'block',
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#c9944a',
    background: 'rgba(201, 148, 74, 0.08)',
    border: '1px solid rgba(201, 148, 74, 0.2)',
    borderRadius: 10,
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  backLink: {
    display: 'block',
    textAlign: 'center' as const,
    color: '#9a8d80',
    fontSize: 13,
    textDecoration: 'none',
  },

  // Footer
  footer: {
    marginTop: 24,
    fontSize: 13,
    color: '#9a8d80',
    textAlign: 'center' as const,
  },
  footerLink: {
    color: '#c9944a',
    textDecoration: 'none',
    fontWeight: 600,
  },
}
