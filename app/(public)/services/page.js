import Link from 'next/link'

export const metadata = {
  title: 'Our Services',
  description: 'Universal Trading Co. provides comprehensive Japanese vehicle export services including auction buying, inspection, shipping, and customs clearance.',
}

const services = [
  { icon: '&#128666;', title: 'Vehicle Export', desc: 'Complete export service for Japanese vehicles to destinations worldwide.' },
  { icon: '&#127941;', title: 'Auction Buying', desc: 'Direct access to all major Japanese auctions with expert bidding assistance.' },
  { icon: '&#9989;', title: 'Quality Inspection', desc: 'Rigorous multi-point inspection before every vehicle leaves Japan.' },
  { icon: '&#127758;', title: 'Worldwide Shipping', desc: 'Reliable door-to-door shipping to over 50 countries worldwide.' },
  { icon: '&#128196;', title: 'Documentation', desc: 'Full handling of all export documents, certificates, and paperwork.' },
  { icon: '&#127963;', title: 'Customs Clearance', desc: 'Expert guidance through customs procedures in your destination country.' },
]

export default function ServicesPage() {
  return (
    <>
      <div className="page-header">
        <div className="utc-container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">&#8250;</span>
            <span className="current">Our Services</span>
          </div>
          <h1>Our Services</h1>
          <p>Comprehensive Japanese vehicle export solutions tailored to your needs</p>
        </div>
      </div>

      <section className="section">
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">What We Do</span>
            <h2 className="section-title">End-to-End Export Services</h2>
            <p className="section-desc">From finding the right vehicle to delivering it to your doorstep, UTC handles every step of the process.</p>
          </div>
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {services.map((service, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon" dangerouslySetInnerHTML={{ __html: service.icon }} />
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid">
            <div className="info-content">
              <h2>Vehicle Export</h2>
              <p>
                Universal Trading Co. has been exporting quality Japanese vehicles for years.
                We work with dealers, importers, and private buyers across the globe to deliver
                reliable vehicles from Japan&apos;s top auctions and dealerships.
              </p>
              <p>
                Our export team handles everything from vehicle sourcing and inspection to
                loading and shipping logistics. We ensure each vehicle meets the import
                requirements of the destination country.
              </p>
              <ul style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.8, paddingLeft: 20 }}>
                <li>Access to all major Japanese auctions</li>
                <li>Direct dealer partnerships in Japan</li>
                <li>Export to over 50 countries</li>
                <li>Competitive FOB and CIF pricing</li>
              </ul>
            </div>
            <div className="info-image">
              <div style={{
                width: '100%',
                height: 400,
                background: 'linear-gradient(135deg, #FEE2E2 0%, #F3F4F6 100%)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                fontSize: 48,
                fontWeight: 800,
              }}>
                UTC
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid reverse">
            <div className="info-content">
              <h2>Auction Buying Service</h2>
              <p>
                Japan has over 100 auctions operating daily, offering thousands of vehicles.
                Our experienced bidding team has direct access to UCCA, JAA, TAA, CAA, and
                other major auction houses across Japan.
              </p>
              <p>
                We provide real-time auction alerts, detailed inspection reports, and
                professional bidding on your behalf. You set the budget, we handle the rest.
              </p>
              <ul style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.8, paddingLeft: 20 }}>
                <li>Live auction bidding assistance</li>
                <li>Pre-auction vehicle inspection reports</li>
                <li>Wide network across Japan</li>
                <li>Transparent pricing with no hidden fees</li>
              </ul>
            </div>
            <div className="info-image">
              <div style={{
                width: '100%',
                height: 400,
                background: 'linear-gradient(135deg, #DBEAFE 0%, #F3F4F6 100%)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1D4ED8',
                fontSize: 48,
                fontWeight: 800,
              }}>
                &#127941;
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid">
            <div className="info-content">
              <h2>Quality Inspection</h2>
              <p>
                Every vehicle exported by UTC undergoes a comprehensive multi-point inspection.
                Our certified inspectors check mechanical condition, body integrity, electrical
                systems, and safety features before any vehicle leaves Japan.
              </p>
              <p>
                We provide detailed inspection reports with photos so you know exactly
                what you&apos;re getting before it ships. This commitment to quality has made
                us one of the most trusted names in Japanese vehicle exports.
              </p>
              <ul style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.8, paddingLeft: 20 }}>
                <li>150+ point inspection process</li>
                <li>Detailed photo reports included</li>
                <li>Mechanical and cosmetic assessment</li>
                <li>Honest and transparent evaluations</li>
              </ul>
            </div>
            <div className="info-image">
              <div style={{
                width: '100%',
                height: 400,
                background: 'linear-gradient(135deg, #DCFCE7 0%, #F3F4F6 100%)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803D',
                fontSize: 48,
                fontWeight: 800,
              }}>
                &#9989;
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid reverse">
            <div className="info-content">
              <h2>Worldwide Shipping</h2>
              <p>
                UTC partners with leading international shipping companies to offer reliable
                vehicle transport to ports across the globe. We handle RoRo (Roll-on Roll-off)
                and container shipping options to suit your needs and budget.
              </p>
              <p>
                From the moment your vehicle leaves the port in Japan to its arrival at your
                nearest port, we track and manage every detail of the shipping process.
              </p>
              <ul style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.8, paddingLeft: 20 }}>
                <li>RoRo and container shipping options</li>
                <li>Direct routes to major ports worldwide</li>
                <li>Real-time shipment tracking</li>
                <li>Insurance coverage available</li>
              </ul>
            </div>
            <div className="info-image">
              <div style={{
                width: '100%',
                height: 400,
                background: 'linear-gradient(135deg, #FEF3C7 0%, #F3F4F6 100%)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                fontSize: 48,
                fontWeight: 800,
              }}>
                &#127758;
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid">
            <div className="info-content">
              <h2>Documentation &amp; Customs Clearance</h2>
              <p>
                Exporting a vehicle involves significant paperwork. UTC handles all documentation
                including export certificates, de-registration papers, bills of lading, and
                customs declarations required by both Japanese and destination country authorities.
              </p>
              <p>
                Our experienced customs team ensures smooth clearance at both ends, preventing
                delays and ensuring your vehicle arrives without issues.
              </p>
              <ul style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.8, paddingLeft: 20 }}>
                <li>Full export documentation handling</li>
                <li>Customs clearance assistance</li>
                <li>Import guidance for your country</li>
                <li>Compliance with local regulations</li>
              </ul>
            </div>
            <div className="info-image">
              <div style={{
                width: '100%',
                height: 400,
                background: 'linear-gradient(135deg, #EDE9FE 0%, #F3F4F6 100%)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7C3AED',
                fontSize: 48,
                fontWeight: 800,
              }}>
                &#128196;
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="utc-container">
          <h2>Get Started Today</h2>
          <p>Ready to import a quality Japanese vehicle? Contact us for a free consultation or browse our current stock.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/stock" className="btn-white">Browse Stock</Link>
            <Link href="/contact" className="btn-white" style={{ background: 'transparent', border: '2px solid white' }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
