'use client'
import Link from 'next/link'
import { useSyncExternalStore, useEffect, useState } from 'react'
import { subscribeWishlist, getWishlistSnapshot, toggleWishlist } from '@/components/public/wishlist'
import { useAuth } from '@/components/public/AuthContext'

export default function VehicleCard({ vehicle }) {
  const wishlist = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, () => [])
  const vehicleId = vehicle.vehicleId || vehicle._id
  const wishlisted = vehicleId ? wishlist.some(v => (v.vehicleId || v._id) === vehicleId) : false
  const [displayFields, setDisplayFields] = useState([])
  const [priceField, setPriceField] = useState(null)
  const { loggedIn, loading: authLoading, openAuthModal } = useAuth()

  useEffect(() => {
    fetch('/api/fields')
      .then(r => r.json())
      .then(fields => {
        const priceDisplayField = fields.find(f => {
          if (!f.displayAsPrice) return false
          const sanitizedLabel = f.label?.replace(/\./g, '')
          return vehicle[f._id] || vehicle[f.label] || vehicle[sanitizedLabel]
        })
        const publicCardFields = fields.filter(f => {
          if (!f.showOnPublicCard) return false
          const sanitizedLabel = f.label?.replace(/\./g, '')
          return vehicle[f._id] || vehicle[f.label] || vehicle[sanitizedLabel]
        })
        setPriceField(priceDisplayField)
        setDisplayFields(publicCardFields)
      })
      .catch(() => {})
  }, [vehicle])

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

  const detailUrl = `/stock/${vehicleId || vehicle.slug}`

  const displayPrice = priceField
    ? (vehicle[priceField._id] || vehicle[priceField.label] || vehicle[priceField.label?.replace(/\./g, '')])
    : vehicle.price

  const specs = [
    { label: 'Year', value: vehicle.year || 'N/A' },
    { label: 'Fuel Type', value: vehicle.fuelType || 'N/A' },
    { label: 'Transmission', value: vehicle.transmission || 'N/A' },
    { label: 'Engine', value: vehicle.engine || 'N/A' },
    { label: 'Doors', value: vehicle.doors || 'N/A' },
    { label: 'Seats', value: vehicle.seats || 'N/A' },
    { label: 'Mileage', value: formatMileage(vehicle.mileage) },
  ]

  const formatFieldValue = (value) => {
    if (value === null || value === undefined) return 'N/A'
    const num = parseFloat(value)
    if (!isNaN(num)) return num.toLocaleString()
    return String(value)
  }

  // ── Price display: locked for guests ──────────────────────────────────────
  const renderPrice = () => {
    if (authLoading) return <div className="vehicle-card-price" style={{ color: '#ccc' }}>—</div>

    if (loggedIn) {
      return <div className="vehicle-card-price">{formatPrice(displayPrice)}</div>
    }

    return (
      <button
        onClick={openAuthModal}
        title="Sign up to see price"
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'none', border: '1px dashed #e8450a',
          borderRadius: 4, padding: '5px 10px', cursor: 'pointer',
          marginBottom: 8, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fff4f1' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#e8450a" strokeWidth={2.2}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#e8450a', filter: 'blur(4px)', userSelect: 'none', letterSpacing: '0.05em' }}>
          $XX,XXX
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#e8450a' }}>Sign up to view</span>
      </button>
    )
  }

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-image">
        <Link href={detailUrl}>
          {vehicle.mainImage ? (
            <img src={vehicle.mainImage} alt={vehicle.title} loading="lazy" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af', fontSize: 14 }}>
              No Image
            </div>
          )}
        </Link>
        <div className="vehicle-card-badges">
          {vehicle.isNewArrival && <span className="vehicle-badge badge-new">New</span>}
          {vehicle.allocationStatus && <span className="vehicle-badge badge-presold">Pre-Sold</span>}
        </div>
        <button
          className={`vehicle-card-wishlist ${wishlisted ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(vehicle) }}
          title="Add to Wishlist"
        >
          {wishlisted ? '\u2665' : '\u2661'}
        </button>
      </div>

      <div className="vehicle-card-body">
        <Link href={detailUrl}>
          <h3 className="vehicle-card-title">{vehicle.title}</h3>
        </Link>

        {renderPrice()}

        {displayFields.length > 0 && (
          <div style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {displayFields.map(field => {
              const sanitizedLabel = field.label?.replace(/\./g, '')
              const fieldValue = vehicle[field._id] || vehicle[field.label] || vehicle[sanitizedLabel]
              return fieldValue ? (
                <div key={field._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 8px', background: '#f9fafb', borderRadius: '4px' }}>
                  <span style={{ color: '#6b7280', fontWeight: 500 }}>{field.label}</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>{formatFieldValue(fieldValue)}</span>
                </div>
              ) : null
            })}
          </div>
        )}

        <div className="vehicle-card-specs">
          {specs.map((s) => (
            <div key={s.label} className="vehicle-spec">
              <span className="vehicle-spec-value">{s.value}</span>
              <span className="vehicle-spec-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="vehicle-card-footer">
        <Link href={detailUrl}>
          <button className="view-details-btn">View Details</button>
        </Link>
      </div>
    </div>
  )
}
