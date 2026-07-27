'use client'
import { useState } from 'react'

const CONDITIONS = ['Excellent', 'Very Good', 'Good', 'Fair', 'For Parts']

export default function SellCarForm() {
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    condition: '',
    priceExpectation: '',
    contactName: '',
    email: '',
    phone: '',
    country: '',
    message: '',
  })
  const [photos, setPhotos] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 10) {
      setResult({ type: 'error', message: 'Maximum 10 photos allowed.' })
      return
    }
    setPhotos(files)
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value)
      })
      photos.forEach(photo => {
        formData.append('photos', photo)
      })

      const res = await fetch('/api/public/sell-your-car', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ type: 'success', message: 'Submission received! We will review your details and contact you with a valuation shortly.' })
        setForm({
          make: '', model: '', year: '', mileage: '', condition: '',
          priceExpectation: '', contactName: '', email: '', phone: '',
          country: '', message: '',
        })
        setPhotos([])
      } else {
        setResult({ type: 'error', message: data.message || 'Error submitting form. Please try again.' })
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sell-form-card">
      <h2>Submit Your Vehicle Details</h2>
      <p>Fill in the form below and our team will get back to you with a valuation.</p>

      {result && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 14,
          background: result.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: result.type === 'success' ? '#166534' : '#991b1b',
        }}>
          {result.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="sell-form-grid">
          <div className="form-group">
            <label>Make *</label>
            <input
              type="text"
              name="make"
              required
              value={form.make}
              onChange={handleChange}
              placeholder="e.g. Toyota"
            />
          </div>
          <div className="form-group">
            <label>Model *</label>
            <input
              type="text"
              name="model"
              required
              value={form.model}
              onChange={handleChange}
              placeholder="e.g. Land Cruiser"
            />
          </div>
          <div className="form-group">
            <label>Year *</label>
            <input
              type="number"
              name="year"
              required
              min="1970"
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={handleChange}
              placeholder="e.g. 2020"
            />
          </div>
          <div className="form-group">
            <label>Mileage (km) *</label>
            <input
              type="number"
              name="mileage"
              required
              min="0"
              value={form.mileage}
              onChange={handleChange}
              placeholder="e.g. 50000"
            />
          </div>
          <div className="form-group">
            <label>Condition *</label>
            <select name="condition" required value={form.condition} onChange={handleChange}>
              <option value="">Select condition</option>
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Price Expectation (USD)</label>
            <input
              type="number"
              name="priceExpectation"
              min="0"
              value={form.priceExpectation}
              onChange={handleChange}
              placeholder="e.g. 15000"
            />
          </div>
          <div className="form-group full-width">
            <label>Photos (max 10)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotos}
              style={{ padding: '8px 0' }}
            />
            {photos.length > 0 && (
              <span style={{ fontSize: 12, color: '#6B7280' }}>{photos.length} photo{photos.length > 1 ? 's' : ''} selected</span>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E5E7EB', paddingTop: 20, marginTop: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Your Contact Details</h3>
          </div>

          <div className="form-group">
            <label>Contact Name *</label>
            <input
              type="text"
              name="contactName"
              required
              value={form.contactName}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Phone / WhatsApp</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 234 567 890"
            />
          </div>
          <div className="form-group">
            <label>Country *</label>
            <input
              type="text"
              name="country"
              required
              value={form.country}
              onChange={handleChange}
              placeholder="Your country"
            />
          </div>
          <div className="form-group full-width">
            <label>Message</label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="Additional details about your vehicle..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
          style={{ width: '100%', marginTop: 24, padding: '14px 32px', fontSize: 15 }}
        >
          {submitting ? 'Submitting...' : 'Submit Vehicle Details'}
        </button>
      </form>
    </div>
  )
}
