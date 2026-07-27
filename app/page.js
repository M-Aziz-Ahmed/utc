import Link from 'next/link'
import { getPublicVehicles, getVehicleCount } from '@/utils/publicVehicleService'
import SearchPanel from '@/components/public/SearchPanel'
import VehicleCard from '@/components/public/VehicleCard'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'

export const revalidate = 60

export default async function Home() {
  let vehicleCount = 0
  let featuredVehicles = []

  try {
    const countResult = await getVehicleCount()
    vehicleCount = countResult || 0
  } catch {
    vehicleCount = 0
  }

  try {
    const result = await getPublicVehicles({ page: 1, limit: 8, sort: 'latest' })
    featuredVehicles = result.vehicles || []
  } catch {
    featuredVehicles = []
  }

  return (
    <div className="public-site">
      <PublicHeader />
      <main className="public-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-badge">&#127471; &#127477; Japanese Vehicle Export Specialist</div>
            <h1 className="hero-title">
              FIND YOUR <span>DREAM CAR</span>
            </h1>
            <p className="hero-subtitle">DIRECT FROM JAPAN</p>

            <div className="hero-features">
              <div className="hero-feature">
                <div className="hero-feature-icon">&#127942;</div>
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

            <Link href="/stock" className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
              Browse Our Stock
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat-card">
              <div className="hero-stat-number">{vehicleCount.toLocaleString()}+</div>
              <div className="hero-stat-label">VEHICLES AVAILABLE</div>
            </div>
          </div>
        </section>

        {/* Search Panel */}
        <SearchPanel />

        {/* Features */}
        <section className="features-section">
          <div className="utc-container">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">&#127942;</div>
                <h3>Japan Auction</h3>
                <p>Direct Purchase</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">&#9989;</div>
                <h3>Quality Check</h3>
                <p>Certified Vehicles</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">&#128666;</div>
                <h3>Worldwide Shipping</h3>
                <p>Fast &amp; Secure</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">&#128274;</div>
                <h3>Secure Payment</h3>
                <p>100% Safe</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">&#128172;</div>
                <h3>24/7 Support</h3>
                <p>We Are Here</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        {featuredVehicles.length > 0 && (
          <section className="section">
            <div className="utc-container">
              <div className="section-header">
                <span className="section-label">Our Collection</span>
                <h2 className="section-title">Featured Vehicles</h2>
                <p className="section-desc">Browse our latest selection of premium Japanese vehicles</p>
              </div>
              <div className="vehicles-grid">
                {featuredVehicles.map(vehicle => (
                  <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Link href="/stock" className="btn-outline">View All Vehicles</Link>
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="section" style={{ background: '#f9fafb' }}>
          <div className="utc-container">
            <div className="section-header">
              <span className="section-label">How It Works</span>
              <h2 className="section-title">Simple Process, Excellent Service</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Browse &amp; Select</h3>
                <p>Search our extensive inventory of quality Japanese vehicles</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Inquire &amp; Reserve</h3>
                <p>Contact us or reserve your chosen vehicle with a deposit</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Inspect &amp; Export</h3>
                <p>We handle inspection, documentation, and customs clearance</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h3>Ship &amp; Deliver</h3>
                <p>Your vehicle ships worldwide and arrives at your port</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-banner">
          <div className="utc-container">
            <h2>Ready to Find Your Perfect Vehicle?</h2>
            <p>Browse our complete inventory of premium Japanese vehicles</p>
            <Link href="/stock" className="btn-white">Browse All Vehicles</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
