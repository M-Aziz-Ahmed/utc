'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/public/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.ok) {
        router.push('/account/dashboard')
      } else {
        setError(data.message || 'Login failed')
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
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your UTC account</p>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}
