'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', country: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/public/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          country: form.country,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        router.push('/account/dashboard')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join UTC to track vehicles and manage reservations</p>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters"
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                placeholder="Your country"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
