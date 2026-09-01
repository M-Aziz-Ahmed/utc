'use client'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { subscribeWishlist, getWishlistSnapshot, toggleWishlist } from '@/components/public/wishlist'
import { useAuth } from '@/components/public/AuthContext'

export default function VehicleRow({ vehicle }) {
  const wishlist = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, () => [])
  const vehicleId = vehicle.vehicleId || vehicle._id
  const wishlisted = vehicleId ? wishlist.some(v => (v.vehicleId || v._id) === vehicleId) : false
  const { loggedIn, loading: authLoading, openAuthModal } = useAuth()

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

  const detailUrl = `/stock/${vehicle.vehicleId || vehicle.slug}`

  const renderPrice = () => {
    if (authLoading) return <div className="vehicle-row-price" style={{ color: '#ccc' }}>—</div>
    if (loggedIn) return <div className="vehicle-row-price">{formatPrice(vehicle.price)}</div>
    return (
      <button
        onClick={openAuthModal}
        title="Sign up to see price"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px dashed #e8450a',
          borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fff4f1' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
      >
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#e8450a" strokeWidth={2.2}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e8450a', filter: 'blur(4px)', userSelect: 'none' }}>$XX,XXX</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#e8450a' }}>Sign up</span>
      </button>
    )
  }

  return (
    <div className="vehicle-row">
      <div className="vehicle-row-image">
        <Link href={detailUrl}>
          {vehicle.mainImage ? (
            <img src={vehicle.mainImage} alt={vehicle.title} loading="lazy" />
          ) : (
            <div className="vehicle-row-no-img">No Image</div>
          )}
        </Link>
        {vehicle.isNewArrival && <span className="vehicle-badge badge-new" style={{ position: 'absolute', top: 6, left: 6, fontSize: 10, padding: '2px 6px' }}>New</span>}
        {vehicle.allocationStatus && <span className="vehicle-badge badge-presold" style={{ position: 'absolute', top: 6, left: vehicle.isNewArrival ? 48 : 6, fontSize: 10, padding: '2px 6px' }}>Pre-Sold</span>}
      </div>

      <div className="vehicle-row-info">
        <Link href={detailUrl}>
          <h3 className="vehicle-row-title">{vehicle.title}</h3>
        </Link>
        {renderPrice()}
      </div>

      <div className="vehicle-row-specs">
        <div className="vehicle-row-spec">
          <span className="vehicle-row-spec-label">Year</span>
          <span className="vehicle-row-spec-value">{vehicle.year || 'N/A'}</span>
        </div>
        <div className="vehicle-row-spec">
          <span className="vehicle-row-spec-label">Fuel</span>
          <span className="vehicle-row-spec-value">{vehicle.fuelType || 'N/A'}</span>
        </div>
        <div className="vehicle-row-spec">
          <span className="vehicle-row-spec-label">Trans</span>
          <span className="vehicle-row-spec-value">{vehicle.transmission || 'N/A'}</span>
        </div>
        <div className="vehicle-row-spec">
          <span className="vehicle-row-spec-label">Engine</span>
          <span className="vehicle-row-spec-value">{vehicle.engine || 'N/A'}</span>
        </div>
        <div className="vehicle-row-spec">
          <span className="vehicle-row-spec-label">Doors</span>
          <span className="vehicle-row-spec-value">{vehicle.doors || 'N/A'}</span>
        </div>
        <div className="vehicle-row-spec">
          <span className="vehicle-row-spec-label">Seats</span>
          <span className="vehicle-row-spec-value">{vehicle.seats || 'N/A'}</span>
        </div>
        <div className="vehicle-row-spec">
          <span className="vehicle-row-spec-label">Mileage</span>
          <span className="vehicle-row-spec-value">{formatMileage(vehicle.mileage)}</span>
        </div>
      </div>

      <div className="vehicle-row-actions">
        <button
          className={`vehicle-row-wishlist ${wishlisted ? 'active' : ''}`}
          onClick={() => toggleWishlist(vehicle)}
          title="Add to Wishlist"
        >
          {wishlisted ? '\u2665' : '\u2661'}
        </button>
        <Link href={detailUrl}>
          <button className="vehicle-row-view-btn">View Details</button>
        </Link>
      </div>
    </div>
  )
}
