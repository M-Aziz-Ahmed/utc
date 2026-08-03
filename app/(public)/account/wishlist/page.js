'use client'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { subscribeWishlist, getWishlistSnapshot, removeFromWishlist } from '@/components/public/wishlist'

export default function WishlistPage() {
  const wishlist = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, () => [])

  const handleRemove = (id) => {
    removeFromWishlist(id)
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>My Wishlist</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>Vehicles you&apos;ve saved for later.</p>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#9825;</div>
          <h3>No Vehicles Saved</h3>
          <p>Browse our stock and save vehicles you&apos;re interested in.</p>
          <Link href="/stock" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Browse Stock</Link>
        </div>
      ) : (
        <div className="vehicles-grid">
          {wishlist.map((v, i) => {
            const id = v.vehicleId || v._id
            const url = `/stock/${id || v.slug}`
            return (
              <div key={id || v.slug || i} className="vehicle-card">
                <div className="vehicle-card-image">
                  <Link href={url}>
                    {v.mainImage && <img src={v.mainImage} alt={v.title} />}
                  </Link>
                  <button
                    onClick={() => handleRemove(id)}
                    title="Remove from Wishlist"
                    className="vehicle-card-wishlist active"
                  >
                    &#10005;
                  </button>
                </div>
                <div className="vehicle-card-body">
                  <Link href={url} style={{ textDecoration: 'none' }}>
                    <h3 className="vehicle-card-title">{v.title}</h3>
                  </Link>
                  <div className="vehicle-card-price">{v.price ? `$${parseFloat(v.price).toLocaleString()}` : 'Price on Request'}</div>
                </div>
                <div className="vehicle-card-footer">
                  <Link href={url} style={{ textDecoration: 'none' }}>
                    <button className="view-details-btn">View Details</button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
