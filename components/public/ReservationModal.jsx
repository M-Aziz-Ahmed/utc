'use client'
import { useState } from 'react'

export default function ReservationModal({ vehicle, isOpen, onClose }) {
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCountry: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/public/reservations', {
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
        setResult({ type: 'success', message: 'Reservation request submitted! We will confirm shortly.' })
        setForm({ customerName: '', customerEmail: '', customerPhone: '', customerCountry: '', notes: '' })
      } else {
        setResult({ type: 'error', message: data.message || 'Error submitting reservation' })
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
          <h3>Reserve This Vehicle</h3>
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
                    value={form.customerName}
                    onChange={e => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={form.customerEmail}
                    onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label>Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={form.customerPhone}
                    onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={form.customerCountry}
                    onChange={e => setForm({ ...form, customerCountry: e.target.value })}
                    placeholder="Your country"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special requirements..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
                A reservation fee may be required to confirm your reservation. Our team will contact you with details.
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? 'Submitting...' : 'Submit Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
