'use client'
import { useState, useEffect } from 'react'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('utc_wishlist')
    if (stored) {
      try {
        setWishlist(JSON.parse(stored))
      } catch {
        setWishlist([])
      }
    }
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>My Wishlist</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>Vehicles you&apos;ve saved for later.</p>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#9825;</div>
          <h3>No Vehicles Saved</h3>
          <p>Browse our stock and save vehicles you&apos;re interested in.</p>
          <a href="/stock" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Browse Stock</a>
        </div>
      ) : (
        <div className="vehicles-grid">
          {wishlist.map((v, i) => (
            <div key={i} className="vehicle-card">
              <div className="vehicle-card-image">
                {v.mainImage && <img src={v.mainImage} alt={v.title} />}
              </div>
              <div className="vehicle-card-body">
                <h3 className="vehicle-card-title">{v.title}</h3>
                <div className="vehicle-card-price">{v.price ? `$${parseFloat(v.price).toLocaleString()}` : 'Price on Request'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
