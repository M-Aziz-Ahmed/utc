'use client'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { subscribeWishlist, getWishlistSnapshot, toggleWishlist } from '@/components/public/wishlist'

export default function VehicleCard({ vehicle }) {
  const wishlist = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, () => [])
  const vehicleId = vehicle.vehicleId || vehicle._id
  const wishlisted = vehicleId ? wishlist.some(v => (v.vehicleId || v._id) === vehicleId) : false

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

  const specs = [
    { label: 'Year', value: vehicle.year || 'N/A' },
    { label: 'Fuel Type', value: vehicle.fuelType || 'N/A' },
    { label: 'Transmission', value: vehicle.transmission || 'N/A' },
    { label: 'Engine', value: vehicle.engine || 'N/A' },
    { label: 'Doors', value: vehicle.doors || 'N/A' },
    { label: 'Seats', value: vehicle.seats || 'N/A' },
    { label: 'Mileage', value: formatMileage(vehicle.mileage) },
  ]

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
        <div className="vehicle-card-price">{formatPrice(vehicle.price)}</div>

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
