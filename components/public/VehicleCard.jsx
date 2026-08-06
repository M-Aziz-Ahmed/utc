'use client'
import Link from 'next/link'
import { useSyncExternalStore, useEffect, useState } from 'react'
import { subscribeWishlist, getWishlistSnapshot, toggleWishlist } from '@/components/public/wishlist'

export default function VehicleCard({ vehicle }) {
  const wishlist = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, () => [])
  const vehicleId = vehicle.vehicleId || vehicle._id
  const wishlisted = vehicleId ? wishlist.some(v => (v.vehicleId || v._id) === vehicleId) : false
  const [displayFields, setDisplayFields] = useState([])
  const [priceField, setPriceField] = useState(null)

  useEffect(() => {
    // Fetch fields marked for display
    fetch('/api/fields')
      .then(r => r.json())
      .then(fields => {
        const priceDisplayField = fields.find(f => f.displayAsPrice && vehicle[f._id])
        const publicCardFields = fields.filter(f => f.showOnPublicCard && vehicle[f._id])
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

  // Determine which price to display
  const displayPrice = priceField ? vehicle[priceField._id] : vehicle.price

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
        </div>
        <button
          className={`vehicle-card-wishlist ${wishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            toggleWishlist(vehicle)
          }}
          title="Add to Wishlist"
        >
          {wishlisted ? '\u2665' : '\u2661'}
        </button>
      </div>

      <div className="vehicle-card-body">
        <Link href={detailUrl}>
          <h3 className="vehicle-card-title">{vehicle.title}</h3>
        </Link>
        <div className="vehicle-card-price">{formatPrice(displayPrice)}</div>

        {/* Display custom fields marked for public cards */}
        {displayFields.length > 0 && (
          <div style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {displayFields.map(field => (
              <div key={field._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 8px', background: '#f9fafb', borderRadius: '4px' }}>
                <span style={{ color: '#6b7280', fontWeight: 500 }}>{field.label}</span>
                <span style={{ color: '#111827', fontWeight: 600 }}>{formatFieldValue(vehicle[field._id])}</span>
              </div>
            ))}
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
