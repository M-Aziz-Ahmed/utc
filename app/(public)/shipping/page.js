import Link from 'next/link'

const shippingMethods = [
  {
    method: 'RoRo (Roll-on/Roll-off)',
    icon: '&#127746;',
    capacity: 'Up to 6 vehicles per vessel',
    transitTime: '2-6 weeks',
    cost: 'Most affordable',
    bestFor: 'Standard sedans, SUVs, and commercial vehicles',
    pros: ['Lowest shipping cost', 'Fast loading/unloading', 'Regular departures'],
    cons: ['Open to elements during transit', 'Limited to drivable vehicles only'],
  },
  {
    method: 'Container (20ft / 40ft)',
    icon: '&#128230;',
    capacity: '1-4 vehicles per container',
    transitTime: '3-8 weeks',
    cost: 'Moderate to higher',
    bestFor: 'Luxury cars, classic vehicles, multiple vehicle shipments',
    pros: ['Full protection from elements', 'Can ship non-drivable vehicles', 'Can include spare parts'],
    cons: ['Higher cost than RoRo', 'Longer loading process'],
  },
]

const destinationPorts = [
  { port: 'Mombasa', country: 'Kenya', flag: '&#127472;&#127466;', transit: '4-6 weeks', frequency: 'Weekly' },
  { port: 'Dar es Salaam', country: 'Tanzania', flag: '&#127481;&#127479;', transit: '4-6 weeks', frequency: 'Weekly' },
  { port: 'Jebel Ali', country: 'UAE', flag: '&#127462;&#127466;', transit: '2-3 weeks', frequency: 'Bi-weekly' },
  { port: 'Port Qasim', country: 'Pakistan', flag: '&#127477;&#127475;', transit: '3-4 weeks', frequency: 'Weekly' },
  { port: 'Chittagong', country: 'Bangladesh', flag: '&#127463;&#127467;', transit: '3-5 weeks', frequency: 'Bi-weekly' },
  { port: 'Auckland', country: 'New Zealand', flag: '&#127475;&#127487;', transit: '3-4 weeks', frequency: 'Weekly' },
  { port: 'Sydney', country: 'Australia', flag: '&#127462;&#127482;', transit: '3-5 weeks', frequency: 'Bi-weekly' },
  { port: 'Jeddah', country: 'Saudi Arabia', flag: '&#127480;&#127462;', transit: '3-4 weeks', frequency: 'Bi-weekly' },
  { port: 'Durban', country: 'South Africa', flag: '&#127487;&#127462;', transit: '5-7 weeks', frequency: 'Monthly' },
  { port: 'Kingston', country: 'Jamaica', flag: '&#127471;&#127476;', transit: '4-6 weeks', frequency: 'Monthly' },
]

const shippingSteps = [
  {
    num: '01',
    title: 'Vehicle Preparation',
    desc: 'Once purchased, your vehicle is thoroughly cleaned, inspected, and prepared for international shipping at our Japan facility.',
  },
  {
    num: '02',
    title: 'Documentation',
    desc: 'We prepare all export and import documentation including bill of lading, commercial invoice, certificate of origin, and customs declarations.',
  },
  {
    num: '03',
    title: 'Loading & Transit',
    desc: 'Your vehicle is securely loaded onto the vessel using proper tie-down methods. Real-time tracking is provided throughout the journey.',
  },
  {
    num: '04',
    title: 'Arrival & Clearance',
    desc: 'Upon arrival, we coordinate with local customs brokers to clear your vehicle. We handle all import duties and regulatory compliance.',
  },
]

export const metadata = {
  title: 'Worldwide Shipping',
  description: 'UTC offers worldwide vehicle shipping from Japan. RoRo and container shipping options to Africa, Middle East, Oceania, and more.',
}

export default function ShippingPage() {
  return (
    <>
      <div className="page-header">
        <div className="utc-container">
          <h1>Worldwide Shipping</h1>
          <p>Reliable vehicle export shipping from Japan to destinations worldwide</p>
        </div>
      </div>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid">
            <div className="info-content">
              <h2>Shipping Methods</h2>
              <p>
                UTC offers two primary shipping methods to get your vehicle from Japan to your
                destination port safely and efficiently. The right choice depends on your vehicle
                type, budget, and delivery timeline.
              </p>
              <p>
                Both methods are fully insured and include GPS tracking so you can monitor
                your shipment in real time. We work with the world&apos;s leading shipping lines
                to ensure reliable schedules and secure transport.
              </p>
            </div>
            <div className="info-image" style={{ background: 'var(--utc-gray-100)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--utc-gray-400)', fontSize: 48 }}>
              &#128674;
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--utc-gray-50)' }}>
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">Compare Options</span>
            <h2 className="section-title">RoRo vs Container Shipping</h2>
            <p className="section-desc">Choose the method that best suits your vehicle and budget.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            {shippingMethods.map((m) => (
              <div key={m.method} style={{ background: 'white', borderRadius: 'var(--utc-radius-xl)', border: '1px solid var(--utc-gray-200)', overflow: 'hidden' }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--utc-gray-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--utc-radius-lg)', background: 'var(--utc-red-light)', color: 'var(--utc-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }} dangerouslySetInnerHTML={{ __html: m.icon }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--utc-gray-900)' }}>{m.method}</h3>
                  </div>
                </div>
                <div style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--utc-gray-100)' }}>
                      <span style={{ fontSize: 13, color: 'var(--utc-gray-500)' }}>Capacity</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--utc-gray-900)' }}>{m.capacity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--utc-gray-100)' }}>
                      <span style={{ fontSize: 13, color: 'var(--utc-gray-500)' }}>Transit Time</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--utc-gray-900)' }}>{m.transitTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--utc-gray-100)' }}>
                      <span style={{ fontSize: 13, color: 'var(--utc-gray-500)' }}>Cost Level</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--utc-gray-900)' }}>{m.cost}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--utc-gray-500)' }}>Best For</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--utc-gray-900)', textAlign: 'right', maxWidth: '60%' }}>{m.bestFor}</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--utc-gray-600)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advantages</div>
                    {m.pros.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 13, color: 'var(--utc-gray-600)' }}>
                        <span style={{ color: '#16A34A' }}>&#10003;</span> {p}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--utc-gray-600)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Considerations</div>
                    {m.cons.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 13, color: 'var(--utc-gray-600)' }}>
                        <span style={{ color: 'var(--utc-red)' }}>&#9679;</span> {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid reverse">
            <div className="info-content">
              <h2>Shipping Process &amp; Timelines</h2>
              <p>
                From the moment your vehicle is purchased, UTC manages every aspect of the shipping
                process. Our logistics team coordinates vehicle pickup, port handling, vessel booking,
                and final delivery to your destination port.
              </p>
              <p>
                Transit times vary depending on your destination port, shipping line schedules,
                and any port congestion. We provide estimated arrival dates at booking and keep
                you updated throughout the journey with real-time tracking information.
              </p>
            </div>
            <div className="info-image" style={{ background: 'var(--utc-gray-100)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--utc-gray-400)', fontSize: 48 }}>
              &#128666;
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--utc-gray-50)' }}>
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">Destinations</span>
            <h2 className="section-title">Popular Destination Ports</h2>
            <p className="section-desc">We ship to major ports worldwide. Contact us for destinations not listed below.</p>
          </div>
          <div style={{ background: 'white', borderRadius: 'var(--utc-radius-xl)', border: '1px solid var(--utc-gray-200)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '16px 24px', background: 'var(--utc-gray-50)', borderBottom: '1px solid var(--utc-gray-200)', fontSize: 12, fontWeight: 700, color: 'var(--utc-gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div>Port</div>
              <div>Country</div>
              <div>Transit</div>
              <div>Frequency</div>
              <div style={{ textAlign: 'right' }}>Details</div>
            </div>
            {destinationPorts.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '16px 24px', borderBottom: i < destinationPorts.length - 1 ? '1px solid var(--utc-gray-100)' : 'none', alignItems: 'center', fontSize: 14, color: 'var(--utc-gray-700)' }}>
                <div style={{ fontWeight: 600, color: 'var(--utc-gray-900)' }}>{p.port}</div>
                <div dangerouslySetInnerHTML={{ __html: `${p.flag} ${p.country}` }} />
                <div>{p.transit}</div>
                <div>{p.frequency}</div>
                <div style={{ textAlign: 'right' }}>
                  <Link href="/contact" style={{ color: 'var(--utc-red)', fontSize: 13, fontWeight: 600 }}>Get Quote</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Shipping Steps</h2>
            <p className="section-desc">Our end-to-end shipping process ensures your vehicle arrives safely and on time.</p>
          </div>
          <div className="steps-grid">
            {shippingSteps.map((step) => (
              <div className="step-card" key={step.num}>
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="utc-container">
          <h2>Get Shipping Quote</h2>
          <p>Request a detailed shipping quote for your vehicle. We cover all major ports worldwide.</p>
          <Link href="/contact" className="btn-white">Request a Quote</Link>
        </div>
      </section>
    </>
  )
}
