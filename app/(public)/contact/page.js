import Link from 'next/link'
import ContactForm from '@/components/public/ContactForm'

const contactInfo = [
  {
    icon: '&#128222;',
    title: 'Phone',
    lines: ['+81 3-XXXX-XXXX', 'Mon - Fri, 9:00 AM - 6:00 PM JST'],
  },
  {
    icon: '&#128231;',
    title: 'Email',
    lines: ['info@universaltrading.co', 'sales@universaltrading.co'],
  },
  {
    icon: '&#128205;',
    title: 'Address',
    lines: ['Universal Trading Co., Ltd.', 'Tokyo, Japan'],
  },
  {
    icon: '&#128172;',
    title: 'WhatsApp',
    lines: ['+81 XX-XXXX-XXXX', 'Available 24/7 for quick inquiries'],
  },
]

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Universal Trading Co. (UTC). Contact us for vehicle inquiries, auction access, shipping quotes, and more.',
}

export default function ContactPage() {
  return (
    <>
      <div className="page-header">
        <div className="utc-container">
          <h1>Contact Us</h1>
          <p>We&apos;re here to help with all your Japanese vehicle export needs</p>
        </div>
      </div>

      <section className="contact-section">
        <div className="utc-container">
          <div className="contact-grid">
            <div>
              <div className="contact-info-card" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--utc-gray-900)', marginBottom: 8 }}>Get in Touch</h2>
                <p style={{ fontSize: 15, color: 'var(--utc-gray-600)', marginBottom: 28 }}>
                  Whether you&apos;re looking for a specific vehicle, need a shipping quote, or have
                  questions about our services — we&apos;re ready to assist.
                </p>

                {contactInfo.map((item, i) => (
                  <div className="contact-info-item" key={i}>
                    <div className="contact-info-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
                    <div className="contact-info-text">
                      <h4>{item.title}</h4>
                      {item.lines.map((line, j) => (
                        <p key={j}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--utc-gray-100)', borderRadius: 'var(--utc-radius-xl)', padding: 24, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--utc-gray-400)' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>&#128506;</div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>Map Placeholder</p>
                  <p style={{ fontSize: 13 }}>Tokyo, Japan</p>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="utc-container">
          <h2>Ready to Start?</h2>
          <p>Browse our inventory or reach out for a personalized consultation.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/stock" className="btn-white">Browse Vehicles</Link>
            <Link href="/shipping" className="btn-white" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid white' }}>Shipping Info</Link>
          </div>
        </div>
      </section>
    </>
  )
}
