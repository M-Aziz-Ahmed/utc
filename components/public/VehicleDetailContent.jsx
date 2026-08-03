'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import InquiryModal from '@/components/public/InquiryModal'
import ReservationModal from '@/components/public/ReservationModal'

export default function VehicleDetailContent({ vehicle }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [reservationOpen, setReservationOpen] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [favoriteList, setFavoriteList] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('compareList')
      if (saved) setCompareList(JSON.parse(saved))
      const fav = localStorage.getItem('favoriteList')
      if (fav) setFavoriteList(JSON.parse(fav))
    } catch {}
  }, [])

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

  const images = vehicle.images || []
  const mainImage = images[selectedImage] || vehicle.mainImage || ''

  const handleCompare = () => {
    if (!vehicle.vehicleId) return
    const updated = compareList.includes(vehicle.vehicleId)
      ? compareList.filter(id => id !== vehicle.vehicleId)
      : [...compareList, vehicle.vehicleId]
    setCompareList(updated)
    try { localStorage.setItem('compareList', JSON.stringify(updated)) } catch {}
  }

  const handleFavorite = () => {
    if (!vehicle.vehicleId) return
    const updated = favoriteList.includes(vehicle.vehicleId)
      ? favoriteList.filter(id => id !== vehicle.vehicleId)
      : [...favoriteList, vehicle.vehicleId]
    setFavoriteList(updated)
    try { localStorage.setItem('favoriteList', JSON.stringify(updated)) } catch {}
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle.title,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleDownloadPDF = () => {
    const content = [
      vehicle.title,
      `Price: ${formatPrice(vehicle.price)}`,
      `Mileage: ${formatMileage(vehicle.mileage)}`,
      `Engine: ${vehicle.engine || 'N/A'}`,
      `Transmission: ${vehicle.transmission || 'N/A'}`,
      `Fuel Type: ${vehicle.fuelType || 'N/A'}`,
      `Drive Type: ${vehicle.driveType || 'N/A'}`,
      `Color: ${vehicle.color || 'N/A'}`,
      `Body Type: ${vehicle.bodyType || 'N/A'}`,
      `Year: ${vehicle.year || 'N/A'}`,
      `Chassis No: ${vehicle.chassisNumber || 'N/A'}`,
      `Grade: ${vehicle.grade || 'N/A'}`,
      `Location: ${vehicle.location || 'N/A'}`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${vehicle.title || 'vehicle'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Group specs into categories for better organization
  const primarySpecs = [
    { label: 'Mileage', value: formatMileage(vehicle.mileage), icon: '&#128200;' },
    { label: 'Engine', value: vehicle.engine || 'N/A', icon: '&#9881;' },
    { label: 'Transmission', value: vehicle.transmission || 'N/A', icon: '&#128260;' },
    { label: 'Fuel Type', value: vehicle.fuelType || 'N/A', icon: '&#9981;' },
  ]

  const vehicleSpecs = [
    { label: 'Body Type', value: vehicle.bodyType || 'N/A' },
    { label: 'Drive Type', value: vehicle.driveType || 'N/A' },
    { label: 'Steering', value: vehicle.steering || 'N/A' },
    { label: 'Color', value: vehicle.color || 'N/A' },
    { label: 'Seats', value: vehicle.seats || 'N/A' },
    { label: 'Doors', value: vehicle.doors || 'N/A' },
  ]

  const documentSpecs = [
    { label: 'Year', value: vehicle.year || 'N/A' },
    { label: 'Chassis Number', value: vehicle.chassisNumber || 'N/A' },
    { label: 'Grade', value: vehicle.grade || 'N/A' },
    { label: 'Condition', value: vehicle.condition || 'N/A' },
    { label: 'Location', value: vehicle.location || 'N/A' },
  ]

  return (
    <>
      <div className="vehicle-detail-page">
        <div className="utc-container">
          <div className="breadcrumb" style={{ marginBottom: 24 }}>
            <Link href="/">Home</Link>
            <span className="separator">&#8250;</span>
            <Link href="/stock">Stock</Link>
            <span className="separator">&#8250;</span>
            <span className="current">{vehicle.title}</span>
          </div>

          <div className="vehicle-detail-layout">
            <div className="vehicle-gallery">
              <div className="gallery-main">
                {mainImage ? (
                  <img src={mainImage} alt={vehicle.title} style={{ objectFit: 'contain', maxHeight: '100%' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 16 }}>
                    No Image Available
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="gallery-thumbs">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`gallery-thumb ${i === selectedImage ? 'active' : ''}`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <img src={img} alt={`${vehicle.title} - Image ${i + 1}`} style={{ objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="vehicle-detail-info">
              <div className="detail-header">
                <h1 className="detail-title">{vehicle.title}</h1>
                <div className="detail-price">{formatPrice(vehicle.price)}</div>
                <div className="detail-id">Stock ID: {vehicle.stockId || vehicle.vehicleId}</div>
              </div>

              {/* Primary Specifications - Highlighted Grid */}
              <div className="detail-primary-specs">
                {primarySpecs.map((spec, i) => (
                  <div key={i} className="primary-spec-card">
                    <div className="spec-icon" dangerouslySetInnerHTML={{ __html: spec.icon }} />
                    <div className="spec-label">{spec.label}</div>
                    <div className="spec-value">{spec.value}</div>
                  </div>
                ))}
              </div>

              {/* Vehicle Details - Professional Table */}
              <div className="detail-specs-section">
                <h3 className="specs-section-title">Vehicle Details</h3>
                <div className="detail-specs-table">
                  {vehicleSpecs.map((spec, i) => (
                    <div key={i} className="spec-row">
                      <div className="spec-label-col">{spec.label}</div>
                      <div className="spec-value-col">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Information - Professional Table */}
              <div className="detail-specs-section">
                <h3 className="specs-section-title">Document Information</h3>
                <div className="detail-specs-table">
                  {documentSpecs.map((spec, i) => (
                    <div key={i} className="spec-row">
                      <div className="spec-label-col">{spec.label}</div>
                      <div className="spec-value-col">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-actions">
                <button className="btn-primary" onClick={() => setInquiryOpen(true)}>
                  &#9993; Inquire Now
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`I'm interested in ${vehicle.title}. Price: ${formatPrice(vehicle.price)} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btn-secondary" type="button" style={{ width: '100%' }}>
                    &#128172; WhatsApp Chat
                  </button>
                </a>
                <button className="btn-outline" onClick={() => setReservationOpen(true)}>
                  &#128274; Reserve This Car
                </button>
                <button className="btn-outline" style={{ width: '100%' }}>
                  &#128722; Calculate Shipping
                </button>

                <div className="detail-secondary-actions">
                  <button onClick={handleCompare}>
                    {compareList.includes(vehicle.vehicleId) ? '&#9989;' : '&#128203;'} Add to Compare
                  </button>
                  <button onClick={handleFavorite}>
                    {favoriteList.includes(vehicle.vehicleId) ? '&#10084;&#65039;' : '&#128065;'} Add to Favorites
                  </button>
                  <button onClick={handleDownloadPDF}>
                    &#128196; Download PDF
                  </button>
                  <button onClick={handleShare}>
                    &#128279; Share Vehicle
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="vehicle-tabs" style={{ marginTop: 32 }}>
            <div className="tab-headers">
              <button
                className={`tab-header ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              {vehicle.images && vehicle.images.length > 0 && (
                <button
                  className={`tab-header ${activeTab === 'auction' ? 'active' : ''}`}
                  onClick={() => setActiveTab('auction')}
                >
                  Auction Sheet
                </button>
              )}
              <button
                className={`tab-header ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                Features
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111827' }}>Vehicle Overview</h3>
                  <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8, marginBottom: 16 }}>
                    This {vehicle.year} {vehicle.make || ''} {vehicle.model || ''} is a quality Japanese vehicle available
                    for worldwide export. Located in {vehicle.location || 'Japan'}, this vehicle has been thoroughly inspected
                    and is ready for shipping.
                  </p>
                  {vehicle.grade && (
                    <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8 }}>
                      <strong>Grade:</strong> {vehicle.grade} - This grade reflects the overall condition and quality of the vehicle.
                    </p>
                  )}
                  <div style={{ marginTop: 24, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#111827' }}>Need more information?</h4>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                      Contact our team for detailed inspection reports, additional photos, or shipping quotes.
                    </p>
                    <button className="btn-primary" onClick={() => setInquiryOpen(true)} style={{ fontSize: 13, padding: '8px 20px' }}>
                      Contact Us
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'auction' && vehicle.images && vehicle.images.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111827' }}>Vehicle Images & Auction Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {vehicle.images.map((img, i) => (
                      <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <img src={img} alt={`${vehicle.title} - Image ${i + 1}`} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                  {vehicle.chassisNumber && (
                    <div style={{ marginTop: 20, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                      <p style={{ fontSize: 13, color: '#6B7280' }}>
                        <strong>Chassis No:</strong> {vehicle.chassisNumber}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'features' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111827' }}>Vehicle Features & Specifications</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                    {[
                      { label: 'Make', value: vehicle.make },
                      { label: 'Model', value: vehicle.model },
                      { label: 'Year', value: vehicle.year },
                      { label: 'Engine', value: vehicle.engine },
                      { label: 'Transmission', value: vehicle.transmission },
                      { label: 'Fuel Type', value: vehicle.fuelType },
                      { label: 'Body Type', value: vehicle.bodyType },
                      { label: 'Drive Type', value: vehicle.driveType },
                      { label: 'Steering', value: vehicle.steering },
                      { label: 'Color', value: vehicle.color },
                      { label: 'Seats', value: vehicle.seats },
                      { label: 'Doors', value: vehicle.doors },
                      { label: 'Mileage', value: formatMileage(vehicle.mileage) },
                      { label: 'Grade', value: vehicle.grade },
                      { label: 'Condition', value: vehicle.condition },
                      { label: 'Location', value: vehicle.location },
                    ].filter(item => item.value).map((item, i) => (
                      <div key={i} style={{ padding: 12, background: '#f9fafb', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: '#6B7280' }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <InquiryModal vehicle={vehicle} isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <ReservationModal vehicle={vehicle} isOpen={reservationOpen} onClose={() => setReservationOpen(false)} />
    </>
  )
}
