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
        console.log('=== PRICE FIELD DEBUG ===')
        console.log('All fields:', fields.map(f => ({ id: f._id, label: f.label, displayAsPrice: f.displayAsPrice })))
        console.log('Vehicle data keys:', Object.keys(vehicle))
        
        // Find price field - check field._id, field.label, and sanitized label (dots removed)
        const priceDisplayField = fields.find(f => {
          if (!f.displayAsPrice) return false
          const sanitizedLabel = f.label?.replace(/\./g, '')
          const hasValue = vehicle[f._id] || vehicle[f.label] || vehicle[sanitizedLabel]
          console.log(`Checking field "${f.label}" (id: ${f._id}):`, {
            byId: vehicle[f._id],
            byLabel: vehicle[f.label],
            bySanitized: vehicle[sanitizedLabel],
            hasValue
          })
          return hasValue
        })
        
        console.log('Price field found:', priceDisplayField)
        if (priceDisplayField) {
          const sanitizedLabel = priceDisplayField.label?.replace(/\./g, '')
          const value = vehicle[priceDisplayField._id] || vehicle[priceDisplayField.label] || vehicle[sanitizedLabel]
          console.log('Price value:', value)
        }
        
        // Find public card fields - check field._id, field.label, and sanitized label
        const publicCardFields = fields.filter(f => {
          if (!f.showOnPublicCard) return false
          const sanitizedLabel = f.label?.replace(/\./g, '')
          return vehicle[f._id] || vehicle[f.label] || vehicle[sanitizedLabel]
        })
        
        console.log('Public card fields:', publicCardFields)
        console.log('=== END DEBUG ===')
        
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

  // Determine which price to display - check _id, label, and sanitized label
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
