'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus('sent')
        setFormData({ firstName: '', lastName: '', email: '', phone: '', country: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="contact-form-card">
      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--utc-gray-900)', marginBottom: 24 }}>Send Us a Message</h3>

      {status === 'sent' && (
        <div style={{ padding: '16px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--utc-radius)', marginBottom: 20, fontSize: 14, color: '#166534', fontWeight: 600 }}>
          Thank you! Your message has been sent. We&apos;ll get back to you within 24 hours.
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: '16px 20px', background: 'var(--utc-red-light)', border: '1px solid #FECACA', borderRadius: 'var(--utc-radius)', marginBottom: 20, fontSize: 14, color: 'var(--utc-red-dark)', fontWeight: 600 }}>
          Something went wrong. Please try again or contact us directly.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="contact-form-grid">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="John"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              placeholder="Your country"
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select a subject</option>
              <option value="vehicle-inquiry">Vehicle Inquiry</option>
              <option value="auction-access">Auction Access</option>
              <option value="shipping-quote">Shipping Quote</option>
              <option value="general">General Inquiry</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>
          <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Tell us about your vehicle requirements or questions..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--utc-gray-300)', borderRadius: 'var(--utc-radius)', fontSize: 14, color: 'var(--utc-gray-900)', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 12, color: 'var(--utc-gray-500)', margin: 0 }}>
            We typically respond within 24 hours during business days.
          </p>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-primary"
            style={{ minWidth: 160 }}
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  )
}
