'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Store session
      localStorage.setItem('wetwo_vendor_session', JSON.stringify(data.vendor))
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">✨ WeTwo Vendors</div>
        <p className="login-tagline">Your command center</p>

        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to manage your page, links, and clients</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <a href="mailto:hello@wetwo.love">Contact us</a>
        </p>
      </div>

      <style jsx>{`
        .login-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #faf8f5, #f0ece6);
        }
        .login-card {
          background: #fff;
          border: 1px solid #e4ddd4;
          border-radius: 16px;
          padding: 48px 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .login-logo {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          color: #c9944a;
          margin-bottom: 2px;
        }
        .login-tagline {
          font-size: 12px;
          color: #9a8d80;
          margin-bottom: 32px;
        }
        .login-title {
          font-size: 20px;
          font-weight: 700;
          color: #2c2420;
          margin-bottom: 6px;
        }
        .login-subtitle {
          font-size: 14px;
          color: #6b5e52;
          margin-bottom: 28px;
        }
        .login-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .form-group {
          text-align: left;
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #6b5e52;
          margin-bottom: 6px;
        }
        .form-group input {
          width: 100%;
          padding: 12px 14px;
          background: #f3efe9;
          border: 1px solid #e4ddd4;
          border-radius: 8px;
          font-size: 15px;
          color: #2c2420;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #c9944a;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: #c9944a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          font-family: inherit;
        }
        .login-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-footer {
          margin-top: 24px;
          font-size: 13px;
          color: #9a8d80;
        }
        .login-footer a {
          color: #c9944a;
          text-decoration: none;
        }
        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

