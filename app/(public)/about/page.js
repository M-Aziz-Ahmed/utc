import Link from 'next/link'

const values = [
  { icon: '&#128274;', title: 'Transparency', desc: 'Every vehicle is fully inspected and documented. No hidden fees, no surprises.' },
  { icon: '&#9989;', title: 'Quality', desc: 'We only purchase vehicles that meet our rigorous quality standards from trusted auctions.' },
  { icon: '&#129309;', title: 'Trust', desc: 'Built on years of honest dealings with clients across Africa, Middle East, and Oceania.' },
  { icon: '&#128666;', title: 'Reliability', desc: 'On-time deliveries, responsive communication, and consistent service you can count on.' },
  { icon: '&#128222;', title: 'Support', desc: 'Dedicated account managers available to assist you at every step of the process.' },
  { icon: '&#127775;', title: 'Value', desc: 'Competitive pricing with no compromise on quality or service standards.' },
]

const whyChoose = [
  {
    title: 'Direct Auction Access',
    desc: 'As licensed members of Japan\'s top auction houses, we bid directly on your behalf — no middlemen, no markups.',
    icon: '&#127775;',
  },
  {
    title: 'Rigorous Inspections',
    desc: 'Every vehicle passes through our multi-point inspection before export, ensuring you receive exactly what was promised.',
    icon: '&#128269;',
  },
  {
    title: 'Global Shipping Network',
    desc: 'Established partnerships with leading shipping lines for reliable, insured transport to any major port worldwide.',
    icon: '&#127758;',
  },
  {
    title: 'Competitive Pricing',
    desc: 'Our auction volume and industry relationships allow us to secure the best prices and pass the savings to you.',
    icon: '&#128176;',
  },
  {
    title: 'End-to-End Service',
    desc: 'From vehicle selection to port delivery, we handle every detail including documentation, customs, and compliance.',
    icon: '&#9989;',
  },
  {
    title: 'Proven Track Record',
    desc: 'Hundreds of satisfied clients across multiple continents trust UTC for their Japanese vehicle imports.',
    icon: '&#128200;',
  },
]

const teamMembers = [
  { name: 'Managing Director', role: 'Leadership', initials: 'MD' },
  { name: 'Operations Manager', role: 'Operations', initials: 'OM' },
  { name: 'Sales Director', role: 'Sales', initials: 'SD' },
  { name: 'Logistics Coordinator', role: 'Shipping', initials: 'LC' },
]

export const metadata = {
  title: 'About Us',
  description: 'Learn about Universal Trading Co. (UTC) - Japan\'s trusted vehicle export company. Our mission, values, and team.',
}

export default function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div className="utc-container">
          <h1>About Universal Trading Co.</h1>
          <p>Your trusted partner in Japanese vehicle exports</p>
        </div>
      </div>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid">
            <div className="info-content">
              <h2>Our Story</h2>
              <p>
                Universal Trading Co. (UTC) was established with a clear vision: to bridge the gap
                between Japan&apos;s world-class vehicle market and buyers around the globe. Japan produces
                some of the most reliable and well-maintained vehicles in the world, and we believe
                everyone deserves access to them.
              </p>
              <p>
                What started as a small operation has grown into a trusted export company serving
                clients across Africa, the Middle East, Oceania, and beyond. Our team combines
                deep knowledge of the Japanese automotive market with extensive logistics expertise,
                making the import process seamless for our customers.
              </p>
              <p>
                Today, UTC facilitates hundreds of vehicle exports annually, maintaining strong
                relationships with Japan&apos;s leading auction houses, shipping lines, and automotive
                dealers. Our commitment to quality, transparency, and customer satisfaction
                remains the foundation of everything we do.
              </p>
            </div>
            <div className="info-image" style={{ background: 'var(--utc-gray-100)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--utc-gray-400)', fontSize: 48 }}>
              &#127471;&#127477;
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid reverse">
            <div className="info-content">
              <h2>Our Mission</h2>
              <p>
                To provide reliable, transparent, and efficient Japanese vehicle export services
                that connect global buyers with Japan&apos;s finest automotive offerings. We are
                committed to delivering exceptional value, quality vehicles, and a purchase
                experience that exceeds expectations.
              </p>
              <h2 style={{ marginTop: 32 }}>Our Vision</h2>
              <p>
                To be the most trusted name in Japanese vehicle exports, recognized globally for
                our integrity, quality standards, and dedication to customer success. We envision
                a world where anyone, anywhere can access Japan&apos;s best vehicles with confidence
                and ease.
              </p>
            </div>
            <div className="info-image" style={{ background: 'var(--utc-gray-100)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--utc-gray-400)', fontSize: 48 }}>
              &#128161;
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--utc-gray-50)' }}>
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">What We Stand For</h2>
            <p className="section-desc">The principles that guide every decision we make.</p>
          </div>
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {values.map((v, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon" dangerouslySetInnerHTML={{ __html: v.icon }} />
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">Our Team</span>
            <h2 className="section-title">Meet the Team</h2>
            <p className="section-desc">The people behind UTC&apos;s success.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {teamMembers.map((t, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 32, background: 'white', borderRadius: 'var(--utc-radius-lg)', border: '1px solid var(--utc-gray-200)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--utc-red-light)', color: 'var(--utc-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, margin: '0 auto 16px' }}>
                  {t.initials}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--utc-gray-900)', marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--utc-gray-500)' }}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--utc-gray-50)' }}>
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">Why UTC</span>
            <h2 className="section-title">Why Choose UTC</h2>
            <p className="section-desc">What makes us the preferred choice for Japanese vehicle exports.</p>
          </div>
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {whyChoose.map((w, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon" dangerouslySetInnerHTML={{ __html: w.icon }} />
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="utc-container">
          <h2>Contact Us Today</h2>
          <p>Have questions about our services? We&apos;re here to help you find the perfect vehicle.</p>
          <Link href="/contact" className="btn-white">Get in Touch</Link>
        </div>
      </section>
    </>
  )
}
