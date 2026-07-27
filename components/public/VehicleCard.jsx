'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function VehicleCard({ vehicle }) {
  const [wishlisted, setWishlisted] = useState(false)

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

  const detailUrl = `/stock/${vehicle.slug || vehicle.vehicleId}`

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
            setWishlisted(!wishlisted)
          }}
          title="Add to Wishlist"
        >
          {wishlisted ? '&#9829;' : '&#9825;'}
        </button>
      </div>

      <div className="vehicle-card-body">
        <Link href={detailUrl}>
          <h3 className="vehicle-card-title">{vehicle.title}</h3>
        </Link>
        <div className="vehicle-card-price">{formatPrice(vehicle.price)}</div>

        <div className="vehicle-card-specs">
          <div className="vehicle-spec">
            <span className="vehicle-spec-value">{formatMileage(vehicle.mileage)}</span>
            <span className="vehicle-spec-label">Mileage</span>
          </div>
          <div className="vehicle-spec">
            <span className="vehicle-spec-value">{vehicle.engine || 'N/A'}</span>
            <span className="vehicle-spec-label">Engine</span>
          </div>
          <div className="vehicle-spec">
            <span className="vehicle-spec-value">{vehicle.transmission || 'N/A'}</span>
            <span className="vehicle-spec-label">Gearbox</span>
          </div>
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
