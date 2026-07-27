'use client'
import { useState } from 'react'

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Profile updated successfully!')
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>My Profile</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>Manage your account information.</p>

      <div style={{ background: 'white', borderRadius: 12, padding: 32, border: '1px solid #e5e7eb', maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
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
            <div className="form-group">
              <label>Address</label>
              <textarea
                rows={3}
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Your address"
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
