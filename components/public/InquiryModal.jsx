'use client'
import { useState } from 'react'

export default function InquiryModal({ vehicle, isOpen, onClose }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vehicleId: vehicle?.vehicleId,
          vehicleTitle: vehicle?.title,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setResult({ type: 'success', message: 'Inquiry submitted successfully! We will contact you soon.' })
        setForm({ fullName: '', email: '', phone: '', country: '', message: '' })
      } else {
        setResult({ type: 'error', message: data.message || 'Error submitting inquiry' })
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Inquire About This Vehicle</h3>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <div className="modal-body">
          {vehicle && (
            <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              <strong>{vehicle.title}</strong>
              {vehicle.price && <span style={{ color: '#DC2626', fontWeight: 700, marginLeft: 12 }}>${parseFloat(vehicle.price).toLocaleString()}</span>}
            </div>
          )}

          {result && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
              background: result.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: result.type === 'success' ? '#166534' : '#991b1b',
            }}>
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="modal-form-grid">
              <div className="two-col">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
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
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label>Phone / WhatsApp</label>
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
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your requirements..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? 'Submitting...' : 'Send Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
