import Link from 'next/link'
import SearchPanel from '@/components/public/SearchPanel'
import VehicleCard from '@/components/public/VehicleCard'

const formatPrice = (price) => {
  if (!price) return 'Price on Request'
  const num = parseFloat(price)
  if (isNaN(num)) return 'Price on Request'
  return `$${num.toLocaleString()}`
}

const formatMileage = (mileage) => {
  if (!mileage) return 'N/A'
  const num = parseFloat(mileage)
  if (isNaN(num)) return mileage
  return `${num.toLocaleString()} km`
}

export default async function HomePage() {
  let vehicleCount = 0
  let featuredVehicles = []

  try {
    const [countRes, vehiclesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/vehicles/count`, { next: { revalidate: 60 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/vehicles?limit=8`, { next: { revalidate: 60 } }),
    ])

    if (countRes.ok) {
      const countData = await countRes.json()
      vehicleCount = countData.count ?? countData.total ?? 0
    }

    if (vehiclesRes.ok) {
      const vehiclesData = await vehiclesRes.json()
      featuredVehicles = vehiclesData.vehicles || vehiclesData.data || vehiclesData || []
      if (!Array.isArray(featuredVehicles)) featuredVehicles = []
    }
  } catch {
    // API may not be available yet
  }

  const features = [
    { icon: '&#127775;', title: 'Japan Auction', desc: 'Direct access to Japanese auctions' },
    { icon: '&#9989;', title: 'Quality Check', desc: 'Rigorous multi-point inspection' },
    { icon: '&#128666;', title: 'Worldwide Shipping', desc: 'Door-to-door global delivery' },
    { icon: '&#128274;', title: 'Secure Payment', desc: 'Safe & transparent transactions' },
    { icon: '&#128222;', title: '24/7 Support', desc: 'Always here to help you' },
  ]

  const steps = [
    { num: '01', title: 'Browse & Search', desc: 'Find your ideal vehicle from our extensive inventory of quality Japanese cars.' },
    { num: '02', title: 'Request a Quote', desc: 'Get a detailed price breakdown including shipping to your country.' },
    { num: '03', title: 'Secure Payment', desc: 'Complete your purchase through our secure payment system.' },
    { num: '04', title: 'Ship & Receive', desc: 'We handle logistics. Receive your car at your nearest port.' },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
          }} />
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-badge">
            &#127471;&#127477; Premium Japanese Vehicle Exports
          </div>

          <h1 className="hero-title">
            FIND YOUR <span>DREAM CAR</span>
          </h1>
          <p className="hero-subtitle">DIRECT FROM JAPAN</p>

          <div className="hero-features">
            <div className="hero-feature">
              <div className="hero-feature-icon">&#127775;</div>
              <span>Japanese Auction Direct</span>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon">&#9989;</div>
              <span>Best Quality Vehicles</span>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon">&#128666;</div>
              <span>Worldwide Shipping</span>
            </div>
          </div>

          <Link href="/stock" className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
            Browse All Vehicles
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-card">
            <div className="hero-stat-number">{vehicleCount.toLocaleString()}</div>
            <div className="hero-stat-label">Vehicles in Stock</div>
          </div>
        </div>
      </section>

      {/* Search Panel */}
      <SearchPanel />

      {/* Features Section */}
      <section className="features-section">
        <div className="utc-container">
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon" dangerouslySetInnerHTML={{ __html: f.icon }} />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      {featuredVehicles.length > 0 && (
        <section className="section">
          <div className="utc-container">
            <div className="section-header">
              <span className="section-label">Our Inventory</span>
              <h2 className="section-title">Featured Vehicles</h2>
              <p className="section-desc">Handpicked quality vehicles from Japanese auctions, ready for worldwide delivery.</p>
            </div>
            <div className="vehicles-grid">
              {featuredVehicles.map((vehicle, i) => (
                <VehicleCard key={vehicle._id || vehicle.vehicleId || i} vehicle={vehicle} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link href="/stock" className="btn-outline">View All Vehicles</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="utc-container">
          <h2>Ready to Find Your Perfect Vehicle?</h2>
          <p>Browse our complete inventory of quality Japanese vehicles with worldwide shipping options.</p>
          <Link href="/stock" className="btn-white">Explore Stock</Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Simple Process, Global Reach</h2>
            <p className="section-desc">From selection to delivery, we make importing your Japanese vehicle effortless.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
